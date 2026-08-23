export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      priority: 1,
      changeFrequency: "weekly",
    },
  ];
}