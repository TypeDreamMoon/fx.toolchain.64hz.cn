import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: { light: 'github-light', dark: 'github-dark' },
      // Plugin-specific fences use C++ colouring; bundled languages load normally.
      fallbackLanguage: 'cpp',
    },
  },
});
