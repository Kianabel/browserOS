import { FileSystem } from "./filesystem.js";

class Desktop extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const container = document.createElement("div");
    container.classList.add("desktop-container");

    const style = document.createElement("style");
    style.textContent = `
      .desktop-container {
        position: absolute;
        inset: 0;
        z-index: 0;
        user-select: none;
        overflow: hidden;
      }

      .selection-box {
        position: absolute;
        border: 0.125rem dashed rgba(255, 255, 255, 0.68);
        background-color: rgba(255, 255, 255, 0.12);
        z-index: 1000;
      }

      .desktop-item {
        position: absolute;
        width: 5.25rem;
        min-height: 4.75rem;
        display: grid;
        justify-items: center;
        gap: 0.35rem;
        padding: 0.35rem;
        border: 0;
        border-radius: 0.7rem;
        background: transparent;
        color: white;
        cursor: grab;
        text-align: center;
      }

      :host-context([browseros-hide-desktop-icons]) .desktop-item {
        display: none;
      }

      .desktop-item:hover,
      .desktop-item:focus-visible,
      .desktop-item.selected,
      .desktop-item.dragging {
        background: rgba(255, 255, 255, 0.12);
        outline: none;
      }

      .desktop-item.selected {
        background: rgba(56, 189, 248, 0.22);
        box-shadow: inset 0 0 0 0.0625rem rgba(125, 211, 252, 0.55);
      }

      .desktop-item.drop-target {
        background: rgba(14, 165, 233, 0.22);
        box-shadow: inset 0 0 0 0.1rem rgba(125, 211, 252, 0.72);
      }

      .desktop-item.cut-pending {
        opacity: 0.48;
      }

      .desktop-icon {
        width: 2.45rem;
        height: 2.45rem;
        display: grid;
        place-items: center;
        border-radius: 0.7rem;
        background: var(--icon-color, #4f8cff);
        color: white;
        box-shadow: inset 0 0 0 0.0625rem rgba(255, 255, 255, 0.18), 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
      }

      .desktop-icon svg {
        width: 1.35rem;
        height: 1.35rem;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.9;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .desktop-label {
        max-width: 100%;
        padding: 0.08rem 0.25rem;
        border-radius: 0.3rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: white;
        text-shadow: 0 0.1rem 0.25rem rgba(0, 0, 0, 0.75);
        font: 750 0.76rem/1.15 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .folder-panel {
        position: absolute;
        top: 2rem;
        left: 7rem;
        width: min(42rem, calc(100vw - 2rem));
        max-height: min(28rem, calc(100vh - 4rem));
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr);
        border: 0.0625rem solid rgba(255, 255, 255, 0.28);
        border-radius: 0.85rem;
        background: rgba(16, 22, 30, 0.92);
        color: white;
        backdrop-filter: blur(22px);
        box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.34);
        overflow: hidden;
        z-index: 20;
      }

      .folder-panel[hidden] {
        display: none;
      }

      .folder-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 2.5rem;
        padding: 0 0.55rem 0 0.85rem;
        background: rgba(255, 255, 255, 0.06);
        font: 800 0.86rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .folder-header button {
        width: 1.8rem;
        height: 1.8rem;
        border: 0;
        border-radius: 0.45rem;
        background: transparent;
        color: white;
        cursor: pointer;
        font: 900 1rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .folder-header button:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      .folder-path {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.62);
        font: 700 0.74rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .folder-toolbar {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        min-height: 2.4rem;
        padding: 0.35rem 0.55rem;
        border-top: 0.0625rem solid rgba(255, 255, 255, 0.08);
        border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.035);
      }

      .folder-toolbar button,
      .details-actions button {
        min-height: 1.8rem;
        border: 0;
        border-radius: 0.45rem;
        padding: 0 0.55rem;
        background: rgba(255, 255, 255, 0.09);
        color: white;
        cursor: pointer;
        font: 750 0.74rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .folder-toolbar button:disabled,
      .details-actions button:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .folder-toolbar button:not(:disabled):hover,
      .details-actions button:not(:disabled):hover {
        background: rgba(255, 255, 255, 0.16);
      }

      .folder-body {
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(13rem, 0.42fr);
      }

      .folder-content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
        align-content: start;
        gap: 0.5rem;
        padding: 0.85rem;
        overflow: auto;
      }

      .folder-content .desktop-item {
        position: static;
        width: auto;
      }

      .folder-content .desktop-item.selected {
        background: rgba(56, 189, 248, 0.22);
      }

      .details-pane {
        min-width: 0;
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr);
        gap: 0.65rem;
        padding: 0.85rem;
        border-left: 0.0625rem solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.035);
        overflow: auto;
      }

      .details-title {
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: white;
        font: 850 0.95rem/1.2 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .details-meta {
        margin: 0;
        color: rgba(255, 255, 255, 0.58);
        font: 700 0.74rem/1.4 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .details-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .file-editor {
        width: 100%;
        min-height: 10rem;
        resize: vertical;
        box-sizing: border-box;
        border: 0.0625rem solid rgba(255, 255, 255, 0.16);
        border-radius: 0.55rem;
        padding: 0.55rem;
        background: rgba(0, 0, 0, 0.2);
        color: white;
        font: 500 0.78rem/1.45 Consolas, "Courier New", monospace;
      }

      .empty-folder {
        margin: 0;
        color: rgba(255, 255, 255, 0.58);
        font: 700 0.78rem/1.35 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      @media (max-width: 44rem) {
        .folder-body {
          grid-template-columns: 1fr;
        }

        .details-pane {
          border-left: 0;
          border-top: 0.0625rem solid rgba(255, 255, 255, 0.08);
        }
      }

      .desktop-context-menu {
        position: fixed;
        z-index: 1100;
        width: 12rem;
        padding: 0.35rem;
        border-radius: 0.75rem;
        background: rgba(16, 22, 30, 0.96);
        border: 0.0625rem solid rgba(255, 255, 255, 0.22);
        box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.38);
        backdrop-filter: blur(20px);
      }

      .desktop-context-menu[hidden] {
        display: none;
      }

      .desktop-context-menu button {
        width: 100%;
        min-height: 2.25rem;
        display: flex;
        align-items: center;
        border: 0;
        border-radius: 0.55rem;
        padding: 0 0.65rem;
        background: transparent;
        color: white;
        font: 700 0.82rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
        cursor: pointer;
      }

      .desktop-context-menu button:hover {
        background: rgba(255, 255, 255, 0.14);
      }

      .drag-badge {
        position: fixed;
        z-index: 2500;
        left: 0;
        top: 0;
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        min-height: 2.25rem;
        padding: 0 0.7rem 0 0.5rem;
        border-radius: 0.65rem;
        border: 0.0625rem solid rgba(255, 255, 255, 0.42);
        background: rgba(16, 22, 30, 0.62);
        color: white;
        pointer-events: none;
        opacity: 0.82;
        transform: translate(14px, 14px);
        box-shadow: 0 0.8rem 1.8rem rgba(0, 0, 0, 0.28);
        backdrop-filter: blur(14px);
        font: 800 0.75rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .drag-badge-icon {
        width: 1.45rem;
        height: 1.45rem;
        display: grid;
        place-items: center;
        border-radius: 0.45rem;
        background: rgba(14, 165, 233, 0.86);
      }

      .drag-badge-icon svg {
        width: 0.95rem;
        height: 0.95rem;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);

    const contextMenu = document.createElement("div");
    contextMenu.classList.add("desktop-context-menu");
    contextMenu.hidden = true;
    shadow.appendChild(contextMenu);

    this.container = container;
    this.contextMenu = contextMenu;
    FileSystem.migrateLegacyDesktopItems();
    this.items = [];
    this.selectedIds = new Set();
    this.lastSelectedId = null;
    this.clipboard = null;
    this.selectionBox = null;
    this.selectionMoved = false;
    this.selectionBaseIds = new Set();
    this.suppressNextClick = false;
    this.startX = 0;
    this.startY = 0;
    this.gridWidth = 96;
    this.gridHeight = 88;
    this.dragState = null;
    this.dragBadge = null;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.nativeDragOverHandler = this.nativeDragOverHandler.bind(this);
    this.nativeDropHandler = this.nativeDropHandler.bind(this);
    this.nativeDragLeaveHandler = this.nativeDragLeaveHandler.bind(this);
    this.addAppHandler = this.addAppHandler.bind(this);
    this.createFolderHandler = this.createFolderHandler.bind(this);
    this.filesystemChangedHandler = this.filesystemChangedHandler.bind(this);
    this.outsidePointerHandler = this.outsidePointerHandler.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);
    this.openFolderId = null;
    this.selectedNodeId = null;
  }

  connectedCallback() {
    this.container.addEventListener("mousedown", this.onMouseDown);
    this.container.addEventListener("dragover", this.nativeDragOverHandler);
    this.container.addEventListener("drop", this.nativeDropHandler);
    this.container.addEventListener("dragleave", this.nativeDragLeaveHandler);
    document.addEventListener("pointerdown", this.outsidePointerHandler, true);
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("browseros:add-desktop-app", this.addAppHandler);
    document.addEventListener("browseros:create-folder", this.createFolderHandler);
    document.addEventListener("browseros:filesystem-changed", this.filesystemChangedHandler);
    this.renderItems();
  }

  disconnectedCallback() {
    this.container.removeEventListener("mousedown", this.onMouseDown);
    this.container.removeEventListener("dragover", this.nativeDragOverHandler);
    this.container.removeEventListener("drop", this.nativeDropHandler);
    this.container.removeEventListener("dragleave", this.nativeDragLeaveHandler);
    document.removeEventListener("pointerdown", this.outsidePointerHandler, true);
    document.removeEventListener("keydown", this.keydownHandler);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("browseros:add-desktop-app", this.addAppHandler);
    document.removeEventListener("browseros:create-folder", this.createFolderHandler);
    document.removeEventListener("browseros:filesystem-changed", this.filesystemChangedHandler);
  }

  addAppHandler(event) {
    const App = event.detail;
    const Position = this.findNearestOpenCell(this.findOpenCell());
    FileSystem.createShortcut(FileSystem.DESKTOP_ID, App, {
      x: Position.x,
      y: Position.y,
    });
    this.loadDesktopItems();
    this.renderItems();
  }

  createFolderHandler(event) {
    const Position = this.findNearestOpenCell(this.snapPoint(event.detail?.x || 32, event.detail?.y || 32));
    FileSystem.createFolder(FileSystem.DESKTOP_ID, "New folder", {
      iconColor: "#f59e0b",
      x: Position.x,
      y: Position.y,
    });
    this.loadDesktopItems();
    this.renderItems();
  }

  filesystemChangedHandler() {
    this.renderItems();
  }

  renderItems() {
    this.container.querySelectorAll(".desktop-item").forEach((item) => item.remove());
    this.container.querySelector(".folder-panel")?.remove();
    this.loadDesktopItems();
    this.normalizeDesktopPositions();
    this.loadDesktopItems();

    this.items.forEach((item) => {
      const Button = this.createItemButton(item, true);
      this.container.appendChild(Button);
    });

    if (this.openFolderId) {
      this.renderFolderPanel(this.openFolderId);
    }
  }

  createItemButton(item, draggable) {
    const Button = document.createElement("button");
    Button.classList.add("desktop-item");
    Button.type = "button";
    if (draggable) {
      Button.style.left = `${item.metadata?.x || 24}px`;
      Button.style.top = `${item.metadata?.y || 24}px`;
    }
    Button.dataset.id = item.id;
    if (this.selectedIds.has(item.id)) Button.classList.add("selected");
    if (this.isCutPending(item.id)) Button.classList.add("cut-pending");
    Button.innerHTML = `
      <span class="desktop-icon" style="--icon-color: ${item.metadata?.iconColor || "#4f8cff"}">${this.createItemIcon(item)}</span>
      <span class="desktop-label">${this.escapeHtml(item.name)}</span>
    `;

    if (draggable) {
      Button.addEventListener("mousedown", (event) => this.startItemDrag(event, item, Button));
      Button.addEventListener("dragover", (event) => this.nativeItemDragOverHandler(event, item, Button));
      Button.addEventListener("dragleave", () => Button.classList.remove("drop-target"));
      Button.addEventListener("drop", (event) => this.nativeItemDropHandler(event, item, Button));
    }
    Button.addEventListener("click", (event) => this.selectDesktopItem(item.id, event));
    Button.addEventListener("dblclick", () => this.openItem(item));
    Button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      this.openItem(item);
    });
    Button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.selectedIds.has(item.id)) this.setSelection([item.id]);
      this.showItemContextMenu(event, item);
    });

    return Button;
  }

  renderFolderPanel(folderId) {
    const folder = FileSystem.getNode(folderId);
    if (!folder) {
      this.openFolderId = null;
      this.selectedNodeId = null;
      return;
    }

    const Panel = document.createElement("section");
    Panel.classList.add("folder-panel");
    Panel.innerHTML = `
      <header class="folder-header">
        <div>
          <span>${this.escapeHtml(folder.name)}</span>
          <div class="folder-path">${this.escapeHtml(this.getFolderPath(folder).join(" / "))}</div>
        </div>
        <button class="close-folder" type="button" aria-label="Close folder">x</button>
      </header>
      <nav class="folder-toolbar" aria-label="Folder actions">
        <button class="folder-up" type="button">Up</button>
        <button class="folder-new-folder" type="button">New folder</button>
        <button class="folder-new-file" type="button">New text file</button>
        <button class="folder-rename" type="button">Rename</button>
        <button class="folder-delete" type="button">Delete</button>
      </nav>
      <div class="folder-body">
        <div class="folder-content"></div>
        <aside class="details-pane"></aside>
      </div>
    `;

    const Content = Panel.querySelector(".folder-content");
    const Children = FileSystem.listChildren(folderId);
    if (Children.length) {
      Children.forEach((child) => {
        Content.appendChild(this.createFolderItemButton(child));
      });
    } else {
      const Empty = document.createElement("p");
      Empty.classList.add("empty-folder");
      Empty.textContent = "This folder is empty.";
      Content.appendChild(Empty);
    }

    const Selected = this.selectedNodeId ? FileSystem.getNode(this.selectedNodeId) : null;
    this.renderDetailsPane(Panel.querySelector(".details-pane"), Selected, folder);

    Panel.addEventListener("mousedown", (event) => event.stopPropagation());
    Panel.querySelector(".close-folder").addEventListener("click", () => {
      this.openFolderId = null;
      this.selectedNodeId = null;
      this.renderItems();
    });
    Panel.querySelector(".folder-up").disabled = folder.id === FileSystem.DESKTOP_ID;
    Panel.querySelector(".folder-up").addEventListener("click", () => {
      if (folder.parentId) {
        this.openFolderId = folder.parentId === "root" ? FileSystem.DESKTOP_ID : folder.parentId;
        this.selectedNodeId = null;
        this.renderItems();
      }
    });
    Panel.querySelector(".folder-new-folder").addEventListener("click", () => this.createFolderInside(folder.id));
    Panel.querySelector(".folder-new-file").addEventListener("click", () => this.createFileInside(folder.id));
    Panel.querySelector(".folder-rename").disabled = !Selected;
    Panel.querySelector(".folder-rename").addEventListener("click", () => {
      if (Selected) this.renameItem(Selected);
    });
    Panel.querySelector(".folder-delete").disabled = !Selected;
    Panel.querySelector(".folder-delete").addEventListener("click", () => {
      if (Selected) this.deleteItem(Selected.id);
    });

    this.container.appendChild(Panel);
  }

  createFolderItemButton(item) {
    const Button = this.createItemButton(item, false);
    if (item.id === this.selectedNodeId) {
      Button.classList.add("selected");
    }
    Button.addEventListener("click", (event) => {
      event.stopPropagation();
      this.selectedNodeId = item.id;
      this.renderItems();
    });
    return Button;
  }

  renderDetailsPane(container, selected, folder) {
    if (!selected) {
      container.innerHTML = `
        <h3 class="details-title">${this.escapeHtml(folder.name)}</h3>
        <p class="details-meta">${FileSystem.listChildren(folder.id).length} item(s)</p>
        <div class="details-actions">
          <button type="button" data-action="rename-folder">Rename folder</button>
        </div>
      `;
      container.querySelector('[data-action="rename-folder"]').addEventListener("click", () => this.renameItem(folder));
      return;
    }

    container.innerHTML = `
      <h3 class="details-title">${this.escapeHtml(selected.name)}</h3>
      <p class="details-meta">${selected.type}${selected.type === "folder" ? ` · ${FileSystem.listChildren(selected.id).length} item(s)` : ""}</p>
      <div class="details-actions">
        <button type="button" data-action="open">Open</button>
        <button type="button" data-action="rename">Rename</button>
        <button type="button" data-action="delete">Delete</button>
      </div>
      <div class="details-extra"></div>
    `;
    container.querySelector('[data-action="open"]').addEventListener("click", () => this.openItem(selected));
    container.querySelector('[data-action="rename"]').addEventListener("click", () => this.renameItem(selected));
    container.querySelector('[data-action="delete"]').addEventListener("click", () => this.deleteItem(selected.id));

    if (selected.type === "file") {
      const Extra = container.querySelector(".details-extra");
      Extra.innerHTML = `<textarea class="file-editor" aria-label="File content">${this.escapeHtml(selected.content || "")}</textarea>`;
      Extra.querySelector("textarea").addEventListener("input", (event) => {
        FileSystem.updateNode(selected.id, { content: event.target.value });
      });
    }
  }

  startItemDrag(event, item, element) {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (event.detail > 1) return;
    if (!this.selectedIds.has(item.id)) {
      this.setSelection([item.id]);
      this.renderItems();
      element = this.container.querySelector(`.desktop-item[data-id="${this.escapeSelector(item.id)}"]`) || element;
    }

    const DragIds = this.selectedIds.has(item.id) ? [...this.selectedIds] : [item.id];
    const DragItems = DragIds
      .map((id) => ({
        node: FileSystem.getNode(id),
        element: this.container.querySelector(`.desktop-item[data-id="${this.escapeSelector(id)}"]`),
      }))
      .filter((entry) => entry.node && entry.element);

    this.dragState = {
      item,
      element,
      items: DragItems,
      active: false,
      startX: event.clientX,
      startY: event.clientY,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      offsetX: event.clientX - (item.metadata?.x || 0),
      offsetY: event.clientY - (item.metadata?.y || 0),
      itemOffsets: DragItems.map((entry) => ({
        id: entry.node.id,
        element: entry.element,
        offsetX: event.clientX - (entry.node.metadata?.x || 0),
        offsetY: event.clientY - (entry.node.metadata?.y || 0),
      })),
    };

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  openItem(item) {
    if (item.type === "folder") {
      document.dispatchEvent(new CustomEvent("browseros:open-file-browser", {
        detail: { folderId: item.id },
      }));
      return;
    }
    if (item.type === "file") {
      const IsImage = String(item.metadata?.mimeType || "").startsWith("image/");
      document.dispatchEvent(new CustomEvent("browseros:open-app", {
        detail: IsImage
          ? { componentTag: "app-image-viewer", selectedId: item.id }
          : { componentTag: "app-notepad", fileId: item.id },
      }));
      return;
    }
    if (item.type !== "shortcut" || item.target?.kind !== "app") return;
    document.dispatchEvent(new CustomEvent("browseros:open-app", {
      detail: { componentTag: item.target.componentTag },
    }));
  }

  showItemContextMenu(event, item) {
    const Items = [
      { label: item.type === "folder" ? "Open folder" : "Open", action: () => this.openItem(item) },
      { separator: true },
      { label: "Rename", action: () => this.renameItem(item) },
      { label: "Copy", action: () => this.copySelection() },
      { label: "Cut", action: () => this.cutSelection() },
      { label: "Paste", action: () => this.pasteClipboard(), disabled: !this.clipboard },
    ];
    if (item.type === "folder") {
      Items.push(
        { separator: true },
        { label: "New folder inside", action: () => this.createFolderInside(item.id) },
        { label: "New text file inside", action: () => this.createFileInside(item.id) },
      );
    }
    Items.push(
      { separator: true },
      { label: "Delete", action: () => this.deleteItem(item.id) },
    );
    document.dispatchEvent(new CustomEvent("browseros:show-context-menu", {
      detail: {
        x: event.clientX,
        y: event.clientY,
        width: "13.5rem",
        items: Items,
      },
    }));
  }

  createContextMenuButton(label, action) {
    const Button = document.createElement("button");
    Button.type = "button";
    Button.textContent = label;
    Button.addEventListener("click", () => {
      action();
      this.closeContextMenu();
    });
    return Button;
  }

  positionContextMenu(x, y) {
    this.contextMenu.hidden = false;
    const Rect = this.contextMenu.getBoundingClientRect();
    const Left = Math.min(x, window.innerWidth - Rect.width - 8);
    const Top = Math.min(y, window.innerHeight - Rect.height - 8);
    this.contextMenu.style.left = `${Math.max(8, Left)}px`;
    this.contextMenu.style.top = `${Math.max(8, Top)}px`;
  }

  closeContextMenu() {
    this.contextMenu.hidden = true;
  }

  outsidePointerHandler(event) {
    if (!event.composedPath().includes(this.contextMenu)) {
      this.closeContextMenu();
    }
  }

  keydownHandler(event) {
    const IsMod = event.ctrlKey || event.metaKey;
    const Key = event.key.toLowerCase();
    if (this.isDesktopShortcutEvent(event)) {
      if (IsMod && Key === "a") {
        event.preventDefault();
        this.setSelection(this.items.map((item) => item.id));
        this.renderItems();
        return;
      }
      if (IsMod && Key === "x") {
        event.preventDefault();
        this.cutSelection();
        return;
      }
      if (IsMod && Key === "c") {
        event.preventDefault();
        this.copySelection();
        return;
      }
      if (IsMod && Key === "v") {
        event.preventDefault();
        this.pasteClipboard();
        return;
      }
      if (event.key === "Delete") {
        event.preventDefault();
        this.deleteSelection();
        return;
      }
      if (event.key === "Enter" && this.selectedIds.size === 1) {
        event.preventDefault();
        const Item = FileSystem.getNode([...this.selectedIds][0]);
        if (Item) this.openItem(Item);
        return;
      }
    }

    if (event.key === "Escape") {
      this.closeContextMenu();
      if (this.openFolderId) {
        this.openFolderId = null;
        this.renderItems();
      }
    }
  }

  createFolderInside(parentId) {
    FileSystem.createFolder(parentId, "New folder", {
      iconColor: "#f59e0b",
      x: 24,
      y: 24,
    });
    this.openFolderId = parentId;
    this.renderItems();
  }

  createFileInside(parentId) {
    const Name = this.getUniqueChildName(parentId, "New file.txt");
    const File = FileSystem.createFile(parentId, Name, "");
    this.openFolderId = parentId;
    this.selectedNodeId = File?.id || null;
    this.renderItems();
  }

  renameItem(item) {
    const Name = prompt("Rename", item.name);
    if (!Name?.trim()) return;
    FileSystem.renameNode(item.id, Name.trim());
    if (this.openFolderId === item.id) {
      this.openFolderId = item.id;
    }
    this.renderItems();
  }

  deleteItem(id) {
    FileSystem.deleteNode(id);
    if (this.openFolderId === id) this.openFolderId = null;
    if (this.selectedNodeId === id) this.selectedNodeId = null;
    this.selectedIds.delete(id);
    this.renderItems();
  }

  selectDesktopItem(id, event) {
    event.stopPropagation();
    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      return;
    }

    const VisibleIds = this.items.map((item) => item.id);
    if (event.shiftKey && this.lastSelectedId) {
      const Start = VisibleIds.indexOf(this.lastSelectedId);
      const End = VisibleIds.indexOf(id);
      if (Start > -1 && End > -1) {
        const [From, To] = Start < End ? [Start, End] : [End, Start];
        this.setSelection(VisibleIds.slice(From, To + 1), id);
        this.renderItems();
        return;
      }
    }

    if (event.ctrlKey || event.metaKey) {
      const Next = new Set(this.selectedIds);
      if (Next.has(id)) Next.delete(id);
      else Next.add(id);
      this.setSelection([...Next], Next.has(id) ? id : [...Next].at(-1) || null);
      this.renderItems();
      return;
    }

    this.setSelection([id]);
    this.renderItems();
  }

  setSelection(ids, primaryId = null) {
    const ValidIds = ids.filter((id) => Boolean(FileSystem.getNode(id)));
    this.selectedIds = new Set(ValidIds);
    this.lastSelectedId = primaryId || ValidIds.at(-1) || null;
  }

  clearSelection() {
    this.selectedIds = new Set();
    this.lastSelectedId = null;
  }

  updateSelectionFromBox() {
    if (!this.selectionBox) return;
    const Box = this.selectionBox.getBoundingClientRect();
    const HitIds = [];
    this.container.querySelectorAll(".desktop-item").forEach((element) => {
      const Rect = element.getBoundingClientRect();
      const Hits = Rect.left < Box.right
        && Rect.right > Box.left
        && Rect.top < Box.bottom
        && Rect.bottom > Box.top;
      const Selected = Hits || this.selectionBaseIds.has(element.dataset.id);
      element.classList.toggle("selected", Selected);
      if (Hits) HitIds.push(element.dataset.id);
    });
    this.setSelection([...new Set([...this.selectionBaseIds, ...HitIds])]);
  }

  copySelection() {
    const Ids = [...this.selectedIds];
    if (!Ids.length) return;
    this.clipboard = { mode: "copy", ids: Ids };
    this.renderItems();
  }

  cutSelection() {
    const Ids = [...this.selectedIds].filter((id) => {
      const Node = FileSystem.getNode(id);
      return Node && Node.id !== FileSystem.DESKTOP_ID && Node.id !== FileSystem.ROOT_ID;
    });
    if (!Ids.length) return;
    this.clipboard = { mode: "cut", ids: Ids };
    this.renderItems();
  }

  pasteClipboard() {
    if (!this.clipboard) return;
    const CreatedOrMoved = [];
    const Occupied = this.getOccupiedCells(this.clipboard.mode === "cut" ? (this.clipboard.ids || []) : []);
    if (this.clipboard.mode === "cut") {
      (this.clipboard.ids || []).forEach((id) => {
        const Position = this.findNearestOpenCell(this.findOpenCell(), Occupied);
        Occupied.add(this.cellKey(Position));
        const Moved = FileSystem.moveNode(id, FileSystem.DESKTOP_ID, {
          x: Position.x,
          y: Position.y,
        });
        if (Moved) CreatedOrMoved.push(Moved.id);
      });
      this.clipboard = null;
    } else {
      (this.clipboard.ids || []).forEach((id) => {
        const Position = this.findNearestOpenCell(this.findOpenCell(), Occupied);
        Occupied.add(this.cellKey(Position));
        const Clone = FileSystem.duplicateNode(id, FileSystem.DESKTOP_ID);
        if (Clone) {
          FileSystem.updateNode(Clone.id, {
            metadata: {
              x: Position.x,
              y: Position.y,
            },
          });
          CreatedOrMoved.push(Clone.id);
        }
      });
    }
    if (CreatedOrMoved.length) {
      this.setSelection(CreatedOrMoved);
      document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
      this.renderItems();
    }
  }

  deleteSelection() {
    const Ids = [...this.selectedIds];
    if (!Ids.length) return;
    if (!confirm(`Delete ${Ids.length === 1 ? "this item" : `${Ids.length} items`}?`)) return;
    Ids.forEach((id) => FileSystem.deleteNode(id));
    this.clearSelection();
    document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
    this.renderItems();
  }

  isCutPending(id) {
    return this.clipboard?.mode === "cut" && (this.clipboard.ids || []).includes(id);
  }

  isDesktopShortcutEvent(event) {
    if (event.composedPath?.().some((node) => node?.matches?.("input, textarea"))) return false;
    const Root = this.getRootNode();
    const Windows = [...Root.querySelectorAll("window-c")];
    const HasVisibleWindow = Windows.some((Window) => {
      const Container = Window.shadowRoot?.querySelector(".windowClass");
      return Container && Container.style.display !== "none";
    });
    return !HasVisibleWindow;
  }

  getUniqueChildName(parentId, baseName) {
    const Existing = new Set(FileSystem.listChildren(parentId).map((child) => child.name));
    if (!Existing.has(baseName)) return baseName;

    const DotIndex = baseName.lastIndexOf(".");
    const Stem = DotIndex > -1 ? baseName.slice(0, DotIndex) : baseName;
    const Ext = DotIndex > -1 ? baseName.slice(DotIndex) : "";
    let Index = 2;
    while (Existing.has(`${Stem} ${Index}${Ext}`)) {
      Index += 1;
    }
    return `${Stem} ${Index}${Ext}`;
  }

  getFolderPath(folder) {
    const Path = [];
    let Current = folder;
    while (Current) {
      Path.unshift(Current.name);
      Current = Current.parentId ? FileSystem.getNode(Current.parentId) : null;
      if (Current?.id === "root") {
        Path.unshift(Current.name);
        break;
      }
    }
    return Path;
  }

  escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  escapeSelector(value) {
    if (window.CSS?.escape) return CSS.escape(value);
    return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  }

  nativeDragOverHandler(event) {
    if (!this.hasFileSystemDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  nativeDropHandler(event) {
    if (!this.hasFileSystemDrag(event)) return;
    if (event.target.closest?.(".desktop-item")) return;
    event.preventDefault();
    event.stopPropagation();
    this.moveNativeDragToDesktop(this.getNativeDraggedIds(event), event.clientX, event.clientY);
  }

  nativeDragLeaveHandler(event) {
    if (event.relatedTarget && this.container.contains(event.relatedTarget)) return;
    this.container.querySelectorAll(".desktop-item.drop-target").forEach((item) => {
      item.classList.remove("drop-target");
    });
  }

  nativeItemDragOverHandler(event, item, element) {
    if (!this.hasFileSystemDrag(event)) return;
    const DraggedIds = this.getNativeDraggedIds(event);
    if (item.type === "folder" && DraggedIds.includes(item.id)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    if (item.type === "folder") element.classList.add("drop-target");
  }

  nativeItemDropHandler(event, item, element) {
    if (!this.hasFileSystemDrag(event)) return;
    const DraggedIds = this.getNativeDraggedIds(event);
    if (item.type === "folder" && DraggedIds.includes(item.id)) return;
    event.preventDefault();
    event.stopPropagation();
    element.classList.remove("drop-target");
    if (item.type === "folder") {
      this.moveNativeDragToFolder(DraggedIds, item.id);
      return;
    }
    this.moveNativeDragToDesktop(DraggedIds, event.clientX, event.clientY);
  }

  hasFileSystemDrag(event) {
    return [...(event.dataTransfer?.types || [])].includes("text/browseros-node-ids")
      || [...(event.dataTransfer?.types || [])].includes("text/browseros-node-id");
  }

  getNativeDraggedIds(event) {
    try {
      const Ids = JSON.parse(event.dataTransfer.getData("text/browseros-node-ids") || "[]");
      if (Array.isArray(Ids) && Ids.length) return Ids;
    } catch {
      // Fall back to the single-item drag payload below.
    }
    return [event.dataTransfer.getData("text/browseros-node-id")].filter(Boolean);
  }

  moveNativeDragToDesktop(ids, x, y) {
    const MovableIds = ids.filter((id) => {
      const Node = FileSystem.getNode(id);
      return Node && Node.id !== FileSystem.ROOT_ID && Node.id !== FileSystem.DESKTOP_ID;
    });
    if (!MovableIds.length) return;

    const Occupied = this.getOccupiedCells(MovableIds);
    const MovedIds = [];
    MovableIds.forEach((id, index) => {
      const Position = this.findNearestOpenCell(
        this.snapPoint(x + index * 18, y + index * 18),
        Occupied,
      );
      Occupied.add(this.cellKey(Position));
      const Moved = FileSystem.moveNode(id, FileSystem.DESKTOP_ID, {
        x: Position.x,
        y: Position.y,
      });
      if (Moved) MovedIds.push(Moved.id);
    });

    if (MovedIds.length) {
      this.setSelection(MovedIds);
      document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
      this.renderItems();
    }
  }

  moveNativeDragToFolder(ids, folderId) {
    const Folder = FileSystem.getNode(folderId);
    if (!Folder || Folder.type !== "folder") return;
    const MovedIds = [];
    ids.forEach((id, index) => {
      const Node = FileSystem.getNode(id);
      if (!Node || Node.id === folderId || Node.id === FileSystem.ROOT_ID || Node.id === FileSystem.DESKTOP_ID) return;
      const Moved = FileSystem.moveNode(id, folderId, {
        x: 24 + index * 12,
        y: 24 + index * 12,
      });
      if (Moved) MovedIds.push(Moved.id);
    });

    if (MovedIds.length) {
      this.clearSelection();
      document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
      this.renderItems();
    }
  }

  showDragBadge(count, x, y) {
    if (!this.dragBadge) {
      this.dragBadge = document.createElement("div");
      this.dragBadge.classList.add("drag-badge");
      this.shadowRoot.appendChild(this.dragBadge);
    }

    this.dragBadge.innerHTML = `
      <span class="drag-badge-icon">${this.createDragBadgeIcon()}</span>
      <span>${count === 1 ? "Move item" : `Move ${count} items`}</span>
    `;
    this.moveDragBadge(x, y);
  }

  moveDragBadge(x, y) {
    if (!this.dragBadge) return;
    this.dragBadge.style.left = `${x}px`;
    this.dragBadge.style.top = `${y}px`;
  }

  removeDragBadge() {
    this.dragBadge?.remove();
    this.dragBadge = null;
  }

  createDragBadgeIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z"></path><path d="M13 3.5V8h4M9 13h6M9 16h4"></path></svg>`;
  }

  onMouseDown(event) {
    if (event.button !== 0) return;
    if (event.target.closest?.(".desktop-item")) return;

    this.startX = event.clientX;
    this.startY = event.clientY;
    this.selectionMoved = false;
    this.selectionBaseIds = (event.ctrlKey || event.metaKey || event.shiftKey) ? new Set(this.selectedIds) : new Set();

    this.selectionBox = document.createElement("div");
    this.selectionBox.classList.add("selection-box");
    this.container.appendChild(this.selectionBox);

    this.selectionBox.style.left = `${this.startX}px`;
    this.selectionBox.style.top = `${this.startY}px`;

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  onMouseMove(event) {
    if (this.dragState) {
      this.dragState.lastClientX = event.clientX;
      this.dragState.lastClientY = event.clientY;
      if (!this.dragState.active) {
        const Distance = Math.hypot(event.clientX - this.dragState.startX, event.clientY - this.dragState.startY);
        if (Distance < 5) return;
        this.dragState.active = true;
        this.dragState.items.forEach((entry) => entry.element.classList.add("dragging"));
        this.showDragBadge(this.dragState.itemOffsets.length, event.clientX, event.clientY);
      }
      event.preventDefault();
      this.moveDragBadge(event.clientX, event.clientY);
      this.dragState.itemOffsets.forEach((entry) => {
        const Position = this.clampPoint(event.clientX - entry.offsetX, event.clientY - entry.offsetY);
        entry.element.style.left = `${Position.x}px`;
        entry.element.style.top = `${Position.y}px`;
      });
      return;
    }

    if (!this.selectionBox) return;
    this.selectionMoved = true;

    const currentX = event.clientX;
    const currentY = event.clientY;
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    const left = Math.min(currentX, this.startX);
    const top = Math.min(currentY, this.startY);

    this.selectionBox.style.width = `${width}px`;
    this.selectionBox.style.height = `${height}px`;
    this.selectionBox.style.left = `${left}px`;
    this.selectionBox.style.top = `${top}px`;
    this.updateSelectionFromBox();
  }

  onMouseUp() {
    if (this.dragState) {
      if (this.dragState.active) {
        const PrimaryEntry = this.dragState.itemOffsets.find((entry) => entry.id === this.dragState.item.id) || this.dragState.itemOffsets[0];
        const PrimaryLeft = parseFloat(PrimaryEntry.element.style.left);
        const PrimaryTop = parseFloat(PrimaryEntry.element.style.top);
        const PrimaryPosition = this.snapPoint(PrimaryLeft, PrimaryTop);
        const DropFolder = this.findFolderAt(PrimaryPosition.x, PrimaryPosition.y, this.dragState.item.id);
        const FileBrowserDrop = this.findFileBrowserDropTarget(
          this.dragState.lastClientX ?? this.dragState.startX,
          this.dragState.lastClientY ?? this.dragState.startY,
        );
        if (FileBrowserDrop) {
          FileBrowserDrop.app.moveExternalNodes(
            this.dragState.itemOffsets.map((entry) => entry.id),
            FileBrowserDrop.folderId,
          );
          this.clearSelection();
        } else if (DropFolder) {
          this.dragState.itemOffsets.forEach((entry, index) => {
            FileSystem.moveNode(entry.id, DropFolder.id, {
              x: 24 + index * 12,
              y: 24 + index * 12,
            });
          });
        } else {
          const Occupied = this.getOccupiedCells(this.dragState.itemOffsets.map((entry) => entry.id));
          this.dragState.itemOffsets.forEach((entry) => {
            const Left = parseFloat(entry.element.style.left);
            const Top = parseFloat(entry.element.style.top);
            const Position = this.findNearestOpenCell(this.snapPoint(Left, Top), Occupied);
            Occupied.add(this.cellKey(Position));
            FileSystem.updateNode(entry.id, {
              metadata: {
                x: Position.x,
                y: Position.y,
              },
            });
          });
        }
        this.dragState.items.forEach((entry) => entry.element.classList.remove("dragging"));
        this.removeDragBadge();
        this.dragState = null;
        this.renderItems();
      } else {
        this.removeDragBadge();
        this.dragState = null;
      }
    }

    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);

    if (this.selectionBox) {
      this.container.removeChild(this.selectionBox);
      this.selectionBox = null;
      this.suppressNextClick = this.selectionMoved;
      if (!this.selectionMoved && this.selectionBaseIds.size === 0) {
        this.clearSelection();
      }
      this.selectionMoved = false;
      this.renderItems();
    }
  }

  findOpenCell() {
    this.loadDesktopItems();
    const Taken = this.getOccupiedCells();
    const MaxRows = Math.max(1, Math.floor((window.innerHeight - 120) / this.gridHeight));

    for (let column = 0; column < 10; column += 1) {
      for (let row = 0; row < MaxRows; row += 1) {
        const Position = { x: 24 + column * this.gridWidth, y: 24 + row * this.gridHeight };
        if (!Taken.has(this.cellKey(Position))) return Position;
      }
    }

    return { x: 24, y: 24 };
  }

  normalizeDesktopPositions() {
    const Occupied = new Set();
    let Changed = false;

    this.items.forEach((item) => {
      const Current = this.snapPoint(item.metadata?.x || 24, item.metadata?.y || 24);
      const Position = Occupied.has(this.cellKey(Current))
        ? this.findNearestOpenCell(Current, Occupied)
        : Current;
      Occupied.add(this.cellKey(Position));

      if (Position.x !== item.metadata?.x || Position.y !== item.metadata?.y) {
        FileSystem.updateNode(item.id, {
          metadata: {
            x: Position.x,
            y: Position.y,
          },
        });
        Changed = true;
      }
    });

    if (Changed) this.items = FileSystem.listChildren(FileSystem.DESKTOP_ID);
  }

  findNearestOpenCell(preferred, occupied = this.getOccupiedCells()) {
    const StartColumn = Math.max(0, Math.round((preferred.x - 24) / this.gridWidth));
    const StartRow = Math.max(0, Math.round((preferred.y - 24) / this.gridHeight));
    const MaxColumns = Math.max(1, Math.floor((window.innerWidth - 48) / this.gridWidth));
    const MaxRows = Math.max(1, Math.floor((window.innerHeight - 140) / this.gridHeight));

    for (let radius = 0; radius <= Math.max(MaxColumns, MaxRows); radius += 1) {
      const Candidates = [];
      for (let column = Math.max(0, StartColumn - radius); column <= Math.min(MaxColumns - 1, StartColumn + radius); column += 1) {
        for (let row = Math.max(0, StartRow - radius); row <= Math.min(MaxRows - 1, StartRow + radius); row += 1) {
          if (Math.max(Math.abs(column - StartColumn), Math.abs(row - StartRow)) !== radius) continue;
          Candidates.push({ x: 24 + column * this.gridWidth, y: 24 + row * this.gridHeight });
        }
      }

      Candidates.sort((a, b) => {
        const DistanceA = Math.hypot(a.x - preferred.x, a.y - preferred.y);
        const DistanceB = Math.hypot(b.x - preferred.x, b.y - preferred.y);
        return DistanceA - DistanceB;
      });

      const Open = Candidates.find((position) => !occupied.has(this.cellKey(position)));
      if (Open) return Open;
    }

    return preferred;
  }

  getOccupiedCells(ignoredIds = []) {
    const Ignored = new Set(ignoredIds);
    this.loadDesktopItems();
    return new Set(this.items
      .filter((item) => !Ignored.has(item.id))
      .map((item) => this.cellKey({
        x: item.metadata?.x || 24,
        y: item.metadata?.y || 24,
      })));
  }

  cellKey(position) {
    return `${position.x}:${position.y}`;
  }

  snapPoint(x, y) {
    const Clamped = this.clampPoint(x, y);
    return {
      x: Math.round((Clamped.x - 24) / this.gridWidth) * this.gridWidth + 24,
      y: Math.round((Clamped.y - 24) / this.gridHeight) * this.gridHeight + 24,
    };
  }

  clampPoint(x, y) {
    return {
      x: Math.max(8, Math.min(x, window.innerWidth - 104)),
      y: Math.max(8, Math.min(y, window.innerHeight - 140)),
    };
  }

  loadDesktopItems() {
    this.items = FileSystem.listChildren(FileSystem.DESKTOP_ID);
  }

  findFolderAt(x, y, ignoredId) {
    return this.items.find((item) => {
      if (item.id === ignoredId || item.type !== "folder") return false;
      const ItemX = item.metadata?.x || 0;
      const ItemY = item.metadata?.y || 0;
      return x >= ItemX - 24 && x <= ItemX + 72 && y >= ItemY - 24 && y <= ItemY + 72;
    });
  }

  findFileBrowserDropTarget(clientX, clientY) {
    const Root = this.getRootNode();
    const Windows = [...Root.querySelectorAll("window-c")]
      .filter((Window) => {
        const Container = Window.shadowRoot?.querySelector(".windowClass");
        return Container && Container.style.display !== "none";
      })
      .sort((WindowA, WindowB) => {
        const ZIndexA = Number(WindowA.shadowRoot?.querySelector(".windowClass")?.style.zIndex || 0);
        const ZIndexB = Number(WindowB.shadowRoot?.querySelector(".windowClass")?.style.zIndex || 0);
        return ZIndexB - ZIndexA;
      });

    for (const Window of Windows) {
      const Apps = [...Window.querySelectorAll("app-file-browser")];
      for (const App of Apps) {
        const Rect = App.getBoundingClientRect();
        const Hits = clientX >= Rect.left
          && clientX <= Rect.right
          && clientY >= Rect.top
          && clientY <= Rect.bottom;
        if (!Hits) continue;

        const FolderId = App.getDropFolderIdAtPoint?.(clientX, clientY);
        if (FolderId) return { app: App, folderId: FolderId };
      }
    }

    return null;
  }

  createItemIcon(item) {
    if (item.type === "folder") {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7.5h7l1.6 2H20a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5Z"></path></svg>`;
    }
    if (item.type === "file") {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z"></path><path d="M13 3.5V8h4M9 13h6M9 16h6"></path></svg>`;
    }

    const key = item.name.toLowerCase();
    if (key.includes("browser")) return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M4 12h16M12 4c2.2 2.4 3.2 5.1 3.2 8S14.2 17.6 12 20M12 4C9.8 6.4 8.8 9.1 8.8 12s1 5.6 3.2 8"></path></svg>`;
    if (key.includes("settings")) return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"></path><path d="m19 13.2.1-1.2-.1-1.2 2-1.5-2-3.4-2.4 1a8.2 8.2 0 0 0-2.1-1.2L12.2 3H8.8l-.4 2.7c-.8.3-1.5.7-2.1 1.2l-2.4-1-2 3.4 2 1.5-.1 1.2.1 1.2-2 1.5 2 3.4 2.4-1c.6.5 1.3.9 2.1 1.2l.4 2.7h3.4l.4-2.7c.8-.3 1.5-.7 2.1-1.2l2.4 1 2-3.4-2.1-1.5Z"></path></svg>`;
    if (key.includes("run")) return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4.5v15l11-7.5-11-7.5Z"></path><path d="M4 7h3M3 12h4M4 17h3"></path></svg>`;
    if (key.includes("image")) return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"></rect><circle cx="9" cy="10" r="1.4"></circle><path d="m6.8 16 4-4 2.8 2.8 1.7-1.7L18.5 16"></path></svg>`;
    if (key.includes("64") || key.includes("base")) return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12"></path></svg>`;
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="3"></rect><path d="M9 9h6v6H9z"></path></svg>`;
  }
}

customElements.define("desktop-c", Desktop);
