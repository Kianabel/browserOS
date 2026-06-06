# browserOS Handoff Memory

Last updated: 2026-06-06

This file exists so a fresh Codex/agent instance can continue the project after the user migrates machines/OSes. The chat history will not be available, so treat this as the project memory.

## Project Goal

`browserOS` is a browser-based desktop/OS simulation built with plain HTML, CSS, and JavaScript web components. It should feel like a small usable operating system: desktop icons, windows, taskbar, app launcher, context menus, file browser, basic apps, settings, notifications, and smooth drag/drop workflows.

The user's strongest product constraint: **do not use HTML canvas**. Avoid `<canvas>`, `getContext()`, `HTMLCanvasElement`, or canvas-based libraries. Build UI with DOM, CSS, SVG icons, images, iframes, and plain JS.

The user prefers fast iteration, practical UX polish, and is fine with committing/pushing to GitHub when it is a good idea. They explicitly allowed pushing to `main`.

## Repository

- GitHub remote: `https://github.com/Kianabel/browserOS.git`
- Main branch is used directly.
- Current pushed baseline at handoff:
  - `1993b99 Add command palette and editor polish`
  - previous major baseline: `1d83d89 Build desktop filesystem experience`
- There is no `package.json` and no build pipeline. This is currently a static frontend project.
- Typical local URL used in the in-app browser: `http://127.0.0.1:4173/src/index.html`

## Verification Habits

Run these before commits:

```powershell
Get-ChildItem -Path .\src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
rg -n "canvas|Canvas|<canvas|HTMLCanvasElement|getContext\(|debugger|console\.log" .\src .\public .\README.md
```

The `rg` command should exit with code `1` and no output because no matches were found.

Important environment note: Browser/IAB automation repeatedly failed in this Windows sandbox with:

```text
windows sandbox failed: spawn setup refresh
```

So previous changes were verified with syntax/static checks, not live browser automation. If a future environment can run Browser/IAB or Playwright, do visual and interaction QA, especially for drag/drop and responsive layout.

## File Map

Entrypoint:

- `src/index.html`: static host page.
- `src/index.css`: global page CSS.
- `src/entry.js`: defines `<browser-os>`, imports all components/apps, app registry.

Core components:

- `src/components/window-manager.js`: `<window-c>`, window chrome, drag/resize/minimize/fullscreen/z-index.
- `src/components/taskbar.js`: `<taskbar-c>`, launcher, taskbar, favorites, context menu, command palette, opens app windows.
- `src/components/desktop.js`: `<desktop-c>`, filesystem-backed desktop icons/folders, lasso selection, keyboard shortcuts, drag/drop, desktop grid.
- `src/components/filesystem.js`: localStorage-backed plain JSON filesystem tree.
- `src/components/notifications.js`: `<notifications-c>`, global toast notifications via `browseros:notify`.
- `src/components/base64.js`: older base64 component helper.

Applications:

- `src/applications/app-filebrowser.js`: Files app, JSON filesystem browser.
- `src/applications/app-notepad.js`: Notepad editor.
- `src/applications/app-browser.js`: fake browser shell/search-engine iframe style app.
- `src/applications/app-imageviewer.js`: Images app/image viewer with import/save behavior.
- `src/applications/app-settings.js`: Settings app, persistent OS UI settings.
- `src/applications/app-run3.js`: Run 3 app.
- `src/applications/app-base64.js`: Base64 encoder/decoder.
- `src/applications/app-template.js`: template app.
- `src/applications/app-slideshow.js` was removed.

## Current App Registry

`src/entry.js` currently registers:

```js
[FileBrowser, Notepad, BrowserApp, AppSettings, Run3, ImageViewer, base64]
```

Tags/favorites matter because the launcher and command palette use them.

## Filesystem Model

`src/components/filesystem.js` stores a normalized JSON tree in localStorage key:

```text
browserOS:filesystem
```

Important ids:

- `root`
- `desktop`

Node types:

- `folder`: has `children`
- `file`: has `content`
- `shortcut`: has `target`, used for app shortcuts

Exports:

- `FileSystem.DESKTOP_ID`
- `FileSystem.ROOT_ID`
- `createFile`
- `createFolder`
- `createShortcut`
- `deleteNode`
- `duplicateNode`
- `exportTree`
- `getNode`
- `getPath`
- `getUniqueName`
- `importTree`
- `listChildren`
- `loadTree`
- `migrateLegacyDesktopItems`
- `moveNode`
- `renameNode`
- `resetTree`
- `saveTree`
- `updateNode`

Do not replace this with IndexedDB or dependencies unless the user explicitly asks. The user asked for plain JSON as the filesystem tree.

## Desktop Behavior Baseline

Desktop icons are actual filesystem nodes under `desktop`.

Implemented:

- Invisible grid placement.
- Collision-free icon placement.
- Desktop folders.
- Double-click opens folders/files/apps.
- Lasso selection.
- Multi-select group drag.
- Drag/drop selected desktop items into desktop folders.
- Drag/drop desktop items into open Files windows.
- Drag/drop Files app items back to desktop or onto desktop folders.
- Keyboard shortcuts: select/copy/cut/paste/delete/open where appropriate.
- Right-click context menus routed through taskbar shared menu.
- Cut items get a visual pending state.
- Drag badge follows cursor for custom desktop drags.

Potential future polish:

- Better drag-over feedback when hovering open windows.
- More robust collision behavior at very small viewports.
- Optional desktop icon labels wrapping to two lines.
- A recycle bin instead of permanent delete.

## Taskbar / Launcher / Command Palette Baseline

`taskbar.js` owns:

- Centered taskbar.
- App launcher with Favorites, Categories, All apps.
- App right-click menu for favorite/unfavorite and add-to-desktop.
- Desktop right-click menu with favorites submenu and Files shortcut.
- Global context menu service: listen for `browseros:show-context-menu`.
- Fullscreen behavior: taskbar hides when a window is fullscreen and reappears when hovering bottom reveal zone.
- Command palette:
  - `Ctrl+K` or `Ctrl+Space`
  - searches apps and filesystem nodes
  - opens apps, folders, shortcuts, text files, and images
- Emits `browseros:notify` when windows open.

Potential future polish:

- Keyboard navigation in launcher.
- Pin/unpin running apps on taskbar.
- Window previews on hover.
- Notification center/history.

## Windows Baseline

`window-manager.js` provides `<window-c>`.

Implemented:

- Window top bar with minimize/fullscreen/close.
- Draggable and resizable windows.
- New windows come forward.
- z-index management.
- Fullscreen state used by taskbar.

Potential future polish:

- Snap zones / half-screen tiling.
- Animated minimize/restore.
- Persist window positions.
- Better focus ring / active window visual.

## Files App Baseline

`app-filebrowser.js` is the main filesystem UI.

Implemented:

- Sidebar locations: Desktop, Root.
- Folder tree.
- Breadcrumb navigation.
- Search.
- Sort select: name, modified, type.
- Grid/list view.
- Toolbar actions: open, new folder, new file, rename, duplicate, paste, undo, delete, export/import JSON.
- Details pane with previews:
  - folder child count
  - shortcut target
  - image preview
  - text snippet
- Inline text editing in details pane.
- Context menu per item and empty space.
- Multi-select, lasso selection.
- Ctrl+A/C/X/V/Z/Y and Delete.
- Drag/drop moving inside Files.
- Drag/drop to/from desktop.
- Undo/redo for moves.
- Toast notifications for create/delete/move/paste/import.

Potential future polish:

- Real columns in list view: name/type/date/size.
- Multi-file details summary.
- Breadcrumb overflow menu.
- File type badges and extension icons.
- Import text/image files from the real OS via `<input type=file>`.
- Export individual files.
- Recycle bin and restore.

## Notepad Baseline

`app-notepad.js`

Implemented:

- Opens filesystem text files via `file-id`.
- New, Save, Save as, Rename.
- Ctrl+S.
- Find bar with next/prev, Ctrl+F.
- Autosave toggle.
- Wrap toggle.
- Line/column status.
- Character/word counts.
- Save/create toast notifications.

Potential future polish:

- Better find match count.
- Replace.
- Markdown preview mode.
- Font size controls.
- Recent files.
- Autosave indicator without noisy filesystem refresh.

## Images App Baseline

`app-imageviewer.js`

Implemented:

- Image viewer / importer.
- Can save images into the JSON filesystem.
- Files and command palette route image files to this app.

Future polish ideas:

- Zoom/pan via DOM transforms, not canvas.
- Gallery mode.
- Image metadata panel.
- Drag images from desktop/files into viewer.

## Browser App Baseline

`app-browser.js`

Implemented:

- Not a real browser engine.
- Intended to look like a person opening a browser/search engine.
- Avoid direct embeds that sites like YouTube reject. The earlier issue was YouTube refusing iframe connection; current approach should make the shell/search behavior more plausible.

Future polish ideas:

- Search suggestions.
- Tabs.
- Bookmarks stored in localStorage.
- Better fallback page when an iframe refuses connection.

## Settings Baseline

`app-settings.js`

Implemented:

- Persistent OS UI settings.
- Applies settings through `AppSettings.applySettings()` in `entry.js`.

Future polish ideas:

- More wallpapers.
- Accent color picker.
- Reset OS/filesystem buttons with confirmation.
- Accessibility settings.

## Notifications Baseline

`src/components/notifications.js`

Usage:

```js
document.dispatchEvent(new CustomEvent("browseros:notify", {
  detail: {
    title: "Title",
    message: "Message",
    tone: "success", // info | success | warning
    duration: 3600
  }
}));
```

The component keeps up to 4 visible toasts.

## Important Events

- `browseros:open-app`
  - detail examples:
    - `{ componentTag: "app-notepad", fileId }`
    - `{ componentTag: "app-image-viewer", selectedId }`
    - `{ componentTag: "app-file-browser", folderId }`
- `browseros:open-file-browser`
  - `{ folderId, selectedId }`
- `browseros:filesystem-changed`
  - used to refresh desktop/files views.
- `browseros:show-context-menu`
  - taskbar renders shared dynamic context menus.
- `browseros:add-desktop-app`
- `browseros:create-folder`
- `browseros:notify`

## Style / UX Direction

The current style is dark translucent OS chrome over a mountain wallpaper, with restrained rounded corners, SVG icons, and compact but readable tool surfaces. Keep it utilitarian and OS-like, not a marketing site. Avoid giant hero pages, decorative cards everywhere, or landing-page copy.

Frontend constraints/preferences:

- Plain web components, no framework currently.
- No new dependencies unless the user explicitly wants them.
- No canvas.
- Use SVG icons and DOM/CSS interactions.
- Do not add visible instruction text explaining how the app works unless it belongs in an empty state or real workflow.
- Keep controls stable on mobile: no overlapping text, no clipped toolbar labels.

## Known Issues / Verification Gaps

- Browser automation was not available in the previous Codex Windows sandbox.
- Need manual/live QA for:
  - drag/drop desktop <-> Files
  - command palette search and open flows
  - Notepad autosave/find behavior
  - fullscreen taskbar reveal
  - mobile responsiveness
- There is no automated test suite.
- No package/build script exists.

## Suggested Next Work

High-value next pass:

1. Add recycle bin/trash as a real filesystem folder and route deletes there.
2. Add file import/export for individual text/image files.
3. Improve list view with columns and sorting headers.
4. Add window snapping and persisted window positions.
5. Add notification history center from the clock/taskbar.
6. Add command palette actions beyond search results: "New folder", "New note", "Open settings", "Clear desktop selection".
7. Add Settings controls for accent color, wallpaper, desktop icon visibility, taskbar size, and reset filesystem.
8. Add a small README with local run instructions and the no-canvas constraint.

## Git / Commit Notes

The user allowed direct pushes to `main` when appropriate. Continue to run static checks first. If creating feature branches is desired, note that a previous sandbox blocked branch creation without elevated Git permissions; committing directly to `main` worked after local repo author config was set:

```text
user.name = Kianabel
user.email = 203403789+Kianabel@users.noreply.github.com
```

Use concise commit messages. Recent useful commits:

- `1993b99 Add command palette and editor polish`
- `1d83d89 Build desktop filesystem experience`

## Do Not Forget

- The project’s identity is an OS-like browser desktop.
- The main part of the project is to **not use HTML canvas**.
- Filesystem must remain a plain JSON tree unless the user changes their mind.
- The user likes proactive UX improvements and is okay with made-up features if they make the system feel more real.
