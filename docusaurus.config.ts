import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const GITHUB_ORG = 'L3-iGrant';
const GITHUB_REPO = 'eudi-wallet-tracker';
const GITHUB_BRANCH = 'main';

const config: Config = {
  title: 'EUDI Wallet Tracker',
  tagline: 'Member State readiness for the European Digital Identity Wallet',
  favicon: 'img/favicon.ico',

  url: 'https://eudi-tracker.igrant.io',
  baseUrl: '/',

  organizationName: GITHUB_ORG,
  projectName: GITHUB_REPO,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', type: 'image/png', sizes: '16x16', href: '/img/favicon-16.png'}},
    {tagName: 'link', attributes: {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon-32.png'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', sizes: '180x180', href: '/img/apple-touch-icon.png'}},
    {tagName: 'link', attributes: {rel: 'icon', type: 'image/png', sizes: '192x192', href: '/img/android-192.png'}},
    // Geist typeface, matching docs.igrant.io and the compliance site.
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'}},
    {tagName: 'link', attributes: {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap'}},
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/edit/${GITHUB_BRANCH}/`,
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/og-default.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'EUDI Wallet Status Tracker',
      items: [
        {to: '/tracker/table', label: 'Table', position: 'left'},
        {to: '/intro', label: 'Docs', position: 'left'},
        {
          href: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Tracker',
          items: [
            {label: 'Map view', to: '/tracker'},
            {label: 'Table view', to: '/tracker/table'},
          ],
        },
        {
          title: 'Docs',
          items: [
            {label: 'Overview', to: '/intro'},
            {label: 'About', to: '/about'},
          ],
        },
        {
          title: 'iGrant.io',
          items: [
            {label: 'iGrant.io', href: 'https://www.igrant.io'},
            {label: 'Data Wallet', href: 'https://www.igrant.io/datawallet-for-eudi-wallet.html'},
            {label: 'Organisation Wallet', href: 'https://www.igrant.io/organisationwallet-for-eudi-wallet.html'},
          ],
        },
      ],
      copyright: `EUDI Wallet Status Tracker maintained by iGrant.io (Sweden). Code under EUPL-1.2. Data under CC BY 4.0. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    // Algolia DocSearch placeholder; apply at https://docsearch.algolia.com/apply/
    // algolia: {
    //   appId: 'YOUR_APP_ID',
    //   apiKey: 'YOUR_PUBLIC_API_KEY',
    //   indexName: 'eudi-wallet-tracker',
    // },
  } satisfies Preset.ThemeConfig,

  customFields: {
    giscus: {
      repo: `${GITHUB_ORG}/${GITHUB_REPO}`,
      repoId: 'REPLACE_AFTER_REPO_CREATED',
      category: 'Comments',
      categoryId: 'REPLACE_AFTER_DISCUSSION_CATEGORY_CREATED',
      mapping: 'pathname',
      strict: '0',
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'bottom',
      lang: 'en',
    },
    githubOrg: GITHUB_ORG,
    githubRepo: GITHUB_REPO,
  },
};

export default config;
