function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "Method not allowed." });
  }

  const contentType = String(request.headers?.["content-type"] || "").split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return response.status(415).json({ message: "Please send a JSON message." });
  }

  // Prevent submissions from other websites. This is not a bot/rate limiter:
  // non-browser clients can forge Origin and must be controlled at the edge.
  try {
    const origin = new URL(request.headers?.origin);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    if (origin.origin !== request.headers.origin || origin.host !== request.headers.host ||
        (origin.protocol !== "https:" && !(local && origin.protocol === "http:"))) {
      return response.status(403).json({ message: "Please use the contact form on this website." });
    }
  } catch {
    return response.status(403).json({ message: "Please use the contact form on this website." });
  }

  let body = request.body;
  try {
    const serialized = typeof body === "string" ? body : JSON.stringify(body);
    if (!serialized) throw new Error("Missing body");
    if (Buffer.byteLength(serialized, "utf8") > 16 * 1024) {
      return response.status(413).json({ message: "The message is too large." });
    }
  } catch {
    return response.status(400).json({ message: "Invalid message payload." });
  }
  if (typeof body === "string") {
    try {
      body = body ? JSON.parse(body) : {};
    } catch {
      return response.status(400).json({ message: "Invalid message payload." });
    }
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return response.status(400).json({ message: "Invalid message payload." });
  }

  if (typeof body.website === "string" && body.website.trim()) {
    return response.status(200).json({ ok: true });
  }

  const limits = { name: 120, company: 160, email: 254, phone: 60, country: 100, message: 4000 };
  const fields = {};
  for (const [field, max] of Object.entries(limits)) {
    const value = body[field] ?? "";
    if (typeof value !== "string" || value.length > max ||
        (field !== "message" && /[\u0000-\u001f\u007f]/.test(value)) ||
        (field === "message" && /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))) {
      return response.status(400).json({ message: "Please check the message fields and their lengths." });
    }
    fields[field] = value.trim();
  }
  const { name, company, email, phone, country, message } = fields;

  if (!name || !company || !email || !country || !message || !isEmail(email)) {
    return response.status(400).json({ message: "Please complete the required fields." });
  }

  if (body.privacy !== "on" && body.privacy !== true) {
    return response.status(400).json({ message: "Please confirm the privacy statement before sending." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.CONTACT_TO || "info@tysmalems.com";

  if (!apiKey || !from || !to) {
    return response.status(503).json({
      message: "The contact form is not configured yet.",
    });
  }

  const subject = `Website message from ${name}`;
  const text = [
    "New website message",
    "",
    `Name: ${name}`,
    `Company: ${company}`,
    `Email: ${email}`,
    `Telephone: ${phone || "-"}`,
    `Country: ${country}`,
    "",
    message,
  ].join("\n");
  const html = `
    <h1>New website message</h1>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Company:</strong> ${escapeHtml(company)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Telephone:</strong> ${escapeHtml(phone || "-")}</p>
    <p><strong>Country:</strong> ${escapeHtml(country)}</p>
    <hr>
    ${message.split(/\n{2,}/).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join("")}
  `;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject,
        text,
        html,
      }),
    });

    if (!resendResponse.ok) {
      return response.status(502).json({ message: "The message could not be sent." });
    }

    return response.status(200).json({ ok: true });
  } catch {
    return response.status(502).json({ message: "The message could not be sent. Please try again later." });
  }
};
