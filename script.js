const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const defaultApproachHeroImages = [
  { id: "approach-room", src: "approach.png", alt: "Approach interior" },
  { id: "approach-global", src: "hero-global-mobility.png", alt: "International perspective" },
  { id: "approach-private", src: "hero-private-clients.png", alt: "Private clients" },
];
const defaultSocialLinks = [
  { id: "linkedin", label: "LinkedIn", shortLabel: "in", url: "https://www.linkedin.com/company/tysma-lems-international-tax-consultants" },
];

function syncHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

menuButton.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    header.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

document.querySelectorAll("[data-hero-slides]").forEach((heroSlides) => {
  if (heroSlides.dataset.heroSlides === "approach") {
    const savedApproachHeroImages = JSON.parse(localStorage.getItem("tlApproachHeroImages") || "null");
    const images = Array.isArray(savedApproachHeroImages) && savedApproachHeroImages.length > 0
      ? savedApproachHeroImages
      : defaultApproachHeroImages;

    heroSlides.innerHTML = images
      .map((image, index) => `<img src="${image.src}" alt="" class="hero-image${index === 0 ? " is-active" : ""}">`)
      .join("");
  }

  const heroImages = [...heroSlides.querySelectorAll(".hero-image")];
  let activeHeroImage = 0;

  if (heroImages.length > 1) {
    window.setInterval(() => {
      heroImages[activeHeroImage].classList.remove("is-active");
      activeHeroImage = (activeHeroImage + 1) % heroImages.length;
      heroImages[activeHeroImage].classList.add("is-active");
    }, 5200);
  }
});

document.querySelectorAll(".social-links").forEach((socialLinks) => {
  const savedSocialLinks = JSON.parse(localStorage.getItem("tlSocialLinks") || "null");
  const savedLinkedIn = Array.isArray(savedSocialLinks)
    ? savedSocialLinks.find((link) => link.id === "linkedin")
    : null;
  const savedUrl = savedLinkedIn?.url;
  const links = [{ ...defaultSocialLinks[0], url: savedUrl && !/^https:\/\/www\.linkedin\.com\/company\/3201828\/?$/.test(savedUrl) ? savedUrl : defaultSocialLinks[0].url }];
  const activeLinks = links.filter((link) => link.url);

  socialLinks.innerHTML = (activeLinks.length > 0 ? activeLinks : defaultSocialLinks)
    .map((link) => `<a href="${link.url || "#"}" aria-label="${link.label}"${link.url ? ' target="_blank" rel="noopener"' : ""}>${link.shortLabel}</a>`)
    .join("");
});

const contactForm = document.querySelector("[data-contact-form]");
const contactStatus = document.querySelector("[data-contact-status]");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());
  const submitButton = contactForm.querySelector('button[type="submit"]');

  if (contactStatus) contactStatus.textContent = "Sending your message.";
  if (submitButton) submitButton.disabled = true;

  fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "The message could not be sent.");
      }
      contactForm.reset();
      if (contactStatus) contactStatus.textContent = "Thank you. Your message has been sent.";
    })
    .catch((error) => {
      if (contactStatus) contactStatus.textContent = error.message;
    })
    .finally(() => {
      if (submitButton) submitButton.disabled = false;
    });
});
