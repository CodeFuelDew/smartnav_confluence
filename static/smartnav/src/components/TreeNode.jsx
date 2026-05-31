import React from 'react';
import styles from './TreeNode.module.css';

export default function TreeNode({ pageId, pages, expanded, onToggle, currentPageId, depth = 0 }) {
  const page = pages[pageId];
  if (!page) return null;

  const isExpanded = expanded.includes(pageId);
  const isActive = pageId === currentPageId;
  const hasChildren = page.children?.length > 0;

  return (
    <div className={styles.node}>
      <div
        className={`${styles.row} ${isActive ? styles.active : ''}`}
        onClick={() => onToggle(pageId)}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        <span className={styles.chevronWrapper}>
          <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>
            {hasChildren ? '▸' : ''}
          </span>
        </span>
        <span className={styles.title}>
          {page.title}
        </span>
      </div>
      {isExpanded && hasChildren && (
        <div className={styles.children}>
          {page.children.map((childId) => (
            <TreeNode
              key={childId}
              pageId={childId}
              pages={pages}
              expanded={expanded}
              onToggle={onToggle}
              currentPageId={currentPageId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
