import React, { useState, useEffect } from 'react';
import { view } from '@forge/bridge';
import { invoke } from '@forge/bridge';
import Breadcrumbs from './components/Breadcrumbs';
import PageTree from './components/PageTree';
import UpgradePrompt from './components/UpgradePrompt';

export default function App() {
  const [context, setContext] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState(null);
  const [breadcrumbsLoading, setBreadcrumbsLoading] = useState(false);
  const [userCount, setUserCount] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);

  useEffect(() => {
    view.getContext().then(setContext);
    view.onContextUpdate(setContext);
  }, []);

  useEffect(() => {
    if (!context?.content?.id) return;
    setBreadcrumbsLoading(true);
    invoke('getBreadcrumbs', {
      pageId: context.content.id,
      spaceKey: context?.space?.key,
    })
      .then(setBreadcrumbs)
      .catch(() => setBreadcrumbs(null))
      .finally(() => setBreadcrumbsLoading(false));
  }, [context]);

  useEffect(() => {
    invoke('getUserCount').then(setUserCount).catch(() => {});
    invoke('startTrial').then(setTrialStatus).catch(() => {});
  }, []);

  const spaceKey = context?.space?.key;
  const currentPageId = context?.content?.id;

  return (
    <div>
      <UpgradePrompt trialStatus={trialStatus} userCount={userCount} />
      <Breadcrumbs breadcrumbs={breadcrumbs} loading={breadcrumbsLoading} />
      <PageTree spaceKey={spaceKey} currentPageId={currentPageId} />
    </div>
  );
}
