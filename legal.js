const corporatePagesKey = "tlCorporatePages";
const siteUrl = "https://www.tysmalems.com";
const defaultCorporatePages = [
  {
    slug: "terms",
    label: "Terms & Conditions",
    title: "Terms & Conditions",
    intro: "The terms under which Tysma | Lems provides information through this website and, where applicable, professional services.",
    body: "This page is reserved for the current Terms & Conditions of Tysma | Lems.\n\nUse the CMS to add the full legal wording, update the effective date and keep the published version aligned with the firm's current engagement terms.",
    seoDescription: "Terms and conditions for Tysma | Lems.",
    status: "Published",
    updatedAt: "2026-08-31",
  },
  {
    slug: "privacy",
    label: "Privacy",
    title: "Privacy",
    intro: "How Tysma | Lems handles personal data shared through this website and in professional contact with the firm.",
    body: "This page is reserved for the current privacy statement of Tysma | Lems.\n\nUse the CMS to describe which personal data is processed, for which purposes, how long it is retained and how visitors can exercise their privacy rights.",
    seoDescription: "Privacy statement for Tysma | Lems.",
    status: "Published",
    updatedAt: "2026-08-31",
  },
  {
    slug: "disclaimer",
    label: "Disclaimer",
    title: "Disclaimer",
    intro: "Important notes about the information provided on this website.",
    body: "This page is reserved for the current disclaimer of Tysma | Lems.\n\nUse the CMS to clarify that website information is general in nature and does not replace advice tailored to a specific situation.",
    seoDescription: "Website disclaimer for Tysma | Lems.",
    status: "Published",
    updatedAt: "2026-08-31",
  },
  {
    slug: "cookies",
    label: "Cookies",
    title: "Cookies",
    intro: "Information about the cookies and similar technologies used on this website.",
    body: "This page is reserved for the current cookie statement of Tysma | Lems.\n\nUse the CMS to explain which cookies are used, why they are used and how visitors can manage their preferences.",
    seoDescription: "Cookie statement for Tysma | Lems.",
    status: "Published",
    updatedAt: "2026-08-31",
  },
  {
    slug: "csr",
    label: "Corporate Social Responsibility",
    title: "Corporate Social Responsibility",
    intro: "How Tysma | Lems looks at responsible business, people, community and long-term professional conduct.",
    body: "This page is reserved for the current Corporate Social Responsibility statement of Tysma | Lems.\n\nUse the CMS to describe the firm's commitments, initiatives and principles in a concise and practical way.",
    seoDescription: "Corporate Social Responsibility information from Tysma | Lems.",
    status: "Published",
    updatedAt: "2026-08-31",
  },
];
const pageUrls = {
  terms: "terms.html",
  privacy: "privacy.html",
  disclaimer: "disclaimer.html",
  cookies: "cookies.html",
  csr: "csr.html",
};

function getCorporatePages() {
  const saved = JSON.parse(localStorage.getItem(corporatePagesKey) || "null");
  const pages = Array.isArray(saved) && saved.length > 0 ? saved : defaultCorporatePages;
  return defaultCorporatePages.map((fallbackPage) => ({
    ...fallbackPage,
    ...(pages.find((page) => page.slug === fallbackPage.slug) || {}),
  }));
}

function setMeta(name, content, attribute = "name") {
  if (!content) return;
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function setCanonical(path) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = `${siteUrl}/${path}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function paragraphs(value) {
  return String(value || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function renderLegalHub() {
  const hub = document.querySelector("[data-legal-hub]");
  if (!hub) return;
  const pages = getCorporatePages().filter((page) => page.status === "Published");
  setCanonical("legal/");
  document.title = "Legal & Responsibility | Tysma Lems";
  setMeta("description", "Legal information and Corporate Social Responsibility pages from Tysma | Lems.");
  hub.innerHTML = `
    <div class="section-label">Legal & Responsibility</div>
    <h1 class="page-title">Corporate information, kept clear<span class="brand-dot">.</span></h1>
    <p class="legal-intro">The formal information behind the website, maintained in one consistent editorial format.</p>
    <div class="legal-hub-list">
      ${pages.map((page) => `
        <article class="legal-hub-item">
          <p>${page.label}</p>
          <h2>${page.title}</h2>
          <span>Updated ${formatDate(page.updatedAt)}</span>
          <a href="${pageUrls[page.slug]}">Read page -></a>
        </article>
      `).join("")}
    </div>
  `;
}

function renderCorporatePage() {
  const pageRoot = document.querySelector("[data-corporate-page]");
  if (!pageRoot) return;
  const slug = pageRoot.dataset.corporatePage;
  const page = getCorporatePages().find((item) => item.slug === slug);

  if (!page || page.status !== "Published") {
    pageRoot.innerHTML = `
      <div class="section-label">Legal & Responsibility</div>
      <h1 class="page-title">Page unavailable<span class="brand-dot">.</span></h1>
      <p class="legal-intro">This page is not published yet.</p>
      <a class="text-link" href="legal.html">Back to overview</a>
    `;
    return;
  }

  document.title = `${page.title} | Tysma Lems`;
  setMeta("description", page.seoDescription);
  setMeta("og:title", `${page.title} | Tysma Lems`, "property");
  setMeta("og:description", page.seoDescription, "property");
  setCanonical(`${page.slug === "csr" ? "csr" : page.slug}/`);

  pageRoot.innerHTML = `
    <div class="section-label">Legal & Responsibility</div>
    <div class="legal-page-grid">
      <div>
        <h1 class="page-title">${page.title}<span class="brand-dot">.</span></h1>
        <p class="legal-intro">${page.intro}</p>
      </div>
      <aside class="legal-page-meta" aria-label="Page information">
        <span>${page.label}</span>
        <p>Updated ${formatDate(page.updatedAt)}</p>
      </aside>
    </div>
    <div class="legal-body">${paragraphs(page.body)}</div>
    <a class="text-link" href="legal.html">Back to overview</a>
  `;
}

renderLegalHub();
renderCorporatePage();
