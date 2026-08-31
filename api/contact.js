function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clean(value = "") {
  return String(value).trim().slice(0, 4000);
}

function isEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "Method not allowed." });
  }

  let body = request.body || {};
  if (typeof body === "string") {
    try {
      body = body ? JSON.parse(body) : {};
    } catch {
      return response.status(400).json({ message: "Invalid message payload." });
    }
  }

  if (clean(body.website)) {
    return response.status(200).json({ ok: true });
  }

  const name = clean(body.name);
  const company = clean(body.company);
  const email = clean(body.email);
  const phone = clean(body.phone);
  const country = clean(body.country);
  const message = clean(body.message);

  if (!name || !company || !email || !country || !message || !isEmail(email)) {
    return response.status(400).json({ message: "Please complete the required fields." });
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

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
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
};
