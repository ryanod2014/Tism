'use client';

import Link from 'next/link';
import styles from './ProjectCard.module.css';
import { Badge } from '@/components/ui';

export interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  type: 'webapp' | 'ecommerce' | 'blog' | 'funnel' | 'landing';
  status: 'active' | 'idle';
  activeDevs: number;
  messageCount?: number;
}

const typeLabels: Record<string, { icon: string; label: string }> = {
  webapp: { icon: '💻', label: 'Web App' },
  ecommerce: { icon: '🛒', label: 'E-commerce' },
  blog: { icon: '📝', label: 'Blog' },
  funnel: { icon: '📈', label: 'Funnel' },
  landing: { icon: '🎯', label: 'Landing' },
};

function DashboardPreview() {
  return (
    <div className={styles.miniDashboard}>
      <div className={styles.miniHeader}>
        <div className={styles.miniLogo}>Acme Dashboard</div>
        <div className={styles.miniNav}>
          <span className={styles.active}>Dashboard</span>
          <span>Users</span>
          <span>Settings</span>
        </div>
        <div className={styles.miniAvatar} />
      </div>
      <div className={styles.miniBody}>
        <div className={styles.miniTitle}>Dashboard</div>
        <div className={styles.miniStats}>
          <div className={styles.miniStat}>
            <div className={styles.miniStatLabel}>Users</div>
            <div className={styles.miniStatValue}>12.8K</div>
          </div>
          <div className={styles.miniStat}>
            <div className={styles.miniStatLabel}>Active</div>
            <div className={styles.miniStatValue}>1.2K</div>
          </div>
          <div className={styles.miniStat}>
            <div className={styles.miniStatLabel}>Revenue</div>
            <div className={styles.miniStatValue}>$48K</div>
          </div>
          <div className={styles.miniStat}>
            <div className={styles.miniStatLabel}>Churn</div>
            <div className={styles.miniStatValue}>2.4%</div>
          </div>
        </div>
        <div className={styles.miniChart}>
          <div className={styles.miniChartTitle}>Revenue</div>
          <div className={styles.miniChartArea}>
            <div className={styles.miniChartLine} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EcommercePreview() {
  return (
    <div className={styles.miniEcommerce}>
      <div className={styles.miniHeader}>
        <div className={styles.miniLogo}>ShopNow</div>
        <div className={styles.miniNav}>
          <span className={styles.active}>Products</span>
          <span>Cart</span>
          <span>Orders</span>
        </div>
        <div className={styles.miniAvatar} />
      </div>
      <div className={styles.miniProducts}>
        <div className={styles.miniProduct}>
          <div className={`${styles.miniProductImg} ${styles.yellow}`} />
          <div className={styles.miniProductInfo}>
            <div className={styles.miniProductName}>Product 1</div>
            <div className={styles.miniProductPrice}>$29.99</div>
          </div>
        </div>
        <div className={styles.miniProduct}>
          <div className={`${styles.miniProductImg} ${styles.blue}`} />
          <div className={styles.miniProductInfo}>
            <div className={styles.miniProductName}>Product 2</div>
            <div className={styles.miniProductPrice}>$49.99</div>
          </div>
        </div>
        <div className={styles.miniProduct}>
          <div className={`${styles.miniProductImg} ${styles.pink}`} />
          <div className={styles.miniProductInfo}>
            <div className={styles.miniProductName}>Product 3</div>
            <div className={styles.miniProductPrice}>$19.99</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogPreview() {
  return (
    <div className={styles.miniBlog}>
      <div className={styles.miniBlogHeader}>
        <div className={styles.miniBlogLogo}>The Blog</div>
        <div className={styles.miniBlogNav}>
          <span>Articles</span>
          <span>About</span>
        </div>
      </div>
      <div className={styles.miniBlogBody}>
        <div className={styles.miniBlogFeatured}>
          <div className={styles.miniBlogFeaturedImg} />
          <div className={styles.miniBlogFeaturedContent}>
            <div className={styles.miniBlogTag}>Featured</div>
            <div className={styles.miniBlogTitle}>Getting Started with Modern Web Development</div>
          </div>
        </div>
        <div className={styles.miniBlogPosts}>
          <div className={styles.miniBlogPost} />
          <div className={styles.miniBlogPost} />
        </div>
      </div>
    </div>
  );
}

export function ProjectCard({
  name,
  description,
  type,
  status,
  activeDevs,
  messageCount = 0,
}: ProjectCardProps) {
  const typeConfig = typeLabels[type];

  const renderPreview = () => {
    switch (type) {
      case 'webapp':
        return <DashboardPreview />;
      case 'ecommerce':
        return <EcommercePreview />;
      case 'blog':
        return <BlogPreview />;
      default:
        return <DashboardPreview />;
    }
  };

  return (
    <Link href="/project" className={styles.card}>
      {messageCount > 0 && (
        <span className={styles.messageBadge}>{messageCount}</span>
      )}
      
      <div className={styles.preview}>
        <div className={styles.previewContent}>
          {renderPreview()}
        </div>
      </div>
      
      <div className={styles.metaRow}>
        <Badge variant={type} className={styles.typeBadge}>
          {typeConfig.icon} {typeConfig.label}
        </Badge>
        <div className={styles.status}>
          <span className={`${styles.statusDot} ${styles[status]}`} />
          <span>{activeDevs} devs {status === 'active' ? 'active' : 'on standby'}</span>
        </div>
      </div>

      <div className={styles.header}>
        <div className={styles.name}>{name}</div>
      </div>

      <div className={styles.desc}>{description}</div>
    </Link>
  );
}
