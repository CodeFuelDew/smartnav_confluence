import React, { useState, useEffect } from 'react';
import { view } from '@forge/bridge';
import { invoke } from '@forge/bridge';
import Breadcrumbs from './components/Breadcrumbs';
import PageTree from './components/PageTree';

export default function App() {
  const [context, setContext] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState(null);
  const [breadcrumbsLoading, setBreadcrumbsLoading] = useState(false);

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  useEffect(() => {
    if (!context?.extension?.content?.id) return;
    setBreadcrumbsLoading(true);
    invoke('getBreadcrumbs', {
      pageId: context.extension.content.id,
      spaceKey: context?.extension?.space?.key,
    })
      .then(setBreadcrumbs)
      .catch(() => setBreadcrumbs(null))
      .finally(() => setBreadcrumbsLoading(false));
  }, [context]);

  const spaceKey = context?.extension?.space?.key;
  const currentPageId = context?.extension?.content?.id;

  return (
    <div>
      <Breadcrumbs breadcrumbs={breadcrumbs} loading={breadcrumbsLoading} />
      <PageTree spaceKey={spaceKey} currentPageId={currentPageId} />
    </div>
  );
}
