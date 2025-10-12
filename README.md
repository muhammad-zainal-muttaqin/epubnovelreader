# EPUB Novel Reader

A modern, privacy-first web application for reading EPUB novels with a clean interface and comprehensive customization features.

## ✨ Features

### 📚 Core Reading
- **EPUB Support**: Upload and read EPUB files with full chapter navigation
- **Smart TOC**: Table of Contents-based chapter grouping and navigation
- **Internal Links**: Working links within chapters (e.g., from Contents page)
- **Reading Progress**: Automatic progress tracking with visual indicators
- **Resume Reading**: Continue exactly where you left off

### 🎨 Customization
- **8 Font Options**: Serif, Sans, Mono, Merriweather, Open Sans, Literata, Garamond, OpenDyslexic
- **Dyslexia-Friendly**: OpenDyslexic font for better readability
- **Typography Control**: Font size (14-24px), line height (1.4-2.0), text alignment (left, center, right, justify)
- **Theme Support**: Dark mode (default) and light mode
- **Content Width**: Adjustable max-width (600-900px)
- **Breathing Space**: Novel-like paragraph spacing for comfortable reading

### 🔒 Privacy & Security
- **100% Local**: All data stored in browser IndexedDB
- **Zero Tracking**: No analytics, cookies, or external servers
- **No Upload**: Files never leave your device
- **Open Source**: Fully transparent and verifiable code

### 📱 User Experience
- **Mobile-Optimized**: Touch-friendly with proper safe areas
- **Clean UI**: Hidden scrollbars and minimal distractions
- **Responsive Design**: Consistent experience across all devices
- **Floating Actions**: Easy access to upload without clutter

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Modern web browser with IndexedDB support

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd epubnovelreader
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   bun install
   # or
   npm install
   \`\`\`

3. **Start development server**
   \`\`\`bash
   bun dev
   # or
   npm run dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Getting Started
1. **Upload Books**: Click the upload button to add EPUB files to your library
2. **Browse Library**: View all your uploaded books with progress indicators
3. **Start Reading**: Click "Read" or "Continue" to open a book
4. **Customize Settings**: Adjust fonts, themes, and layout preferences

### Reading Controls
- **Navigation**: Use Previous/Next buttons or chapter list
- **Settings**: Access font size, theme, and alignment options
- **Progress**: Track reading progress with visual indicators
- **Bookmarks**: Automatic progress saving for seamless continuation

### Mobile Experience
- **Touch Navigation**: Swipe-friendly controls and gestures
- **Responsive Layout**: Optimized for all screen sizes
- **Floating Action Button**: Easy access to upload functionality
- **Safe Areas**: Proper spacing on devices with notches/home indicators

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Package Manager**: Bun (recommended) or npm
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React icon library
- **Storage**: IndexedDB for local data persistence
- **Theme**: next-themes for dark/light mode support

## 🎯 Recent Updates

- **Smart TOC Navigation**: Chapters grouped by Table of Contents structure, not just file order
- **Internal Link Support**: Working navigation from TOC pages to specific chapters
- **OpenDyslexic Font**: Added dyslexia-friendly font option
- **Breathing Space**: Novel-like paragraph spacing for comfortable long reading sessions
- **Persistent Settings**: Reader preferences saved across chapters and sessions
- **Accurate Chapter Count**: Shows actual story chapters, excluding front/back matter
- **Mobile-First UI**: Optimized button sizes, safe areas, and floating actions
- **Consistent Layout**: Standardized max-width (900px) across all pages

## 📱 Browser Support

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support with iOS/macOS compatibility
- **Mobile Browsers**: Optimized for iOS Safari and Chrome Mobile

## 🚀 Deployment

### Vercel (Recommended)
\`\`\`bash
bun run build
# Deploy to Vercel with zero configuration
\`\`\`

### Other Platforms
- **Netlify**: Supports Next.js with static export
- **GitHub Pages**: Use static export for hosting
- **Self-Hosted**: Run with any Node.js hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies for optimal performance
- Inspired by clean, distraction-free reading experiences
- Designed with privacy and user control as core principles

---

**Enjoy your private reading experience!** 📚✨

## Development Checkpoint: Library Folder System

This project now includes an experimental Folder system for organizing uploaded EPUBs. Work is on the `dev` branch and the implementation is feature-complete enough for testing. Below is a summary of what was done and an in-depth account of a complex UI freeze bug that was discovered and resolved during implementation.

### Summary of Changes
- Added `Folder` type and stored folders in IndexedDB (`lib/db/folders.ts`).
- Implemented folder CRUD (create, rename, delete) with slug generation and unique slug enforcement.
- Indexed folders by `slug` in IndexedDB and migrated DB version accordingly.
- Updated `app/library/page.tsx` with folder grid, book movement between folders, sorting, and breadcrumb behavior.
- UI: `FolderCard`, `CreateFolderDialog`, `MoveBookDialog`, `LibraryHeader` components.
- Routing: folder-aware URL using query param `?folder=slug` so folders are bookmarkable and back/forward work.

### The Freeze Bug (detailed)
Symptom: after interacting with some dialog/popover flows (especially moving books between folders or renaming folders), the UI would become unresponsive — clicks would not register and the page required a hard refresh (F5) to recover.

Root causes identified during investigation:
- Focus/ARIA conflict: Radix popovers/menus sometimes retained focus while an ancestor element became `aria-hidden` (Radix hides the rest of the app when dialogs open). Browsers block pointer events when assistive-technology-related ARIA states conflict with the focused element.
- Race conditions: operations that updated IndexedDB and then immediately triggered UI updates or navigation could occur while a popup animation/transition or focus trap was still active.
- Direct DOM manipulation attempts (initially) to remove overlays sometimes interfered with React/Radix portal management and caused removeChild errors or other unstable UI states.

What we changed to fix the freeze (multiple coordinated fixes):
1. Avoid direct DOM removal of Radix portal nodes. Let Radix manage portals and overlays to prevent React/DOM conflicts.
2. Close/popover sequencing: defer menu actions (Rename/Delete/Move) slightly (50–80ms) so the popover has time to close and release focus before we open a dialog or change URL/state.
3. Blur active element before opening dialogs or changing URL to ensure no descendant remains focused while an ancestor is hidden. This prevents the browser warning "Blocked aria-hidden on an element because its descendant retained focus." and the resulting blocked interactions.
4. Optimistic UI updates: when moving a book, update local state immediately (optimistic update) and trigger a background data reload so the UI stays responsive while the DB operation completes.
5. Fallback DB lookup: when attempting to Move a book that was uploaded very recently (race between upload and UI state), fall back to reading the book entry from IndexedDB before opening the Move dialog.
6. Accessibility fix: ensure `DialogContent` has an `aria-describedby` (generate an offscreen description node when none provided) to silence React accessibility warnings.
7. DB migration: bumped DB version and added a `slug` index for folders so lookups by `?folder=slug` are fast and correct.

Why this combination works:
- Deferring actions and blurring focus prevents the accessibility focus/aria-hidden conflict that caused browsers to block interactions.
- Letting Radix manage portals avoids interfering with React's reconciliation and DOM ownership.
- Optimistic updates keep the UI interactive while background IO finishes.

### How to test the fixes
1. Start the app on the `dev` branch.
2. Upload an EPUB, then immediately move it to a folder — UI should stay responsive, and folder counts should update without freeze.
3. Rename a folder while its dropdown menu is open — the rename dialog should open and URL update should occur without freezing.
4. Use the browser back/forward and refresh on a folder URL `/library?folder=your-folder-slug` — the folder should load correctly.
5. Open DevTools Console and check there are no persistent removeChild errors or blocked aria-hidden warnings.

### Next steps / Recommendations
- Consider using Radix's programmatic close APIs (if available) to explicitly close menus/popovers before opening dialogs instead of manual delays.
- Add a small suite of end-to-end tests (Playwright/Cypress) to reproduce upload → move and rename flows to prevent regressions.
- Add visual loading skeletons to the library list so background reloads feel smoother.
- Document DB migrations in a migration log for future upgrades.

If you want, I can commit this README update and also create a short PR on `dev` summarizing the work.
