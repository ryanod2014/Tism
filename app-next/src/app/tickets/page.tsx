'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, Button } from '@/components/ui';
import styles from './page.module.css';

const columns = [
  { id: 'pending-tickets', name: 'Pending Tickets', color: 'muted', count: 2 },
  { id: 'tickets', name: 'Tickets', color: 'purple', count: 2 },
  { id: 'dev-in-progress', name: 'Dev Agents', color: 'cyan', count: 2 },
  { id: 'pending-qa', name: 'Pending QA', color: 'amber', count: 1 },
  { id: 'qa-in-progress', name: 'QA Agents', color: 'orange', count: 1 },
  { id: 'pending-docs', name: 'Pending Docs', color: 'pink', count: 1 },
  { id: 'done', name: 'Done', color: 'green', count: 2 },
];

const tickets: Record<string, { id: string; title: string; desc?: string; priority?: string; tag?: string; agent?: string }[]> = {
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

const messages = [
  { id: 1, avatar: 'https://i.pravatar.cc/80?img=23', author: 'Luna', time: 'Just now', badges: ['critical', 'pending'], text: 'Marcus needs a decision: Should users see pricing before or after signup?', unread: true, replies: 3 },
  { id: 2, avatar: 'https://i.pravatar.cc/80?img=5', author: 'Sophia', time: '8:15 AM', badges: ['pending'], text: 'Which chart library should we use?', unread: true, replies: 2 },
];

export default function TicketsPage() {
  const [panelWidth, setPanelWidth] = useState(420);
  const [projectTitle, setProjectTitle] = useState('SaaS Dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('inboxPanelWidth');
    if (saved) setPanelWidth(parseInt(saved));
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

  return (
    <div className={styles.app} style={{ '--inbox-width': `${panelWidth}px` } as React.CSSProperties}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backToProjects}>←</Link>
          <div className={styles.headerDivider} />
          <div className={styles.projectTitle} contentEditable suppressContentEditableWarning>
            {projectTitle}
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.viewTabs}>
            <Link href="/project" className={styles.viewTab}>Preview</Link>
            <span className={`${styles.viewTab} ${styles.active}`}>Pipeline</span>
            <Link href="/live" className={styles.viewTab}>Live</Link>
          </div>
          <Button variant="primary" size="sm">🚀 Launch</Button>
          <Avatar initials="RO" size="sm" />
        </div>
      </header>

      <aside className={styles.chatPanel}>
        <div className={styles.chatPanelHeader}>
          <div className={styles.chatPanelTitle}>
            <img className={styles.pmAvatar} src="https://i.pravatar.cc/80?img=23" alt="Luna" />
            <div>
              <div className={styles.pmName}>Luna</div>
              <div className={styles.pmStatus}>Your PM</div>
            </div>
          </div>
        </div>

        <div className={styles.messagesWrapper}>
          <div className={styles.messagesContainer}>
            <div className={styles.dateDivider}>Today</div>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.slackMessage} ${msg.unread ? styles.unread : ''}`}>
                <img className={styles.slackMessageAvatar} src={msg.avatar} alt={msg.author} />
                <div className={styles.slackMessageContent}>
                  <div className={styles.slackMessageHeader}>
                    <span className={styles.slackMessageAuthor}>{msg.author}</span>
                    <span className={styles.slackMessageTime}>{msg.time}</span>
                    {msg.badges.map((b) => (
                      <span key={b} className={`${styles.slackMessageBadge} ${styles[b]}`}>{b}</span>
                    ))}
                    {msg.unread && <div className={styles.unreadDot} />}
                  </div>
                  <div className={styles.slackMessageText}>{msg.text}</div>
                  <div className={styles.threadPreview}>💬 {msg.replies} replies</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.slackChatInputArea}>
          <div className={styles.slackChatInputContainer}>
            <input type="text" className={styles.slackChatInputField} placeholder="Message Luna..." />
            <button className={styles.slackChatSendBtn}>Send</button>
          </div>
        </div>
      </aside>

      <div className={styles.panelResizer} onMouseDown={handleMouseDown} />

      <main className={styles.main}>
        <div className={styles.ticketBoard}>
          {columns.map((col) => (
            <div key={col.id} className={`${styles.ticketColumn} ${styles[col.id]}`}>
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                  <div className={`${styles.columnDot} ${styles[col.color]}`} />
                  <span className={styles.columnName}>{col.name}</span>
                </div>
                <span className={styles.columnCount}>{col.count}</span>
              </div>
              <div className={styles.columnBody}>
                {tickets[col.id]?.map((ticket) => (
                  <div key={ticket.id} className={`${styles.ticket} ${col.id === 'done' ? styles.done : ''}`}>
                    <div className={styles.ticketHeader}>
                      <span className={styles.ticketId}>{ticket.id}</span>
                      {ticket.priority && (
                        <span className={`${styles.ticketPriority} ${styles[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      )}
                    </div>
                    <div className={styles.ticketTitle}>{ticket.title}</div>
                    {ticket.desc && <div className={styles.ticketDesc}>{ticket.desc}</div>}
                    <div className={styles.ticketFooter}>
                      {ticket.tag && <span className={styles.ticketTag}>{ticket.tag}</span>}
                      {ticket.agent && (
                        <span className={styles.agentWorking}>
                          <span className={styles.workingDot} />
                          {ticket.agent}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
