import styles from './Badge.module.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'urgent' | 'decision' | 'update' | 'cyan' | 'purple' | 'green' | 'amber' | 'red' | 'webapp' | 'ecommerce' | 'blog' | 'funnel' | 'landing';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]} ${className}`}>
      {children}
    </span>
  );
}
