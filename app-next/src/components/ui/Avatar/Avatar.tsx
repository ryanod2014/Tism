import styles from './Avatar.module.css';

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'circle' | 'rounded';
  className?: string;
  onClick?: () => void;
}

export function Avatar({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  variant = 'circle',
  className = '',
  onClick,
}: AvatarProps) {
  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${styles[variant]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {src ? (
        <img src={src} alt={alt} className={styles.image} />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
}
