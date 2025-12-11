# Tism Refactor Handoff Instructions

## Overview
This document provides instructions for continuing the refactor of the Tism HTML mockups into a production-ready Next.js 14+ application. The goal is **pixel-perfect visual parity** and **complete functional parity** with the original HTML mockups.

---

## Project Structure

```
app-next/
├── src/
│   ├── app/
│   │   ├── project/page.tsx     # Main project view (Preview/Pipeline/Live)
│   │   ├── projects/new/        # New project flow (INCOMPLETE)
│   │   ├── chat/                # Chat/spec builder
│   │   ├── home/                # Home/dashboard
│   │   └── ...
│   └── components/
│       ├── features/
│       │   └── DiagramEditor/   # Reusable LucidChart-style component
│       └── ui/                  # Shared UI components
├── public/
└── package.json
```

---

## Priority 1: Fix Missing Style Selection Page

### Problem
The new project flow (`/projects/new`) is missing the **"Choose Style Inspiration"** step completely. This is Step 3 of 3 in the original flow.

### Original Mockup
- **File**: `/style.html`
- **Flow**: `new-project.html` → `chat.html` → **`style.html`** → `app.html`

### What to Implement

1. **Create `/app/projects/style/page.tsx`** (or integrate into existing flow)

2. **Key Features from `style.html`**:
   - Header with "Step 3 of 3" label
   - Title: "What style inspires you?"
   - Filter tabs: All, Minimal, Bold, Corporate, Playful, Dark Mode, Gradients
   - Grid of inspiration cards (Linear, Stripe, Vercel, Notion, Figma, etc.)
   - Each card shows:
     - Mock preview with browser chrome
     - Color scheme visualization
     - Name and style tags
     - Hover state with "👁 Preview" button
     - Selection checkmark when selected
   - "Add Your Own" upload card for custom references
   - Upload modal with URL paste OR image upload options
   - Preview modal to view design in larger format
   - Selected count in header
   - "Skip for now" and "Continue →" buttons
   - Loading overlay when continuing

3. **Data Structure for Inspirations**:
```typescript
interface Inspiration {
  id: number;
  name: string;           // "Linear", "Stripe", etc.
  style: string;          // "Minimal • Dark"
  tags: string[];         // ['minimal', 'dark', 'saas']
  colors: {
    bg: string;
    accent: string;
    text: string;
  };
  url: string;
  mockHero: string;       // Gradient for hero section
  mockSidebar: string;    // Color for sidebar
  mockMain: string;       // Color for main area
}
```

4. **Reference the original `/style.html` lines 1202-1720 for JavaScript logic**

---

## Priority 2: Fix Launch Modal

### Problem
The 🚀 Launch button in the header doesn't open the deploy modal like the original.

### Original Mockup
- **File**: `/app.html` lines 4256-4396 (HTML), lines 2955-3100+ (CSS), lines 6184-6192 (JS)

### What to Implement

1. **Add state to `/app/project/page.tsx`**:
```typescript
const [showLaunchModal, setShowLaunchModal] = useState(false);
```

2. **Update Launch button**:
```tsx
<Button 
  variant="primary" 
  size="sm" 
  onClick={() => setShowLaunchModal(true)}
>
  🚀 Launch
</Button>
```

3. **Create LaunchModal component** with these features:

   **Staging Section**:
   - 🟡 Staging badge
   - Description: "Your changes deploy here first for testing"
   - URL box with copy and open buttons
   - Commit message and time ("Added dark mode toggle" • 2 mins ago)
   - Deploy status indicator (Deployed)

   **Promote Section**:
   - Arrow indicator (↓)
   - "⬆️ Promote to Production" button
   - Opens confirmation dialog

   **Production Section**:
   - 🟢 Production badge
   - URL box with copy and open buttons
   - Custom domain row with "Configure" button
   - Commit message and time
   - Live status indicator
   - Collapsible Version History:
     - v12 (Current) - "Fixed checkout bug"
     - v11 - "Added dark mode" [Rollback]
     - v10 - "Updated pricing page" [Rollback]
     - v9 - "New onboarding flow" [Rollback]

   **Footer**:
   - "Done" button

4. **Additional Dialogs**:
   - Promote confirmation dialog
   - Rollback confirmation dialog
   - Domain configuration modal

5. **Consider making this a reusable component** at:
   ```
   /components/features/LaunchModal/
   ```

---

## Components Already Completed

### ✅ DiagramEditor (Reusable)
- Location: `/components/features/DiagramEditor/`
- Usage: `import { DiagramEditor } from '@/components/features/DiagramEditor'`
- Features: Canvas drawing, shapes, connections, Mermaid export

### ✅ Project Page Features
- Preview/Pipeline/Live view switching (state-based, persistent sidebar)
- Thread overlay with replies
- Message feed with actions (Discuss, Accept, Remind, Delete)
- User Role dropdown with icons, descriptions, Test Data section
- Page dropdown with folder structure
- Chat input with attachment and diagram buttons
- Toast notifications

---

## CSS Guidelines

1. **Use CSS Modules**: Each component should have its own `.module.css`
2. **Reference CSS Variables** from the original mockups:
   ```css
   --bg-deep: #0a0a0f;
   --bg-surface: #12121a;
   --bg-elevated: #1a1a26;
   --bg-hover: #222233;
   --border: #2a2a3e;
   --border-bright: #3d3d5c;
   --text-primary: #f0f0f5;
   --text-secondary: #8888a0;
   --text-muted: #555566;
   --accent-cyan: #00d4ff;
   --accent-purple: #a855f7;
   --accent-green: #22c55e;
   --accent-amber: #f59e0b;
   --accent-red: #ef4444;
   --accent-pink: #ec4899;
   --gradient-primary: linear-gradient(135deg, #00d4ff 0%, #a855f7 100%);
   ```

3. **Match exact spacing, borders, and transitions** from original HTML

---

## Key Files to Reference

| Feature | Original Mockup | Next.js Location |
|---------|-----------------|------------------|
| Project view | `app.html` | `app/project/page.tsx` |
| New project | `new-project.html` | `app/projects/new/page.tsx` |
| Style selection | `style.html` | **TO CREATE** |
| Chat/spec | `chat.html` | `app/chat/page.tsx` |
| Home | `home.html` | `app/home/page.tsx` |
| Pipeline | `tickets.html` | Integrated in project page |
| Live view | `live.html` | Integrated in project page |

---

## Testing Checklist

Before marking complete, verify:

- [ ] Style selection page matches `style.html` visually
- [ ] All 12 inspiration cards render with correct colors
- [ ] Filter tabs work correctly
- [ ] Card selection/deselection works
- [ ] "Add Your Own" upload modal works (URL + image upload)
- [ ] Preview modal shows design correctly
- [ ] Continue flow works end-to-end
- [ ] Launch button opens deploy modal
- [ ] Staging/Production sections display correctly
- [ ] Copy URL buttons work
- [ ] Promote to Production shows confirmation
- [ ] Version history expands/collapses
- [ ] Rollback buttons show confirmation
- [ ] All modals close on Escape and backdrop click

---

## Running the App

```bash
cd app-next
npm run dev
```

- Next.js app: http://localhost:3000
- Original mockups: http://localhost:8080 (if serving static files)

---

## Notes

- Always read the original HTML/CSS/JS before implementing
- Prefer extracting reusable components to `/components/features/`
- Maintain functional parity - if it worked in the mockup, it should work in Next.js
- Test on both desktop and mobile viewports
