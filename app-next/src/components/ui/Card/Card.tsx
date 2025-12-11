import styles from './Card.module.css';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  hover = false,
  onClick,
  className = '',
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${hover ? styles.hover : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
