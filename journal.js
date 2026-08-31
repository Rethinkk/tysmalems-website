const defaultArticles = [
  {
    id: "journal-001",
    journalNumber: "001",
    title: "International lives require international thinking",
    slug: "international-lives-require-international-thinking",
    standfirst: "A first editorial note on why cross-border tax advice starts with people, movement and context.",
    body: "Every international situation begins with a life or business that crosses borders. Tax follows from that reality. Good advice starts by understanding the movement, the people involved and the decisions that need to be made.\n\nFor Tysma | Lems, that perspective has grown from decades of working with maritime professionals, international businesses and private clients.",
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

const filterLabels = ["All", "International Tax", "Maritime", "Global Mobility", "Personal Business", "Perspectives"];
const siteUrl = "https://www.tysmalems.com";

function categorySlug(category) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function categoryFromSlug(slug) {
  return filterLabels.find((label) => categorySlug(label) === slug) || "All";
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

function setStructuredData(id, data) {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function getArticles() {
  const saved = JSON.parse(localStorage.getItem("tlJournalArticles") || "null");
  return Array.isArray(saved) && saved.length > 0 ? saved : defaultArticles;
}

function publishedArticles() {
  return getArticles()
    .filter((article) => article.status === "Published")
    .sort((a, b) => {
      if (a.featuredRank && b.featuredRank) return Number(a.featuredRank) - Number(b.featuredRank);
      return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    });
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function metaLine(article) {
  return ["Journal " + (article.journalNumber || ""), article.category, formatDate(article.publishedAt)]
    .filter(Boolean)
    .join(" - ");
}

function articleUrl(article) {
  return `article.html?slug=${encodeURIComponent(article.slug)}`;
}

function canonicalArticleUrl(article) {
  return `${siteUrl}/journal/${article.slug}`;
}

function renderArticleCard(article) {
  return `
    <article class="journal-item">
      <p class="journal-meta">${metaLine(article)}</p>
      <h2>${article.title}</h2>
      <p>${article.standfirst}</p>
      <a href="${articleUrl(article)}">Read Journal -></a>
    </article>
  `;
}

function renderJournalLanding() {
  const filters = document.querySelector("[data-journal-filters]");
  const featured = document.querySelector("[data-journal-featured]");
  const list = document.querySelector("[data-journal-list]");
  if (!filters || !featured || !list) return;
  setCanonical("journal/");
  setStructuredData("journal-collection-schema", {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tysma | Lems Journal",
    description: "Thoughts, observations and perspectives on international lives.",
    url: `${siteUrl}/journal/`,
    publisher: {
      "@type": "Organization",
      name: "Tysma | Lems",
      url: siteUrl,
    },
  });

  let activeFilter = "All";

  function paint() {
    const articles = publishedArticles();
    const filtered = activeFilter === "All" ? articles : articles.filter((article) => article.category === activeFilter);
    const featuredArticle = filtered.find((article) => article.featured) || filtered[0];
    const remaining = featuredArticle ? filtered.filter((article) => article.id !== featuredArticle.id) : filtered;

    filters.innerHTML = filterLabels
      .map((label) => label === "All"
        ? `<button type="button" class="${label === activeFilter ? "is-active" : ""}" data-filter="${label}">${label}</button>`
        : `<a class="${label === activeFilter ? "is-active" : ""}" href="category.html?category=${categorySlug(label)}">${label}</a>`)
      .join("");

    featured.innerHTML = featuredArticle
      ? `
        <article class="featured-journal">
          <p class="journal-meta">${metaLine(featuredArticle)}</p>
          <h2>${featuredArticle.title}</h2>
          <p>${featuredArticle.standfirst}</p>
          <a href="${articleUrl(featuredArticle)}">Read Journal -></a>
        </article>
      `
      : `<p>No published Journal items yet.</p>`;

    list.innerHTML = remaining.length > 0
      ? remaining.map(renderArticleCard).join("")
      : `<p class="journal-empty">More Journal items will appear here once published.</p>`;
  }

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    activeFilter = button.dataset.filter;
    paint();
  });

  paint();
}

function renderCategoryPage() {
  const categoryRoot = document.querySelector("[data-category-page]");
  if (!categoryRoot) return;

  const slug = new URLSearchParams(window.location.search).get("category") || "all";
  const category = categoryFromSlug(slug);
  const articles = category === "All"
    ? publishedArticles()
    : publishedArticles().filter((article) => article.category === category);

  document.title = `${category} Journal | Tysma Lems`;
  setMeta("description", `Tysma | Lems Journal articles about ${category}.`);
  setCanonical(`journal/category/${categorySlug(category)}/`);
  setStructuredData("journal-category-schema", {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category} Journal`,
    description: `Tysma | Lems Journal articles about ${category}.`,
    url: `${siteUrl}/journal/category/${categorySlug(category)}/`,
    isPartOf: {
      "@type": "CollectionPage",
      name: "Tysma | Lems Journal",
      url: `${siteUrl}/journal/`,
    },
  });

  categoryRoot.innerHTML = `
    <div class="section-label">Journal category</div>
    <h1 class="page-title">${category}</h1>
    <p>Editorial notes and observations in ${category}.</p>
    <div class="journal-list category-list">
      ${articles.length > 0 ? articles.map(renderArticleCard).join("") : `<p class="journal-empty">No published Journal items in this category yet.</p>`}
    </div>
  `;
}

function renderArticlePage() {
  const articleRoot = document.querySelector("[data-article]");
  if (!articleRoot) return;

  const slug = new URLSearchParams(window.location.search).get("slug");
  const articles = publishedArticles();
  const article = articles.find((item) => item.slug === slug) || articles[0];

  if (!article) {
    articleRoot.innerHTML = "<p>No published Journal item found.</p>";
    return;
  }

  document.title = `${article.title} | Tysma Lems`;
  setMeta("description", article.seoDescription || article.standfirst);
  setMeta("og:title", article.socialTitle || article.title, "property");
  setMeta("og:description", article.socialDescription || article.standfirst, "property");
  setMeta("og:type", "article", "property");
  setMeta("og:url", canonicalArticleUrl(article), "property");
  setMeta("twitter:card", article.heroMedia ? "summary_large_image" : "summary");
  setMeta("twitter:title", article.socialTitle || article.title);
  setMeta("twitter:description", article.socialDescription || article.standfirst);
  setCanonical(`journal/${article.slug}/`);
  setStructuredData("journal-article-schema", {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonicalArticleUrl(article)}#article`,
    headline: article.title,
    description: article.seoDescription || article.standfirst,
    url: canonicalArticleUrl(article),
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    articleSection: article.category,
    keywords: article.tags || [],
    author: (article.authors || ["Tysma | Lems"]).map((author) => ({
      "@type": "Person",
      name: author,
    })),
    publisher: {
      "@type": "Organization",
      name: "Tysma | Lems",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalArticleUrl(article),
    },
  });
  const paragraphs = String(article.body || "")
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");

  articleRoot.innerHTML = `
    <p class="journal-meta">${metaLine(article)}</p>
    <h1 class="page-title">${article.title}</h1>
    <p class="article-standfirst">${article.standfirst}</p>
    ${article.heroMedia ? `<img class="article-hero" src="${article.heroMedia}" alt="">` : ""}
    <div class="article-body">${paragraphs}</div>
    <aside class="article-contact">
      <p>If you would like to know more about this subject, contact Tysma | Lems.</p>
      <a href="contact.html">Contact us</a>
    </aside>
    <footer class="article-footer">
      <p class="article-updated">Updated ${formatDate(article.updatedAt || article.publishedAt)}</p>
      <div class="article-footer-actions">
        ${article.publicShareEnabled ? `
          <div class="article-share" aria-label="Share article">
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener">Share on LinkedIn</a>
            <button type="button" data-copy-article-link>Copy link</button>
          </div>
        ` : ""}
        <a class="article-back-link" href="insights.html">Back to Journal</a>
      </div>
    </footer>
  `;

  const copyButton = articleRoot.querySelector("[data-copy-article-link]");
  copyButton?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(window.location.href);
    copyButton.textContent = "Copied";
  });
}

renderJournalLanding();
renderCategoryPage();
renderArticlePage();
