'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Avatar, Button } from '@/components/ui';
import { DiagramEditor } from '@/components/features/DiagramEditor';
import { LaunchModal } from '@/components/features/LaunchModal';
import styles from './page.module.css';

interface Message {
  id: number;
  avatar?: string;
  author: string;
  time: string;
  badges: ('critical' | 'pending' | 'done' | 'backlog')[];
  text: string;
  unread?: boolean;
  hasActions?: boolean;
  dateGroup: 'today' | 'yesterday';
  isUser?: boolean;
  replies?: number;
  threadType?: string;
  suggestion?: string;
}

interface ThreadReply {
  id: number;
  avatar?: string;
  author: string;
  authorType?: 'luna' | 'dev' | 'user';
  isUser?: boolean;
  time: string;
  text: string;
}

interface ThreadContent {
  title: string;
  message: string;
  replies: ThreadReply[];
  hasDecision: boolean;
  suggestion?: string;
  page?: string;
  isUserMessage?: boolean;
  originalTime?: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    avatar: 'https://i.pravatar.cc/80?img=23',
    author: 'Luna',
    time: 'Just now',
    badges: ['critical', 'pending'],
    text: '<strong>Marcus needs a decision:</strong> Should users see pricing before or after signup? I\'d suggest <strong>after signup</strong> to capture emails first.',
    unread: true,
    hasActions: true,
    dateGroup: 'today',
    threadType: 'billing',
    suggestion: 'After signup',
  },
  {
    id: 2,
    avatar: 'https://i.pravatar.cc/80?img=5',
    author: 'Sophia',
    time: '8:15 AM',
    badges: ['pending'],
    text: 'Which chart library for analytics? I\'d recommend <strong>Recharts</strong> — it\'s more React-native and lighter weight.',
    unread: true,
    hasActions: true,
    dateGroup: 'today',
    threadType: 'charts',
    suggestion: 'Recharts',
  },
  {
    id: 3,
    isUser: true,
    author: 'You',
    time: '8:00 AM',
    badges: ['done'],
    text: 'I need an analytics dashboard with user signups, revenue, and feature usage.',
    replies: 9,
    dateGroup: 'today',
    threadType: 'analytics',
  },
  {
    id: 4,
    isUser: true,
    author: 'You',
    time: '2:30 PM',
    badges: ['done'],
    text: 'I need a billing system with Stripe, subscriptions, and invoices.',
    replies: 6,
    dateGroup: 'yesterday',
    threadType: 'billingrequest',
  },
  {
    id: 5,
    avatar: 'https://i.pravatar.cc/80?img=33',
    author: 'Alex',
    time: '11:00 AM',
    badges: ['done'],
    text: 'User authentication is complete! Login, signup, password reset all working.',
    dateGroup: 'yesterday',
    threadType: 'auth',
  },
  {
    id: 6,
    avatar: 'https://i.pravatar.cc/80?img=23',
    author: 'Luna',
    time: '9:00 AM',
    badges: [],
    text: 'Welcome to your new project! I\'m Luna, your AI Project Manager. I\'ll coordinate with the dev team and keep you updated.',
    dateGroup: 'yesterday',
    threadType: 'welcome',
  },
];

const threadContents: Record<string, ThreadContent> = {
  billing: {
    title: 'Thread: Billing Flow',
    message: '<strong>Marcus needs a decision on the billing flow.</strong> He\'s ready to build the checkout page but needs to know the user journey.',
    hasDecision: true,
    suggestion: 'After signup',
    page: 'Plans',
    replies: [
      { id: 1, avatar: 'https://i.pravatar.cc/40?img=12', author: 'Marcus', authorType: 'dev', time: '10:32 AM', text: 'Should users see pricing before or after signup? I\'ve got both flows ready to go.' },
      { id: 2, avatar: 'https://i.pravatar.cc/40?img=23', author: 'Luna', authorType: 'luna', time: '10:33 AM', text: 'Good question. Let me get input on this.' },
      { id: 3, avatar: 'https://i.pravatar.cc/40?img=12', author: 'Marcus', authorType: 'dev', time: '10:35 AM', text: 'My suggestion: after signup to capture emails first. But totally up to you!' },
    ],
  },
  charts: {
    title: 'Thread: Chart Library',
    message: '<strong>Sophia recommends Recharts</strong> for the analytics dashboard. It\'s lightweight and React-native.',
    hasDecision: true,
    suggestion: 'Recharts',
    page: 'Analytics',
    replies: [
      { id: 1, avatar: 'https://i.pravatar.cc/40?img=5', author: 'Sophia', authorType: 'dev', time: '8:16 AM', text: 'I\'ve tested both Chart.js and Recharts. Recharts integrates better with React state.' },
      { id: 2, avatar: 'https://i.pravatar.cc/40?img=23', author: 'Luna', authorType: 'luna', time: '8:17 AM', text: 'What about bundle size?' },
      { id: 3, avatar: 'https://i.pravatar.cc/40?img=5', author: 'Sophia', authorType: 'dev', time: '8:18 AM', text: 'Recharts is ~40kb gzipped. Chart.js is ~60kb. Both are reasonable.' },
    ],
  },
  analytics: {
    title: 'Thread: Analytics Dashboard',
    message: 'I need an analytics dashboard with user signups, revenue, and feature usage.',
    hasDecision: false,
    page: 'Analytics',
    isUserMessage: true,
    originalTime: '8:00 AM',
    replies: [
      { id: 1, avatar: 'https://i.pravatar.cc/40?img=23', author: 'Luna', authorType: 'luna', time: '8:02 AM', text: 'Got it! A few quick questions to make sure I spec this correctly:' },
      { id: 2, avatar: 'https://i.pravatar.cc/40?img=23', author: 'Luna', authorType: 'luna', time: '8:03 AM', text: '1. What time range should the charts cover? (7 days, 30 days, custom?)' },
      { id: 3, avatar: 'https://i.pravatar.cc/40?img=23', author: 'Luna', authorType: 'luna', time: '8:03 AM', text: '2. Should revenue be shown as MRR, ARR, or both?' },
      { id: 4, avatar: 'https://i.pravatar.cc/40?img=23', author: 'Luna', authorType: 'luna', time: '8:04 AM', text: '3. For feature usage, do you want a breakdown by feature or just top 5?' },
      { id: 5, isUser: true, author: 'You', time: '8:15 AM', text: 'Default to 30 days with a date picker. Show MRR with ARR toggle. Top 5 features is fine for now.' },
      { id: 6, avatar: 'https://i.pravatar.cc/40?img=23', author: 'Luna', authorType: 'luna', time: '8:16 AM', text: 'Perfect, that\'s all I needed! Creating the ticket now...' },
      { id: 7, avatar: 'https://i.pravatar.cc/40?img=23', author: 'Luna', authorType: 'luna', time: '8:17 AM', text: '✅ Created ticket <strong>#TKT-1042</strong> — "Analytics Dashboard: signups, revenue, feature usage". You can track progress in the Pipeline.' },
      { id: 8, avatar: 'https://i.pravatar.cc/40?img=23', author: 'Luna', authorType: 'luna', time: '8:17 AM', text: '<strong>@Sophia</strong> — Can you take this one? It\'s frontend-heavy with the charts work.' },
      { id: 9, avatar: 'https://i.pravatar.cc/40?img=5', author: 'Sophia', authorType: 'dev', time: '8:18 AM', text: 'On it! I\'ll start with the chart components. ETA ~2 hours for the first draft.' },
    ],
  },
};

const pageTemplates: Record<string, { title: string; stats: { label: string; value: string; change: string; positive?: boolean }[] }> = {
  Dashboard: {
    title: 'Dashboard Overview',
    stats: [
      { label: 'Total Users', value: '12,847', change: '↑ 12% from last month' },
      { label: 'Active Now', value: '1,294', change: '↑ 8% from yesterday' },
      { label: 'Revenue', value: '$48.2K', change: '↑ 23% from last month' },
      { label: 'Churn Rate', value: '2.4%', change: '↓ 0.3% improvement', positive: true },
    ],
  },
  Analytics: {
    title: 'Analytics',
    stats: [
      { label: 'Page Views', value: '284,392', change: '↑ 18% from last week' },
      { label: 'Bounce Rate', value: '32.4%', change: '↓ 2.1% improvement', positive: true },
      { label: 'Avg. Session', value: '4m 32s', change: '↑ 12% from last week' },
      { label: 'Conversions', value: '1,847', change: '↑ 8% from last week' },
    ],
  },
  Plans: {
    title: 'Billing & Plans',
    stats: [
      { label: 'MRR', value: '$48,200', change: '↑ 15% from last month' },
      { label: 'Active Subscriptions', value: '1,284', change: '↑ 12% from last month' },
      { label: 'Avg. Revenue/User', value: '$37.50', change: '↑ 3% from last month' },
    ],
  },
  'User List': {
    title: 'Users',
    stats: [
      { label: 'Total Users', value: '12,847', change: '↑ 234 this week' },
      { label: 'Active', value: '8,492', change: '66% of total' },
      { label: 'New Today', value: '47', change: '↑ 12% vs yesterday' },
      { label: 'Churned', value: '23', change: '↓ 8% vs last week', positive: true },
    ],
  },
};

interface TestDataField {
  id: number;
  key: string;
  value: string;
}

interface FolderState {
  [key: string]: boolean;
}

export default function ProjectPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [panelWidth, setPanelWidth] = useState(420);
  const [projectTitle] = useState('SaaS Dashboard');
  const [userRole, setUserRole] = useState('Admin');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const [testDataOpen, setTestDataOpen] = useState(false);
  const [testDataFields, setTestDataFields] = useState<TestDataField[]>([
    { id: 1, key: 'billing_plan', value: 'pro_6mo' },
    { id: 2, key: 'subscription_status', value: 'active' },
    { id: 3, key: 'trial_days_left', value: '0' },
  ]);
  const [openFolders, setOpenFolders] = useState<FolderState>({ Dashboard: true });
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [showDiagramEditor, setShowDiagramEditor] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'preview' | 'pipeline' | 'live'>('preview');
  const [editMode, setEditMode] = useState(false);
  const resizerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const pageDropdownRef = useRef<HTMLDivElement>(null);
  const messagesFeedRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLDivElement>(null);
  const threadInputRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<{ range: Range; inputType: 'main' | 'thread' } | null>(null);
  const nextFieldId = useRef(4);

  useEffect(() => {
    const saved = localStorage.getItem('inboxPanelWidth');
    if (saved) setPanelWidth(parseInt(saved));
  }, []);

  // Scroll messages to bottom on mount
  useEffect(() => {
    if (messagesFeedRef.current) {
      messagesFeedRef.current.scrollTop = messagesFeedRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ESC key listener to exit edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editMode) {
        setEditMode(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editMode]);

  // Save cursor position when user is in chat inputs
  const saveCursorPosition = (inputType: 'main' | 'thread') => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const input = inputType === 'main' ? chatInputRef.current : threadInputRef.current;
      if (input && input.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = { range: range.cloneRange(), inputType };
      }
    }
  };

  // Insert inline element pill at cursor position
  const insertInlineElementPill = (name: string) => {
    // Determine which input to use - thread if open, otherwise main
    const useThread = activeThread !== null;
    const input = useThread ? threadInputRef.current : chatInputRef.current;
    const expectedInputType = useThread ? 'thread' : 'main';
    
    if (!input) return;
    
    input.focus();
    
    const selection = window.getSelection();
    if (!selection) return;
    
    let range: Range;
    
    // Use saved range if it's for the correct input
    if (savedRangeRef.current && savedRangeRef.current.inputType === expectedInputType) {
      range = savedRangeRef.current.range;
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (selection.rangeCount > 0 && input.contains(selection.anchorNode)) {
      range = selection.getRangeAt(0);
    } else {
      // Place cursor at end
      range = document.createRange();
      range.selectNodeContents(input);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Delete any selected content
    range.deleteContents();
    
    // Create the pill element
    const pill = document.createElement('span');
    pill.className = styles.inlineElementPill;
    pill.contentEditable = 'false';
    pill.dataset.element = name;
    pill.innerHTML = `<svg viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>${name}`;
    
    // Create a space after the pill
    const space = document.createTextNode('\u00A0');
    
    // Insert pill and space
    range.insertNode(space);
    range.insertNode(pill);
    
    // Move cursor after the space
    range.setStartAfter(space);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Clear saved range
    savedRangeRef.current = null;
    
    showToast(`Added ${name}`);
  };

  // Handle element selection in edit mode
  const handleElementClick = (name: string) => {
    if (!editMode) return;
    
    // Exit edit mode first
    setEditMode(false);
    
    // Insert the pill inline
    insertInlineElementPill(name);
  };

  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(target)) {
        setShowRoleDropdown(false);
      }
      if (pageDropdownRef.current && !pageDropdownRef.current.contains(target)) {
        setShowPageDropdown(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleMouseDown = () => {
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(280, e.clientX), 600);
      setPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      localStorage.setItem('inboxPanelWidth', panelWidth.toString());
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const showToast = (text: string) => setToast(text);

  const openThread = (threadType: string) => {
    setActiveThread(threadType);
    const content = threadContents[threadType];
    if (content?.page) {
      setPreviousPage(currentPage);
      setCurrentPage(content.page);
    }
  };

  const closeThread = () => {
    setActiveThread(null);
    if (previousPage) {
      setCurrentPage(previousPage);
      setPreviousPage(null);
    }
  };

  const acceptSuggestion = (messageId: number, suggestion: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          badges: msg.badges.filter(b => b !== 'critical' && b !== 'pending').concat('done') as Message['badges'],
          unread: false,
          hasActions: false,
        };
      }
      return msg;
    }));
    showToast(`Accepted: ${suggestion}`);
    closeThread();
  };

  const remindLater = (messageId: number, title: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          badges: msg.badges.filter(b => b !== 'critical' && b !== 'pending').concat('backlog') as Message['badges'],
          unread: false,
          hasActions: false,
        };
      }
      return msg;
    }));
    showToast(`Added to backlog: ${title}`);
    closeThread();
  };

  const deleteMessage = (messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    showToast('Message deleted');
    closeThread();
  };

  const selectPage = (page: string) => {
    setCurrentPage(page);
    setShowPageDropdown(false);
    showToast(`Navigated to ${page}`);
  };

  const toggleFolder = (folder: string) => {
    setOpenFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const addTestDataField = () => {
    setTestDataFields(prev => [...prev, { id: nextFieldId.current++, key: '', value: '' }]);
  };

  const removeTestDataField = (id: number) => {
    setTestDataFields(prev => prev.filter(f => f.id !== id));
  };

  const updateTestDataField = (id: number, field: 'key' | 'value', value: string) => {
    setTestDataFields(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const pageStructure = [
    {
      folder: 'Dashboard',
      pages: [
        { name: 'Dashboard', icon: '📊', desc: 'Main overview page' },
        { name: 'Analytics', icon: '📈', desc: 'Charts and metrics' },
      ],
    },
    {
      folder: 'Users',
      pages: [
        { name: 'User List', icon: '👥', desc: 'All users table' },
        { name: 'User Profile', icon: '👤', desc: 'Individual user view' },
      ],
    },
    {
      folder: 'Billing',
      pages: [
        { name: 'Plans', icon: '💳', desc: 'Subscription tiers' },
        { name: 'Invoices', icon: '🧾', desc: 'Payment history' },
      ],
    },
    {
      folder: 'Settings',
      pages: [
        { name: 'General', icon: '⚙️', desc: 'App settings' },
        { name: 'Integrations', icon: '🔗', desc: 'Third-party apps' },
      ],
    },
  ];

  const todayMessages = messages.filter(m => m.dateGroup === 'today');
  const yesterdayMessages = messages.filter(m => m.dateGroup === 'yesterday');
  const currentThreadContent = activeThread ? threadContents[activeThread] : null;
  const currentThreadMessage = activeThread ? messages.find(m => m.threadType === activeThread) : null;
  const currentPageData = useMemo(() => pageTemplates[currentPage] || pageTemplates.Dashboard, [currentPage]);

  return (
    <div className={styles.app} ref={appRef} style={{ '--inbox-width': `${panelWidth}px` } as React.CSSProperties}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/home" className={styles.backToProjects}>←</Link>
          <div className={styles.headerDivider} />
          <div className={styles.projectTitle}>{projectTitle}</div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.viewTabs}>
            <div className={styles.viewTabsLabel}>View:</div>
            <div className={styles.viewTabsButtons}>
              <button 
                className={`${styles.viewTab} ${currentView === 'preview' ? styles.active : ''}`}
                onClick={() => setCurrentView('preview')}
              >
                Preview
              </button>
              <button 
                className={`${styles.viewTab} ${currentView === 'pipeline' ? styles.active : ''}`}
                onClick={() => setCurrentView('pipeline')}
              >
                Pipeline
              </button>
              <button 
                className={`${styles.viewTab} ${currentView === 'live' ? styles.active : ''}`}
                onClick={() => setCurrentView('live')}
              >
                Live
              </button>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowLaunchModal(true)}>Publish</Button>
          <Avatar initials="RO" size="sm" />
        </div>
      </header>

      <aside className={`${styles.chatPanel} ${activeThread ? styles.threadOpen : ''}`}>
        <div className={styles.chatPanelDimmer} onClick={closeThread} />

        <div className={styles.messagesFeed} ref={messagesFeedRef}>
          <div className={styles.dateDivider}>Yesterday</div>
          {[...yesterdayMessages].reverse().map((msg) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              onOpenThread={openThread}
              onAccept={acceptSuggestion}
              onRemind={remindLater}
              onDelete={deleteMessage}
            />
          ))}

          <div className={styles.dateDivider}>Today</div>
          {[...todayMessages].reverse().map((msg) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              onOpenThread={openThread}
              onAccept={acceptSuggestion}
              onRemind={remindLater}
              onDelete={deleteMessage}
            />
          ))}
        </div>

        <div className={styles.chatInputArea}>
          <div className={styles.chatInputContainer}>
            <div 
              ref={chatInputRef}
              className={styles.chatInputField} 
              contentEditable 
              data-placeholder="request new feature / bug fix / brainstorm ideas"
              suppressContentEditableWarning
              onSelect={() => saveCursorPosition('main')}
              onKeyUp={() => saveCursorPosition('main')}
              onClick={() => saveCursorPosition('main')}
            />
            <div className={styles.chatInputToolbar}>
              <div className={styles.chatInputTools}>
                <button className={styles.chatToolBtn} title="Attach file">
                  <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
                <button className={`${styles.chatToolBtn} ${styles.toolDiagram}`} title="Create diagram" onClick={() => setShowDiagramEditor(true)}>
                  <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                    <rect x="2" y="2" width="6" height="6" rx="1" />
                    <rect x="16" y="2" width="6" height="6" rx="1" />
                    <rect x="2" y="16" width="6" height="6" rx="1" />
                    <line x1="8" y1="5" x2="16" y2="5" />
                    <line x1="5" y1="8" x2="5" y2="16" />
                    <circle cx="19" cy="19" r="3" />
                    <line x1="17" y1="17" x2="8" y2="8" />
                  </svg>
                </button>
              </div>
              <button className={styles.chatSendBtn}>
                <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                New Thread
              </button>
            </div>
          </div>
        </div>

        {/* Thread Overlay */}
        <div className={`${styles.threadOverlay} ${activeThread ? styles.open : ''}`}>
          <div className={styles.threadHeader}>
            <div className={styles.threadTitle}>{currentThreadContent?.title || 'Thread'}</div>
            <button className={styles.threadClose} onClick={closeThread}>×</button>
          </div>

          <div className={styles.threadMessages}>
            <div className={styles.threadOriginal}>
              <div className={styles.threadOriginalLabel}>Original message</div>
              <div className={styles.threadOriginalMessage}>
                {currentThreadContent?.isUserMessage ? (
                  <div className={`${styles.threadOriginalAvatar} ${styles.you}`}>Y</div>
                ) : (
                  <img className={styles.threadOriginalAvatar} src="https://i.pravatar.cc/80?img=23" alt="Luna" />
                )}
                <div className={styles.threadOriginalContent}>
                  <div className={styles.threadOriginalHeader}>
                    <span className={styles.threadOriginalAuthor}>{currentThreadContent?.isUserMessage ? 'You' : 'Luna'}</span>
                    <span className={styles.threadOriginalTime}>{currentThreadContent?.originalTime || '10:30 AM'}</span>
                  </div>
                  <div 
                    className={styles.threadOriginalText}
                    dangerouslySetInnerHTML={{ __html: currentThreadContent?.message || '' }}
                  />
                  {currentThreadContent?.hasDecision && currentThreadMessage?.hasActions && (
                    <div className={styles.decisionActions}>
                      <button 
                        className={styles.decisionBtn}
                        onClick={() => currentThreadMessage && acceptSuggestion(currentThreadMessage.id, currentThreadContent.suggestion || '')}
                      >
                        <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Accept suggestion
                      </button>
                      <button 
                        className={styles.decisionBtn}
                        onClick={() => currentThreadMessage && remindLater(currentThreadMessage.id, currentThreadContent.title)}
                      >
                        <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Remind me later
                      </button>
                      <button 
                        className={`${styles.decisionBtn} ${styles.delete}`}
                        onClick={() => currentThreadMessage && deleteMessage(currentThreadMessage.id)}
                      >
                        <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.threadRepliesDivider}>
              <span>{currentThreadContent?.replies.length || 0} replies</span>
            </div>

            {currentThreadContent?.replies.map((reply) => (
              <div key={reply.id} className={styles.threadReply}>
                {reply.isUser ? (
                  <div className={`${styles.threadReplyAvatar} ${styles.you}`}>Y</div>
                ) : (
                  <img className={styles.threadReplyAvatar} src={reply.avatar} alt={reply.author} />
                )}
                <div className={styles.threadReplyContent}>
                  <div className={styles.threadReplyHeader}>
                    <span className={`${styles.threadReplyAuthor} ${reply.isUser ? styles.user : styles[reply.authorType || 'dev']}`}>{reply.author}</span>
                    <span className={styles.threadReplyTime}>{reply.time}</span>
                  </div>
                  <div className={styles.threadReplyText} dangerouslySetInnerHTML={{ __html: reply.text }} />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.chatInputArea}>
            <div className={styles.chatAttachments}>
              {/* Element and diagram pills will be inserted here */}
            </div>
            <div className={styles.chatInputContainer}>
              <div 
                ref={threadInputRef}
                className={styles.chatInputField} 
                contentEditable 
                data-placeholder="Add to discussion..."
                suppressContentEditableWarning
                onSelect={() => saveCursorPosition('thread')}
                onKeyUp={() => saveCursorPosition('thread')}
                onClick={() => saveCursorPosition('thread')}
              />
              <div className={styles.chatInputToolbar}>
                <div className={styles.chatInputTools}>
                  <button className={styles.chatToolBtn} title="Attach file">
                    <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  <button className={`${styles.chatToolBtn} ${styles.toolDiagram}`} title="Create diagram" onClick={() => setShowDiagramEditor(true)}>
                    <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                      <rect x="2" y="2" width="6" height="6" rx="1" />
                      <rect x="16" y="2" width="6" height="6" rx="1" />
                      <rect x="2" y="16" width="6" height="6" rx="1" />
                      <line x1="8" y1="5" x2="16" y2="5" />
                      <line x1="5" y1="8" x2="5" y2="16" />
                      <circle cx="19" cy="19" r="3" />
                      <line x1="17" y1="17" x2="8" y2="8" />
                    </svg>
                  </button>
                </div>
                <button className={styles.chatSendBtn}>
                  <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className={styles.panelResizer} ref={resizerRef} onMouseDown={handleMouseDown} />

      {/* Preview View */}
      {currentView === 'preview' && (
      <main className={styles.previewArea}>
        <div className={styles.previewToolbar}>
          <div className={styles.browserControls}>
            <div className={styles.browserNav}>
              <button className={styles.navBtn} title="Back">←</button>
              <button className={styles.navBtn} title="Forward">→</button>
              <button className={styles.navBtn} title="Reload">↻</button>
            </div>
            <div className={styles.urlBar}>
              <span className={styles.urlIcon}>🔒</span>
              <span className={styles.urlText}>preview.tism.app/saas-dashboard</span>
            </div>
          </div>

          <div className={styles.previewState}>
            {/* User Role Dropdown */}
            <div className={styles.stateDropdownWrapper} ref={roleDropdownRef}>
              <button className={styles.stateTrigger} onClick={() => { setShowRoleDropdown(!showRoleDropdown); setShowPageDropdown(false); }}>
                <span className={styles.stateTriggerLabel}>User Role:</span>
                <span className={styles.stateLabel}>{userRole}</span>
                <span className={styles.stateChevron}>▼</span>
              </button>
              <div className={`${styles.stateDropdown} ${showRoleDropdown ? styles.open : ''}`}>
                <div className={styles.stateSection}>
                  {[
                    { name: 'Admin', icon: '👑', desc: 'Full dashboard access' },
                    { name: 'Member', icon: '👤', desc: 'Limited access' },
                    { name: 'Viewer', icon: '👁️', desc: 'Read-only' },
                  ].map((role) => (
                    <div
                      key={role.name}
                      className={`${styles.stateOption} ${userRole === role.name ? styles.active : ''}`}
                      onClick={() => { setUserRole(role.name); showToast(`Preview updated: ${role.name}`); }}
                    >
                      <div className={styles.stateOptionIcon}>{role.icon}</div>
                      <div className={styles.stateOptionContent}>
                        <div className={styles.stateOptionName}>{role.name}</div>
                        <div className={styles.stateOptionDesc}>{role.desc}</div>
                      </div>
                      <span className={styles.stateOptionCheck}>✓</span>
                    </div>
                  ))}
                </div>
                <div className={styles.stateSection}>
                  <div 
                    className={`${styles.sectionHeaderToggle} ${testDataOpen ? styles.open : ''}`}
                    onClick={() => setTestDataOpen(!testDataOpen)}
                  >
                    <span className={styles.sectionChevron}>›</span>
                    <span className={styles.sectionLabel}>🗃️ Test Data</span>
                    <span className={styles.sectionValue}>{testDataFields.length} field{testDataFields.length !== 1 ? 's' : ''}</span>
                  </div>
                  {testDataOpen && (
                    <div className={styles.sectionContents}>
                      <div className={styles.testDataFields}>
                        {testDataFields.map((field) => (
                          <div key={field.id} className={styles.testDataRow}>
                            <input
                              type="text"
                              className={styles.testDataKey}
                              value={field.key}
                              placeholder="key"
                              onChange={(e) => updateTestDataField(field.id, 'key', e.target.value)}
                            />
                            <input
                              type="text"
                              className={styles.testDataValue}
                              value={field.value}
                              placeholder="value"
                              onChange={(e) => updateTestDataField(field.id, 'value', e.target.value)}
                            />
                            <button 
                              className={styles.testDataRemove}
                              onClick={() => removeTestDataField(field.id)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <button className={styles.testDataAdd} onClick={addTestDataField}>
                        + Add Field
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Page Dropdown */}
            <div className={styles.stateDropdownWrapper} ref={pageDropdownRef}>
              <button className={styles.stateTrigger} onClick={() => { setShowPageDropdown(!showPageDropdown); setShowRoleDropdown(false); }}>
                <span className={styles.stateTriggerLabel}>Page:</span>
                <span className={styles.stateLabel}>{currentPage}</span>
                <span className={styles.stateChevron}>▼</span>
              </button>
              <div className={`${styles.stateDropdown} ${showPageDropdown ? styles.open : ''}`}>
                <div className={styles.stateSection}>
                  {pageStructure.map((section) => (
                    <div key={section.folder}>
                      <div 
                        className={`${styles.featureFolder} ${openFolders[section.folder] ? styles.open : ''}`}
                        onClick={() => toggleFolder(section.folder)}
                      >
                        <span className={styles.folderIcon}>📁</span>
                        <span className={styles.folderName}>{section.folder}</span>
                        <span className={styles.folderChevron}>›</span>
                      </div>
                      <div className={`${styles.folderContents} ${!openFolders[section.folder] ? styles.collapsed : ''}`}>
                        {section.pages.map((page) => (
                          <div
                            key={page.name}
                            className={`${styles.stateOption} ${currentPage === page.name ? styles.active : ''}`}
                            onClick={() => selectPage(page.name)}
                          >
                            <div className={styles.stateOptionIcon}>{page.icon}</div>
                            <div className={styles.stateOptionContent}>
                              <div className={styles.stateOptionName}>{page.name}</div>
                              <div className={styles.stateOptionDesc}>{page.desc}</div>
                            </div>
                            <span className={styles.stateOptionCheck}>✓</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.previewActions}>
            <button 
              className={styles.deviceToggle} 
              onClick={() => setIsMobileView(!isMobileView)}
            >
              <span className={styles.deviceIcon}>{isMobileView ? '📱' : '💻'}</span>
              <span className={styles.deviceLabel}>{isMobileView ? 'Mobile' : 'Desktop'}</span>
            </button>
          </div>
        </div>

        {/* Context Banner - shows when thread changes page */}
        {activeThread && currentThreadContent?.page && (
          <div className={styles.previewContextBanner}>
            <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span>Showing <strong>{currentPage}</strong> — related to the thread you&apos;re viewing</span>
          </div>
        )}

        <div className={`${styles.previewFrame} ${isMobileView ? styles.mobileView : ''} ${editMode ? styles.editModeActive : ''}`}>
          <div className={styles.mockApp}>
            <div 
              className={`${styles.mockHeader} ${editMode ? styles.selectableElement : ''}`}
              onClick={() => handleElementClick('App Header')}
            >
              <div className={styles.mockLogo}>Acme Dashboard</div>
              <nav 
                className={`${styles.mockNav} ${editMode ? styles.selectableElement : ''}`}
                onClick={(e) => { e.stopPropagation(); handleElementClick('Navigation Menu'); }}
              >
                {['Dashboard', 'Users', 'Analytics', 'Billing', 'Settings'].map((nav) => (
                  <a 
                    key={nav} 
                    className={`${styles.mockNavItem} ${(nav === currentPage || (nav === 'Billing' && currentPage === 'Plans') || (nav === 'Users' && currentPage === 'User List')) ? styles.active : ''}`}
                  >
                    {nav}
                  </a>
                ))}
              </nav>
              <div className={styles.mockUser} />
            </div>
            <div className={styles.mockBody}>
              <h1 className={styles.mockTitle}>{currentPageData.title}</h1>
              <div className={styles.mockStats} style={{ gridTemplateColumns: `repeat(${currentPageData.stats.length}, 1fr)` }}>
                {currentPageData.stats.map((stat) => (
                  <div 
                    key={stat.label} 
                    className={`${styles.mockStat} ${editMode ? styles.selectableElement : ''}`}
                    onClick={() => handleElementClick(`${stat.label} Card`)}
                  >
                    <div className={styles.mockStatLabel}>{stat.label}</div>
                    <div className={styles.mockStatValue}>{stat.value}</div>
                    <div className={`${styles.mockStatChange} ${stat.positive ? styles.positive : ''}`}>{stat.change}</div>
                  </div>
                ))}
              </div>
              <div 
                className={`${styles.mockChart} ${editMode ? styles.selectableElement : ''}`}
                onClick={() => handleElementClick('Revenue Chart')}
              >
                <div className={styles.mockChartTitle}>
                  {currentPage === 'Analytics' ? 'Traffic Sources' : currentPage === 'Plans' ? 'Revenue by Plan' : 'Revenue Over Time'}
                </div>
                <div className={styles.mockChartArea}>
                  <div className={styles.mockChartLine} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.editToggle} ${editMode ? styles.active : ''}`} onClick={toggleEditMode}>
          <span className={styles.editToggleIcon}>✏️</span>
          <span className={styles.editToggleText}>{editMode ? 'Click an element to reference it' : 'Select Element'}</span>
          <span className={styles.editToggleHint}>ESC to exit</span>
        </div>
      </main>
      )}

      {/* Pipeline View */}
      {currentView === 'pipeline' && (
        <main className={styles.pipelineArea}>
          <PipelineView />
        </main>
      )}

      {/* Live View */}
      {currentView === 'live' && (
        <main className={styles.liveArea}>
          <LiveView />
        </main>
      )}

      {/* Toast Notification */}
      <div className={`${styles.toast} ${toast ? styles.active : ''}`}>
        <span>✅</span>
        <span>{toast}</span>
      </div>

      {/* Diagram Editor Modal */}
      {showDiagramEditor && (
        <DiagramEditor onClose={() => setShowDiagramEditor(false)} onInsert={(mermaid) => {
          showToast('Diagram attached to message');
          setShowDiagramEditor(false);
        }} />
      )}

      {/* Launch Modal */}
      <LaunchModal
        isOpen={showLaunchModal}
        onClose={() => setShowLaunchModal(false)}
        projectName={projectTitle.toLowerCase().replace(/\s+/g, '-')}
        onToast={showToast}
      />
    </div>
  );
}

interface MessageItemProps {
  msg: Message;
  onOpenThread: (threadType: string) => void;
  onAccept: (messageId: number, suggestion: string) => void;
  onRemind: (messageId: number, title: string) => void;
  onDelete: (messageId: number) => void;
}

function MessageItem({ msg, onOpenThread, onAccept, onRemind, onDelete }: MessageItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (msg.threadType) onOpenThread(msg.threadType);
  };

  return (
    <div className={`${styles.slackMessage} ${msg.unread ? styles.unread : ''}`} onClick={handleClick}>
      {msg.isUser ? (
        <div className={`${styles.slackMessageAvatar} ${styles.you}`}>Y</div>
      ) : (
        <img className={styles.slackMessageAvatar} src={msg.avatar} alt={msg.author} />
      )}
      <div className={styles.slackMessageContent}>
        <div className={styles.slackMessageHeader}>
          <span className={styles.slackMessageAuthor}>{msg.author}</span>
          <span className={styles.slackMessageTime}>{msg.time}</span>
          {msg.badges?.map((badge) => (
            <span key={badge} className={`${styles.slackMessageBadge} ${styles[badge]}`}>
              {badge.charAt(0).toUpperCase() + badge.slice(1)}
            </span>
          ))}
          {msg.unread && <div className={styles.unreadDot} />}
        </div>
        <div className={styles.slackMessageText} dangerouslySetInnerHTML={{ __html: msg.text }} />
        {msg.hasActions && (
          <div className={styles.decisionActions}>
            <button className={styles.decisionBtn} onClick={() => msg.threadType && onOpenThread(msg.threadType)}>
              <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Discuss
            </button>
            <button 
              className={styles.decisionBtn}
              onClick={(e) => { e.stopPropagation(); onAccept(msg.id, msg.suggestion || ''); }}
            >
              <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Accept suggestion
            </button>
            <button 
              className={styles.decisionBtn}
              onClick={(e) => { e.stopPropagation(); onRemind(msg.id, msg.author + '\'s suggestion'); }}
            >
              <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Remind me later
            </button>
            <button 
              className={`${styles.decisionBtn} ${styles.delete}`}
              onClick={(e) => { e.stopPropagation(); onDelete(msg.id); }}
            >
              <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete
            </button>
          </div>
        )}
        {msg.replies && (
          <div className={styles.threadPreview} onClick={() => msg.threadType && onOpenThread(msg.threadType)}>
            <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {msg.replies} replies
          </div>
        )}
      </div>
    </div>
  );
}

// Pipeline View Component
const pipelineColumns = [
  { id: 'pending-tickets', name: 'Pending Tickets', color: 'muted', count: 2 },
  { id: 'tickets', name: 'Tickets', color: 'purple', count: 2 },
  { id: 'dev-in-progress', name: 'Dev Agents', color: 'cyan', count: 2 },
  { id: 'pending-qa', name: 'Pending QA', color: 'amber', count: 1 },
  { id: 'qa-in-progress', name: 'QA Agents', color: 'orange', count: 1 },
  { id: 'pending-docs', name: 'Pending Docs', color: 'pink', count: 1 },
  { id: 'done', name: 'Done', color: 'green', count: 2 },
];

const pipelineTickets: Record<string, { id: string; title: string; desc?: string; priority?: string; tag?: string; agent?: string }[]> = {
  'pending-tickets': [
    { id: 'TSM-014', title: 'Keyboard shortcuts', priority: 'low', tag: 'UX' },
    { id: 'TSM-013', title: 'Export to CSV', priority: 'medium', tag: 'Feature' },
  ],
  'tickets': [
    { id: 'TSM-012', title: 'Add dark mode toggle', desc: 'Allow users to switch themes', priority: 'low', tag: 'UI' },
    { id: 'TSM-011', title: 'User avatar upload', priority: 'medium', tag: 'Feature' },
  ],
  'dev-in-progress': [
    { id: 'TSM-008', title: 'User management table with CRUD', desc: 'Build full user table with pagination', priority: 'high', agent: 'Dev Agent' },
    { id: 'TSM-009', title: 'Stripe billing integration', desc: 'Connect Stripe API for subscriptions', priority: 'high', agent: 'Dev Agent' },
  ],
  'pending-qa': [
    { id: 'TSM-007', title: 'Dashboard layout', desc: 'Main dashboard grid layout', priority: 'medium', tag: 'Awaiting QA' },
  ],
  'qa-in-progress': [
    { id: 'TSM-006', title: 'Email templates', priority: 'medium', agent: 'QA Agent' },
  ],
  'pending-docs': [
    { id: 'TSM-005', title: 'Analytics widgets', desc: 'Charts for MAU, revenue, churn', priority: 'medium', tag: 'Awaiting Docs' },
  ],
  'done': [
    { id: 'TSM-001', title: 'Project setup', tag: 'Setup' },
    { id: 'TSM-002', title: 'Auth flow', tag: 'Auth' },
  ],
};

function PipelineView() {
  return (
    <div className={styles.pipelineContent}>
      <div className={styles.pipelineHeader}>
        <h2 className={styles.pipelineTitle}>Pipeline</h2>
        <div className={styles.pipelineStats}>
          <span className={styles.pipelineStat}>11 tickets</span>
          <span className={styles.pipelineStat}>4 in progress</span>
        </div>
      </div>
      <div className={styles.kanbanBoard}>
        {pipelineColumns.map((column) => (
          <div key={column.id} className={styles.kanbanColumn}>
            <div className={styles.kanbanColumnHeader}>
              <span className={`${styles.kanbanColumnDot} ${styles[column.color]}`} />
              <span className={styles.kanbanColumnName}>{column.name}</span>
              <span className={styles.kanbanColumnCount}>{column.count}</span>
            </div>
            <div className={styles.kanbanColumnBody}>
              {pipelineTickets[column.id]?.map((ticket) => (
                <div key={ticket.id} className={styles.kanbanCard}>
                  <div className={styles.kanbanCardHeader}>
                    <span className={styles.kanbanCardId}>{ticket.id}</span>
                    {ticket.priority && (
                      <span className={`${styles.kanbanCardPriority} ${styles[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    )}
                  </div>
                  <div className={styles.kanbanCardTitle}>{ticket.title}</div>
                  {ticket.desc && <div className={styles.kanbanCardDesc}>{ticket.desc}</div>}
                  {ticket.tag && <span className={styles.kanbanCardTag}>{ticket.tag}</span>}
                  {ticket.agent && <span className={styles.kanbanCardAgent}>{ticket.agent}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Live View Component
const liveAgents = [
  { id: 'agent1', name: 'Marcus', task: 'TSM-008' },
  { id: 'agent2', name: 'Sophia', task: 'TSM-012' },
  { id: 'agent3', name: 'Jordan', task: 'TSM-006' },
  { id: 'agent4', name: 'Alex', task: 'TSM-015' },
  { id: 'agent5', name: 'Riley', task: 'TSM-009' },
  { id: 'agent6', name: 'Sam', task: 'TSM-011' },
  { id: 'agent7', name: 'Morgan', task: 'TSM-014' },
  { id: 'agent8', name: 'Casey', task: 'TSM-016' },
];

const liveActivities = [
  { name: 'Marcus', action: 'started working on TSM-008', time: 'just now' },
  { name: 'Sophia', action: 'pushed 3 commits', time: '3s ago' },
  { name: 'Jordan', action: 'completed test suite', time: '6s ago' },
  { name: 'Alex', action: 'deployed to staging', time: '9s ago' },
  { name: 'Riley', action: 'fixed UI bug', time: '12s ago' },
];

function LiveView() {
  return (
    <div className={styles.liveContent}>
      <div className={styles.liveHeader}>
        <div className={styles.liveStatus}>
          <span className={styles.liveStatusDot} />
          <span className={styles.liveStatusText}>8 Agents Active</span>
        </div>
        <div className={styles.liveStats}>
          <span className={styles.liveStat}>📄 4,302 lines</span>
          <span className={styles.liveStat}>✅ 249 tests</span>
          <span className={styles.liveStat}>📦 13 commits</span>
        </div>
      </div>
      
      <div className={styles.liveGrid}>
        <div className={styles.agentsGrid}>
          {liveAgents.map((agent) => (
            <div key={agent.id} className={styles.agentCard}>
              <div className={styles.agentHeader}>
                <div className={styles.agentAvatar}>{agent.name[0]}</div>
                <div className={styles.agentInfo}>
                  <div className={styles.agentName}>{agent.name}</div>
                  <div className={styles.agentTask}>{agent.task}</div>
                </div>
              </div>
              <div className={styles.agentCode}>
                <div className={styles.codeLine}><span className={styles.lineNum}>1</span>import {'{ us'}</div>
                <div className={styles.codeLine}><span className={styles.lineNum}>2</span>import {'{ Us'}</div>
                <div className={styles.codeLine}><span className={styles.lineNum}>3</span></div>
                <div className={styles.codeLine}><span className={styles.lineNum}>4</span>export func</div>
                <div className={styles.codeLine}><span className={styles.lineNum}>5</span>{'  const [us'}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.activityFeed}>
          <div className={styles.activityHeader}>
            <span className={styles.activityDot} />
            Live Activity
          </div>
          {liveActivities.map((activity, i) => (
            <div key={i} className={styles.activityItem}>
              <div className={styles.activityAvatar}>{activity.name[0]}</div>
              <div className={styles.activityContent}>
                <span className={styles.activityName}>{activity.name}</span>
                <span className={styles.activityAction}>{activity.action}</span>
              </div>
              <span className={styles.activityTime}>{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

