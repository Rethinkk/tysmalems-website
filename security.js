// Shared rendering boundaries for locally edited CMS content.
window.SiteSecurity = Object.freeze({
  escape(value = "") {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    })[character]);
  },
  readArray(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return Array.isArray(value) && value.every((item) => item && typeof item === "object" && !Array.isArray(item))
        ? value : fallback;
    } catch {
      return fallback;
    }
  },
  url(value, image = false) {
    if (typeof value !== "string" || !value.trim()) return "";
    if (image && /^data:image\/(?:png|jpeg|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i.test(value)) return value;
    try {
      const url = new URL(value, window.location.href);
      if (url.username || url.password) return "";
      if (url.origin === window.location.origin && ["http:", "https:"].includes(url.protocol)) return url.href;
      if (!image && ["https:", "mailto:", "tel:"].includes(url.protocol)) return url.href;
    } catch { /* Invalid user supplied URL. */ }
    return "";
  },
});
