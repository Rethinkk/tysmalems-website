const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Tysma | Lems",
  alternateName: "Tysma Lems",
  url: "https://www.tysmalems.com",
  email: "info@tysmalems.com",
  telephone: "+31 10 833 12 25",
  foundingDate: "1953",
  image: "https://www.tysmalems.com/hero-maritime.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Veerhaven 4",
    postalCode: "3016 CJ",
    addressLocality: "Rotterdam",
    addressCountry: "NL",
  },
  areaServed: "International",
  knowsAbout: [
    "International tax",
    "Global mobility",
    "Maritime tax",
    "Cross-border work",
    "Private clients",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tysma | Lems",
  url: "https://www.tysmalems.com",
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: "Tysma | Lems",
  },
};

function addSchema(id, data) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

addSchema("tl-organization-schema", organizationSchema);
addSchema("tl-website-schema", websiteSchema);
