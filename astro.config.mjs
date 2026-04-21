import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  site: process.env.SITE ?? "https://example.github.io",
  base:
    process.env.BASE_PATH ??
    (isGitHubActions && repositoryName ? `/${repositoryName}/` : "/"),
  integrations: [mdx()]
});
