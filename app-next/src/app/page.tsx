'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout';
import { ProjectCard } from '@/components/features/projects';
import styles from './page.module.css';

const projects = [
  {
    id: 'saas-dashboard',
    name: 'SaaS Dashboard',
    description: 'Analytics dashboard with user management, billing, and real-time metrics.',
    type: 'webapp' as const,
    status: 'active' as const,
    activeDevs: 2,
    messageCount: 3,
  },
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Full-featured online store with cart, checkout, and inventory management.',
    type: 'ecommerce' as const,
    status: 'active' as const,
    activeDevs: 2,
    messageCount: 1,
  },
  {
    id: 'blog-platform',
    name: 'Blog Platform',
    description: 'Content management system with markdown support and SEO optimization.',
    type: 'blog' as const,
    status: 'idle' as const,
    activeDevs: 0,
    messageCount: 0,
  },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('modified');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.main}>
        <section className={styles.projectsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Manage Your Dev Teams</h2>
            <div className={styles.controls}>
              <div className={styles.searchWrapper}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className={styles.sortDropdown}>
                <button
                  className={styles.sortTrigger}
                  onClick={() => setSortMenuOpen(!sortMenuOpen)}
                >
                  <span>↕️</span>
                  <span>{sortBy === 'modified' ? 'Date Modified' : sortBy === 'created' ? 'Date Created' : 'Name (A-Z)'}</span>
                  <span className={styles.sortChevron}>▼</span>
                </button>
                {sortMenuOpen && (
                  <div className={styles.sortMenu}>
                    {['modified', 'created', 'name'].map((option) => (
                      <div
                        key={option}
                        className={`${styles.sortOption} ${sortBy === option ? styles.active : ''}`}
                        onClick={() => { setSortBy(option); setSortMenuOpen(false); }}
                      >
                        {option === 'modified' ? 'Date Modified' : option === 'created' ? 'Date Created' : 'Name (A-Z)'}
                        {sortBy === option && <span>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.projectsGrid}>
            <Link href="/projects/new" className={styles.newCard}>
              <div className={styles.newIcon}>+</div>
              <div className={styles.newLabel}>Recruit Team for New Project</div>
            </Link>

            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
