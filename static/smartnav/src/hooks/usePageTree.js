import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@forge/bridge';
import useLocalStorage from './useLocalStorage';

export default function usePageTree(spaceKey) {
  const [pages, setPages] = useState({});
  const [rootIds, setRootIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useLocalStorage(
    `smartnav:expanded:${spaceKey}`,
    []
  );
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  useEffect(() => {
    if (!spaceKey) return;
    setLoading(true);
    setError(null);
    setPages({});
    setRootIds([]);

    invoke('getTopLevelPages', { spaceKey })
      .then((res) => {
        if (res.error) { setError(res.error); return; }
        if (!res.pages) {
          setError('Invalid response from server');
          return;
        }
        const pageMap = {};
        Object.values(res.pages).forEach((p) => {
          pageMap[p.id] = { ...p, loaded: true, children: p.children || [] };
        });
        setPages(pageMap);
        setRootIds(res.rootIds || []);
      })
      .catch((e) => { console.error('getTopLevelPages invoke error:', e); setError('Failed to load tree'); })
      .finally(() => setLoading(false));
  }, [spaceKey]);

  const fetchChildren = useCallback(async (parentId) => {
    if (pagesRef.current[parentId]?.loaded) return;
    try {
      const res = await invoke('getChildPages', { parentId });
      if (res.error) { setError(res.error); return; }
      setPages((prev) => {
        const next = { ...prev };
        next[parentId] = { ...next[parentId], loaded: true, children: res.map((c) => c.id) };
        res.forEach((c) => {
          if (!next[c.id]) next[c.id] = { ...c, loaded: false, children: [] };
        });
        return next;
      });
    } catch (e) {
      console.error('fetchChildren error:', e);
      setError('Failed to load children');
    }
  }, []);

  const toggleExpanded = useCallback((id) => {
    setExpanded((prev) => {
      const isExpanded = prev.includes(id);
      if (isExpanded) return prev.filter((n) => n !== id);
      fetchChildren(id);
      return [...prev, id];
    });
  }, [fetchChildren, setExpanded]);

  useEffect(() => {
    if (expanded.length > 0 && rootIds.length > 0 && Object.keys(pages).length > 0) {
      const pageMap = pagesRef.current;
      expanded.forEach((id) => {
        if (pageMap[id] && !pageMap[id].loaded) {
          fetchChildren(id);
        }
      });
    }
  }, [expanded, rootIds, pages, fetchChildren]);

  const retry = useCallback(() => {
    setPages({});
    setRootIds([]);
    setLoading(true);
    setError(null);

    invoke('getTopLevelPages', { spaceKey })
      .then((res) => {
        if (res.error) { setError(res.error); return; }
        if (!res.pages) {
          setError('Invalid response from server');
          return;
        }
        const pageMap = {};
        Object.values(res.pages).forEach((p) => {
          pageMap[p.id] = { ...p, loaded: true, children: p.children || [] };
        });
        setPages(pageMap);
        setRootIds(res.rootIds || []);
      })
      .catch((e) => { console.error('retry error:', e); setError('Failed to load tree'); })
      .finally(() => setLoading(false));
  }, [spaceKey]);

  return { pages, rootIds, loading, error, expanded, toggleExpanded, fetchChildren, retry };
}
