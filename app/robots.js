export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/login", "/admin", "/admin-login"],
      },
    ],
    sitemap: "https://neurix-medical.vercel.app/sitemap.xml",
  };
}