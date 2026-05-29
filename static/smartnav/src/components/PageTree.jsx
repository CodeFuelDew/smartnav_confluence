import React from 'react';
import usePageTree from '../hooks/usePageTree';
import TreeNode from './TreeNode';
import styles from './PageTree.module.css';

export default function PageTree({ spaceKey, currentPageId }) {
  const { pages, rootIds, loading, error, expanded, toggleExpanded, retry } =
    usePageTree(spaceKey);

  if (!spaceKey) {
    return <div className={styles.message}>No space selected</div>;
  }

  if (loading && rootIds.length === 0) {
    return <div className={styles.message}>Loading page tree...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button className={styles.retryBtn} onClick={retry}>
          Retry
        </button>
      </div>
    );
  }

  if (rootIds.length === 0) {
    return <div className={styles.message}>No pages found</div>;
  }

  return (
    <div className={styles.tree}>
      {rootIds.map((id) => (
        <TreeNode
          key={id}
          pageId={id}
          pages={pages}
          expanded={expanded}
          onToggle={toggleExpanded}
          currentPageId={currentPageId}
        />
      ))}
    </div>
  );
}
