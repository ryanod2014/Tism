'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, Button } from '@/components/ui';
import styles from './page.module.css';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar?: string;
  status: 'active' | 'pending';
  joinedAt?: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  sentAt: string;
}

const initialMembers: TeamMember[] = [
  { id: '1', name: 'Ryan O\'Donnell', email: 'ryan@example.com', role: 'owner', status: 'active', joinedAt: 'Oct 2024' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', role: 'admin', avatar: 'https://i.pravatar.cc/80?img=5', status: 'active', joinedAt: 'Nov 2024' },
  { id: '3', name: 'Marcus Johnson', email: 'marcus@example.com', role: 'member', avatar: 'https://i.pravatar.cc/80?img=12', status: 'active', joinedAt: 'Dec 2024' },
];

const initialInvites: PendingInvite[] = [
  { id: 'inv1', email: 'alex@example.com', role: 'member', sentAt: '2 days ago' },
];

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For hobbyists and side projects',
    features: ['3 projects', '1 team member', '$20 in credits included', 'Community support'],
    cta: 'Downgrade',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For professionals and indie devs',
    features: ['Unlimited projects', '3 team members', '$50 in credits included', 'Priority support', 'Custom domains', 'Version history'],
    cta: 'Current Plan',
    popular: true,
    disabled: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$149',
    period: '/month',
    description: 'For growing teams',
    features: ['Unlimited projects', '20 team members', '$150 in credits included', 'Dedicated support', 'SSO & SAML', 'Advanced analytics', 'API access'],
    cta: 'Upgrade to Team',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: ['Unlimited everything', 'Unlimited team members', 'Volume discounts on tokens', 'Dedicated success manager', 'SLA guarantee', 'On-premise option'],
    cta: 'Contact Sales',
  },
];

const tokenPricing = {
  input: 0.05,    // $0.05 per 1K input tokens (10x markup on $5/1M)
  output: 0.25,   // $0.25 per 1K output tokens (10x markup on $25/1M)
};

const usageHistory = [
  { date: 'Dec 11', inputTokens: 245000, outputTokens: 89000, cost: 34.50 },
  { date: 'Dec 10', inputTokens: 312000, outputTokens: 124000, cost: 46.60 },
  { date: 'Dec 9', inputTokens: 189000, outputTokens: 67000, cost: 26.20 },
  { date: 'Dec 8', inputTokens: 423000, outputTokens: 156000, cost: 60.15 },
  { date: 'Dec 7', inputTokens: 156000, outputTokens: 52000, cost: 20.80 },
  { date: 'Dec 6', inputTokens: 287000, outputTokens: 98000, cost: 38.85 },
  { date: 'Dec 5', inputTokens: 198000, outputTokens: 71000, cost: 27.65 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'billing'>('team');
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(initialInvites);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [currentPlan] = useState('pro');
  
  // Token usage stats
  const currentPeriodUsage = {
    inputTokens: 1810000,
    outputTokens: 657000,
    totalCost: 254.75,
    creditsIncluded: 50,
    creditsUsed: 50,
    overage: 204.75,
    periodStart: 'Dec 1, 2024',
    periodEnd: 'Dec 31, 2024',
  };
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleInvite = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }

    // Check if already invited or member
    if (members.some(m => m.email === inviteEmail) || pendingInvites.some(i => i.email === inviteEmail)) {
      showToast('This person has already been invited');
      return;
    }

    const newInvite: PendingInvite = {
      id: `inv-${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      sentAt: 'Just now',
    };

    setPendingInvites([newInvite, ...pendingInvites]);
    setInviteEmail('');
    showToast(`Invitation sent to ${inviteEmail}`);
  };

  const cancelInvite = (id: string) => {
    setPendingInvites(pendingInvites.filter(i => i.id !== id));
    showToast('Invitation cancelled');
  };

  const resendInvite = (email: string) => {
    showToast(`Invitation resent to ${email}`);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    setShowMemberMenu(null);
    showToast('Team member removed');
  };

  const changeMemberRole = (id: string, newRole: TeamMember['role']) => {
    setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m));
    setShowMemberMenu(null);
    showToast('Role updated');
  };

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return styles.roleOwner;
      case 'admin': return styles.roleAdmin;
      case 'member': return styles.roleMember;
      case 'viewer': return styles.roleViewer;
      default: return '';
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backBtn}>← Back</Link>
          <div className={styles.headerDivider} />
          <span className={styles.headerTitle}>Settings</span>
        </div>
        <div className={styles.headerRight}>
          <Avatar initials="RO" size="sm" />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'team' ? styles.active : ''}`}
              onClick={() => setActiveTab('team')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Team
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'billing' ? styles.active : ''}`}
              onClick={() => setActiveTab('billing')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Billing
            </button>
          </div>

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className={styles.tabContent}>
              {/* Invite Section */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Invite Team Members</h2>
                  <p className={styles.sectionDesc}>Add people to collaborate on your projects</p>
                </div>

                <div className={styles.inviteForm}>
                  <div className={styles.inviteInputGroup}>
                    <input
                      type="email"
                      className={styles.inviteInput}
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                    />
                    <div className={styles.roleSelector}>
                      <button
                        className={styles.roleTrigger}
                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                      >
                        <span className={styles.roleLabel}>{inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1)}</span>
                        <span className={styles.roleChevron}>▼</span>
                      </button>
                      {showRoleDropdown && (
                        <div className={styles.roleDropdown}>
                          {(['admin', 'member', 'viewer'] as const).map((role) => (
                            <div
                              key={role}
                              className={`${styles.roleOption} ${inviteRole === role ? styles.active : ''}`}
                              onClick={() => { setInviteRole(role); setShowRoleDropdown(false); }}
                            >
                              <div className={styles.roleOptionInfo}>
                                <span className={styles.roleOptionName}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                                <span className={styles.roleOptionDesc}>
                                  {role === 'admin' && 'Can manage team and billing'}
                                  {role === 'member' && 'Can create and edit projects'}
                                  {role === 'viewer' && 'Can view projects only'}
                                </span>
                              </div>
                              {inviteRole === role && <span className={styles.roleCheck}>✓</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="primary" size="md" onClick={handleInvite}>
                    Send Invite
                  </Button>
                </div>
              </section>

              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Pending Invites</h2>
                    <span className={styles.badge}>{pendingInvites.length}</span>
                  </div>

                  <div className={styles.membersList}>
                    {pendingInvites.map((invite) => (
                      <div key={invite.id} className={`${styles.memberRow} ${styles.pending}`}>
                        <div className={styles.memberInfo}>
                          <div className={styles.memberAvatar}>
                            <span className={styles.avatarPlaceholder}>📧</span>
                          </div>
                          <div className={styles.memberDetails}>
                            <span className={styles.memberEmail}>{invite.email}</span>
                            <span className={styles.memberMeta}>Invited {invite.sentAt}</span>
                          </div>
                        </div>
                        <div className={styles.memberActions}>
                          <span className={`${styles.roleBadge} ${getRoleColor(invite.role)}`}>
                            {invite.role}
                          </span>
                          <button className={styles.actionBtn} onClick={() => resendInvite(invite.email)}>
                            Resend
                          </button>
                          <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => cancelInvite(invite.id)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Team Members */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Team Members</h2>
                  <span className={styles.badge}>{members.length}</span>
                </div>

                <div className={styles.membersList}>
                  {members.map((member) => (
                    <div key={member.id} className={styles.memberRow}>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberAvatar}>
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} />
                          ) : (
                            <span className={styles.avatarInitials}>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        <div className={styles.memberDetails}>
                          <span className={styles.memberName}>{member.name}</span>
                          <span className={styles.memberMeta}>{member.email} • Joined {member.joinedAt}</span>
                        </div>
                      </div>
                      <div className={styles.memberActions}>
                        <span className={`${styles.roleBadge} ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                        {member.role !== 'owner' && (
                          <div className={styles.memberMenuWrapper}>
                            <button
                              className={styles.menuTrigger}
                              onClick={() => setShowMemberMenu(showMemberMenu === member.id ? null : member.id)}
                            >
                              ⋮
                            </button>
                            {showMemberMenu === member.id && (
                              <div className={styles.memberMenu}>
                                <div className={styles.menuSection}>
                                  <div className={styles.menuLabel}>Change Role</div>
                                  {(['admin', 'member', 'viewer'] as const).map((role) => (
                                    <button
                                      key={role}
                                      className={`${styles.menuItem} ${member.role === role ? styles.active : ''}`}
                                      onClick={() => changeMemberRole(member.id, role)}
                                    >
                                      {role.charAt(0).toUpperCase() + role.slice(1)}
                                      {member.role === role && <span>✓</span>}
                                    </button>
                                  ))}
                                </div>
                                <div className={styles.menuDivider} />
                                <button
                                  className={`${styles.menuItem} ${styles.danger}`}
                                  onClick={() => removeMember(member.id)}
                                >
                                  Remove from team
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className={styles.tabContent}>
              {/* Current Usage */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Current Usage</h2>
                  <span className={styles.periodLabel}>{currentPeriodUsage.periodStart} - {currentPeriodUsage.periodEnd}</span>
                </div>

                <div className={styles.usageGrid}>
                  {/* Token Breakdown Card */}
                  <div className={styles.usageCard}>
                    <div className={styles.usageCardHeader}>
                      <span className={styles.usageCardIcon}>🔤</span>
                      <span className={styles.usageCardTitle}>Token Usage</span>
                    </div>
                    <div className={styles.tokenBreakdown}>
                      <div className={styles.tokenRow}>
                        <div className={styles.tokenLabel}>
                          <span className={styles.tokenDot} style={{ background: 'var(--accent-cyan)' }} />
                          Input Tokens
                        </div>
                        <div className={styles.tokenValue}>
                          <span className={styles.tokenCount}>{(currentPeriodUsage.inputTokens / 1000).toFixed(0)}K</span>
                          <span className={styles.tokenCost}>${(currentPeriodUsage.inputTokens / 1000 * tokenPricing.input).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className={styles.tokenRow}>
                        <div className={styles.tokenLabel}>
                          <span className={styles.tokenDot} style={{ background: 'var(--accent-purple)' }} />
                          Output Tokens
                        </div>
                        <div className={styles.tokenValue}>
                          <span className={styles.tokenCount}>{(currentPeriodUsage.outputTokens / 1000).toFixed(0)}K</span>
                          <span className={styles.tokenCost}>${(currentPeriodUsage.outputTokens / 1000 * tokenPricing.output).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.tokenTotal}>
                      <span>Total</span>
                      <span className={styles.tokenTotalValue}>${currentPeriodUsage.totalCost.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Credits Card */}
                  <div className={styles.usageCard}>
                    <div className={styles.usageCardHeader}>
                      <span className={styles.usageCardIcon}>💳</span>
                      <span className={styles.usageCardTitle}>Credits & Billing</span>
                    </div>
                    <div className={styles.creditsBreakdown}>
                      <div className={styles.creditRow}>
                        <span>Plan Credits (Pro)</span>
                        <span className={styles.creditValue}>${currentPeriodUsage.creditsIncluded.toFixed(2)}</span>
                      </div>
                      <div className={styles.creditRow}>
                        <span>Credits Used</span>
                        <span className={styles.creditValue}>-${currentPeriodUsage.creditsUsed.toFixed(2)}</span>
                      </div>
                      <div className={styles.creditDivider} />
                      <div className={`${styles.creditRow} ${styles.overage}`}>
                        <span>Overage This Period</span>
                        <span className={styles.overageValue}>${currentPeriodUsage.overage.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className={styles.estimatedBill}>
                      <div className={styles.estimatedLabel}>Estimated Bill</div>
                      <div className={styles.estimatedValue}>
                        <span className={styles.basePlan}>$49.00</span>
                        <span className={styles.plus}>+</span>
                        <span className={styles.overageAmount}>${currentPeriodUsage.overage.toFixed(2)}</span>
                        <span className={styles.equals}>=</span>
                        <span className={styles.totalBill}>${(49 + currentPeriodUsage.overage).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Reference Card */}
                  <div className={styles.usageCard}>
                    <div className={styles.usageCardHeader}>
                      <span className={styles.usageCardIcon}>📊</span>
                      <span className={styles.usageCardTitle}>Token Pricing</span>
                    </div>
                    <div className={styles.pricingTable}>
                      <div className={styles.pricingRow}>
                        <div className={styles.pricingLabel}>
                          <span className={styles.tokenDot} style={{ background: 'var(--accent-cyan)' }} />
                          Input Tokens
                        </div>
                        <div className={styles.pricingValue}>${tokenPricing.input.toFixed(2)} <span>/ 1K tokens</span></div>
                      </div>
                      <div className={styles.pricingRow}>
                        <div className={styles.pricingLabel}>
                          <span className={styles.tokenDot} style={{ background: 'var(--accent-purple)' }} />
                          Output Tokens
                        </div>
                        <div className={styles.pricingValue}>${tokenPricing.output.toFixed(2)} <span>/ 1K tokens</span></div>
                      </div>
                    </div>
                    <div className={styles.pricingNote}>
                      <span>💡</span>
                      Powered by Claude Opus 4.5 — the most capable AI model
                    </div>
                  </div>
                </div>
              </section>

              {/* Usage History */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Daily Usage (Last 7 Days)</h2>
                </div>

                <div className={styles.usageHistoryCard}>
                  <div className={styles.usageChart}>
                    {usageHistory.map((day, i) => {
                      const maxCost = Math.max(...usageHistory.map(d => d.cost));
                      const height = (day.cost / maxCost) * 100;
                      return (
                        <div key={i} className={styles.chartBar}>
                          <div className={styles.chartBarInner} style={{ height: `${height}%` }}>
                            <div className={styles.chartTooltip}>
                              <div className={styles.tooltipDate}>{day.date}</div>
                              <div className={styles.tooltipRow}>Input: {(day.inputTokens / 1000).toFixed(0)}K</div>
                              <div className={styles.tooltipRow}>Output: {(day.outputTokens / 1000).toFixed(0)}K</div>
                              <div className={styles.tooltipTotal}>${day.cost.toFixed(2)}</div>
                            </div>
                          </div>
                          <span className={styles.chartLabel}>{day.date.split(' ')[1]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.usageHistoryTable}>
                    <div className={styles.historyHeader}>
                      <span>Date</span>
                      <span>Input</span>
                      <span>Output</span>
                      <span>Cost</span>
                    </div>
                    {usageHistory.map((day, i) => (
                      <div key={i} className={styles.historyRow}>
                        <span>{day.date}</span>
                        <span>{(day.inputTokens / 1000).toFixed(0)}K tokens</span>
                        <span>{(day.outputTokens / 1000).toFixed(0)}K tokens</span>
                        <span className={styles.historyCost}>${day.cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Current Plan */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Current Plan</h2>
                </div>

                <div className={styles.currentPlanCard}>
                  <div className={styles.currentPlanInfo}>
                    <div className={styles.currentPlanBadge}>Pro</div>
                    <div className={styles.currentPlanDetails}>
                      <p>You are currently on the <strong>Pro</strong> plan.</p>
                      <p className={styles.usageText}>$49/month base + $50 in credits included</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Plans */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Available Plans</h2>
                </div>

                <div className={styles.plansGrid}>
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`${styles.planCard} ${plan.popular ? styles.popular : ''} ${currentPlan === plan.id ? styles.current : ''}`}
                    >
                      {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}
                      <div className={styles.planHeader}>
                        <h3 className={styles.planName}>{plan.name}</h3>
                        <div className={styles.planPrice}>
                          <span className={styles.priceValue}>{plan.price}</span>
                          <span className={styles.pricePeriod}>{plan.period}</span>
                        </div>
                        <p className={styles.planDesc}>{plan.description}</p>
                      </div>
                      <ul className={styles.planFeatures}>
                        {plan.features.map((feature, i) => (
                          <li key={i}>
                            <span className={styles.featureCheck}>✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button
                        className={`${styles.planCta} ${currentPlan === plan.id ? styles.disabled : ''}`}
                        onClick={() => !plan.disabled && handleUpgrade(plan.id)}
                        disabled={plan.disabled}
                      >
                        {currentPlan === plan.id ? 'Current Plan' : plan.cta}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Payment Method */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Payment Method</h2>
                </div>

                <div className={styles.paymentCard}>
                  <div className={styles.noPayment}>
                    <div className={styles.noPaymentIcon}>💳</div>
                    <p>No payment method on file</p>
                    <p className={styles.noPaymentHint}>Add a payment method to upgrade your plan</p>
                    <Button variant="secondary" size="sm" onClick={() => setShowPaymentModal(true)}>
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              </section>

              {/* Billing History */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Billing History</h2>
                </div>

                <div className={styles.billingHistory}>
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📄</span>
                    <p>No invoices yet</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      <div className={`${styles.toast} ${toast ? styles.active : ''}`}>
        <span>✅</span>
        <span>{toast}</span>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {selectedPlan ? `Upgrade to ${plans.find(p => p.id === selectedPlan)?.name}` : 'Add Payment Method'}
              </h2>
              <button className={styles.modalClose} onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.paymentForm}>
                <div className={styles.formGroup}>
                  <label>Card Number</label>
                  <input type="text" placeholder="4242 4242 4242 4242" />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>CVC</label>
                    <input type="text" placeholder="123" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Name on Card</label>
                  <input type="text" placeholder="John Doe" />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="secondary" size="md" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={() => { setShowPaymentModal(false); showToast('Payment method added'); }}>
                {selectedPlan ? 'Subscribe' : 'Save Card'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
