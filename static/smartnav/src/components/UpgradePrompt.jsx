import React from 'react';
import styles from './UpgradePrompt.module.css';

export default function UpgradePrompt({ trialStatus, userCount }) {
  if (!trialStatus) return null;

  const isOverFreeLimit = userCount > 10;

  if (!isOverFreeLimit) {
    return (
      <div className={styles.freeBadge}>
        Free tier — {userCount} user{userCount !== 1 ? 's' : ''}
      </div>
    );
  }

  if (trialStatus.active) {
    return (
      <div className={styles.trialBanner}>
        Trial active — {trialStatus.daysRemaining} day{trialStatus.daysRemaining !== 1 ? 's' : ''} remaining
      </div>
    );
  }

  return (
    <div className={styles.upgradeBanner}>
      <p className={styles.upgradeText}>
        Your {14}-day trial has ended. Upgrade to continue using Smart Nav.
      </p>
      <a
        href="https://marketplace.atlassian.com/apps/..."
        className={styles.upgradeBtn}
        target="_blank"
        rel="noopener noreferrer"
      >
        Upgrade now
      </a>
    </div>
  );
}
