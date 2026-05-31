import Resolver from '@forge/resolver';
import { asUser, asApp, route } from '@forge/api';
import { storage } from '@forge/kvs';
import { STORAGE_KEYS, TRIAL_DAYS } from '../utils/constants';

const resolver = new Resolver();

resolver.define('getTopLevelPages', async ({ payload }) => {
  const { spaceKey } = payload;
  try {
    const spaceRes = await asUser().requestConfluence(
      route`/wiki/api/v2/spaces?keys=${spaceKey}`
    );
    if (!spaceRes.ok) {
      return { error: `Failed to fetch space: ${spaceRes.status}` };
    }
    const spaceData = await spaceRes.json();
    const spaces = spaceData.results || [];
    if (spaces.length === 0) {
      return { error: 'Space not found' };
    }
    const spaceId = spaces[0].id;
    const homepageId = String(spaces[0].homepageId || '');

    const pagesResult = await asUser().requestConfluence(
      route`/wiki/api/v2/spaces/${spaceId}/pages?limit=250`
    );
    if (!pagesResult.ok) {
      const errText = await pagesResult.text();
      return { error: `API error ${pagesResult.status}: ${errText}` };
    }
    const data = await pagesResult.json();
    const all = data.results || [];

    const filtered = homepageId ? all.filter((p) => String(p.id) !== homepageId) : all;

    const pageMap = {};
    filtered.forEach((p) => {
      pageMap[p.id] = {
        id: p.id,
        title: p.title,
        parentId: String(p.parentId || '') === homepageId ? null : (p.parentId || null),
        url: p._links?.webui || '',
        children: [],
      };
    });

    filtered.forEach((p) => {
      const adjustedParentId = String(p.parentId || '') === homepageId ? null : (p.parentId || null);
      if (adjustedParentId && pageMap[adjustedParentId]) {
        pageMap[adjustedParentId].children.push(p.id);
      }
    });

    const rootIds = filtered
      .filter((p) => !pageMap[p.id].parentId)
      .map((p) => p.id);

    return { pages: pageMap, rootIds };
  } catch (e) {
    return { error: `getTopLevelPages error: ${e.message}` };
  }
});

resolver.define('getChildPages', async ({ payload }) => {
  const { parentId } = payload;
  try {
    const res = await asUser().requestConfluence(
      route`/wiki/api/v2/pages/${parentId}/children?limit=250`
    );
    if (!res.ok) {
      const errText = await res.text();
      return { error: `API error ${res.status}: ${errText}` };
    }
    const data = await res.json();
    return (data.results || []).map((p) => ({
      id: p.id,
      title: p.title,
      url: p._links?.webui || '',
    }));
  } catch (e) {
    return { error: `getChildPages error: ${e.message}` };
  }
});

resolver.define('getBreadcrumbs', async ({ payload }) => {
  const { pageId, spaceKey } = payload;
  try {
    const res = await asUser().requestConfluence(
      route`/wiki/api/v2/pages/${pageId}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const ancestors = [];
    let current = data;
    while (current.parentId) {
      const parentRes = await asUser().requestConfluence(
        route`/wiki/api/v2/pages/${current.parentId}`
      );
      if (!parentRes.ok) break;
      const parent = await parentRes.json();
      ancestors.unshift({
        id: parent.id,
        title: parent.title,
        url: parent._links?.webui || '',
      });
      current = parent;
    }
    return {
      current: { id: data.id, title: data.title },
      ancestors,
      space: { key: spaceKey, name: spaceKey },
    };
  } catch {
    return null;
  }
});

resolver.define('getUserCount', async () => {
  try {
    const res = await asApp().requestConfluence(route`/wiki/api/v2/users?limit=11`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.results?.length || 0;
  } catch {
    return 0;
  }
});

resolver.define('startTrial', async () => {
  try {
    const existing = await storage.get(STORAGE_KEYS.TRIAL_START);
    if (existing) {
      const elapsed = Math.floor((Date.now() - new Date(existing).getTime()) / 86400000);
      const remaining = Math.max(0, TRIAL_DAYS - elapsed);
      return { active: remaining > 0, daysRemaining: remaining };
    }
    await storage.set(STORAGE_KEYS.TRIAL_START, new Date().toISOString());
    return { active: true, daysRemaining: TRIAL_DAYS };
  } catch {
    return { active: false, daysRemaining: 0 };
  }
});

export const handler = resolver.getDefinitions();
