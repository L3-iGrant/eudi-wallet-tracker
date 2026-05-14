import React from 'react';
import Giscus from '@giscus/react';
import {useColorMode} from '@docusaurus/theme-common';
import {useLocation} from '@docusaurus/router';
import siteConfig from '@generated/docusaurus.config';

export default function GiscusComments() {
  const {colorMode} = useColorMode();
  const {pathname} = useLocation();
  const cfg: any = (siteConfig.customFields as any)?.giscus ?? {};

  if (!cfg.repo || cfg.repoId === 'REPLACE_AFTER_REPO_CREATED') {
    return (
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          border: 'var(--tracker-border)',
          borderRadius: 'var(--tracker-card-radius)',
          color: '#6b7280',
          fontSize: '0.85rem',
        }}
      >
        Comments will appear here once the GitHub repo and Giscus discussion
        category are configured. See <code>docusaurus.config.ts</code>.
      </div>
    );
  }

  return (
    <div style={{marginTop: '2rem'}} key={pathname}>
      <Giscus
        id="comments"
        repo={cfg.repo}
        repoId={cfg.repoId}
        category={cfg.category}
        categoryId={cfg.categoryId}
        mapping={cfg.mapping ?? 'pathname'}
        strict={cfg.strict ?? '0'}
        reactionsEnabled={cfg.reactionsEnabled ?? '1'}
        emitMetadata={cfg.emitMetadata ?? '0'}
        inputPosition={cfg.inputPosition ?? 'bottom'}
        theme={colorMode === 'dark' ? 'dark' : 'light'}
        lang={cfg.lang ?? 'en'}
        loading="lazy"
      />
    </div>
  );
}
