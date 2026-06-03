import { FileSystem } from "../components/filesystem.js";

export const name = "Files";
export const componentTag = "app-file-browser";
export const iconLabel = "FI";
export const iconColor = "#0ea5e9";
export const tag = "System";
export const favorite = true;
export const windowWidth = "860px";
export const windowHeight = "560px";

class AppFileBrowser extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.currentFolderId = FileSystem.DESKTOP_ID;
    this.selectedId = null;
    this.selectedIds = new Set();
    this.lastSelectedId = null;
    this.viewMode = "grid";
    this.clipboard = null;
    this.searchQuery = "";
    this.contextTargetId = null;
    this.undoStack = [];
    this.redoStack = [];
    this.selectionBox = null;
    this.selectionStart = null;
    this.suppressNextItemsClick = false;
    this.dragImage = null;
    this.openFolderHandler = this.openFolderHandler.bind(this);
    this.filesystemChangedHandler = this.filesystemChangedHandler.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);
    this.selectionMoveHandler = this.selectionMoveHandler.bind(this);
    this.selectionEndHandler = this.selectionEndHandler.bind(this);
  }

  static get observedAttributes() {
    return ["folder-id", "selected-id"];
  }

  connectedCallback() {
    const FolderId = this.getAttribute("folder-id") || this.initialFolderId;
    if (FolderId && FileSystem.getNode(FolderId)?.type === "folder") {
      this.currentFolderId = FolderId;
    }
    const SelectedId = this.getAttribute("selected-id");
    if (SelectedId && FileSystem.getNode(SelectedId)) {
      this.setSelection([SelectedId]);
    }
    document.addEventListener("browseros:filebrowser-open-folder", this.openFolderHandler);
    document.addEventListener("browseros:filesystem-changed", this.filesystemChangedHandler);
    document.addEventListener("keydown", this.keydownHandler);
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener("browseros:filebrowser-open-folder", this.openFolderHandler);
    document.removeEventListener("browseros:filesystem-changed", this.filesystemChangedHandler);
    document.removeEventListener("keydown", this.keydownHandler);
    document.removeEventListener("mousemove", this.selectionMoveHandler);
    document.removeEventListener("mouseup", this.selectionEndHandler);
    this.clearDragImage();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === "folder-id" && newValue && FileSystem.getNode(newValue)?.type === "folder") {
      this.currentFolderId = newValue;
      this.clearSelection();
      this.render();
    }
    if (name === "selected-id" && newValue && FileSystem.getNode(newValue)) {
      this.setSelection([newValue]);
      this.render();
    }
  }

  openFolderHandler(event) {
    const FolderId = event.detail?.folderId;
    if (!FolderId || !this.isConnected) return;
    const Node = FileSystem.getNode(FolderId);
    if (!Node || Node.type !== "folder") return;
    this.currentFolderId = FolderId;
    this.clearSelection();
    this.render();
  }

  filesystemChangedHandler() {
    if (!FileSystem.getNode(this.currentFolderId)) {
      this.currentFolderId = FileSystem.DESKTOP_ID;
      this.clearSelection();
    }
    this.render();
  }

  render() {
    const CurrentFolder = FileSystem.getNode(this.currentFolderId) || FileSystem.getNode(FileSystem.DESKTOP_ID);
    if (!CurrentFolder || CurrentFolder.type !== "folder") {
      this.currentFolderId = FileSystem.DESKTOP_ID;
      return this.render();
    }

    const Children = this.getVisibleChildren(CurrentFolder.id);
    const Selected = this.selectedId ? FileSystem.getNode(this.selectedId) : null;
    const SelectedNodes = this.getSelectedNodes();
    const Path = FileSystem.getPath(CurrentFolder.id);

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="file-browser" tabindex="0">
        <aside class="sidebar">
          <div class="brand">
            <span class="brand-icon">${this.iconSvg("folder")}</span>
            <div>
              <h2>Files</h2>
              <p>Plain JSON filesystem</p>
            </div>
          </div>
          <button class="location ${CurrentFolder.id === FileSystem.DESKTOP_ID ? "active" : ""}" data-location="${FileSystem.DESKTOP_ID}">
            <span>${this.iconSvg("desktop")}</span>
            <span>Desktop</span>
          </button>
          <button class="location ${CurrentFolder.id === FileSystem.ROOT_ID ? "active" : ""}" data-location="${FileSystem.ROOT_ID}">
            <span>${this.iconSvg("drive")}</span>
            <span>Root</span>
          </button>
          <div class="tree-title">Folders</div>
          <div class="folder-tree">${this.renderFolderTree(FileSystem.ROOT_ID, 0)}</div>
        </aside>

        <section class="main">
          <header class="toolbar">
            <button class="icon-button" data-action="up" ${CurrentFolder.id === FileSystem.ROOT_ID ? "disabled" : ""} aria-label="Up">${this.iconSvg("up")}</button>
            <div class="breadcrumbs">${Path.map((node) => `<button data-folder="${node.id}">${this.escapeHtml(node.name)}</button>`).join("")}</div>
            <input class="search" type="search" placeholder="Search files" value="${this.escapeHtml(this.searchQuery)}" />
            <button class="icon-button ${this.viewMode === "grid" ? "active" : ""}" data-action="grid" aria-label="Grid view">${this.iconSvg("grid")}</button>
            <button class="icon-button ${this.viewMode === "list" ? "active" : ""}" data-action="list" aria-label="List view">${this.iconSvg("list")}</button>
          </header>

          <nav class="actions" aria-label="File actions">
            <button data-action="new-folder">${this.iconSvg("folder-plus")}<span>New folder</span></button>
            <button data-action="new-file">${this.iconSvg("file-plus")}<span>New file</span></button>
            <button data-action="rename" ${!Selected || Selected.id === FileSystem.ROOT_ID ? "disabled" : ""}>${this.iconSvg("edit")}<span>Rename</span></button>
            <button data-action="duplicate" ${SelectedNodes.length === 0 ? "disabled" : ""}>${this.iconSvg("copy")}<span>Duplicate</span></button>
            <button data-action="delete" ${SelectedNodes.length === 0 ? "disabled" : ""}>${this.iconSvg("trash")}<span>Delete</span></button>
            <button data-action="export">${this.iconSvg("download")}<span>Export JSON</span></button>
            <button data-action="import">${this.iconSvg("upload")}<span>Import</span></button>
            <span class="selection-status">${this.getSelectionStatus(SelectedNodes)}</span>
          </nav>

          <div class="content-shell">
            <div class="items ${this.viewMode}" data-drop-folder="${CurrentFolder.id}">
              ${Children.length ? Children.map((item) => this.renderItem(item)).join("") : this.renderEmptyState()}
            </div>
            <aside class="details">
              ${this.renderDetails(Selected, CurrentFolder)}
            </aside>
          </div>
        </section>
      </div>
    `;

    this.bindEvents();
  }

  styles() {
    return `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        color: #e5edf7;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      button,
      input,
      textarea {
        font: inherit;
      }

      .file-browser {
        position: relative;
        height: 100%;
        display: grid;
        grid-template-columns: 15rem minmax(0, 1fr);
        background: #0d131c;
        overflow: hidden;
      }

      .sidebar {
        min-width: 0;
        padding: 0.9rem;
        border-right: 0.0625rem solid rgba(255, 255, 255, 0.08);
        background: #111926;
        overflow: auto;
      }

      .brand {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: 0.7rem;
        margin-bottom: 1rem;
      }

      .brand-icon,
      .node-icon {
        width: 2.25rem;
        height: 2.25rem;
        display: grid;
        place-items: center;
        border-radius: 0.65rem;
        background: #0ea5e9;
        color: white;
        box-shadow: inset 0 0 0 0.0625rem rgba(255, 255, 255, 0.18);
      }

      .brand h2,
      .brand p {
        margin: 0;
      }

      .brand h2 {
        font-size: 1rem;
        line-height: 1.1;
      }

      .brand p,
      .tree-title,
      .meta,
      .empty p {
        color: rgba(229, 237, 247, 0.58);
        font-size: 0.74rem;
        line-height: 1.35;
      }

      .location,
      .tree-node {
        width: 100%;
        min-height: 2.25rem;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: 0.55rem;
        border: 0;
        border-radius: 0.55rem;
        padding: 0 0.55rem;
        color: #e5edf7;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }

      .location svg,
      .tree-node svg {
        width: 1rem;
        height: 1rem;
      }

      .location:hover,
      .tree-node:hover,
      .tree-node.drop-target,
      .location.drop-target,
      .location.active,
      .tree-node.active,
      .icon-button:hover,
      .actions button:hover,
      .item:hover,
      .item.selected {
        background: rgba(255, 255, 255, 0.1);
      }

      .tree-title {
        margin: 1rem 0 0.35rem;
        font-weight: 850;
        text-transform: uppercase;
      }

      .main {
        min-width: 0;
        min-height: 0;
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr);
        background:
          radial-gradient(circle at 80% 4%, rgba(14, 165, 233, 0.16), transparent 18rem),
          #0d131c;
      }

      .toolbar,
      .actions {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        min-width: 0;
        padding: 0.65rem;
        border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.08);
      }

      .toolbar {
        background: rgba(255, 255, 255, 0.035);
      }

      .breadcrumbs {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        overflow: hidden;
      }

      .breadcrumbs button {
        flex: 0 1 auto;
        min-width: 0;
        max-width: 10rem;
        border: 0;
        border-radius: 0.5rem;
        padding: 0.4rem 0.55rem;
        color: #e5edf7;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
      }

      .search {
        width: min(13rem, 26%);
        min-width: 8rem;
        height: 2rem;
        border: 0.0625rem solid rgba(255, 255, 255, 0.14);
        border-radius: 0.55rem;
        padding: 0 0.7rem;
        background: rgba(255, 255, 255, 0.07);
        color: #e5edf7;
        outline: none;
      }

      .search:focus {
        border-color: rgba(56, 189, 248, 0.75);
      }

      .icon-button,
      .actions button,
      .details-actions button {
        min-height: 2rem;
        border: 0;
        border-radius: 0.55rem;
        background: rgba(255, 255, 255, 0.08);
        color: #e5edf7;
        cursor: pointer;
      }

      .selection-status {
        margin-left: auto;
        color: rgba(229, 237, 247, 0.52);
        font-size: 0.72rem;
        font-weight: 800;
        white-space: nowrap;
      }

      .icon-button {
        width: 2rem;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
      }

      .icon-button.active {
        background: rgba(14, 165, 233, 0.25);
        color: #7dd3fc;
      }

      .actions button,
      .details-actions button {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0 0.65rem;
        font-size: 0.75rem;
        font-weight: 800;
      }

      button:disabled {
        opacity: 0.42;
        cursor: default;
      }

      svg {
        width: 1.1rem;
        height: 1.1rem;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.9;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .content-shell {
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 17rem;
      }

      .items {
        position: relative;
        min-height: 0;
        overflow: auto;
        padding: 0.9rem;
      }

      .items.grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(7.6rem, 1fr));
        align-content: start;
        gap: 0.65rem;
      }

      .items.list {
        display: grid;
        align-content: start;
        gap: 0.35rem;
      }

      .item {
        min-width: 0;
        border: 0.0625rem solid transparent;
        border-radius: 0.75rem;
        background: rgba(255, 255, 255, 0.045);
        color: #e5edf7;
        cursor: pointer;
      }

      .item.selected {
        border-color: rgba(125, 211, 252, 0.42);
        background: rgba(14, 165, 233, 0.16);
      }

      .item.drop-target {
        border-color: rgba(125, 211, 252, 0.72);
        background: rgba(14, 165, 233, 0.22);
      }

      .item.cut-pending {
        opacity: 0.48;
        outline: 0.0625rem dashed rgba(226, 232, 240, 0.55);
        outline-offset: -0.25rem;
      }

      .grid .item {
        min-height: 6.7rem;
        display: grid;
        justify-items: center;
        align-content: center;
        gap: 0.55rem;
        padding: 0.75rem;
        text-align: center;
      }

      .list .item {
        min-height: 2.8rem;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.65rem;
        padding: 0.45rem 0.65rem;
        text-align: left;
      }

      .item-name {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.82rem;
        font-weight: 800;
      }

      .item-type {
        color: rgba(229, 237, 247, 0.52);
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: capitalize;
      }

      .details {
        min-width: 0;
        display: grid;
        align-content: start;
        gap: 0.75rem;
        padding: 0.9rem;
        border-left: 0.0625rem solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.035);
        overflow: auto;
      }

      .details h3 {
        margin: 0;
        overflow-wrap: anywhere;
        font-size: 1rem;
        line-height: 1.2;
      }

      .details-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .editor {
        width: 100%;
        min-height: 12rem;
        resize: vertical;
        border: 0.0625rem solid rgba(255, 255, 255, 0.14);
        border-radius: 0.65rem;
        padding: 0.7rem;
        background: rgba(0, 0, 0, 0.2);
        color: #e5edf7;
        outline: none;
        font-family: Consolas, "Courier New", monospace;
        font-size: 0.78rem;
        line-height: 1.45;
      }

      .empty {
        grid-column: 1 / -1;
        min-height: 14rem;
        display: grid;
        place-items: center;
        text-align: center;
        border: 0.0625rem dashed rgba(255, 255, 255, 0.15);
        border-radius: 0.8rem;
      }

      .empty h3 {
        margin: 0 0 0.25rem;
        font-size: 0.95rem;
      }

      .selection-box {
        position: absolute;
        z-index: 20;
        border: 0.125rem dashed rgba(226, 232, 240, 0.82);
        border-radius: 0.25rem;
        background: rgba(125, 211, 252, 0.12);
        pointer-events: none;
      }

      .drag-image {
        position: fixed;
        left: -1000px;
        top: -1000px;
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        min-height: 2.25rem;
        padding: 0 0.7rem 0 0.5rem;
        border-radius: 0.65rem;
        border: 0.0625rem solid rgba(255, 255, 255, 0.46);
        background: rgba(16, 22, 30, 0.62);
        color: white;
        opacity: 0.82;
        box-shadow: 0 0.8rem 1.8rem rgba(0, 0, 0, 0.28);
        font: 800 0.75rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
        pointer-events: none;
      }

      .drag-image-icon {
        width: 1.45rem;
        height: 1.45rem;
        display: grid;
        place-items: center;
        border-radius: 0.45rem;
        background: rgba(14, 165, 233, 0.86);
      }

      .drag-image-icon svg {
        width: 0.95rem;
        height: 0.95rem;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      @media (max-width: 48rem) {
        .file-browser {
          grid-template-columns: 1fr;
        }

        .sidebar {
          display: none;
        }

        .content-shell {
          grid-template-columns: 1fr;
        }

        .details {
          display: none;
        }

        .actions {
          overflow-x: auto;
        }

        .search {
          min-width: 6rem;
        }
      }
    `;
  }

  bindEvents() {
    const Root = this.shadowRoot;
    const VisibleIds = this.getVisibleChildren(this.currentFolderId).map((child) => child.id);
    Root.querySelector(".file-browser")?.addEventListener("pointerdown", (event) => {
      if (!event.target?.matches?.("input, textarea, button")) {
        Root.querySelector(".file-browser")?.focus();
      }
    });
    Root.querySelectorAll("[data-location], [data-folder]").forEach((button) => {
      button.addEventListener("click", () => this.navigateTo(button.dataset.location || button.dataset.folder));
      button.addEventListener("dragover", (event) => this.allowFolderDrop(event, button.dataset.location || button.dataset.folder, button));
      button.addEventListener("dragleave", () => button.classList.remove("drop-target"));
      button.addEventListener("drop", (event) => {
        event.preventDefault();
        event.stopPropagation();
        button.classList.remove("drop-target");
        this.moveDraggedNodes(this.getDraggedIds(event), button.dataset.location || button.dataset.folder);
      });
    });

    Root.querySelector(".search")?.addEventListener("input", (event) => {
      this.searchQuery = event.target.value;
      this.render();
    });

    Root.querySelector("[data-action='up']")?.addEventListener("click", () => this.navigateUp());
    Root.querySelector("[data-action='grid']")?.addEventListener("click", () => {
      this.viewMode = "grid";
      this.render();
    });
    Root.querySelector("[data-action='list']")?.addEventListener("click", () => {
      this.viewMode = "list";
      this.render();
    });
    Root.querySelectorAll("[data-action='new-folder']").forEach((button) => button.addEventListener("click", () => this.createFolder()));
    Root.querySelectorAll("[data-action='new-file']").forEach((button) => button.addEventListener("click", () => this.createFile()));
    Root.querySelectorAll("[data-action='rename']").forEach((button) => button.addEventListener("click", () => this.renameSelected()));
    Root.querySelectorAll("[data-action='duplicate']").forEach((button) => button.addEventListener("click", () => this.duplicateSelected()));
    Root.querySelectorAll("[data-action='delete']").forEach((button) => button.addEventListener("click", () => this.deleteSelected()));
    Root.querySelectorAll("[data-action='export']").forEach((button) => button.addEventListener("click", () => this.exportJson()));
    Root.querySelectorAll("[data-action='import']").forEach((button) => button.addEventListener("click", () => this.importJson()));

    Root.querySelectorAll(".item").forEach((itemElement) => {
      const Id = itemElement.dataset.id;
      itemElement.addEventListener("click", (event) => {
        this.selectItem(Id, event, VisibleIds);
      });
      itemElement.addEventListener("dblclick", () => this.openNode(Id));
      itemElement.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this.selectedIds.has(Id)) {
          this.setSelection([Id]);
        }
        this.showContextMenu(event, Id);
      });
      itemElement.addEventListener("dragstart", (event) => {
        if (!this.selectedIds.has(Id)) {
          this.setSelection([Id]);
        }
        const DragIds = this.selectedIds.has(Id) ? [...this.selectedIds] : [Id];
        event.dataTransfer.setData("text/browseros-node-ids", JSON.stringify(DragIds));
        event.dataTransfer.setData("text/browseros-node-id", Id);
        event.dataTransfer.effectAllowed = "move";
        this.setDragImage(event, DragIds);
      });
      itemElement.addEventListener("dragend", () => {
        this.clearDragImage();
      });
      itemElement.addEventListener("dragover", (event) => {
        this.allowFolderDrop(event, Id, itemElement);
      });
      itemElement.addEventListener("dragleave", () => {
        itemElement.classList.remove("drop-target");
      });
      itemElement.addEventListener("drop", (event) => {
        const Node = FileSystem.getNode(Id);
        if (Node?.type !== "folder") return;
        event.preventDefault();
        event.stopPropagation();
        itemElement.classList.remove("drop-target");
        this.moveDraggedNodes(this.getDraggedIds(event), Id);
      });
    });

    Root.querySelector(".items")?.addEventListener("contextmenu", (event) => {
      if (event.target.closest(".item")) return;
      event.preventDefault();
      event.stopPropagation();
      this.showContextMenu(event, null);
    });
    Root.querySelector(".items")?.addEventListener("click", (event) => {
      if (event.target.closest(".item")) return;
      if (this.suppressNextItemsClick) {
        this.suppressNextItemsClick = false;
        return;
      }
      this.clearSelection();
      this.render();
    });
    Root.querySelector(".items")?.addEventListener("mousedown", (event) => {
      if (event.button !== 0 || event.target.closest(".item")) return;
      this.startBoxSelection(event);
    });
    Root.querySelector(".items")?.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });
    Root.querySelector(".items")?.addEventListener("drop", (event) => {
      event.preventDefault();
      this.moveDraggedNodes(this.getDraggedIds(event), this.currentFolderId);
    });

    Root.querySelector(".editor")?.addEventListener("input", (event) => {
      if (this.selectedId) FileSystem.updateNode(this.selectedId, { content: event.target.value });
    });
  }

  keydownHandler(event) {
    if (!this.isActiveFileBrowser()) return;
    const IsMod = event.ctrlKey || event.metaKey;
    if (!IsMod && event.key !== "Delete" && event.key !== "Enter") return;
    if (event.composedPath?.().some((node) => node?.matches?.("input, textarea"))) return;

    const Key = event.key.toLowerCase();
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
      this.pasteClipboard(this.currentFolderId);
      return;
    }
    if (IsMod && Key === "z") {
      event.preventDefault();
      this.undoLastMove();
      return;
    }
    if (IsMod && Key === "y") {
      event.preventDefault();
      this.redoLastMove();
      return;
    }
    if (IsMod && Key === "a") {
      event.preventDefault();
      this.selectAllVisible();
      return;
    }
    if (event.key === "Delete") {
      event.preventDefault();
      this.deleteSelected();
      return;
    }
    if (event.key === "Enter" && this.selectedId) {
      event.preventDefault();
      this.openNode(this.selectedId);
    }
  }

  startBoxSelection(event) {
    const Items = this.shadowRoot.querySelector(".items");
    if (!Items) return;
    event.preventDefault();

    const Rect = Items.getBoundingClientRect();
    this.selectionStart = {
      x: event.clientX,
      y: event.clientY,
      originLeft: event.clientX - Rect.left + Items.scrollLeft,
      originTop: event.clientY - Rect.top + Items.scrollTop,
      didMove: false,
      additive: event.ctrlKey || event.metaKey || event.shiftKey,
      baseIds: new Set(this.selectedIds),
    };

    this.selectionBox = document.createElement("div");
    this.selectionBox.classList.add("selection-box");
    Items.appendChild(this.selectionBox);
    this.updateSelectionBox(event);

    document.addEventListener("mousemove", this.selectionMoveHandler);
    document.addEventListener("mouseup", this.selectionEndHandler);
  }

  selectionMoveHandler(event) {
    if (!this.selectionStart) return;
    this.selectionStart.didMove = true;
    this.updateSelectionBox(event);
    this.updateBoxSelection();
  }

  selectionEndHandler() {
    document.removeEventListener("mousemove", this.selectionMoveHandler);
    document.removeEventListener("mouseup", this.selectionEndHandler);
    this.selectionBox?.remove();
    this.selectionBox = null;
    const ShouldRender = Boolean(this.selectionStart?.didMove);
    this.suppressNextItemsClick = ShouldRender;
    this.selectionStart = null;
    if (ShouldRender) this.render();
  }

  updateSelectionBox(event) {
    const Items = this.shadowRoot.querySelector(".items");
    if (!Items || !this.selectionBox || !this.selectionStart) return;

    const Rect = Items.getBoundingClientRect();
    const CurrentLeft = event.clientX - Rect.left + Items.scrollLeft;
    const CurrentTop = event.clientY - Rect.top + Items.scrollTop;
    const Left = Math.min(CurrentLeft, this.selectionStart.originLeft);
    const Top = Math.min(CurrentTop, this.selectionStart.originTop);
    const Width = Math.abs(CurrentLeft - this.selectionStart.originLeft);
    const Height = Math.abs(CurrentTop - this.selectionStart.originTop);

    this.selectionBox.style.left = `${Left}px`;
    this.selectionBox.style.top = `${Top}px`;
    this.selectionBox.style.width = `${Width}px`;
    this.selectionBox.style.height = `${Height}px`;
  }

  updateBoxSelection() {
    const Items = this.shadowRoot.querySelector(".items");
    if (!Items || !this.selectionBox || !this.selectionStart) return;

    const Box = this.selectionBox.getBoundingClientRect();
    const HitIds = [];
    Items.querySelectorAll(".item").forEach((element) => {
      const Rect = element.getBoundingClientRect();
      const Hits = Rect.left < Box.right
        && Rect.right > Box.left
        && Rect.top < Box.bottom
        && Rect.bottom > Box.top;
      element.classList.toggle("selected", Hits || this.selectionStart.baseIds.has(element.dataset.id));
      if (Hits) HitIds.push(element.dataset.id);
    });

    const NextIds = this.selectionStart.additive
      ? [...new Set([...this.selectionStart.baseIds, ...HitIds])]
      : HitIds;
    this.setSelection(NextIds);
  }

  selectItem(id, event, visibleIds) {
    if (event.shiftKey && this.lastSelectedId) {
      const Start = visibleIds.indexOf(this.lastSelectedId);
      const End = visibleIds.indexOf(id);
      if (Start > -1 && End > -1) {
        const [From, To] = Start < End ? [Start, End] : [End, Start];
        this.setSelection(visibleIds.slice(From, To + 1), id);
        this.render();
        return;
      }
    }

    if (event.ctrlKey || event.metaKey) {
      const Next = new Set(this.selectedIds);
      if (Next.has(id)) Next.delete(id);
      else Next.add(id);
      this.setSelection([...Next], Next.has(id) ? id : [...Next].at(-1) || null);
      this.render();
      return;
    }

    this.setSelection([id]);
    this.render();
  }

  setSelection(ids, primaryId = null) {
    const ValidIds = ids.filter((id) => Boolean(FileSystem.getNode(id)));
    this.selectedIds = new Set(ValidIds);
    this.selectedId = primaryId || ValidIds.at(-1) || null;
    this.lastSelectedId = this.selectedId;
  }

  clearSelection() {
    this.selectedIds = new Set();
    this.selectedId = null;
    this.lastSelectedId = null;
  }

  selectAllVisible() {
    this.setSelection(this.getVisibleChildren(this.currentFolderId).map((child) => child.id));
    this.render();
  }

  getSelectedNodes() {
    return [...this.selectedIds]
      .map((id) => FileSystem.getNode(id))
      .filter(Boolean);
  }

  getMovableSelectedIds() {
    return this.getSelectedNodes()
      .filter((node) => node.id !== FileSystem.ROOT_ID && node.id !== FileSystem.DESKTOP_ID)
      .map((node) => node.id);
  }

  getDraggedIds(event) {
    try {
      const Ids = JSON.parse(event.dataTransfer.getData("text/browseros-node-ids") || "[]");
      if (Array.isArray(Ids) && Ids.length) return Ids;
    } catch {
      // Fall back to the legacy single-id payload below.
    }
    return [event.dataTransfer.getData("text/browseros-node-id")].filter(Boolean);
  }

  setDragImage(event, ids) {
    this.clearDragImage();
    const DragImage = document.createElement("div");
    DragImage.classList.add("drag-image");
    DragImage.innerHTML = `
      <span class="drag-image-icon">${this.iconSvg("file")}</span>
      <span>${ids.length === 1 ? "Move item" : `Move ${ids.length} items`}</span>
    `;
    this.shadowRoot.appendChild(DragImage);
    event.dataTransfer.setDragImage(DragImage, 14, 14);
    this.dragImage = DragImage;
  }

  clearDragImage() {
    this.dragImage?.remove();
    this.dragImage = null;
  }

  isActiveFileBrowser() {
    if (!this.isConnected) return false;
    const Active = document.activeElement;
    if (Active && Active !== document.body) {
      const Root = Active.getRootNode?.();
      if (Root === this.shadowRoot && Active.matches?.("input, textarea")) return false;
    }

    const OwnWindow = this.closest("window-c");
    if (!OwnWindow) return true;
    const OwnContainer = OwnWindow.shadowRoot?.querySelector(".windowClass");
    if (!OwnContainer || OwnContainer.style.display === "none") return false;

    const Windows = [...OwnWindow.getRootNode().querySelectorAll("window-c")];
    const TopWindow = Windows
      .map((Window) => ({
        window: Window,
        z: Number(Window.shadowRoot?.querySelector(".windowClass")?.style.zIndex || 0),
      }))
      .sort((a, b) => b.z - a.z)[0]?.window;

    return TopWindow === OwnWindow;
  }

  allowFolderDrop(event, folderId, element) {
    const Node = FileSystem.getNode(folderId);
    const DraggedId = event.dataTransfer.getData("text/browseros-node-id");
    if (!Node || Node.type !== "folder" || DraggedId === folderId) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    element?.classList.add("drop-target");
  }

  getVisibleChildren(folderId) {
    const Query = this.searchQuery.trim().toLowerCase();
    const Children = FileSystem.listChildren(folderId);
    if (!Query) return Children;
    return Children.filter((child) => child.name.toLowerCase().includes(Query));
  }

  renderFolderTree(folderId, depth) {
    const Folder = FileSystem.getNode(folderId);
    if (!Folder || Folder.type !== "folder") return "";

    const Children = FileSystem.listChildren(folderId).filter((child) => child.type === "folder");
    return `
      <button class="tree-node ${Folder.id === this.currentFolderId ? "active" : ""}" data-folder="${Folder.id}" style="padding-left: ${0.55 + depth * 0.85}rem">
        <span>${this.iconSvg(Folder.id === FileSystem.ROOT_ID ? "drive" : "folder")}</span>
        <span class="item-name">${this.escapeHtml(Folder.name)}</span>
      </button>
      ${Children.map((child) => this.renderFolderTree(child.id, depth + 1)).join("")}
    `;
  }

  renderItem(item) {
    const IconType = item.type === "shortcut" ? "app" : item.type;
    const Color = item.metadata?.iconColor || (item.type === "folder" ? "#f59e0b" : "#38bdf8");
    return `
      <button class="item ${this.selectedIds.has(item.id) ? "selected" : ""} ${this.isCutPending(item.id) ? "cut-pending" : ""}" data-id="${item.id}" draggable="true" type="button">
        <span class="node-icon" style="background: ${this.escapeHtml(Color)}">${this.iconSvg(IconType)}</span>
        <span class="item-name">${this.escapeHtml(item.name)}</span>
        <span class="item-type">${this.escapeHtml(item.type)}</span>
      </button>
    `;
  }

  renderEmptyState() {
    return `
      <div class="empty">
        <div>
          <h3>This folder is empty</h3>
          <p>Create a folder, text file, or drag something here.</p>
        </div>
      </div>
    `;
  }

  renderDetails(selected, currentFolder) {
    if (!selected) {
      return `
        <span class="node-icon">${this.iconSvg("folder")}</span>
        <h3>${this.escapeHtml(currentFolder.name)}</h3>
        <p class="meta">${FileSystem.listChildren(currentFolder.id).length} item(s)</p>
        <div class="details-actions">
          <button data-action="new-folder">${this.iconSvg("folder-plus")}<span>Folder</span></button>
          <button data-action="new-file">${this.iconSvg("file-plus")}<span>Text file</span></button>
        </div>
      `;
    }

    const Path = FileSystem.getPath(selected.id).map((node) => node.name).join(" / ");
    return `
      <span class="node-icon" style="background: ${this.escapeHtml(selected.metadata?.iconColor || "#38bdf8")}">${this.iconSvg(selected.type === "shortcut" ? "app" : selected.type)}</span>
      <h3>${this.escapeHtml(selected.name)}</h3>
      <p class="meta">${this.escapeHtml(selected.type)}<br>${this.escapeHtml(Path)}<br>Updated ${this.formatDate(selected.updatedAt)}</p>
      <div class="details-actions">
        <button data-action="rename">${this.iconSvg("edit")}<span>Rename</span></button>
        <button data-action="duplicate">${this.iconSvg("copy")}<span>Duplicate</span></button>
        <button data-action="delete" ${selected.id === FileSystem.DESKTOP_ID ? "disabled" : ""}>${this.iconSvg("trash")}<span>Delete</span></button>
      </div>
      ${selected.type === "file" ? `<textarea class="editor" spellcheck="false">${this.escapeHtml(selected.content || "")}</textarea>` : ""}
    `;
  }

  showContextMenu(event, id) {
    const Node = id ? FileSystem.getNode(id) : null;
    this.contextTargetId = id;
    const Items = [];

    if (Node) {
      Items.push(
        { label: Node.type === "folder" ? "Open folder" : "Open", action: () => this.openNode(Node.id) },
        { separator: true },
        { label: "Rename", action: () => this.renameNode(Node.id) },
        { label: "Copy", action: () => this.copyNode(Node.id) },
        { label: "Cut", action: () => this.cutNode(Node.id), disabled: Node.id === FileSystem.ROOT_ID || Node.id === FileSystem.DESKTOP_ID },
        { label: "Duplicate", action: () => this.duplicateNode(Node.id) },
      );
      if (Node.type === "folder") {
        Items.push(
          { separator: true },
          { label: "New folder inside", action: () => this.createFolder(Node.id) },
          { label: "New file inside", action: () => this.createFile(Node.id) },
          { label: "Paste inside", action: () => this.pasteClipboard(Node.id), disabled: !this.clipboard },
        );
      }
      if (Node.id !== FileSystem.DESKTOP_ID && Node.id !== FileSystem.ROOT_ID) {
        Items.push(
          { separator: true },
          { label: "Delete", action: () => this.deleteNode(Node.id) },
        );
      }
    } else {
      Items.push(
        { label: "New folder", action: () => this.createFolder() },
        { label: "New text file", action: () => this.createFile() },
        { label: "Paste here", action: () => this.pasteClipboard(this.currentFolderId), disabled: !this.clipboard },
        { separator: true },
        { label: "Undo move", action: () => this.undoLastMove(), disabled: this.undoStack.length === 0 },
        { label: "Redo move", action: () => this.redoLastMove(), disabled: this.redoStack.length === 0 },
        { separator: true },
        { label: "Export JSON", action: () => this.exportJson() },
      );
    }

    document.dispatchEvent(new CustomEvent("browseros:show-context-menu", {
      detail: {
        x: event.clientX,
        y: event.clientY,
        width: "14rem",
        items: Items,
      },
    }));
  }

  navigateTo(folderId) {
    const Folder = FileSystem.getNode(folderId);
    if (!Folder || Folder.type !== "folder") return;
    this.currentFolderId = folderId;
    this.clearSelection();
    this.render();
  }

  navigateUp() {
    const Folder = FileSystem.getNode(this.currentFolderId);
    if (Folder?.parentId) this.navigateTo(Folder.parentId);
  }

  openNode(id) {
    const Node = FileSystem.getNode(id);
    if (!Node) return;
    if (Node.type === "folder") {
      this.navigateTo(Node.id);
      return;
    }
    if (Node.type === "shortcut" && Node.target?.kind === "app") {
      document.dispatchEvent(new CustomEvent("browseros:open-app", {
        detail: { componentTag: Node.target.componentTag },
      }));
      return;
    }
    if (Node.type === "file") {
      const IsImage = String(Node.metadata?.mimeType || "").startsWith("image/");
      document.dispatchEvent(new CustomEvent("browseros:open-app", {
        detail: IsImage
          ? { componentTag: "app-image-viewer", selectedId: Node.id }
          : { componentTag: "app-notepad", fileId: Node.id },
      }));
    }
  }

  createFolder(parentId = this.currentFolderId) {
    const Folder = FileSystem.createFolder(parentId, "New folder");
    this.currentFolderId = parentId;
    this.setSelection(Folder ? [Folder.id] : []);
    this.render();
  }

  createFile(parentId = this.currentFolderId) {
    const File = FileSystem.createFile(parentId, "New file.txt", "");
    this.currentFolderId = parentId;
    this.setSelection(File ? [File.id] : []);
    this.render();
  }

  renameSelected() {
    if (this.selectedId) this.renameNode(this.selectedId);
  }

  renameNode(id) {
    const Node = FileSystem.getNode(id);
    if (!Node || Node.id === FileSystem.ROOT_ID) return;
    const NextName = prompt("Rename", Node.name);
    if (!NextName?.trim()) return;
    FileSystem.renameNode(id, NextName.trim());
    this.render();
  }

  duplicateSelected() {
    const Clones = this.getSelectedNodes().map((node) => FileSystem.duplicateNode(node.id)).filter(Boolean);
    if (!Clones.length) return;
    this.setSelection(Clones.map((clone) => clone.id));
    document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
    this.render();
  }

  duplicateNode(id) {
    const Clone = FileSystem.duplicateNode(id);
    if (Clone) {
      this.setSelection([Clone.id]);
      document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
    }
    this.render();
  }

  deleteSelected() {
    const Nodes = this.getSelectedNodes()
      .filter((node) => node.id !== FileSystem.ROOT_ID && node.id !== FileSystem.DESKTOP_ID);
    if (!Nodes.length) return;
    const Label = Nodes.length === 1 ? `"${Nodes[0].name}"` : `${Nodes.length} items`;
    if (!confirm(`Delete ${Label}?`)) return;
    Nodes.forEach((node) => FileSystem.deleteNode(node.id));
    this.clearSelection();
    document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
    this.render();
  }

  deleteNode(id) {
    const Node = FileSystem.getNode(id);
    if (!Node || Node.id === FileSystem.ROOT_ID || Node.id === FileSystem.DESKTOP_ID) return;
    if (!confirm(`Delete "${Node.name}"?`)) return;
    FileSystem.deleteNode(id);
    if (this.currentFolderId === id) this.currentFolderId = FileSystem.DESKTOP_ID;
    this.selectedIds.delete(id);
    if (this.selectedId === id) this.selectedId = [...this.selectedIds].at(-1) || null;
    document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
    this.render();
  }

  moveDraggedNode(nodeId, folderId) {
    this.moveDraggedNodes([nodeId], folderId);
  }

  moveDraggedNodes(nodeIds, folderId) {
    const UniqueIds = [...new Set(nodeIds)].filter(Boolean);
    if (!UniqueIds.length || !folderId) return;
    const Moves = [];
    const MovedIds = [];

    UniqueIds.forEach((nodeId) => {
      if (!nodeId || nodeId === folderId) return;
      const Node = FileSystem.getNode(nodeId);
      const PreviousParentId = Node?.parentId;
      if (!Node || PreviousParentId === folderId) return;
      const BeforeMetadata = { ...(Node.metadata || {}) };
      const Moved = FileSystem.moveNode(nodeId, folderId, folderId === FileSystem.DESKTOP_ID ? { x: 24, y: 24 } : {});
      if (!Moved) return;
      Moves.push({
        nodeId,
        fromParentId: PreviousParentId,
        toParentId: folderId,
        beforeMetadata: BeforeMetadata,
        afterMetadata: { ...(Moved.metadata || {}) },
      });
      MovedIds.push(Moved.id);
    });

    if (MovedIds.length) {
      this.recordMove({ moves: Moves });
      this.setSelection(MovedIds);
      document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
      this.render();
    }
  }

  getDropFolderIdAtPoint(clientX, clientY) {
    const Target = this.shadowRoot.elementFromPoint?.(clientX, clientY);
    if (!Target) return null;

    const Location = Target.closest?.("[data-location], [data-folder]");
    if (Location) return Location.dataset.location || Location.dataset.folder;

    const Item = Target.closest?.(".item");
    if (Item) {
      const Node = FileSystem.getNode(Item.dataset.id);
      return Node?.type === "folder" ? Node.id : null;
    }

    if (Target.closest?.(".items")) return this.currentFolderId;
    return null;
  }

  moveExternalNodes(nodeIds, folderId) {
    this.moveDraggedNodes(nodeIds, folderId || this.currentFolderId);
  }

  copyNode(id) {
    if (!FileSystem.getNode(id)) return;
    this.clipboard = { ids: [id], mode: "copy" };
    this.render();
  }

  copySelection() {
    const Ids = this.getSelectedNodes().map((node) => node.id);
    if (!Ids.length) return;
    this.clipboard = { ids: Ids, mode: "copy" };
    this.render();
  }

  cutNode(id) {
    const Node = FileSystem.getNode(id);
    if (!Node || Node.id === FileSystem.ROOT_ID || Node.id === FileSystem.DESKTOP_ID) return;
    this.clipboard = { ids: [id], mode: "cut" };
    this.render();
  }

  cutSelection() {
    const Ids = this.getMovableSelectedIds();
    if (!Ids.length) return;
    this.clipboard = { ids: Ids, mode: "cut" };
    this.render();
  }

  pasteClipboard(parentId = this.currentFolderId) {
    if (!this.clipboard) return;
    if (this.clipboard.mode === "cut") {
      this.moveDraggedNodes(this.clipboard.ids || [], parentId);
      this.clipboard = null;
    } else {
      const Clones = (this.clipboard.ids || [])
        .map((id) => FileSystem.duplicateNode(id, parentId))
        .filter(Boolean);
      if (Clones.length) {
        this.setSelection(Clones.map((clone) => clone.id));
        document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
      }
    }
    this.render();
  }

  isCutPending(id) {
    return this.clipboard?.mode === "cut" && (this.clipboard.ids || []).includes(id);
  }

  getSelectionStatus(selectedNodes) {
    if (this.clipboard?.mode === "cut") {
      return `Cut ${(this.clipboard.ids || []).length} item(s)`;
    }
    if (this.clipboard?.mode === "copy") {
      return `Copied ${(this.clipboard.ids || []).length} item(s)`;
    }
    return selectedNodes.length ? `${selectedNodes.length} selected` : "No selection";
  }

  recordMove(move) {
    this.undoStack.push(move);
    this.redoStack = [];
  }

  undoLastMove() {
    const Batch = this.undoStack.pop();
    if (!Batch) return;
    const Moves = Batch.moves || [Batch];
    const MovedIds = [];

    for (const Move of [...Moves].reverse()) {
      const Moved = FileSystem.moveNode(Move.nodeId, Move.fromParentId, Move.beforeMetadata);
      if (!Moved) continue;
      MovedIds.push(Moved.id);
    }

    if (!MovedIds.length) {
      this.undoStack.push(Batch);
      return;
    }

    this.redoStack.push(Batch);
    this.currentFolderId = Moves[0].fromParentId;
    this.setSelection(MovedIds);
    document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
    this.render();
  }

  redoLastMove() {
    const Batch = this.redoStack.pop();
    if (!Batch) return;
    const Moves = Batch.moves || [Batch];
    const MovedIds = [];

    for (const Move of Moves) {
      const Moved = FileSystem.moveNode(Move.nodeId, Move.toParentId, Move.afterMetadata);
      if (!Moved) continue;
      MovedIds.push(Moved.id);
    }

    if (!MovedIds.length) {
      this.redoStack.push(Batch);
      return;
    }

    this.undoStack.push(Batch);
    this.currentFolderId = Moves[0].toParentId;
    this.setSelection(MovedIds);
    document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
    this.render();
  }

  exportJson() {
    const Text = FileSystem.exportTree();
    navigator.clipboard?.writeText(Text);
    prompt("Filesystem JSON copied when clipboard access is available.", Text);
  }

  importJson() {
    const Text = prompt("Paste filesystem JSON");
    if (!Text) return;
    if (!FileSystem.importTree(Text)) {
      alert("That JSON could not be imported.");
      return;
    }
    this.currentFolderId = FileSystem.DESKTOP_ID;
    this.clearSelection();
    this.render();
  }

  formatDate(value) {
    if (!value) return "unknown";
    return new Intl.DateTimeFormat([], {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  iconSvg(type) {
    const Icons = {
      app: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="3"></rect><path d="M9 9h6v6H9z"></path></svg>`,
      copy: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M5 15V6a1 1 0 0 1 1-1h9"></path></svg>`,
      desktop: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="2"></rect><path d="M9 20h6M12 16v4"></path></svg>`,
      download: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10"></path><path d="m8 10 4 4 4-4"></path><path d="M5 20h14"></path></svg>`,
      drive: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14l2 9H3l2-9Z"></path><path d="M3 14v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"></path><circle cx="17" cy="17" r="1"></circle></svg>`,
      edit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.5 4 4-.5L18.8 8.7l-3.5-3.5L4 16.5Z"></path><path d="m14 6.5 3.5 3.5"></path></svg>`,
      file: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z"></path><path d="M13 3.5V8h4M9 13h6M9 16h6"></path></svg>`,
      "file-plus": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z"></path><path d="M13 3.5V8h4M12 12v6M9 15h6"></path></svg>`,
      folder: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7.5h7l1.6 2H20a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5Z"></path></svg>`,
      "folder-plus": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7.5h7l1.6 2H20a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5Z"></path><path d="M12 12v5M9.5 14.5h5"></path></svg>`,
      grid: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"></rect><rect x="14" y="4" width="6" height="6" rx="1"></rect><rect x="4" y="14" width="6" height="6" rx="1"></rect><rect x="14" y="14" width="6" height="6" rx="1"></rect></svg>`,
      list: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"></path><path d="M4 6h.01M4 12h.01M4 18h.01"></path></svg>`,
      trash: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"></path></svg>`,
      up: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"></path><path d="m6 11 6-6 6 6"></path></svg>`,
      upload: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V10"></path><path d="m8 14 4-4 4 4"></path><path d="M5 4h14"></path></svg>`,
    };
    return Icons[type] || Icons.file;
  }

  escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}

customElements.define(componentTag, AppFileBrowser);
