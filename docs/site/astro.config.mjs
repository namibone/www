import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: process.env.NAMIBONE_DOCS_ORIGIN ?? 'https://namibone.com',
  base: process.env.NAMIBONE_DOCS_BASE ?? '/docs',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'NamibOne Docs',
      description: 'Practical guides for the NamibOne and N1 Wallet pilot.',
      logo: { src: './src/assets/namibone-mark.svg', alt: '' },
      favicon: '/namibone-mark.svg',
      defaultLocale: 'root',
      locales: { root: { label: 'English', lang: 'en' } },
      customCss: ['./src/styles/namibone.css'],
      sidebar: [
        {
          label: 'Get started',
          items: [
            { label: 'Choose a guide', link: '/' },
            { slug: 'pilot', label: 'About the pilot' },
          ],
        },
        {
          label: 'Pilot quickstarts',
          items: ['citizens', 'staff', 'n1-wallet'],
        },
        {
          label: 'Project reference',
          items: ['developers', 'help', 'releases'],
        },
      ],
    }),
  ],
});
