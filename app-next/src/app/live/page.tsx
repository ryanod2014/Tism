'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, Button } from '@/components/ui';
import styles from './page.module.css';

const agents = [
  { id: 'agent1', name: 'Marcus', role: 'Lead Dev', avatar: 'https://i.pravatar.cc/80?img=12', task: 'TSM-008' },
  { id: 'agent2', name: 'Sophia', role: 'Backend', avatar: 'https://i.pravatar.cc/80?img=5', task: 'TSM-012' },
  { id: 'agent3', name: 'Jordan', role: 'QA', avatar: 'https://i.pravatar.cc/80?img=59', task: 'TSM-006' },
  { id: 'agent4', name: 'Alex', role: 'DevOps', avatar: 'https://i.pravatar.cc/80?img=33', task: 'TSM-015' },
  { id: 'agent5', name: 'Riley', role: 'Frontend', avatar: 'https://i.pravatar.cc/80?img=47', task: 'TSM-009' },
  { id: 'agent6', name: 'Sam', role: 'API Dev', avatar: 'https://i.pravatar.cc/80?img=68', task: 'TSM-011' },
  { id: 'agent7', name: 'Morgan', role: 'Security', avatar: 'https://i.pravatar.cc/80?img=15', task: 'TSM-014' },
  { id: 'agent8', name: 'Casey', role: 'Database', avatar: 'https://i.pravatar.cc/80?img=22', task: 'TSM-016' },
  { id: 'agent9', name: 'Taylor', role: 'Tests', avatar: 'https://i.pravatar.cc/80?img=31', task: 'TSM-010' },
  { id: 'agent10', name: 'Avery', role: 'Docs', avatar: 'https://i.pravatar.cc/80?img=44', task: 'TSM-007' },
  { id: 'agent11', name: 'Quinn', role: 'UI/UX', avatar: 'https://i.pravatar.cc/80?img=52', task: 'TSM-013' },
  { id: 'agent12', name: 'Drew', role: 'Infra', avatar: 'https://i.pravatar.cc/80?img=61', task: 'TSM-017' },
];

const codeSnippet = `import { useState, useEffect } from 'react';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser().then(setUser);
  }, []);`;

const activities = [
  { name: 'Marcus', action: 'started working on TSM-008', avatar: 'https://i.pravatar.cc/80?img=12' },
  { name: 'Sophia', action: 'pushed 3 commits', avatar: 'https://i.pravatar.cc/80?img=5' },
  { name: 'Jordan', action: 'completed test suite', avatar: 'https://i.pravatar.cc/80?img=59' },
  { name: 'Alex', action: 'deployed to staging', avatar: 'https://i.pravatar.cc/80?img=33' },
  { name: 'Riley', action: 'fixed UI bug', avatar: 'https://i.pravatar.cc/80?img=47' },
];

export default function LivePage() {
  const [panelWidth, setPanelWidth] = useState(420);
  const [linesWritten, setLinesWritten] = useState(4287);
  const [testsRun, setTestsRun] = useState(247);
  const [commits, setCommits] = useState(12);
  const [particles, setParticles] = useState<{ left: string; delay: string; duration: string }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate particles on client side only to avoid hydration mismatch
    setParticles(
      Array.from({ length: 30 }).map(() => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 15}s`,
        duration: `${10 + Math.random() * 10}s`,
      }))
    );

    const saved = localStorage.getItem('inboxPanelWidth');
    if (saved) setPanelWidth(parseInt(saved));

    const interval = setInterval(() => {
      setLinesWritten((prev) => prev + Math.floor(Math.random() * 5));
      if (Math.random() > 0.8) setTestsRun((prev) => prev + 1);
      if (Math.random() > 0.95) setCommits((prev) => prev + 1);
    }, 500);

    return () => clearInterval(interval);
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
      <div className={styles.particles}>
        {mounted && particles.map((p, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backToProjects}>←</Link>
          <div className={styles.headerDivider} />
          <div className={styles.projectTitle}>SaaS Dashboard</div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.viewTabs}>
            <Link href="/project" className={styles.viewTab}>Preview</Link>
            <span className={`${styles.viewTab} ${styles.active}`}>Live</span>
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
            <div className={`${styles.slackMessage} ${styles.unread}`}>
              <img className={styles.slackMessageAvatar} src="https://i.pravatar.cc/80?img=23" alt="Luna" />
              <div className={styles.slackMessageContent}>
                <div className={styles.slackMessageHeader}>
                  <span className={styles.slackMessageAuthor}>Luna</span>
                  <span className={styles.slackMessageTime}>Just now</span>
                  <span className={`${styles.slackMessageBadge} ${styles.critical}`}>Critical</span>
                </div>
                <div className={styles.slackMessageText}>
                  <strong>Marcus needs a decision:</strong> Should users see pricing before or after signup?
                </div>
              </div>
            </div>
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

      <div className={styles.statusBar}>
        <div className={styles.statusLeft}>
          <div className={styles.liveIndicator}>
            <div className={styles.liveDot} />
            <span className={styles.liveText}><span className={styles.activeCount}>8</span> Agents Active</span>
          </div>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span>📝</span>
              <span className={styles.metricValue}>{linesWritten.toLocaleString()}</span>
              <span>lines</span>
            </div>
            <div className={styles.metric}>
              <span>✅</span>
              <span className={styles.metricValue}>{testsRun}</span>
              <span>tests</span>
            </div>
            <div className={styles.metric}>
              <span>🔄</span>
              <span className={styles.metricValue}>{commits}</span>
              <span>commits</span>
            </div>
          </div>
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.agentGrid}>
          {agents.map((agent, i) => (
            <div
              key={agent.id}
              className={`${styles.agentWindow} ${i % 3 === 0 ? styles.thinking : styles.active}`}
            >
              <div className={styles.windowHeader}>
                <div className={styles.windowInfo}>
                  <div className={styles.windowAvatar}>
                    <img src={agent.avatar} alt={agent.name} />
                    <div className={styles.statusRing} />
                  </div>
                  <span className={styles.windowName}>{agent.name}</span>
                  <span className={styles.windowTask}>{agent.task}</span>
                </div>
                <span className={styles.windowStatus}>
                  {i % 3 === 0 ? '🧠 Thinking...' : '⚡ Writing...'}
                </span>
              </div>
              <div className={styles.windowContent}>
                <div className={styles.codeView}>
                  {codeSnippet.split('\n').map((line, idx) => (
                    <div key={idx} className={styles.codeLine}>
                      <span className={styles.lineNum}>{idx + 1}</span>
                      <span className={styles.lineCode}>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <aside className={styles.activitySidebar}>
        <div className={styles.activityHeader}>
          <div className={styles.activityDot} />
          Live Activity
        </div>
        <div className={styles.activityList}>
          {activities.map((activity, i) => (
            <div key={i} className={styles.activityItem}>
              <div className={styles.activityAvatar}>
                <img src={activity.avatar} alt={activity.name} />
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>
                  <strong>{activity.name}</strong> {activity.action}
                </div>
                <div className={styles.activityTime}>{i === 0 ? 'just now' : `${i * 3}s ago`}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
