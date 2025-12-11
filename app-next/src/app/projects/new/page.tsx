'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import styles from './page.module.css';

const projectTypes = [
  {
    id: 'tool',
    icon: '🛠️',
    name: 'Tool',
    desc: 'Software with no login required',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  },
  {
    id: 'automation',
    icon: '⚡',
    name: 'Automation',
    desc: 'Build a workflow or integration',
    gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
  },
  {
    id: 'clone',
    icon: '🔗',
    name: 'Clone Existing Software',
    desc: 'Paste a URL to replicate an app',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  {
    id: 'webapp',
    icon: '🚀',
    name: 'Webapp / SaaS',
    desc: 'Full application with user accounts',
    gradient: 'linear-gradient(135deg, #00d4ff, #0099cc)',
  },
  {
    id: 'website',
    icon: '🌐',
    name: 'Website / Funnel',
    desc: 'Marketing site or landing pages',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
  },
  {
    id: 'upload',
    icon: '📤',
    name: 'Upload Existing Project',
    desc: 'Import your codebase to continue',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
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
          <Link href="/home" className={styles.backBtn}>← Back</Link>
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
                className={`${styles.optionCard} ${selectedType === type.id ? styles.selected : ''}`}
                onClick={() => handleSelect(type.id)}
              >
                <div className={styles.optionIcon} style={{ background: type.gradient }}>
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
