'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import styles from './page.module.css';

const icons = {
  webapp: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  funnel: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
    </svg>
  ),
  automation: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4"/>
      <path d="m6.8 15-3.5 2"/>
      <path d="m20.7 17-3.5-2"/>
      <path d="M6.8 9 3.3 7"/>
      <path d="m20.7 7-3.5 2"/>
      <path d="m9 22 3-8 3 8"/>
      <path d="M8 22h8"/>
      <path d="M12 2a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.4"/>
      <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.4"/>
    </svg>
  ),
  tool: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  clone: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  ),
  upload: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" x2="12" y1="3" y2="15"/>
    </svg>
  ),
};

interface ProjectType {
  id: string;
  icon: ReactNode;
  name: string;
  desc: string;
  comingSoon?: boolean;
}

const projectTypes: ProjectType[] = [
  {
    id: 'webapp',
    icon: icons.webapp,
    name: 'Webapp / SaaS',
    desc: 'Full application with user accounts',
  },
  {
    id: 'funnel',
    icon: icons.funnel,
    name: 'Website / Funnel',
    desc: 'Marketing site or landing pages',
  },
  {
    id: 'automation',
    icon: icons.automation,
    name: 'Automation',
    desc: 'Build a workflow or integration',
  },
  {
    id: 'tool',
    icon: icons.tool,
    name: 'Tool',
    desc: 'Software with no login required',
  },
  {
    id: 'clone',
    icon: icons.clone,
    name: 'Clone Existing Software',
    desc: 'Paste a URL to replicate an app',
    comingSoon: true,
  },
  {
    id: 'upload',
    icon: icons.upload,
    name: 'Upload Existing Project',
    desc: 'Import your codebase to continue',
    comingSoon: true,
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = (typeId: string) => {
    setSelectedType(typeId);
    setIsLoading(true);
    setTimeout(() => {
      router.push(`/chat?type=${typeId}`);
    }, 1000);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backBtn}>← Back</Link>
          <span className={styles.headerTitle}>New Project</span>
        </div>
        <Avatar initials="RO" size="md" />
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.createHeader}>
            <div className={styles.createLabel}>Create a new project</div>
            <h1 className={styles.createTitle}>How do you want to start?</h1>
            <p className={styles.createSubtitle}>Choose a starting point for your project</p>
          </div>

          <div className={styles.optionsGrid}>
            {projectTypes.map((type) => (
              <div
                key={type.id}
                className={`${styles.optionCard} ${selectedType === type.id ? styles.selected : ''} ${type.comingSoon ? styles.comingSoon : ''}`}
                onClick={() => !type.comingSoon && handleSelect(type.id)}
              >
                {type.comingSoon && <div className={styles.comingSoonBadge}>Coming Soon</div>}
                <div className={styles.optionIcon}>
                  {type.icon}
                </div>
                <div className={styles.optionName}>{type.name}</div>
                <div className={styles.optionDesc}>{type.desc}</div>
              </div>
            ))}
          </div>

          <p className={styles.selectHint}>Select a project type to continue</p>
        </div>
      </main>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Setting up your project...</div>
          <div className={styles.loadingSubtext}>Preparing the spec builder</div>
        </div>
      )}
    </div>
  );
}
