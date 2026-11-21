import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  site: 'https://jigar786.github.io',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
  // `npm run dev:phone` serves over HTTPS (self-signed) so phones that force https:// can open it.
  vite: { plugins: process.env.DEV_HTTPS ? [basicSsl()] : [] },
});
