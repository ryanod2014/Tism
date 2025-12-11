'use client';

import Link from 'next/link';
import styles from './InboxCard.module.css';
import { Badge } from '@/components/ui';

export interface InboxCardProps {
  avatar: string;
  project: string;
  time: string;
  type: 'blocker' | 'decision' | 'update';
  message: string;
  href?: string;
}

const typeLabels: Record<string, string> = {
  blocker: 'Blocker',
  decision: 'Decision',
  update: 'Update',
};

export function InboxCard({
  avatar,
  project,
  time,
  type,
  message,
  href = '/project',
}: InboxCardProps) {
  return (
    <Link href={href} className={`${styles.card} ${styles[type]}`}>
      <div className={styles.header}>
        <div className={styles.avatar}>{avatar}</div>
        <div className={styles.meta}>
          <div className={styles.project}>{project}</div>
          <div className={styles.time}>{time}</div>
        </div>
        <Badge variant={type === 'blocker' ? 'urgent' : type} className={styles.typeBadge}>
          {typeLabels[type]}
        </Badge>
      </div>
      <div className={styles.body}>{message}</div>
    </Link>
  );
}
