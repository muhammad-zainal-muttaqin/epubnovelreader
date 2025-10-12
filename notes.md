# Development Notes

## Library Folder System Implementation

This document tracks the implementation progress of the folder system for organizing uploaded EPUBs in the library.

### Overview
The folder system allows users to organize their uploaded novels into folders, similar to a file manager. This is particularly useful for multi-volume series where each volume can be grouped together.

### Implementation Status: ✅ COMPLETED

**Branch:** `dev`  
**Status:** Feature-complete and tested

---

## Features Implemented

### ✅ Core Functionality
- **Folder CRUD**: Create, rename, delete folders
- **Book Movement**: Move books between folders or to root
- **Sorting**: Sort by name, date added, last read, progress
- **URL Routing**: Folder-aware URLs using `?folder=slug` parameter
- **Mobile Support**: Burger menu for mobile navigation

### ✅ UI Components
- `FolderCard`: Grid display with book count and cover previews
- `CreateFolderDialog`: Create/rename folder dialog
- `MoveBookDialog`: Move book between folders
- `LibraryHeader`: Breadcrumb navigation and sorting controls
- `MobileMenu`: Mobile-friendly navigation menu

### ✅ Database Schema
- Added `Folder` interface with `id`, `name`, `createdAt`, `sortOrder`, `slug`
- Updated `Book` interface with `folderId` field
- IndexedDB migration from version 1 to 3
- Added indexes for `folderId`, `slug` for efficient queries

---

## Technical Challenges & Solutions

### 🐛 UI Freeze Bug (RESOLVED)

**Symptom:** UI became unresponsive after folder operations (move, rename) requiring hard refresh.

**Root Causes:**
1. **Focus/ARIA Conflict**: Radix popovers retained focus while ancestor became `aria-hidden`
2. **Race Conditions**: IndexedDB operations triggered UI updates during animations
3. **DOM Manipulation**: Direct portal removal interfered with React reconciliation

**Solutions Applied:**
1. **Deferred Actions**: Added 50-80ms delays for menu actions to allow popover close
2. **Focus Management**: Explicit `active.blur()` before opening dialogs
3. **Optimistic Updates**: Immediate UI updates with background data reload
4. **Portal Management**: Let Radix handle portal lifecycle
5. **Accessibility Fix**: Added `aria-describedby` to dialog components

### 🔄 State Synchronization (RESOLVED)

**Symptom:** Books disappeared from folders after returning from reader.

**Root Cause:** Race condition between URL sync and data loading in `useEffect`.

**Solution:** Separated URL synchronization from data loading, added proper dependency management.

---

## File Structure

```
lib/
├── types.ts              # Folder interface, Book.folderId
├── keys.ts               # DB_VERSION=3, FOLDERS store
├── db/
│   ├── idb.ts           # IndexedDB setup with folder store
│   ├── folders.ts       # Folder CRUD operations
│   └── books.ts         # Updated with folder filtering

components/library/
├── folder-card.tsx       # Folder display component
├── create-folder-dialog.tsx
├── move-book-dialog.tsx
├── library-header.tsx    # Breadcrumb + sorting
├── mobile-menu.tsx       # Mobile navigation
└── book-card.tsx         # Updated with move option

app/library/
└── page.tsx             # Main library logic with folder support
```

---

## Testing Checklist

### ✅ Basic Functionality
- [x] Create folder
- [x] Rename folder
- [x] Delete folder
- [x] Move book to folder
- [x] Move book between folders
- [x] Move book to root
- [x] Sort by name, date, last read, progress

### ✅ Navigation
- [x] URL routing with folder slugs
- [x] Back/forward browser navigation
- [x] Reader back button returns to correct folder
- [x] Mobile burger menu functionality

### ✅ Edge Cases
- [x] Duplicate folder names (prevented)
- [x] Empty folder handling
- [x] Invalid folder URLs (redirect to root)
- [x] State synchronization after reading

---

## Performance Considerations

- **IndexedDB Indexes**: Added `folderId` and `slug` indexes for efficient queries
- **Optimistic Updates**: UI updates immediately, data reloads in background
- **Lazy Loading**: Folder slugs loaded only when needed for navigation
- **Memory Management**: Proper cleanup of event listeners and state

---

## Future Enhancements

### Potential Improvements
- **Nested Folders**: Support for multi-level folder hierarchy
- **Folder Icons**: Custom icons for different folder types
- **Bulk Operations**: Move multiple books at once
- **Folder Templates**: Pre-configured folder structures
- **Export/Import**: Backup and restore folder structures

### Technical Debt
- **Testing**: Add E2E tests for folder operations
- **Performance**: Implement virtual scrolling for large libraries
- **Accessibility**: Improve screen reader support
- **Error Handling**: Better error messages and recovery

---

## Migration Notes

### Database Migration (v1 → v3)
1. **v1 → v2**: Added folders store and folderId index
2. **v2 → v3**: Added slug index for URL routing

### Breaking Changes
- None - all changes are additive
- Existing books remain in root (folderId = null)

---

## Commit History

Key commits in `dev` branch:
- `feat: implement folder system with CRUD operations`
- `feat: add mobile burger menu for library header`
- `fix: move theme toggle into LibraryHeader for proper alignment`
- `fix: implement proper sorting for folders and books`
- `fix: preserve folder context in reader back navigation`
- `fix: improve folder data synchronization and remove router.refresh()`

---

*Last Updated: December 2024*  
*Branch: `dev`*  
*Status: Production Ready*
