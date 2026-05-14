import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import GiscusComments from '@site/src/components/GiscusComments';
import ShareBar from '@site/src/components/ShareBar';
import {useDoc} from '@docusaurus/plugin-content-docs/client';

export default function FooterWrapper(props: any) {
  const doc: any = useDoc();
  const title = doc?.metadata?.title ?? 'EUDI Wallet Tracker';
  return (
    <>
      <Footer {...props} />
      <ShareBar title={`${title} - iGrant.io EUDI Wallet Tracker`} />
      <GiscusComments />
    </>
  );
}
