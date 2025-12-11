import Link from 'next/link';
import styles from './Header.module.css';
import { Avatar } from '@/components/ui';

export interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <div className={styles.logoIcon}>T</div>
        <span className={styles.logoText}>Tism</span>
      </Link>

      {children}

      <div className={styles.headerActions}>
        <Avatar initials="RO" size="md" />
      </div>
    </header>
  );
}
