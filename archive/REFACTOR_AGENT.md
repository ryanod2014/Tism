# Tism Refactor Agent

You are an expert React/Next.js developer tasked with refactoring HTML mockups into a modern, production-ready Next.js application. You must achieve **pixel-perfect visual parity** and **complete functional parity** with the original mockups.

---

## 🎯 Mission

Convert all HTML mockup files in this project into a modern Next.js 14+ application using TypeScript, following strict best practices for modularity, organization, and code quality.

---

## 📋 Process Overview

### Phase 1: Analysis
1. List all HTML mockup files in the project root
2. For each mockup, read and analyze:
   - HTML structure
   - CSS styles (especially CSS variables/design tokens)
   - JavaScript functionality
   - Interactive elements
3. Document shared patterns (colors, fonts, spacing, components)

### Phase 2: Project Setup
1. Initialize Next.js 14+ project with TypeScript in a new `app-next/` directory
2. Configure:
   - Path aliases (`@/*` → `./src/*`)
   - ESLint + Prettier
   - CSS Modules support (built-in)
3. Extract design tokens from mockups into `globals.css`

### Phase 3: Component Architecture
1. Identify all reusable UI elements across mockups
2. Create component hierarchy (see structure below)
3. Build from atomic → composite (buttons first, then cards, then sections)

### Phase 4: Page-by-Page Conversion
For EACH mockup file, execute this loop:

```
┌─────────────────────────────────────────────────────────┐
│                   CONVERSION LOOP                        │
├─────────────────────────────────────────────────────────┤
│  1. Read original HTML mockup                           │
│  2. Screenshot original mockup in browser               │
│  3. Build Next.js page + components                     │
│  4. Screenshot Next.js version in browser               │
│  5. Compare screenshots visually                        │
│  6. Identify differences:                               │
│     - Colors, spacing, sizing                           │
│     - Typography (font, weight, size, line-height)      │
│     - Borders, shadows, gradients                       │
│     - Layout alignment                                  │
│     - Hover states, animations                          │
│     - Responsive behavior                               │
│  7. Fix ALL differences                                 │
│  8. REPEAT from step 4 until PERFECT match              │
└─────────────────────────────────────────────────────────┘
```

### Phase 5: Functional Verification
1. Test all interactive elements
2. Verify navigation between pages
3. Test hover states, animations, transitions
4. Verify responsive behavior matches original

---

## 🗂️ Required Project Structure

```
app-next/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout (fonts, global styles)
│   │   ├── page.tsx              # Maps to index.html
│   │   ├── home/
│   │   │   └── page.tsx          # Maps to home.html
│   │   ├── projects/
│   │   │   ├── page.tsx          # Projects list
│   │   │   └── new/
│   │   │       └── page.tsx      # Maps to new-project.html
│   │   ├── app/
│   │   │   └── page.tsx          # Maps to app.html
│   │   ├── chat/
│   │   │   └── page.tsx          # Maps to chat.html
│   │   ├── tickets/
│   │   │   └── page.tsx          # Maps to tickets.html
│   │   └── globals.css           # Design tokens + global styles
│   │
│   ├── components/
│   │   ├── ui/                   # Atomic/generic components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   ├── Avatar/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Dropdown/
│   │   │   └── index.ts          # Barrel export
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── Sidebar/
│   │   │   ├── Header/
│   │   │   ├── PageContainer/
│   │   │   └── index.ts
│   │   │
│   │   └── features/             # Feature-specific components
│   │       ├── projects/
│   │       │   ├── ProjectCard/
│   │       │   ├── ProjectGrid/
│   │       │   └── index.ts
│   │       ├── tickets/
│   │       │   ├── TicketBoard/
│   │       │   ├── TicketCard/
│   │       │   ├── TicketColumn/
│   │       │   └── index.ts
│   │       ├── inbox/
│   │       │   ├── InboxPanel/
│   │       │   ├── InboxMessage/
│   │       │   └── index.ts
│   │       └── chat/
│   │           ├── ChatWindow/
│   │           ├── MessageBubble/
│   │           ├── ChatInput/
│   │           └── index.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── index.ts
│   │
│   ├── lib/                      # Utilities
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   └── types/                    # TypeScript types
│       ├── index.ts
│       └── common.ts
│
├── public/                       # Static assets
│   └── fonts/
│
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 🎨 Styling Rules

### Global Styles (`globals.css`)
Extract and use these from the mockups:

```css
:root {
  /* Colors - extract from mockups */
  --bg-deep: #0a0a0f;
  --bg-surface: #12121a;
  --bg-elevated: #1a1a26;
  --border: #2a2a3e;
  --text-primary: #f0f0f5;
  --text-secondary: #8888a0;
  --accent-cyan: #00d4ff;
  --accent-purple: #a855f7;
  --gradient-primary: linear-gradient(135deg, #00d4ff 0%, #a855f7 100%);
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  /* Typography */
  --font-family: 'Outfit', sans-serif;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.4);
}

/* Reset */
* { margin: 0; padding: 0; box-sizing: border-box; }

/* Base */
body {
  font-family: var(--font-family);
  background: var(--bg-deep);
  color: var(--text-primary);
}
```

### Component Styles (CSS Modules)
- Each component has its own `.module.css` file
- Use CSS variables from globals
- NO hardcoded colors/spacing - always use variables
- Keep specificity low

```css
/* Button.module.css */
.button {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  color: var(--text-primary);
  font-family: var(--font-family);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

---

## 📦 Component Rules

### Size Limits
- **Maximum 80 lines** per component file
- If larger, split into sub-components

### Single Responsibility
- Each component does ONE thing
- If it does multiple things, split it

### Props Interface
```tsx
// Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Barrel Exports
Every component folder needs an `index.ts`:
```ts
// Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

Folder-level barrel:
```ts
// components/ui/index.ts
export * from './Button';
export * from './Card';
export * from './Badge';
// etc.
```

---

## 🔍 Visual Verification Process

### Screenshot Comparison Steps

1. **Open original mockup in browser**
   ```
   Use browser_navigate to file:///path/to/mockup.html
   ```

2. **Take screenshot of original**
   ```
   Use browser_take_screenshot with descriptive filename
   Example: original-home-page.png
   ```

3. **Open Next.js version in browser**
   ```
   Navigate to http://localhost:3000/home
   ```

4. **Take screenshot of Next.js version**
   ```
   Example: nextjs-home-page.png
   ```

5. **Compare visually using browser_snapshot**
   - Check every element systematically
   - Document ALL differences

6. **Fix differences one by one**
   - Colors: Check hex values match exactly
   - Spacing: Check padding/margin values
   - Typography: font-size, font-weight, line-height, letter-spacing
   - Borders: width, color, radius
   - Shadows: offset, blur, spread, color
   - Gradients: direction, color stops
   - Animations: duration, easing, properties

7. **Repeat until pixel-perfect**

### Checklist for Each Page

- [ ] Background color/gradient matches
- [ ] All text colors match
- [ ] Font sizes match exactly
- [ ] Font weights match
- [ ] Line heights match
- [ ] Letter spacing matches
- [ ] All spacing (padding/margin) matches
- [ ] Border colors match
- [ ] Border radii match
- [ ] Box shadows match
- [ ] Hover states work identically
- [ ] Transitions/animations match
- [ ] Layout alignment is identical
- [ ] Responsive breakpoints behave the same

---

## 🔄 Iteration Protocol

```
WHILE (differences exist) {
  1. Identify the MOST obvious difference
  2. Locate the responsible component/style
  3. Fix the specific CSS property
  4. Save and hot-reload
  5. Re-screenshot
  6. Verify fix didn't break anything else
  7. Move to next difference
}
```

### Common Issues to Watch For

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| Colors slightly off | Hardcoded instead of variable | Use CSS variable |
| Spacing inconsistent | Wrong spacing variable | Check original px value |
| Font looks different | Missing font import | Check Google Fonts link |
| Shadows missing | Forgot to add | Copy exact shadow values |
| Hover not working | Wrong pseudo-selector | Check :hover styles |
| Gradient wrong | Different direction/colors | Match gradient exactly |
| Border radius off | Wrong radius variable | Check original px value |

---

## ✅ Definition of Done

A page is COMPLETE when:

1. **Visual Parity**: Screenshot comparison shows NO visible differences
2. **Functional Parity**: All interactions work identically
3. **Code Quality**:
   - All components under 80 lines
   - No hardcoded values (uses CSS variables)
   - TypeScript types for all props
   - Proper file structure followed
4. **No Console Errors**: Browser console is clean
5. **Responsive**: Behaves same as original at all sizes

---

## 🚀 Execution Order

1. `index.html` → Root page (navigation hub)
2. `home.html` → Home/Dashboard page
3. `new-project.html` → New project form
4. `app.html` → Main app view (most complex)
5. `chat.html` → Chat interface
6. `tickets.html` → Tickets view
7. `live.html` → Live view
8. Any remaining mockups

For each, complete the FULL conversion loop before moving to next.

---

## 💡 Pro Tips

1. **Start with globals** - Get design tokens right first
2. **Build shared components first** - Button, Card, etc. before pages
3. **Use browser dev tools** - Compare computed styles directly
4. **Check hover states** - Often forgotten
5. **Verify at multiple viewport sizes** - Not just desktop
6. **Copy exact values** - Don't approximate, measure precisely
7. **Check letter-spacing** - Often missed, very noticeable
8. **Verify backgrounds** - Gradients and overlays must match exactly

---

## 🛑 Do NOT

- Skip the screenshot verification loop
- Approximate colors or spacing
- Use inline styles
- Create components over 80 lines
- Hardcode values that should be variables
- Ignore TypeScript errors
- Move to next page before current is perfect
- Forget hover/focus states
- Ignore responsive behavior

---

## 📝 Progress Tracking

Update this section as you work:

### Mockup Status

| File | Status | Notes |
|------|--------|-------|
| index.html | 🟢 Complete (Verified) | Navigation hub at `/` |
| home.html | 🟢 Complete (Verified) | Dashboard at `/home` |
| new-project.html | 🟢 Complete (Verified) | Project creation at `/projects/new` |
| app.html | 🟢 Complete (Verified) | Project preview at `/project` |
| chat.html | 🟢 Complete (Verified) | Spec builder at `/chat` |
| tickets.html | 🟢 Complete (Verified) | Pipeline at `/tickets` |
| live.html | 🟢 Complete (Verified) | Live agent view at `/live` |
| style.html | ⬜ Not Started | Style selection page |
| combined-prototype.html | ⬜ Not Started | |
| slack-style-prototype.html | ⬜ Not Started | |
| slack-style-v2.html | ⬜ Not Started | |
| ux-mockups.html | ⬜ Not Started | |
| ux-mockups-v2.html | ⬜ Not Started | |
| ux-mockups-reddit.html | ⬜ Not Started | |

### Status Key
- ⬜ Not Started
- 🟡 In Progress
- 🟢 Complete (Verified)
- 🔴 Blocked

---

**Remember: The goal is PIXEL-PERFECT parity. Do not move on until each page is indistinguishable from the original mockup.**
