const heroKey = "tlHeroImages";
const approachHeroKey = "tlApproachHeroImages";
const socialLinksKey = "tlSocialLinks";
const articlesKey = "tlJournalArticles";
const corporatePagesKey = "tlCorporatePages";
const fallbackHeroImages = [
  { id: "maritime", src: "hero-maritime.png", name: "Maritime" },
  { id: "global-mobility", src: "hero-global-mobility.png", name: "Global Mobility" },
  { id: "private-clients", src: "hero-private-clients.png", name: "Private Clients" },
];
const fallbackApproachHeroImages = [
  { id: "approach-room", src: "approach.png", name: "Approach interior" },
  { id: "approach-global", src: "hero-global-mobility.png", name: "International perspective" },
  { id: "approach-private", src: "hero-private-clients.png", name: "Private clients" },
];
const fallbackSocialLinks = [
  { id: "linkedin", label: "LinkedIn", shortLabel: "in", url: "" },
  { id: "instagram", label: "Instagram", shortLabel: "ig", url: "" },
  { id: "x", label: "X", shortLabel: "x", url: "" },
  { id: "facebook", label: "Facebook", shortLabel: "f", url: "" },
];
const fallbackCorporatePages = [
  {
    slug: "terms",
    label: "Terms & Conditions",
    title: "Terms & Conditions",
    intro: "The terms under which Tysma | Lems provides information through this website and, where applicable, professional services.",
    body: "This page is reserved for the current Terms & Conditions of Tysma | Lems.\n\nUse this CMS section to add the full legal wording, update the effective date and keep the published version aligned with the firm's current engagement terms.",
    seoDescription: "Terms and conditions for Tysma | Lems.",
    status: "Published",
    updatedAt: "2026-08-31",
  },
  {
    slug: "privacy",
    label: "Privacy",
    title: "Privacy",
    intro: "How Tysma | Lems handles personal data shared through this website and in professional contact with the firm.",
    body: "This page is reserved for the current privacy statement of Tysma | Lems.\n\nUse this CMS section to describe which personal data is processed, for which purposes, how long it is retained and how visitors can exercise their privacy rights.",
    seoDescription: "Privacy statement for Tysma | Lems.",
    status: "Published",
    updatedAt: "2026-08-31",
  },
  {
    slug: "disclaimer",
    label: "Disclaimer",
    title: "Disclaimer",
    intro: "Important notes about the information provided on this website.",
    body: "This page is reserved for the current disclaimer of Tysma | Lems.\n\nUse this CMS section to clarify that website information is general in nature and does not replace advice tailored to a specific situation.",
    seoDescription: "Website disclaimer for Tysma | Lems.",
    status: "Published",
    updatedAt: "2026-08-31",
  },
  {
    slug: "cookies",
    label: "Cookies",
    title: "Cookies",
    intro: "Information about the cookies and similar technologies used on this website.",
    body: "This page is reserved for the current cookie statement of Tysma | Lems.\n\nUse this CMS section to explain which cookies are used, why they are used and how visitors can manage their preferences.",
    seoDescription: "Cookie statement for Tysma | Lems.",
    status: "Published",
    updatedAt: "2026-08-31",
  },
  {
    slug: "csr",
    label: "Corporate Social Responsibility",
    title: "Corporate Social Responsibility",
    intro: "How Tysma | Lems looks at responsible business, people, community and long-term professional conduct.",
    body: "This page is reserved for the current Corporate Social Responsibility statement of Tysma | Lems.\n\nUse this CMS section to describe the firm's commitments, initiatives and principles in a concise and practical way.",
    seoDescription: "Corporate Social Responsibility information from Tysma | Lems.",
    status: "Published",
    updatedAt: "2026-08-31",
  },
];

const manager = document.querySelector("[data-hero-manager]");
const upload = document.querySelector("[data-hero-upload]");
const resetHero = document.querySelector("[data-reset-hero]");
const approachManager = document.querySelector("[data-approach-hero-manager]");
const approachUpload = document.querySelector("[data-approach-hero-upload]");
const resetApproachHero = document.querySelector("[data-reset-approach-hero]");
const socialForm = document.querySelector("[data-social-form]");
const resetSocialLinks = document.querySelector("[data-reset-social-links]");
const socialStatus = document.querySelector("[data-social-status]");
const corporatePageForm = document.querySelector("[data-corporate-page-form]");
const corporatePageList = document.querySelector("[data-corporate-page-list]");
const corporatePageStatus = document.querySelector("[data-corporate-page-status]");
const resetCorporatePages = document.querySelector("[data-reset-corporate-pages]");
const form = document.querySelector("[data-article-form]");
const desk = document.querySelector("[data-article-desk]");
const deskCount = document.querySelector("[data-desk-count]");
const newArticle = document.querySelector("[data-new-article]");
const articleHero = document.querySelector("[data-article-hero]");

let pendingArticleHero = "";

function readJson(key, fallback) {
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  return Array.isArray(saved) ? saved : fallback;
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderMediaManager(element, key, fallback, removeAttribute) {
  const images = readJson(key, fallback);
  if (!element) return;
  element.innerHTML = images
    .map((image) => `
      <article class="media-row">
        <img src="${image.src}" alt="">
        <div>
          <strong>${image.name || "Hero photo"}</strong>
          <span>${image.src.startsWith("data:") ? "Uploaded image" : image.src}</span>
        </div>
        <button type="button" ${removeAttribute}="${image.id}">Remove</button>
      </article>
    `)
    .join("");
}

function renderHeroManager() {
  renderMediaManager(manager, heroKey, fallbackHeroImages, "data-remove-hero");
}

function renderApproachHeroManager() {
  renderMediaManager(approachManager, approachHeroKey, fallbackApproachHeroImages, "data-remove-approach-hero");
}

function getSocialLinks() {
  const savedLinks = readJson(socialLinksKey, fallbackSocialLinks);
  return fallbackSocialLinks.map((fallbackLink) => ({
    ...fallbackLink,
    url: savedLinks.find((link) => link.id === fallbackLink.id)?.url || "",
  }));
}

function getCorporatePages() {
  const savedPages = readJson(corporatePagesKey, fallbackCorporatePages);
  return fallbackCorporatePages.map((fallbackPage) => ({
    ...fallbackPage,
    ...(savedPages.find((page) => page.slug === fallbackPage.slug) || {}),
  }));
}

function corporatePageUrl(slug) {
  const urls = {
    terms: "terms.html",
    privacy: "privacy.html",
    disclaimer: "disclaimer.html",
    cookies: "cookies.html",
    csr: "csr.html",
  };
  return urls[slug] || "legal.html";
}

function fillCorporatePageForm(slug = corporatePageForm?.elements.slug.value || "terms") {
  if (!corporatePageForm) return;
  const page = getCorporatePages().find((item) => item.slug === slug) || fallbackCorporatePages[0];
  corporatePageForm.elements.slug.value = page.slug;
  corporatePageForm.elements.status.value = page.status || "Draft";
  corporatePageForm.elements.updatedAt.value = page.updatedAt || new Date().toISOString().slice(0, 10);
  corporatePageForm.elements.title.value = page.title || "";
  corporatePageForm.elements.intro.value = page.intro || "";
  corporatePageForm.elements.body.value = page.body || "";
  corporatePageForm.elements.seoDescription.value = page.seoDescription || "";
}

function renderCorporatePageList() {
  if (!corporatePageList) return;
  corporatePageList.innerHTML = getCorporatePages()
    .map((page) => `
      <article class="corporate-page-row">
        <div>
          <strong>${page.label}</strong>
          <span>${page.status || "Draft"} - Updated ${page.updatedAt || "not set"}</span>
        </div>
        <a href="${corporatePageUrl(page.slug)}">Preview</a>
      </article>
    `)
    .join("");
}

function fillSocialForm() {
  if (!socialForm) return;
  getSocialLinks().forEach((link) => {
    socialForm.elements[link.id].value = link.url;
  });
}

function getArticles() {
  const fallback = [
    {
      id: "journal-001",
      journalNumber: "001",
      title: "International lives require international thinking",
      slug: "international-lives-require-international-thinking",
      standfirst: "A first editorial note on why cross-border tax advice starts with people, movement and context.",
      body: "Every international situation begins with a life or business that crosses borders. Tax follows from that reality. Good advice starts by understanding the movement, the people involved and the decisions that need to be made.",
      category: "Perspectives",
      tags: ["international tax", "mobility"],
      authors: ["Tysma | Lems"],
      publishedAt: "2026-08-31T12:00",
      updatedAt: "2026-08-31T12:00",
      status: "Published",
      featured: true,
      featuredRank: 1,
      publishToLinkedIn: false,
      publicShareEnabled: true,
      heroMedia: "",
      seoDescription: "Editorial note from Tysma | Lems on international lives and cross-border tax advice.",
    },
  ];
  return readJson(articlesKey, fallback);
}

function renderDesk() {
  const articles = getArticles();
  deskCount.textContent = `${articles.length} item${articles.length === 1 ? "" : "s"}`;
  desk.innerHTML = articles
    .map((article) => `
      <article class="desk-row">
        <div>
          <p>${article.journalNumber || "No number"} - ${article.category || "Uncategorised"} - ${article.status || "Draft"}</p>
          <h3>${article.title || "Untitled"}</h3>
          <span>${article.slug || ""}</span>
          <div class="desk-flags">
            ${article.publishToLinkedIn ? "<span>LinkedIn queued</span>" : ""}
            ${article.publicShareEnabled ? "<span>Public share</span>" : ""}
          </div>
        </div>
        <div class="desk-actions">
          <button type="button" data-edit-article="${article.id}">Edit</button>
          <a href="article.html?slug=${encodeURIComponent(article.slug || "")}">Preview</a>
          <button type="button" data-delete-article="${article.id}">Delete</button>
        </div>
      </article>
    `)
    .join("");
}

function resetForm() {
  form.reset();
  form.elements.id.value = "";
  form.elements.status.value = "Draft";
  form.elements.publishedAt.value = new Date().toISOString().slice(0, 16);
  pendingArticleHero = "";
}

function fillForm(article) {
  form.elements.id.value = article.id || "";
  form.elements.journalNumber.value = article.journalNumber || "";
  form.elements.status.value = article.status || "Draft";
  form.elements.title.value = article.title || "";
  form.elements.slug.value = article.slug || "";
  form.elements.standfirst.value = article.standfirst || "";
  form.elements.category.value = article.category || "Perspectives";
  form.elements.publishedAt.value = article.publishedAt || "";
  form.elements.tags.value = (article.tags || []).join(", ");
  form.elements.authors.value = (article.authors || []).join(", ");
  form.elements.body.value = article.body || "";
  form.elements.seoDescription.value = article.seoDescription || "";
  form.elements.featured.checked = Boolean(article.featured);
  form.elements.publishToLinkedIn.checked = Boolean(article.publishToLinkedIn);
  form.elements.publicShareEnabled.checked = Boolean(article.publicShareEnabled);
  form.elements.featuredRank.value = article.featuredRank || "";
  pendingArticleHero = article.heroMedia || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

manager.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-hero]");
  if (!button) return;
  const images = readJson(heroKey, fallbackHeroImages).filter((image) => image.id !== button.dataset.removeHero);
  saveJson(heroKey, images);
  renderHeroManager();
});

upload.addEventListener("change", async () => {
  const file = upload.files[0];
  if (!file) return;
  const src = await readFileAsDataUrl(file);
  const images = readJson(heroKey, fallbackHeroImages);
  images.push({ id: crypto.randomUUID(), src, name: file.name });
  saveJson(heroKey, images);
  upload.value = "";
  renderHeroManager();
});

resetHero.addEventListener("click", () => {
  saveJson(heroKey, fallbackHeroImages);
  renderHeroManager();
});

approachManager.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-approach-hero]");
  if (!button) return;
  const images = readJson(approachHeroKey, fallbackApproachHeroImages).filter((image) => image.id !== button.dataset.removeApproachHero);
  saveJson(approachHeroKey, images);
  renderApproachHeroManager();
});

approachUpload.addEventListener("change", async () => {
  const file = approachUpload.files[0];
  if (!file) return;
  const src = await readFileAsDataUrl(file);
  const images = readJson(approachHeroKey, fallbackApproachHeroImages);
  images.push({ id: crypto.randomUUID(), src, name: file.name });
  saveJson(approachHeroKey, images);
  approachUpload.value = "";
  renderApproachHeroManager();
});

resetApproachHero.addEventListener("click", () => {
  saveJson(approachHeroKey, fallbackApproachHeroImages);
  renderApproachHeroManager();
});

socialForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const links = fallbackSocialLinks.map((link) => ({
    ...link,
    url: socialForm.elements[link.id].value.trim(),
  }));
  saveJson(socialLinksKey, links);
  socialStatus.textContent = "Social links saved.";
});

resetSocialLinks.addEventListener("click", () => {
  saveJson(socialLinksKey, fallbackSocialLinks);
  fillSocialForm();
  socialStatus.textContent = "Social links reset.";
});

corporatePageForm.addEventListener("change", (event) => {
  if (event.target.name === "slug") fillCorporatePageForm(event.target.value);
});

corporatePageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const pages = getCorporatePages();
  const slug = corporatePageForm.elements.slug.value;
  const existing = pages.find((page) => page.slug === slug);
  const nextPage = {
    ...(existing || {}),
    slug,
    label: existing?.label || corporatePageForm.elements.slug.selectedOptions[0].textContent,
    status: corporatePageForm.elements.status.value,
    updatedAt: corporatePageForm.elements.updatedAt.value || new Date().toISOString().slice(0, 10),
    title: corporatePageForm.elements.title.value,
    intro: corporatePageForm.elements.intro.value,
    body: corporatePageForm.elements.body.value,
    seoDescription: corporatePageForm.elements.seoDescription.value,
  };

  saveJson(corporatePagesKey, pages.map((page) => page.slug === slug ? nextPage : page));
  corporatePageStatus.textContent = `${nextPage.label} saved.`;
  renderCorporatePageList();
});

resetCorporatePages.addEventListener("click", () => {
  saveJson(corporatePagesKey, fallbackCorporatePages);
  fillCorporatePageForm();
  renderCorporatePageList();
  corporatePageStatus.textContent = "Corporate pages reset.";
});

form.elements.title.addEventListener("input", () => {
  if (!form.elements.id.value) form.elements.slug.value = slugify(form.elements.title.value);
});

articleHero.addEventListener("change", async () => {
  const file = articleHero.files[0];
  pendingArticleHero = file ? await readFileAsDataUrl(file) : "";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const articles = getArticles();
  const id = form.elements.id.value || crypto.randomUUID();
  const existing = articles.find((article) => article.id === id);
  const now = new Date().toISOString().slice(0, 16);
  const article = {
    id,
    journalNumber: form.elements.journalNumber.value,
    title: form.elements.title.value,
    slug: slugify(form.elements.slug.value || form.elements.title.value),
    standfirst: form.elements.standfirst.value,
    body: form.elements.body.value,
    category: form.elements.category.value,
    tags: form.elements.tags.value.split(",").map((tag) => tag.trim()).filter(Boolean),
    authors: form.elements.authors.value.split(",").map((author) => author.trim()).filter(Boolean),
    publishedAt: form.elements.publishedAt.value || now,
    updatedAt: now,
    status: form.elements.status.value,
    featured: form.elements.featured.checked,
    featuredRank: form.elements.featuredRank.value,
    publishToLinkedIn: form.elements.publishToLinkedIn.checked,
    publicShareEnabled: form.elements.publicShareEnabled.checked,
    heroMedia: pendingArticleHero,
    seoDescription: form.elements.seoDescription.value,
  };

  const next = existing ? articles.map((item) => item.id === id ? article : item) : [article, ...articles];
  saveJson(articlesKey, next);
  resetForm();
  renderDesk();
});

newArticle.addEventListener("click", resetForm);

desk.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-article]");
  const deleteButton = event.target.closest("[data-delete-article]");
  const articles = getArticles();

  if (editButton) {
    const article = articles.find((item) => item.id === editButton.dataset.editArticle);
    if (article) fillForm(article);
  }

  if (deleteButton) {
    saveJson(articlesKey, articles.filter((item) => item.id !== deleteButton.dataset.deleteArticle));
    renderDesk();
  }
});

renderHeroManager();
renderApproachHeroManager();
fillSocialForm();
fillCorporatePageForm();
renderCorporatePageList();
resetForm();
renderDesk();
