import React from 'react';
import styles from './Breadcrumbs.module.css';

export default function Breadcrumbs({ breadcrumbs, loading }) {
  if (loading) {
    return <div className={styles.breadcrumbs}>Loading...</div>;
  }

  if (!breadcrumbs) return null;

  return (
    <div className={styles.breadcrumbs}>
      <span className={styles.crumb}>
        <a
          href={`/wiki/spaces/${breadcrumbs.space?.key}`}
          className={styles.link}
        >
          {breadcrumbs.space?.name || breadcrumbs.space?.key}
        </a>
      </span>
      {breadcrumbs.ancestors?.map((a) => (
        <span key={a.id} className={styles.crumb}>
          <span className={styles.separator}>›</span>
          <a href={a.url} className={styles.link}>
            {a.title}
          </a>
        </span>
      ))}
      <span className={styles.crumb}>
        <span className={styles.separator}>›</span>
        <span className={styles.current}>
          {breadcrumbs.current?.title}
        </span>
      </span>
    </div>
  );
}
