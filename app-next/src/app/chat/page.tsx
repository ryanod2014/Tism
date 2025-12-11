'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import styles from './page.module.css';

const projectTypes: Record<string, { icon: string; name: string; questions: { text: string; options?: string[]; placeholder?: string }[] }> = {
  tool: {
    icon: '🛠️',
    name: 'Tool',
    questions: [
      { text: "What does this tool do? Describe the main purpose in a sentence or two.", placeholder: "e.g., A PDF merger that combines multiple files into one" },
      { text: "Who will use this tool?", placeholder: "e.g., Small business owners who need to merge invoices" },
      { text: "What are the core features you need?", placeholder: "e.g., Drag and drop upload, preview before merge, download result" },
      { text: "Should this be a web app, desktop app, or command-line tool?", options: ["Web App", "Desktop App", "CLI Tool", "All of the above"] },
      { text: "Any specific technologies or integrations?", placeholder: "e.g., React, Node.js, or just 'no preference'" },
    ],
  },
  webapp: {
    icon: '🚀',
    name: 'Webapp / SaaS',
    questions: [
      { text: "Describe your SaaS in one sentence. What problem does it solve?", placeholder: "e.g., A project management tool for remote design teams" },
      { text: "Who is your target customer?", placeholder: "e.g., Small marketing agencies with 5-20 employees" },
      { text: "What are the 3-5 core features you need for launch?", placeholder: "e.g., User dashboard, team workspaces, file sharing" },
      { text: "How will users sign up and authenticate?", options: ["Email/Password", "Google OAuth", "Magic Link", "All of the above"] },
      { text: "What's your pricing model?", options: ["Free tier + Paid", "Paid only", "Free forever", "Usage-based", "Not sure yet"] },
    ],
  },
};

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type') || 'tool';
  const config = projectTypes[type] || projectTypes.tool;

  const [messages, setMessages] = useState<{ sender: 'agent' | 'user'; text: string; options?: string[] }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      const q = config.questions[0];
      setMessages([{ sender: 'agent', text: q.text, options: q.options }]);
    }, 500);
  }, [config]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const submitAnswer = (answer: string) => {
    setMessages((prev) => [...prev, { sender: 'user', text: answer }]);
    const nextQ = currentQuestion + 1;
    setCurrentQuestion(nextQ);

    if (nextQ < config.questions.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const q = config.questions[nextQ];
        setMessages((prev) => [...prev, { sender: 'agent', text: q.text, options: q.options }]);
      }, 1000);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { 
          sender: 'agent', 
          text: "Great! I have all the information I need. Click 'Create Project' when you're ready." 
        }]);
        setShowFinish(true);
      }, 1000);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    submitAnswer(inputValue.trim());
    setInputValue('');
  };

  const handleFinish = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/projects/style');
    }, 1500);
  };

  const progress = Math.min((currentQuestion + 1) / config.questions.length * 100, 100);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/projects/new" className={styles.backBtn}>← Back</Link>
          <div className={styles.projectType}>
            <span className={styles.typeIcon}>{config.icon}</span>
            <div>
              <div className={styles.typeLabel}>Project Type</div>
              <div className={styles.typeName}>{config.name}</div>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.progressIndicator}>
            <span>Question {Math.min(currentQuestion + 1, config.questions.length)} of {config.questions.length}</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
          <Avatar initials="RO" size="sm" />
        </div>
      </header>

      <div className={styles.chatContainer}>
        <div className={styles.chatMessages} ref={messagesRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${styles[msg.sender]}`}>
              <div className={styles.messageHeader}>
                <div className={`${styles.messageAvatar} ${styles[msg.sender]}`}>
                  {msg.sender === 'agent' ? '🤖' : 'RO'}
                </div>
                <span className={styles.messageSender}>{msg.sender === 'agent' ? 'Spec Builder' : 'You'}</span>
                <span className={styles.messageTime}>Just now</span>
              </div>
              <div className={styles.messageContent}>
                <div className={styles.messageBubble}>
                  {msg.text}
                  {msg.options && (
                    <div className={styles.messageOptions}>
                      {msg.options.map((opt) => (
                        <button key={opt} className={styles.optionBtn} onClick={() => submitAnswer(opt)}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className={styles.message}>
              <div className={styles.messageHeader}>
                <div className={`${styles.messageAvatar} ${styles.agent}`}>🤖</div>
                <span className={styles.messageSender}>Spec Builder</span>
              </div>
              <div className={styles.typingIndicator}>
                <div className={styles.typingDot} />
                <div className={styles.typingDot} />
                <div className={styles.typingDot} />
              </div>
            </div>
          )}
        </div>

        <div className={styles.chatInputArea}>
          <div className={styles.chatInputWrapper}>
            <textarea
              className={styles.chatInput}
              placeholder={config.questions[currentQuestion]?.placeholder || 'Type your answer...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              rows={1}
            />
            {!showFinish ? (
              <button className={styles.chatSend} onClick={handleSend}>→</button>
            ) : (
              <button className={styles.finishBtn} onClick={handleFinish}>Create Project →</button>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Spec complete!</div>
          <div className={styles.loadingSubtext}>Let&apos;s choose a style for your project</div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
