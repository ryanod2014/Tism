import Link from 'next/link';
import styles from './page.module.css';

const screens = [
  {
    href: '/home',
    icon: '🏠',
    name: 'Home',
    desc: 'Projects dashboard with PM inbox preview',
  },
  {
    href: '/projects/new',
    icon: '✨',
    name: 'New Project',
    desc: 'Create project flow with options',
  },
  {
    href: '/project',
    icon: '📋',
    name: 'Project View',
    desc: 'Ticket board + PM inbox + agent activity',
  },
];

export default function IndexPage() {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>T</div>
        <span className={styles.logoText}>Tism</span>
      </div>
      <p className={styles.tagline}>AI Project Manager Mockup</p>

      <p className={styles.screensLabel}>Available Screens</p>

      <div className={styles.screens}>
        {screens.map((screen) => (
          <Link key={screen.href} href={screen.href} className={styles.screenLink}>
            <div className={styles.screenIcon}>{screen.icon}</div>
            <div className={styles.screenName}>{screen.name}</div>
            <div className={styles.screenDesc}>{screen.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
