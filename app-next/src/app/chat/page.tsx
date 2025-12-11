'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import styles from './page.module.css';

// Types
type ConversationStage = 
  | 'vision' 
  | 'roles' 
  | 'features' 
  | 'suggest_features'
  | 'structure' 
  | 'technical' 
  | 'complete';

interface Feature {
  id: string;
  name: string;
  description?: string;
  suggested?: boolean;
}

interface Page {
  id: string;
  name: string;
  icon: string;
  features: Feature[];
}

interface Role {
  id: string;
  name: string;
  icon: string;
  features: Feature[];
  pages?: Page[];
  structureConfirmed?: boolean;
}

interface TechnicalSpec {
  scale?: string;
  auth?: string;
  integrations?: string[];
  timeline?: string;
}

interface SpecTree {
  projectName: string;
  vision: string;
  roles: Role[];
  technical: TechnicalSpec;
  shared?: {
    auth: string;
    notifications: string[];
  };
}

interface Message {
  sender: 'agent' | 'user';
  text: string;
  options?: string[];
  multiSelect?: boolean;
  suggestions?: Feature[];
  structureProposal?: { roleId: string; pages: Page[] };
}

// AI-suggested features based on common patterns
const featureSuggestions: Record<string, Feature[]> = {
  admin: [
    { id: 'admin_users', name: 'User management', description: 'Invite, remove, change roles', suggested: true },
    { id: 'admin_audit', name: 'Audit logs', description: 'Track who did what', suggested: true },
    { id: 'admin_export', name: 'Data export', description: 'Export to CSV/JSON', suggested: true },
    { id: 'admin_settings', name: 'App settings', description: 'Configure app-wide options', suggested: true },
    { id: 'admin_billing', name: 'Billing management', description: 'Subscription and invoices', suggested: true },
  ],
  user: [
    { id: 'user_profile', name: 'Profile settings', description: 'Edit name, avatar, preferences', suggested: true },
    { id: 'user_notifications', name: 'Notification preferences', description: 'Email and push settings', suggested: true },
    { id: 'user_dashboard', name: 'Personal dashboard', description: 'Overview of their data', suggested: true },
  ],
  manager: [
    { id: 'mgr_reports', name: 'Team reports', description: 'Performance and analytics', suggested: true },
    { id: 'mgr_assign', name: 'Task assignment', description: 'Assign work to team', suggested: true },
    { id: 'mgr_overview', name: 'Team overview', description: 'See all team activity', suggested: true },
  ],
};

// Page structure suggestions based on features
const suggestPagesForRole = (role: Role): Page[] => {
  const features = role.features;
  const pages: Page[] = [];
  
  // Always suggest a dashboard
  const dashboardFeatures = features.filter(f => 
    f.name.toLowerCase().includes('dashboard') || 
    f.name.toLowerCase().includes('overview') ||
    f.name.toLowerCase().includes('stats')
  );
  if (dashboardFeatures.length > 0 || features.length > 0) {
    pages.push({
      id: `${role.id}_dashboard`,
      name: 'Dashboard',
      icon: '📊',
      features: dashboardFeatures.length > 0 ? dashboardFeatures : [],
    });
  }

  // Group remaining features by type
  const settingsFeatures = features.filter(f => 
    f.name.toLowerCase().includes('setting') || 
    f.name.toLowerCase().includes('config') ||
    f.name.toLowerCase().includes('preference') ||
    f.name.toLowerCase().includes('profile')
  );
  if (settingsFeatures.length > 0) {
    pages.push({
      id: `${role.id}_settings`,
      name: 'Settings',
      icon: '⚙️',
      features: settingsFeatures,
    });
  }

  // Management features
  const managementFeatures = features.filter(f => 
    f.name.toLowerCase().includes('manage') || 
    f.name.toLowerCase().includes('user') ||
    f.name.toLowerCase().includes('team') ||
    f.name.toLowerCase().includes('member')
  );
  if (managementFeatures.length > 0) {
    pages.push({
      id: `${role.id}_team`,
      name: 'Team',
      icon: '👥',
      features: managementFeatures,
    });
  }

  // Reports/Analytics
  const reportFeatures = features.filter(f => 
    f.name.toLowerCase().includes('report') || 
    f.name.toLowerCase().includes('analytics') ||
    f.name.toLowerCase().includes('audit')
  );
  if (reportFeatures.length > 0) {
    pages.push({
      id: `${role.id}_reports`,
      name: 'Reports',
      icon: '📈',
      features: reportFeatures,
    });
  }

  // Put remaining features in a "Main" or role-specific page
  const usedFeatureIds = pages.flatMap(p => p.features.map(f => f.id));
  const remainingFeatures = features.filter(f => !usedFeatureIds.includes(f.id));
  
  if (remainingFeatures.length > 0) {
    // Insert after dashboard
    pages.splice(1, 0, {
      id: `${role.id}_main`,
      name: role.name === 'Admin' ? 'Admin Tools' : 'Main',
      icon: '⚡',
      features: remainingFeatures,
    });
  }

  return pages;
};

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Conversation state
  const [stage, setStage] = useState<ConversationStage>('vision');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [structureRoleIndex, setStructureRoleIndex] = useState(0);
  
  // Spec tree state
  const [specTree, setSpecTree] = useState<SpecTree>({
    projectName: '',
    vision: '',
    roles: [],
    technical: {},
  });
  
  // UI state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'roles']));
  const [isReorganizing, setIsReorganizing] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  
  const messagesRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    setTimeout(() => {
      setMessages([{
        sender: 'agent',
        text: "👋 Let's build your product spec! I'll help you define what you're building, who uses it, and what they can do.\n\nWatch the folder tree on the right — it'll show your app's structure as we talk.\n\n**What are you building?** Describe it in a sentence or two.",
      }]);
    }, 300);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Add agent message with typing delay
  const addAgentMessage = useCallback((message: Message, delay: number = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, message]);
    }, delay);
  }, []);

  // Handle user response
  const handleSubmit = (answer: string) => {
    if (!answer.trim() && stage !== 'suggest_features') return;
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: answer }]);
    setInputValue('');

    switch (stage) {
      case 'vision':
        handleVisionResponse(answer);
        break;
      case 'roles':
        handleRolesResponse(answer);
        break;
      case 'features':
        handleFeaturesResponse(answer);
        break;
      case 'suggest_features':
        // Handled by button clicks
        break;
      case 'structure':
        handleStructureResponse(answer);
        break;
      case 'technical':
        handleTechnicalResponse(answer);
        break;
    }
  };

  const handleVisionResponse = (answer: string) => {
    // Extract project name (first few words or before "that" or "-")
    const words = answer.split(' ');
    const projectName = words.slice(0, 3).join(' ').replace(/[.,]/g, '') || 'My Project';
    
    setSpecTree(prev => ({
      ...prev,
      projectName,
      vision: answer,
    }));

    setStage('roles');
    addAgentMessage({
      sender: 'agent',
      text: `**${projectName}** — I like it! 📁\n\n**What types of users will use this app?** List the roles (e.g., Admin, User, Manager, Guest).`,
      options: ['Admin + User', 'Admin + User + Manager', 'Admin + User + Guest', 'Single user type', 'Custom...'],
    });
  };

  const handleRolesResponse = (answer: string) => {
    // Parse roles from answer
    let roleNames: string[] = [];
    
    if (answer === 'Admin + User') {
      roleNames = ['Admin', 'User'];
    } else if (answer === 'Admin + User + Manager') {
      roleNames = ['Admin', 'User', 'Manager'];
    } else if (answer === 'Admin + User + Guest') {
      roleNames = ['Admin', 'User', 'Guest'];
    } else if (answer === 'Single user type') {
      roleNames = ['User'];
    } else {
      // Parse custom input
      roleNames = answer.split(/[,+&]/).map(r => r.trim()).filter(Boolean);
      if (roleNames.length === 0) roleNames = ['User'];
    }

    const roles: Role[] = roleNames.map((name, i) => ({
      id: `role_${i}`,
      name,
      icon: name.toLowerCase().includes('admin') ? '👑' : 
            name.toLowerCase().includes('manager') ? '📋' :
            name.toLowerCase().includes('guest') ? '👤' : '🧑',
      features: [],
    }));

    setSpecTree(prev => ({ ...prev, roles }));
    setExpandedFolders(prev => new Set([...prev, ...roles.map(r => r.id)]));
    setCurrentRoleIndex(0);
    setStage('features');

    const firstRole = roles[0];
    addAgentMessage({
      sender: 'agent',
      text: `Great! I see ${roles.length} role${roles.length > 1 ? 's' : ''}: ${roles.map(r => `**${r.name}**`).join(', ')}.\n\nLet's define what each role can do.\n\n**What can a ${firstRole.icon} ${firstRole.name} do?** List the main features/actions.`,
    });
  };

  const handleFeaturesResponse = (answer: string) => {
    // Parse features from answer
    const featureNames = answer.split(/[,\n]/).map(f => f.trim().replace(/^[-•*]\s*/, '')).filter(Boolean);
    const features: Feature[] = featureNames.map((name, i) => ({
      id: `feat_${currentRoleIndex}_${i}`,
      name,
    }));

    // Update role with features
    setSpecTree(prev => {
      const newRoles = [...prev.roles];
      newRoles[currentRoleIndex] = {
        ...newRoles[currentRoleIndex],
        features,
      };
      return { ...prev, roles: newRoles };
    });

    // Move to suggestions for this role
    setStage('suggest_features');
    
    // Get suggestions based on role type
    const role = specTree.roles[currentRoleIndex];
    const roleType = role.name.toLowerCase().includes('admin') ? 'admin' :
                     role.name.toLowerCase().includes('manager') ? 'manager' : 'user';
    const suggestions = featureSuggestions[roleType] || featureSuggestions.user;
    
    // Filter out features that were already mentioned
    const existingNames = features.map(f => f.name.toLowerCase());
    const newSuggestions = suggestions.filter(s => 
      !existingNames.some(n => n.includes(s.name.toLowerCase().split(' ')[0]))
    );

    if (newSuggestions.length > 0) {
      addAgentMessage({
        sender: 'agent',
        text: `Good list! For **${role.name}s**, apps like yours often also include:`,
        suggestions: newSuggestions,
      });
    } else {
      // Skip suggestions, move to next role or structure
      moveToNextRoleOrStructure();
    }
  };

  const handleAddSuggestions = (selectedSuggestions: Feature[]) => {
    // Add selected suggestions to current role
    setSpecTree(prev => {
      const newRoles = [...prev.roles];
      const currentRole = newRoles[currentRoleIndex];
      newRoles[currentRoleIndex] = {
        ...currentRole,
        features: [...currentRole.features, ...selectedSuggestions],
      };
      return { ...prev, roles: newRoles };
    });

    setSelectedFeatures(new Set());
    moveToNextRoleOrStructure();
  };

  const moveToNextRoleOrStructure = () => {
    const nextRoleIndex = currentRoleIndex + 1;
    
    if (nextRoleIndex < specTree.roles.length) {
      // Ask about next role
      setCurrentRoleIndex(nextRoleIndex);
      setStage('features');
      const nextRole = specTree.roles[nextRoleIndex];
      
      addAgentMessage({
        sender: 'agent',
        text: `✅ Got it!\n\nNow, **what can a ${nextRole.icon} ${nextRole.name} do?**`,
      });
    } else {
      // All roles done, propose structure for first role
      setStage('structure');
      setStructureRoleIndex(0);
      proposeStructureForRole(0);
    }
  };

  const proposeStructureForRole = (roleIndex: number) => {
    const role = specTree.roles[roleIndex];
    const suggestedPages = suggestPagesForRole(role);

    // Store suggested pages temporarily
    setSpecTree(prev => {
      const newRoles = [...prev.roles];
      newRoles[roleIndex] = { ...newRoles[roleIndex], pages: suggestedPages };
      return { ...prev, roles: newRoles };
    });

    addAgentMessage({
      sender: 'agent',
      text: `Now let's organize **${role.icon} ${role.name}'s** features into pages.\n\nHere's what I suggest:`,
      structureProposal: { roleId: role.id, pages: suggestedPages },
    }, 1000);
  };

  const handleStructureResponse = (answer: string) => {
    const isApproved = answer.toLowerCase().includes('yes') || 
                       answer.toLowerCase().includes('good') ||
                       answer.toLowerCase().includes('perfect') ||
                       answer.toLowerCase().includes('looks good');

    if (isApproved) {
      // Mark current role structure as confirmed
      setSpecTree(prev => {
        const newRoles = [...prev.roles];
        newRoles[structureRoleIndex] = {
          ...newRoles[structureRoleIndex],
          structureConfirmed: true,
        };
        return { ...prev, roles: newRoles };
      });

      // Trigger reorganization animation
      setIsReorganizing(true);
      setTimeout(() => setIsReorganizing(false), 1000);

      const nextRoleIndex = structureRoleIndex + 1;
      
      if (nextRoleIndex < specTree.roles.length) {
        setStructureRoleIndex(nextRoleIndex);
        setTimeout(() => proposeStructureForRole(nextRoleIndex), 1200);
      } else {
        // All structures confirmed, move to technical
        setStage('technical');
        addAgentMessage({
          sender: 'agent',
          text: `🎉 Structure locked in!\n\nLast section: **Technical Requirements**\n\nHow many users does this need to support?`,
          options: ['< 1,000 users', '1K - 10K users', '10K - 100K users', '100K+ users', 'Not sure yet'],
        }, 1200);
      }
    } else {
      addAgentMessage({
        sender: 'agent',
        text: `No problem! You can drag features to different pages in the tree, or tell me what changes you'd like.`,
      });
    }
  };

  const handleTechnicalResponse = (answer: string) => {
    // Parse technical responses based on current state
    const tech = specTree.technical;
    
    if (!tech.scale) {
      setSpecTree(prev => ({
        ...prev,
        technical: { ...prev.technical, scale: answer },
      }));
      
      addAgentMessage({
        sender: 'agent',
        text: `Got it. **How should users log in?**`,
        options: ['Email + Password', 'Google OAuth', 'Magic Link', 'SSO/SAML', 'Multiple options'],
      });
    } else if (!tech.auth) {
      setSpecTree(prev => ({
        ...prev,
        technical: { ...prev.technical, auth: answer },
      }));
      
      addAgentMessage({
        sender: 'agent',
        text: `**Any third-party integrations needed?** (e.g., Stripe, SendGrid, Slack)`,
      });
    } else if (!tech.integrations) {
      const integrations = answer.split(/[,\n]/).map(i => i.trim()).filter(Boolean);
      setSpecTree(prev => ({
        ...prev,
        technical: { ...prev.technical, integrations },
      }));
      
      addAgentMessage({
        sender: 'agent',
        text: `Last one! **What's your timeline?**`,
        options: ['ASAP (< 1 month)', '1-3 months', '3-6 months', '6+ months', 'No deadline'],
      });
    } else {
      setSpecTree(prev => ({
        ...prev,
        technical: { ...prev.technical, timeline: answer },
      }));
      
      setStage('complete');
      addAgentMessage({
        sender: 'agent',
        text: `🎉 **Your spec is complete!**\n\nReview the folder structure on the right — that's your app! You can click to expand sections and edit anything.\n\nWhen you're ready, export to dev tickets.`,
      });
    }
  };

  const handleSend = () => {
    handleSubmit(inputValue.trim());
  };

  const handleOptionClick = (option: string) => {
    handleSubmit(option);
  };

  const toggleSuggestion = (featureId: string) => {
    setSelectedFeatures(prev => {
      const next = new Set(prev);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  };

  const handleFinish = () => {
    router.push('/tickets');
  };

  // Render folder tree
  const renderFolderTree = () => {
    const tree = specTree;
    
    return (
      <div className={styles.folderTree}>
        {/* Root Project Folder */}
        <div className={styles.folderItem}>
          <div 
            className={`${styles.folderHeader} ${styles.root}`}
            onClick={() => toggleFolder('root')}
          >
            <span className={styles.folderIcon}>📁</span>
            <span className={styles.folderName}>
              {tree.projectName || 'Your Project'}
            </span>
            <span className={styles.expandIcon}>
              {expandedFolders.has('root') ? '▼' : '▶'}
            </span>
          </div>
          
          {expandedFolders.has('root') && (
            <div className={styles.folderChildren}>
              {/* Vision */}
              {tree.vision && (
                <div className={`${styles.fileItem} ${styles.vision}`}>
                  <span className={styles.fileIcon}>📄</span>
                  <span className={styles.fileName}>Vision</span>
                  <span className={styles.filePreview}>
                    {tree.vision.slice(0, 40)}...
                  </span>
                </div>
              )}

              {/* Roles */}
              {tree.roles.length > 0 && (
                <div className={styles.folderItem}>
                  <div 
                    className={styles.folderHeader}
                    onClick={() => toggleFolder('roles')}
                  >
                    <span className={styles.folderIcon}>📁</span>
                    <span className={styles.folderName}>User Roles</span>
                    <span className={styles.folderCount}>{tree.roles.length}</span>
                    <span className={styles.expandIcon}>
                      {expandedFolders.has('roles') ? '▼' : '▶'}
                    </span>
                  </div>
                  
                  {expandedFolders.has('roles') && (
                    <div className={styles.folderChildren}>
                      {tree.roles.map((role) => (
                        <div key={role.id} className={styles.folderItem}>
                          <div 
                            className={`${styles.folderHeader} ${role.structureConfirmed ? styles.confirmed : ''}`}
                            onClick={() => toggleFolder(role.id)}
                          >
                            <span className={styles.folderIcon}>{role.icon}</span>
                            <span className={styles.folderName}>{role.name}</span>
                            {role.features.length > 0 && (
                              <span className={styles.folderCount}>
                                {role.structureConfirmed && role.pages 
                                  ? `${role.pages.length} pages` 
                                  : `${role.features.length} features`}
                              </span>
                            )}
                            <span className={styles.expandIcon}>
                              {expandedFolders.has(role.id) ? '▼' : '▶'}
                            </span>
                          </div>
                          
                          {expandedFolders.has(role.id) && (
                            <div className={`${styles.folderChildren} ${isReorganizing ? styles.reorganizing : ''}`}>
                              {role.structureConfirmed && role.pages ? (
                                // Show pages with features nested
                                role.pages.map((page) => (
                                  <div key={page.id} className={styles.folderItem}>
                                    <div 
                                      className={styles.folderHeader}
                                      onClick={() => toggleFolder(page.id)}
                                    >
                                      <span className={styles.pageIcon}>{page.icon}</span>
                                      <span className={styles.pageName}>{page.name}</span>
                                      <span className={styles.folderCount}>{page.features.length}</span>
                                      <span className={styles.expandIcon}>
                                        {expandedFolders.has(page.id) ? '▼' : '▶'}
                                      </span>
                                    </div>
                                    
                                    {expandedFolders.has(page.id) && (
                                      <div className={styles.folderChildren}>
                                        {page.features.map((feat) => (
                                          <div key={feat.id} className={styles.featureItem}>
                                            <span className={styles.featureIcon}>⚡</span>
                                            <span className={styles.featureName}>{feat.name}</span>
                                          </div>
                                        ))}
                                        {page.features.length === 0 && (
                                          <div className={styles.emptyFeatures}>
                                            <span>Drop features here</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                // Show flat features list
                                role.features.map((feat) => (
                                  <div key={feat.id} className={`${styles.featureItem} ${feat.suggested ? styles.suggested : ''}`}>
                                    <span className={styles.featureIcon}>⚡</span>
                                    <span className={styles.featureName}>{feat.name}</span>
                                  </div>
                                ))
                              )}
                              {role.features.length === 0 && !role.structureConfirmed && (
                                <div className={styles.emptyFeatures}>
                                  <span>Waiting for features...</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Technical */}
              {(tree.technical.scale || tree.technical.auth) && (
                <div className={styles.folderItem}>
                  <div 
                    className={styles.folderHeader}
                    onClick={() => toggleFolder('technical')}
                  >
                    <span className={styles.folderIcon}>📁</span>
                    <span className={styles.folderName}>Technical</span>
                    <span className={styles.expandIcon}>
                      {expandedFolders.has('technical') ? '▼' : '▶'}
                    </span>
                  </div>
                  
                  {expandedFolders.has('technical') && (
                    <div className={styles.folderChildren}>
                      {tree.technical.scale && (
                        <div className={styles.fileItem}>
                          <span className={styles.fileIcon}>📄</span>
                          <span className={styles.fileName}>Scale</span>
                          <span className={styles.fileValue}>{tree.technical.scale}</span>
                        </div>
                      )}
                      {tree.technical.auth && (
                        <div className={styles.fileItem}>
                          <span className={styles.fileIcon}>🔐</span>
                          <span className={styles.fileName}>Auth</span>
                          <span className={styles.fileValue}>{tree.technical.auth}</span>
                        </div>
                      )}
                      {tree.technical.integrations && tree.technical.integrations.length > 0 && (
                        <div className={styles.fileItem}>
                          <span className={styles.fileIcon}>🔗</span>
                          <span className={styles.fileName}>Integrations</span>
                          <span className={styles.fileValue}>
                            {tree.technical.integrations.join(', ')}
                          </span>
                        </div>
                      )}
                      {tree.technical.timeline && (
                        <div className={styles.fileItem}>
                          <span className={styles.fileIcon}>📅</span>
                          <span className={styles.fileName}>Timeline</span>
                          <span className={styles.fileValue}>{tree.technical.timeline}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get stage progress
  const getProgress = () => {
    const stages = ['vision', 'roles', 'features', 'structure', 'technical', 'complete'];
    const currentIndex = stages.indexOf(stage);
    return Math.round(((currentIndex + 1) / stages.length) * 100);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/projects/new" className={styles.backBtn}>← Back</Link>
          <div className={styles.projectType}>
            <span className={styles.typeIcon}>🚀</span>
            <div>
              <div className={styles.typeLabel}>Building Spec</div>
              <div className={styles.typeName}>{specTree.projectName || 'New Project'}</div>
            </div>
          </div>
        </div>
        <div className={styles.headerCenter}>
          <div className={styles.stageIndicator}>
            <div className={styles.stages}>
              {['Vision', 'Roles', 'Features', 'Structure', 'Technical'].map((s, i) => {
                const stageMap = ['vision', 'roles', 'features', 'structure', 'technical'];
                const currentIdx = stageMap.indexOf(stage === 'suggest_features' ? 'features' : stage === 'complete' ? 'technical' : stage);
                const isComplete = i < currentIdx;
                const isCurrent = i === currentIdx;
                
                return (
                  <div 
                    key={s}
                    className={`${styles.stage} ${isComplete ? styles.complete : ''} ${isCurrent ? styles.current : ''}`}
                  >
                    <div className={styles.stageDot}>
                      {isComplete ? '✓' : i + 1}
                    </div>
                    <span className={styles.stageName}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <Avatar initials="RO" size="sm" />
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Left Panel - Conversation */}
        <div className={styles.conversationPanel}>
          <div className={styles.chatMessages} ref={messagesRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${styles[msg.sender]}`}>
                <div className={styles.messageHeader}>
                  <div className={`${styles.messageAvatar} ${styles[msg.sender]}`}>
                    {msg.sender === 'agent' ? '🤖' : 'RO'}
                  </div>
                  <span className={styles.messageSender}>
                    {msg.sender === 'agent' ? 'Spec Builder' : 'You'}
                  </span>
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageBubble}>
                    {msg.text.split('\n').map((line, j) => (
                      <span key={j}>
                        {line.split('**').map((part, k) => 
                          k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                        )}
                        {j < msg.text.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                    
                    {/* Options */}
                    {msg.options && (
                      <div className={styles.messageOptions}>
                        {msg.options.map((opt) => (
                          <button 
                            key={opt} 
                            className={styles.optionBtn} 
                            onClick={() => handleOptionClick(opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Feature Suggestions */}
                    {msg.suggestions && (
                      <div className={styles.suggestions}>
                        {msg.suggestions.map((feat) => (
                          <button
                            key={feat.id}
                            className={`${styles.suggestionItem} ${selectedFeatures.has(feat.id) ? styles.selected : ''}`}
                            onClick={() => toggleSuggestion(feat.id)}
                          >
                            <span className={styles.suggestionCheck}>
                              {selectedFeatures.has(feat.id) ? '✓' : '+'}
                            </span>
                            <div className={styles.suggestionContent}>
                              <span className={styles.suggestionName}>{feat.name}</span>
                              {feat.description && (
                                <span className={styles.suggestionDesc}>{feat.description}</span>
                              )}
                            </div>
                          </button>
                        ))}
                        <div className={styles.suggestionActions}>
                          <button 
                            className={styles.addSelectedBtn}
                            onClick={() => {
                              const selected = msg.suggestions!.filter(s => selectedFeatures.has(s.id));
                              setMessages(prev => [...prev, { 
                                sender: 'user', 
                                text: selected.length > 0 
                                  ? `Added: ${selected.map(s => s.name).join(', ')}`
                                  : "I'll skip these"
                              }]);
                              handleAddSuggestions(selected);
                            }}
                          >
                            {selectedFeatures.size > 0 
                              ? `Add ${selectedFeatures.size} selected →`
                              : 'Skip suggestions →'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Structure Proposal */}
                    {msg.structureProposal && (
                      <div className={styles.structureProposal}>
                        {msg.structureProposal.pages.map((page) => (
                          <div key={page.id} className={styles.proposedPage}>
                            <div className={styles.proposedPageHeader}>
                              <span>{page.icon}</span>
                              <span>{page.name}</span>
                            </div>
                            <div className={styles.proposedFeatures}>
                              {page.features.map((f) => (
                                <span key={f.id} className={styles.proposedFeature}>
                                  {f.name}
                                </span>
                              ))}
                              {page.features.length === 0 && (
                                <span className={styles.noFeatures}>No features yet</span>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className={styles.structureActions}>
                          <button 
                            className={styles.approveBtn}
                            onClick={() => handleSubmit('Looks good!')}
                          >
                            ✓ Looks good
                          </button>
                          <button 
                            className={styles.adjustBtn}
                            onClick={() => handleSubmit("I'd like to adjust")}
                          >
                            Adjust...
                          </button>
                        </div>
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
                placeholder={
                  stage === 'vision' ? "Describe your app..." :
                  stage === 'roles' ? "e.g., Admin, User, Manager" :
                  stage === 'features' ? "List features, separated by commas..." :
                  stage === 'technical' ? "Your answer..." :
                  "Type a message..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    handleSend(); 
                  } 
                }}
                rows={1}
                disabled={stage === 'complete'}
              />
              {stage === 'complete' ? (
                <button className={styles.finishBtn} onClick={handleFinish}>
                  Export Tickets →
                </button>
              ) : (
                <button className={styles.chatSend} onClick={handleSend}>→</button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Folder Tree */}
        <div className={styles.treePanel}>
          <div className={styles.treePanelHeader}>
            <h2 className={styles.treePanelTitle}>📁 Project Structure</h2>
            <div className={styles.treeActions}>
              {stage === 'complete' && (
                <button className={styles.exportBtn}>Export ▾</button>
              )}
            </div>
          </div>
          
          <div className={styles.treeContent}>
            {renderFolderTree()}
          </div>

          {/* Legend */}
          <div className={styles.treeLegend}>
            <div className={styles.legendItem}>
              <span className={styles.legendIcon}>📁</span>
              <span>Folder</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendIcon}>📱</span>
              <span>Page</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendIcon}>⚡</span>
              <span>Feature</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendIcon}>📄</span>
              <span>Info</span>
            </div>
          </div>
        </div>
      </div>
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
