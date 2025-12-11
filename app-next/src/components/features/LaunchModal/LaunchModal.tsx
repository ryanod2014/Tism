'use client';

import { useState, useEffect } from 'react';
import styles from './LaunchModal.module.css';

interface Version {
  id: string;
  number: string;
  commit: string;
  time: string;
  isCurrent?: boolean;
}

interface LaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  onToast?: (message: string) => void;
}

export function LaunchModal({ isOpen, onClose, projectName = 'saas-dashboard', onToast }: LaunchModalProps) {
  const [stagingCommit, setStagingCommit] = useState('"Added dark mode toggle"');
  const [stagingTime, setStagingTime] = useState('2 mins ago');
  const [prodCommit, setProdCommit] = useState('"Fixed checkout bug"');
  const [prodTime, setProdTime] = useState('3 days ago');
  const [versions, setVersions] = useState<Version[]>([
    { id: 'v12', number: 'v12', commit: '"Fixed checkout bug"', time: '3 days ago', isCurrent: true },
    { id: 'v11', number: 'v11', commit: '"Added dark mode"', time: '5 days ago' },
    { id: 'v10', number: 'v10', commit: '"Updated pricing page"', time: '1 week ago' },
    { id: 'v9', number: 'v9', commit: '"New onboarding flow"', time: '2 weeks ago' },
  ]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [showDomainConfig, setShowDomainConfig] = useState(false);
  const [pendingRollback, setPendingRollback] = useState<Version | null>(null);
  const [customDomain, setCustomDomain] = useState('');
  const [showDnsInstructions, setShowDnsInstructions] = useState(false);

  const stagingUrl = `${projectName}-staging.tism.app`;
  const prodUrl = `${projectName}.tism.app`;

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPromoteConfirm) {
          setShowPromoteConfirm(false);
        } else if (showRollbackConfirm) {
          setShowRollbackConfirm(false);
        } else if (showDomainConfig) {
          setShowDomainConfig(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showPromoteConfirm, showRollbackConfirm, showDomainConfig]);

  const copyUrl = (env: 'staging' | 'prod') => {
    const url = `https://${env === 'staging' ? stagingUrl : prodUrl}`;
    navigator.clipboard.writeText(url).then(() => {
      onToast?.('📋 URL copied to clipboard');
    });
  };

  const openUrl = (env: 'staging' | 'prod') => {
    const url = `https://${env === 'staging' ? stagingUrl : prodUrl}`;
    window.open(url, '_blank');
  };

  const handlePromote = () => {
    // Update production to match staging
    setProdCommit(stagingCommit);
    setProdTime('Just now');

    // Update version history
    const nextVersionNum = parseInt(versions[0].number.replace('v', '')) + 1;
    const newVersion: Version = {
      id: `v${nextVersionNum}`,
      number: `v${nextVersionNum}`,
      commit: stagingCommit,
      time: 'Just now',
      isCurrent: true,
    };

    setVersions(prev => {
      const updated = prev.map(v => ({ ...v, isCurrent: false }));
      return [newVersion, ...updated.slice(0, 3)];
    });

    setShowPromoteConfirm(false);
    onToast?.('🚀 Promoted to production successfully!');
  };

  const handleRollback = () => {
    if (!pendingRollback) return;

    setProdCommit(pendingRollback.commit);
    setProdTime('Just now');

    setVersions(prev => prev.map(v => ({
      ...v,
      isCurrent: v.id === pendingRollback.id
    })));

    setShowRollbackConfirm(false);
    setPendingRollback(null);
    onToast?.(`⏪ Rolled back to ${pendingRollback.number}`);
  };

  const openRollbackConfirm = (version: Version) => {
    setPendingRollback(version);
    setShowRollbackConfirm(true);
  };

  const saveDomainConfig = () => {
    if (customDomain) {
      setShowDnsInstructions(true);
      onToast?.('🌐 Domain configuration saved');
    }
    setShowDomainConfig(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>🚀 Deploy & Promote</h2>
            <button className={styles.modalClose} onClick={onClose}>×</button>
          </div>

          <div className={styles.modalBody}>
            {/* Staging Section */}
            <div className={`${styles.envSection} ${styles.staging}`}>
              <div className={styles.envHeader}>
                <span className={`${styles.envBadge} ${styles.staging}`}>🟡 Staging</span>
              </div>
              <p className={styles.envDesc}>Your changes deploy here first for testing.</p>

              <div className={styles.urlBox}>
                <span className={styles.urlIcon}>🔗</span>
                <span className={styles.urlText}>{stagingUrl}</span>
                <div className={styles.urlActions}>
                  <button className={styles.urlActionBtn} onClick={() => copyUrl('staging')} title="Copy URL">
                    📋
                  </button>
                  <button className={styles.urlActionBtn} onClick={() => openUrl('staging')} title="Open in new tab">
                    ↗
                  </button>
                </div>
              </div>

              <div className={styles.deployMeta}>
                <div className={styles.deployInfo}>
                  <span className={styles.commitMsg}>{stagingCommit}</span>
                  <span>•</span>
                  <span>{stagingTime}</span>
                </div>
                <div className={`${styles.deployStatus} ${styles.staging}`}>
                  <span className={`${styles.statusDot} ${styles.staging}`} />
                  <span>Deployed</span>
                </div>
              </div>
            </div>

            {/* Promote Section */}
            <div className={styles.promoteSection}>
              <span className={styles.promoteArrow}>↓</span>
              <button className={styles.promoteBtn} onClick={() => setShowPromoteConfirm(true)}>
                <span className={styles.promoteIcon}>⬆️</span>
                <span>Promote to Production</span>
              </button>
            </div>

            {/* Production Section */}
            <div className={`${styles.envSection} ${styles.production}`}>
              <div className={styles.envHeader}>
                <span className={`${styles.envBadge} ${styles.production}`}>🟢 Production</span>
              </div>

              <div className={styles.urlBox}>
                <span className={styles.urlIcon}>🔗</span>
                <span className={styles.urlText}>{prodUrl}</span>
                <div className={styles.urlActions}>
                  <button className={styles.urlActionBtn} onClick={() => copyUrl('prod')} title="Copy URL">
                    📋
                  </button>
                  <button className={styles.urlActionBtn} onClick={() => openUrl('prod')} title="Open in new tab">
                    ↗
                  </button>
                </div>
              </div>

              <div className={styles.customDomainRow}>
                <span className={styles.domainIcon}>🌐</span>
                <span className={styles.domainText}>
                  {customDomain || 'Add a custom domain'}
                </span>
                <button className={styles.configureBtn} onClick={() => setShowDomainConfig(true)}>
                  Configure
                </button>
              </div>

              <div className={styles.deployMeta}>
                <div className={styles.deployInfo}>
                  <span className={styles.commitMsg}>{prodCommit}</span>
                  <span>•</span>
                  <span>{prodTime}</span>
                </div>
                <div className={`${styles.deployStatus} ${styles.live}`}>
                  <span className={`${styles.statusDot} ${styles.live}`} />
                  <span>Live</span>
                </div>
              </div>

              {/* Version History */}
              <div className={styles.versionHistory}>
                <div
                  className={styles.versionHeader}
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                >
                  <div className={styles.versionHeaderLeft}>
                    <span>📜</span>
                    <span>Version History</span>
                  </div>
                  <span className={`${styles.versionToggle} ${showVersionHistory ? styles.open : ''}`}>
                    ▼
                  </span>
                </div>
                <div className={`${styles.versionList} ${showVersionHistory ? styles.open : ''}`}>
                  {versions.map((version) => (
                    <div key={version.id} className={styles.versionItem}>
                      <span className={`${styles.versionDot} ${version.isCurrent ? styles.current : ''}`} />
                      <div className={styles.versionDetails}>
                        <div className={styles.versionLabel}>
                          <span className={styles.versionNumber}>{version.number}</span>
                          {version.isCurrent && <span className={styles.versionTag}>Current</span>}
                        </div>
                        <span className={styles.versionCommit}>{version.commit}</span>
                      </div>
                      <span className={styles.versionTime}>{version.time}</span>
                      {!version.isCurrent && (
                        <button
                          className={styles.rollbackBtn}
                          onClick={() => openRollbackConfirm(version)}
                        >
                          Rollback
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button className={styles.modalBtnSecondary} onClick={onClose}>Done</button>
          </div>
        </div>
      </div>

      {/* Promote Confirmation Dialog */}
      {showPromoteConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowPromoteConfirm(false)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>⬆️ Promote to Production?</div>
            <p className={styles.confirmMessage}>
              This will make <strong>{stagingCommit}</strong> live for all users.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={`${styles.confirmBtn} ${styles.cancel}`}
                onClick={() => setShowPromoteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles.confirmBtn} ${styles.promote}`}
                onClick={handlePromote}
              >
                Yes, Promote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Confirmation Dialog */}
      {showRollbackConfirm && pendingRollback && (
        <div className={styles.confirmOverlay} onClick={() => setShowRollbackConfirm(false)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>⚠️ Rollback to {pendingRollback.number}?</div>
            <p className={styles.confirmMessage}>
              This will replace the current production with <strong>{pendingRollback.commit}</strong>
            </p>
            <div className={styles.confirmActions}>
              <button
                className={`${styles.confirmBtn} ${styles.cancel}`}
                onClick={() => setShowRollbackConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles.confirmBtn} ${styles.rollback}`}
                onClick={handleRollback}
              >
                Yes, Rollback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Domain Configuration Dialog */}
      {showDomainConfig && (
        <div className={styles.confirmOverlay} onClick={() => setShowDomainConfig(false)}>
          <div className={`${styles.confirmDialog} ${styles.domainDialog}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>🌐 Configure Custom Domain</div>
            <div className={styles.domainInputGroup}>
              <label className={styles.domainLabel}>Domain</label>
              <input
                type="text"
                className={styles.domainInput}
                placeholder="yourdomain.com"
                value={customDomain}
                onChange={(e) => {
                  setCustomDomain(e.target.value);
                  setShowDnsInstructions(!!e.target.value);
                }}
              />
            </div>
            {showDnsInstructions && (
              <div className={styles.dnsInstructions}>
                <div className={styles.dnsTitle}>DNS Configuration</div>
                <div className={styles.dnsRecord}>
                  <div className={styles.dnsRecordRow}>
                    <span className={styles.dnsLabel}>Type</span>
                    <span className={styles.dnsValue}>CNAME</span>
                  </div>
                  <div className={styles.dnsRecordRow}>
                    <span className={styles.dnsLabel}>Name</span>
                    <span className={styles.dnsValue}>@</span>
                  </div>
                  <div className={styles.dnsRecordRow}>
                    <span className={styles.dnsLabel}>Value</span>
                    <span className={styles.dnsValue}>proxy.tism.app</span>
                  </div>
                </div>
                <p className={styles.dnsNote}>DNS changes can take up to 48 hours to propagate.</p>
              </div>
            )}
            <div className={styles.confirmActions}>
              <button
                className={`${styles.confirmBtn} ${styles.cancel}`}
                onClick={() => setShowDomainConfig(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles.confirmBtn} ${styles.promote}`}
                onClick={saveDomainConfig}
              >
                Save Domain
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
