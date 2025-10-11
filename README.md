# EPUB Novel Reader

A modern, privacy-first web application for reading EPUB novels with a clean interface and comprehensive customization features.

## ✨ Features

### 📚 Core Reading Experience
- **EPUB Support**: Upload and read EPUB files with full chapter navigation
- **Reading Progress**: Automatic progress tracking and resume functionality
- **Chapter Navigation**: Easy switching between chapters with progress indicators
- **Responsive Design**: Optimized for both desktop and mobile devices

### 🎨 Customization Options
- **Font Settings**: Multiple font families (Serif, Sans-serif, Monospace, Merriweather, Open Sans, Literata, Garamond)
- **Typography Control**: Adjustable font size, line height, and text alignment
- **Theme Support**: Dark mode (default) and light mode with smooth transitions
- **Layout Options**: Customizable max-width for optimal reading experience

### 🔒 Privacy & Security
- **100% Local Storage**: All EPUB files and reading progress stored locally in your browser
- **No Data Collection**: Zero tracking, analytics, or external data transmission
- **No External APIs**: Runs entirely client-side without server communication
- **Open Source**: Fully transparent codebase for security verification

### 📱 User Experience
- **Mobile-First Design**: Touch-friendly interface with proper tap targets
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Smooth Scrolling**: Hidden scrollbars with fluid reading experience
- **Safe Area Support**: Proper spacing on devices with home indicators

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

## 🎯 Key Improvements

### Recent Updates
- **Mobile UI Optimization**: Improved touch targets and responsive design
- **Single CTA Strategy**: Cleaner interface with focused user actions
- **Consistent Layout**: Standardized max-width across all pages
- **Dark Mode Default**: Better reading experience in low light
- **Accessibility**: Enhanced contrast and keyboard navigation
- **Content Visibility**: Fixed bottom navigation overlap issues

### Design Philosophy
- **Privacy First**: No external dependencies or data collection
- **User-Centric**: Intuitive interface with minimal learning curve
- **Performance**: Fast loading and smooth interactions
- **Accessibility**: WCAG compliant with proper contrast ratios

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
