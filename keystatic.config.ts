import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: { kind: "local" },
  ui: { brand: { name: "Prabhash Jha" } },
  collections: {
    posts: collection({
      label: "Posts",
      slugField: "slug",
      path: "src/content/posts/*",
      format: { contentField: "content", data: "yaml" },
      entryLayout: "content",
      columns: ["title", "pubDate"],
      schema: {
        title: fields.text({ label: "Title" }),
        slug: fields.slug({
          name: { label: "URL slug", description: "Becomes /post/<slug>. Don't change it on an existing post — it breaks the link in Google." },
        }),
        description: fields.text({ label: "Description", multiline: true,
          description: "One line. Shows on cards and in Google results." }),
        pubDate: fields.date({ label: "Publish date" }),
        category: fields.select({
          label: "Topic",
          description: "Decides which topic page this appears on.",
          options: [
            { label: "Digital Marketing", value: "Digital Marketing" },
            { label: "Performance & Affiliate", value: "Performance & Affiliate" },
            { label: "Brand Building", value: "Brand Building" },
            { label: "Business & Finance", value: "Business & Finance" },
            { label: "AI & Automation", value: "AI & Automation" },
            { label: "Founder Lessons", value: "Founder Lessons" },
            { label: "Business", value: "Business" },
          ],
          defaultValue: "Digital Marketing",
        }),
        cover: fields.text({ label: "Cover image URL", description: "Optional. Paste a full https:// image URL." }),
        content: fields.markdoc({ label: "Content", extension: "md" }),
      },
    }),
  },
});
