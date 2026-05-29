import Resolver from '@forge/resolver';
import { asUser, asApp } from '@forge/api';
import { storage } from '@forge/kvs';
import { STORAGE_KEYS, API_PAGE_LIMIT, TRIAL_DAYS } from '../utils/constants';

const resolver = new Resolver();

async function fetchPages(route) {
  const all = [];
  let next = route;
  while (next) {
    const res = await asUser().requestConfluence(next);
    const data = await res.json();
    all.push(...data.results);
    next = data._links?.next ? `/rest/api${data._links.next}` : null;
  }
  return all;
}

function mapPage(p) {
  return {
    id: p.id,
    title: p.title,
    url: p._links?.webui || '',
  };
}

resolver.define('getTopLevelPages', async ({ payload }) => {
  const { spaceKey } = payload;
  const spaceRes = await asUser().requestConfluence(`/rest/api/space/${spaceKey}?expand=homepage`);
  const space = await spaceRes.json();
  const homepageId = space.homepage?.id;
  if (!homepageId) return [];

  const pages = await fetchPages(`/rest/api/content/${homepageId}/child/page?limit=${API_PAGE_LIMIT}`);
  return pages.filter((p) => p.type === 'page').map(mapPage);
});

resolver.define('getChildPages', async ({ payload }) => {
  const { parentId } = payload;
  const pages = await fetchPages(`/rest/api/content/${parentId}/child/page?limit=${API_PAGE_LIMIT}`);
  return pages.filter((p) => p.type === 'page').map(mapPage);
});

resolver.define('getBreadcrumbs', async ({ payload }) => {
  const { pageId, spaceKey } = payload;
  const res = await asUser().requestConfluence(`/rest/api/content/${pageId}?expand=ancestors,space`);
  const page = await res.json();
  const ancestors = (page.ancestors || []).map((a) => ({
    id: a.id,
    title: a.title,
    url: a._links?.webui || '',
  }));
  return {
    current: { id: page.id, title: page.title },
    ancestors,
    space: { key: page.space?.key || spaceKey, name: page.space?.name || '' },
  };
});

resolver.define('getUserCount', async () => {
  const res = await asApp().requestConfluence('/rest/api/user/search?limit=11');
  const data = await res.json();
  return data.results?.length || 0;
});

resolver.define('startTrial', async () => {
  const existing = await storage.get(STORAGE_KEYS.TRIAL_START);
  if (existing) {
    const elapsed = Math.floor((Date.now() - new Date(existing).getTime()) / 86400000);
    const remaining = Math.max(0, TRIAL_DAYS - elapsed);
    return { active: remaining > 0, daysRemaining: remaining };
  }
  await storage.set(STORAGE_KEYS.TRIAL_START, new Date().toISOString());
  return { active: true, daysRemaining: TRIAL_DAYS };
});

export const handler = resolver.getDefinitions();
