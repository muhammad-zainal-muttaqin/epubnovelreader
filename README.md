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

### Deployment
\`\`\`bash
bun run build
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
