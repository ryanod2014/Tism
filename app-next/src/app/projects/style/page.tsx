'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import styles from './page.module.css';

interface Inspiration {
  id: number;
  name: string;
  style: string;
  tags: string[];
  colors: {
    bg: string;
    accent: string;
    text: string;
  };
  url: string;
  mockHero: string;
  mockSidebar: string;
  mockMain: string;
}

interface CustomReference {
  type: 'url' | 'image';
  value: string;
  displayName: string;
  preview: string;
}

const inspirations: Inspiration[] = [
  {
    id: 1,
    name: 'Linear',
    style: 'Minimal • Dark',
    tags: ['minimal', 'dark', 'saas'],
    colors: { bg: '#0a0a0f', accent: '#5e6ad2', text: '#e8e8ed' },
    url: 'https://linear.app',
    mockHero: 'linear-gradient(135deg, #5e6ad2 0%, #8b5cf6 100%)',
    mockSidebar: '#1a1a26',
    mockMain: '#12121a'
  },
  {
    id: 2,
    name: 'Stripe',
    style: 'Clean • Gradient',
    tags: ['gradient', 'corporate', 'minimal'],
    colors: { bg: '#0a2540', accent: '#635bff', text: '#f6f9fc' },
    url: 'https://stripe.com',
    mockHero: 'linear-gradient(135deg, #635bff 0%, #00d4ff 100%)',
    mockSidebar: '#f6f9fc',
    mockMain: '#ffffff'
  },
  {
    id: 3,
    name: 'Vercel',
    style: 'Minimal • Monochrome',
    tags: ['minimal', 'dark', 'corporate'],
    colors: { bg: '#000000', accent: '#ffffff', text: '#888888' },
    url: 'https://vercel.com',
    mockHero: 'linear-gradient(135deg, #333333 0%, #000000 100%)',
    mockSidebar: '#111111',
    mockMain: '#0a0a0a'
  },
  {
    id: 4,
    name: 'Notion',
    style: 'Clean • Friendly',
    tags: ['minimal', 'playful', 'saas'],
    colors: { bg: '#ffffff', accent: '#000000', text: '#37352f' },
    url: 'https://notion.so',
    mockHero: 'linear-gradient(135deg, #f7f6f3 0%, #ffffff 100%)',
    mockSidebar: '#fbfbfa',
    mockMain: '#ffffff'
  },
  {
    id: 5,
    name: 'Figma',
    style: 'Colorful • Playful',
    tags: ['playful', 'gradient', 'bold'],
    colors: { bg: '#1e1e1e', accent: '#a259ff', text: '#ffffff' },
    url: 'https://figma.com',
    mockHero: 'linear-gradient(135deg, #f24e1e 0%, #a259ff 50%, #1abcfe 100%)',
    mockSidebar: '#2c2c2c',
    mockMain: '#1e1e1e'
  },
  {
    id: 6,
    name: 'Loom',
    style: 'Bold • Purple',
    tags: ['bold', 'gradient', 'playful'],
    colors: { bg: '#625df5', accent: '#ffffff', text: '#f5f5f5' },
    url: 'https://loom.com',
    mockHero: 'linear-gradient(135deg, #625df5 0%, #8b7df7 100%)',
    mockSidebar: '#f4f4f8',
    mockMain: '#ffffff'
  },
  {
    id: 7,
    name: 'Raycast',
    style: 'Dark • Vibrant',
    tags: ['dark', 'gradient', 'bold'],
    colors: { bg: '#0d0d0d', accent: '#ff6363', text: '#e5e5e5' },
    url: 'https://raycast.com',
    mockHero: 'linear-gradient(135deg, #ff6363 0%, #ff9f43 100%)',
    mockSidebar: '#1a1a1a',
    mockMain: '#0d0d0d'
  },
  {
    id: 8,
    name: 'Arc',
    style: 'Gradient • Playful',
    tags: ['gradient', 'playful', 'bold'],
    colors: { bg: '#fcfaff', accent: '#5b4dc9', text: '#1a1a2e' },
    url: 'https://arc.net',
    mockHero: 'linear-gradient(135deg, #fcb69f 0%, #ffecd2 50%, #a18cd1 100%)',
    mockSidebar: '#f8f6ff',
    mockMain: '#ffffff'
  },
  {
    id: 9,
    name: 'Supabase',
    style: 'Dark • Green',
    tags: ['dark', 'bold', 'saas'],
    colors: { bg: '#1c1c1c', accent: '#3ecf8e', text: '#ededed' },
    url: 'https://supabase.com',
    mockHero: 'linear-gradient(135deg, #3ecf8e 0%, #1c8656 100%)',
    mockSidebar: '#252525',
    mockMain: '#1c1c1c'
  },
  {
    id: 10,
    name: 'Mercury',
    style: 'Corporate • Clean',
    tags: ['corporate', 'minimal', 'bold'],
    colors: { bg: '#f8f7f4', accent: '#5466f9', text: '#111111' },
    url: 'https://mercury.com',
    mockHero: 'linear-gradient(135deg, #5466f9 0%, #8b94ff 100%)',
    mockSidebar: '#f2f1ee',
    mockMain: '#ffffff'
  },
  {
    id: 11,
    name: 'Pitch',
    style: 'Bold • Yellow',
    tags: ['bold', 'playful', 'corporate'],
    colors: { bg: '#000000', accent: '#ffe600', text: '#ffffff' },
    url: 'https://pitch.com',
    mockHero: 'linear-gradient(135deg, #ffe600 0%, #ffd000 100%)',
    mockSidebar: '#1a1a1a',
    mockMain: '#000000'
  },
  {
    id: 12,
    name: 'Framer',
    style: 'Dark • Blue',
    tags: ['dark', 'gradient', 'minimal'],
    colors: { bg: '#0d0d0d', accent: '#0099ff', text: '#ffffff' },
    url: 'https://framer.com',
    mockHero: 'linear-gradient(135deg, #0099ff 0%, #a855f7 100%)',
    mockSidebar: '#171717',
    mockMain: '#0d0d0d'
  }
];

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'playful', label: 'Playful' },
  { id: 'dark', label: 'Dark Mode' },
  { id: 'gradient', label: 'Gradients' },
];

export default function StyleSelectionPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentPreviewId, setCurrentPreviewId] = useState<number | null>(null);
  const [customReferences, setCustomReferences] = useState<CustomReference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadTab, setUploadTab] = useState<'url' | 'image'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [pendingImages, setPendingImages] = useState<{ name: string; data: string }[]>([]);

  const totalSelected = (selectedId !== null ? 1 : 0) + customReferences.length;

  const filteredInspirations = currentFilter === 'all'
    ? inspirations
    : inspirations.filter(i => i.tags.includes(currentFilter));

  const currentPreviewItem = currentPreviewId ? inspirations.find(i => i.id === currentPreviewId) : null;

  const toggleSelect = (id: number) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  const openPreview = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPreviewId(id);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setCurrentPreviewId(null);
  };

  const toggleSelectFromPreview = () => {
    if (currentPreviewId) {
      toggleSelect(currentPreviewId);
    }
  };

  const openUploadModal = () => {
    setShowUploadModal(true);
    setUploadTab('url');
    setUrlInput('');
    setPendingImages([]);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUrlInput('');
    setPendingImages([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large (max 10MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPendingImages(prev => [...prev, {
          name: file.name,
          data: ev.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeCustomReference = (index: number) => {
    setCustomReferences(prev => prev.filter((_, i) => i !== index));
  };

  const isUploadValid = uploadTab === 'url'
    ? urlInput.startsWith('http://') || urlInput.startsWith('https://')
    : pendingImages.length > 0;

  const submitUpload = () => {
    if (uploadTab === 'url' && urlInput) {
      setCustomReferences(prev => [...prev, {
        type: 'url',
        value: urlInput,
        displayName: urlInput.replace(/^https?:\/\//, '').split('/')[0],
        preview: `https://api.microlink.io/?url=${encodeURIComponent(urlInput)}&screenshot=true&meta=false&embed=screenshot.url`
      }]);
    } else {
      pendingImages.forEach(img => {
        setCustomReferences(prev => [...prev, {
          type: 'image',
          value: img.data,
          displayName: img.name.length > 20 ? img.name.substring(0, 17) + '...' : img.name,
          preview: img.data
        }]);
      });
    }
    closeUploadModal();
  };

  const continueToProject = () => {
    const selectedStyles = selectedId ? inspirations.filter(i => i.id === selectedId) : [];
    const styleData = {
      selected: selectedStyles,
      custom: customReferences
    };
    sessionStorage.setItem('styleInspiration', JSON.stringify(styleData));
    setIsLoading(true);
    setTimeout(() => {
      router.push('/project');
    }, 2000);
  };

  // Close modals on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreview();
        closeUploadModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/chat" className={styles.backBtn}>← Back</Link>
          <span className={styles.headerTitle}>Choose Style Inspiration</span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={`${styles.continueBtn} ${totalSelected > 0 ? styles.active : ''}`}
            onClick={continueToProject}
            disabled={totalSelected === 0}
          >
            Continue →
          </button>
          <Avatar initials="RO" size="md" />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.pageLabel}>Step 3 of 3</div>
          <h1 className={styles.pageTitle}>What style inspires you?</h1>
          <p className={styles.pageSubtitle}>
            Select designs you like. We&apos;ll use these as inspiration for your project&apos;s look and feel.
          </p>
        </div>

        <div className={styles.filterTabs}>
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.filterTab} ${currentFilter === tab.id ? styles.active : ''}`}
              onClick={() => setCurrentFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.inspirationGrid}>
          {/* Upload Card */}
          <div className={styles.uploadCard} onClick={openUploadModal}>
            <div className={styles.uploadPlaceholder}>
              <div className={styles.uploadIcon}>➕</div>
              <div className={styles.uploadTitle}>Add Your Own</div>
              <div className={styles.uploadDesc}>Paste URLs or upload images</div>
            </div>
          </div>

          {/* Custom Reference Cards */}
          {customReferences.map((ref, index) => (
            <div key={`custom-${index}`} className={`${styles.inspirationCard} ${styles.customRef}`}>
              <div className={styles.cardPreview}>
                <div
                  className={styles.customPreviewImage}
                  style={{ backgroundImage: `url('${ref.preview}')` }}
                />
              </div>
              <button
                className={styles.removeCustomBtn}
                onClick={(e) => { e.stopPropagation(); removeCustomReference(index); }}
              >
                ×
              </button>
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{ref.displayName}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.cardStyle}>
                    {ref.type === 'url' ? 'Website' : 'Uploaded'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Inspiration Cards */}
          {filteredInspirations.map(item => (
            <div
              key={item.id}
              className={`${styles.inspirationCard} ${selectedId === item.id ? styles.selected : ''}`}
              onClick={() => toggleSelect(item.id)}
            >
              <div className={styles.cardPreview}>
                <div className={styles.cardPreviewMock}>
                  <div className={styles.mockNav}>
                    <div className={`${styles.mockDot} ${styles.red}`} />
                    <div className={`${styles.mockDot} ${styles.yellow}`} />
                    <div className={`${styles.mockDot} ${styles.green}`} />
                  </div>
                  <div className={styles.mockBody} style={{ background: item.colors.bg }}>
                    <div className={styles.mockHero} style={{ background: item.mockHero }} />
                    <div className={styles.mockContent}>
                      <div className={styles.mockSidebar} style={{ background: item.mockSidebar }} />
                      <div className={styles.mockMain} style={{ background: item.mockMain }} />
                    </div>
                  </div>
                </div>
              </div>
              <button className={styles.viewBtn} onClick={(e) => openPreview(item.id, e)}>
                👁 Preview
              </button>
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{item.name}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.cardStyle}>{item.style}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className={styles.uploadModal} onClick={closeUploadModal}>
          <div className={styles.uploadModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.uploadModalHeader}>
              <span className={styles.uploadModalTitle}>Add Style Reference</span>
              <button className={styles.uploadModalClose} onClick={closeUploadModal}>×</button>
            </div>
            <div className={styles.uploadModalBody}>
              <div className={styles.uploadTabs}>
                <button
                  className={`${styles.uploadTab} ${uploadTab === 'url' ? styles.active : ''}`}
                  onClick={() => setUploadTab('url')}
                >
                  🔗 Paste URL
                </button>
                <button
                  className={`${styles.uploadTab} ${uploadTab === 'image' ? styles.active : ''}`}
                  onClick={() => setUploadTab('image')}
                >
                  🖼️ Upload Image
                </button>
              </div>

              {uploadTab === 'url' ? (
                <div className={styles.uploadTabContent}>
                  <div className={styles.uploadInputGroup}>
                    <label className={styles.uploadLabel}>Website URL</label>
                    <input
                      type="url"
                      className={styles.uploadInput}
                      placeholder="https://example.com"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                  </div>
                  <p className={styles.uploadHint}>
                    Paste a link to any website you&apos;d like to use as design inspiration.
                  </p>
                </div>
              ) : (
                <div className={styles.uploadTabContent}>
                  <label className={styles.uploadDropzone}>
                    <div className={styles.uploadDropzoneIcon}>📁</div>
                    <div className={styles.uploadDropzoneText}>Drag & drop images here</div>
                    <div className={styles.uploadDropzoneHint}>or click to browse (PNG, JPG, up to 10MB each)</div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {pendingImages.length > 0 && (
                    <div className={styles.uploadImagesPreview}>
                      {pendingImages.map((img, i) => (
                        <div key={i} className={styles.uploadImageThumb}>
                          <img src={img.data} alt={img.name} />
                          <button className={styles.removeThumb} onClick={() => removePendingImage(i)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={styles.uploadModalFooter}>
              <button className={styles.uploadCancelBtn} onClick={closeUploadModal}>Cancel</button>
              <button
                className={`${styles.uploadSubmitBtn} ${isUploadValid ? styles.active : ''}`}
                onClick={submitUpload}
                disabled={!isUploadValid}
              >
                Add Reference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && currentPreviewItem && (
        <div className={styles.previewModal} onClick={closePreview}>
          <div className={styles.previewContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.previewHeader}>
              <span className={styles.previewTitle}>{currentPreviewItem.name}</span>
              <div className={styles.previewActions}>
                <button
                  className={styles.previewSelect}
                  onClick={toggleSelectFromPreview}
                  style={selectedIds.includes(currentPreviewItem.id) ? {
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)'
                  } : {}}
                >
                  {selectedIds.includes(currentPreviewItem.id) ? 'Deselect' : 'Select This'}
                </button>
                <button className={styles.previewClose} onClick={closePreview}>×</button>
              </div>
            </div>
            <div className={styles.previewFrame}>
              <div className={styles.previewMock}>
                <div
                  className={styles.previewMockNav}
                  style={{ background: currentPreviewItem.colors.bg, borderColor: currentPreviewItem.mockSidebar }}
                >
                  <div className={styles.previewMockLogo} style={{ color: currentPreviewItem.colors.text }}>
                    {currentPreviewItem.name}
                  </div>
                  <div className={styles.previewMockLinks}>
                    <span style={{ color: currentPreviewItem.colors.text, opacity: 0.7 }}>Features</span>
                    <span style={{ color: currentPreviewItem.colors.text, opacity: 0.7 }}>Pricing</span>
                    <span style={{ color: currentPreviewItem.colors.text, opacity: 0.7 }}>About</span>
                  </div>
                </div>
                <div className={styles.previewMockBody} style={{ background: currentPreviewItem.colors.bg }}>
                  <div className={styles.previewMockHero}>
                    <h1 style={{ color: currentPreviewItem.colors.text }}>
                      Build something amazing
                    </h1>
                    <p style={{ color: currentPreviewItem.colors.text, opacity: 0.7 }}>
                      The modern way to build and ship products faster than ever before.
                    </p>
                    <button
                      className={styles.previewMockCta}
                      style={{ background: currentPreviewItem.mockHero }}
                    >
                      Get Started
                    </button>
                  </div>
                  <div className={styles.previewMockFeatures}>
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={styles.previewMockFeature}
                        style={{ background: currentPreviewItem.mockSidebar }}
                      >
                        <div
                          className={styles.previewMockFeatureIcon}
                          style={{ background: currentPreviewItem.mockHero }}
                        />
                        <h3 style={{ color: currentPreviewItem.colors.text }}>Feature {i}</h3>
                        <p style={{ color: currentPreviewItem.colors.text, opacity: 0.6 }}>
                          Description of this amazing feature.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Creating your project...</div>
          <div className={styles.loadingSubtext}>Applying your style preferences</div>
        </div>
      )}
    </div>
  );
}
