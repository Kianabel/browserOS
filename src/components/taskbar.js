import { FileSystem } from "./filesystem.js";

class Taskbar extends HTMLElement {
  constructor() {
    super();

    const Shadow = this.attachShadow({ mode: "open" });

    const Container = document.createElement("div");
    Container.classList.add("taskbar");

    const Launcher = document.createElement("div");
    Launcher.classList.add("launcher");
    Launcher.hidden = true;

    const ContextMenu = document.createElement("div");
    ContextMenu.classList.add("context-menu");
    ContextMenu.hidden = true;

    const CommandPalette = document.createElement("div");
    CommandPalette.classList.add("command-palette");
    CommandPalette.hidden = true;

    const RevealZone = document.createElement("div");
    RevealZone.classList.add("fullscreen-reveal-zone");

    Shadow.appendChild(RevealZone);
    Shadow.appendChild(Container);
    Shadow.appendChild(Launcher);
    Shadow.appendChild(ContextMenu);
    Shadow.appendChild(CommandPalette);

    const Style = document.createElement("style");
    Style.textContent = `
      :host {
        color: white;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      :host([fullscreen-hidden]) .taskbar,
      :host([fullscreen-hidden]) .launcher {
        opacity: 0;
        transform: translate(-50%, 0.75rem);
        pointer-events: none;
      }

      :host([fullscreen-hidden][fullscreen-revealed]) .taskbar {
        opacity: 1;
        transform: translateX(-50%);
        pointer-events: auto;
      }

      .fullscreen-reveal-zone {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        height: 1.2rem;
        z-index: 999;
        display: none;
      }

      :host([fullscreen-hidden]) .fullscreen-reveal-zone {
        display: block;
      }

      .taskbar {
        position: fixed;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        width: min(52rem, calc(100% - 2rem));
        height: var(--browseros-taskbar-height, 3.45rem);
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.65rem;
        border-radius: 0.875rem;
        background-color: rgba(16, 22, 30, 0.78);
        border: 0.0625rem solid rgba(255, 255, 255, 0.26);
        backdrop-filter: blur(22px);
        box-shadow: 0rem 1rem 3rem rgba(0, 0, 0, 0.34);
        z-index: 1000;
        padding: 0 0.75rem;
        box-sizing: border-box;
        opacity: 1;
        transition: opacity 0.18s ease, transform 0.18s ease;
      }

      .menu-button,
      .window-square {
        height: 2.35rem;
        border: 0;
        border-radius: 0.75rem;
        color: white;
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.12);
        transition: background-color 0.16s ease;
      }

      .menu-button {
        display: grid;
        grid-template-columns: auto auto;
        align-items: center;
        gap: 0.55rem;
        padding: 0 0.85rem;
        font: 750 0.9rem/1 inherit;
      }

      .menu-mark {
        width: 1.05rem;
        height: 1.05rem;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.18rem;
      }

      .menu-mark span {
        border-radius: 0.18rem;
        background: currentColor;
      }

      .running-apps {
        min-width: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.45rem;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .running-apps::-webkit-scrollbar {
        display: none;
      }

      .window-square {
        width: 2.35rem;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
      }

      .menu-button:hover,
      .window-square:hover {
        background-color: rgba(255, 255, 255, 0.22);
      }

      .clock {
        min-width: 4.7rem;
        text-align: right;
        color: rgba(255, 255, 255, 0.82);
        font: 700 0.78rem/1.2 inherit;
      }

      .launcher {
        position: fixed;
        bottom: 5rem;
        left: 50%;
        transform: translateX(-50%);
        width: min(34rem, calc(100% - 2rem));
        max-height: min(34rem, calc(100vh - 7rem));
        z-index: 1001;
        border-radius: 1rem;
        background-color: rgba(16, 22, 30, 0.94);
        border: 0.0625rem solid rgba(255, 255, 255, 0.26);
        backdrop-filter: blur(24px);
        box-shadow: 0rem 1rem 3.25rem rgba(0, 0, 0, 0.38);
        overflow: hidden;
        opacity: 1;
        transition: opacity 0.18s ease, transform 0.18s ease;
      }

      .launcher[hidden] {
        display: none;
      }

      .launcher-shell {
        display: grid;
        gap: 1rem;
        padding: 1rem;
        max-height: inherit;
        overflow-y: auto;
        box-sizing: border-box;
      }

      .launcher-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .launcher-title {
        margin: 0;
        color: white;
        font-size: 1.05rem;
        line-height: 1.2;
      }

      .launcher-subtitle {
        margin: 0.2rem 0 0;
        color: rgba(255, 255, 255, 0.58);
        font-size: 0.78rem;
        line-height: 1.25;
      }

      .all-apps-button {
        height: 2rem;
        border: 0;
        border-radius: 0.6rem;
        padding: 0 0.75rem;
        color: white;
        background: rgba(255, 255, 255, 0.12);
        font: 750 0.78rem/1 inherit;
        cursor: pointer;
      }

      .section {
        display: grid;
        gap: 0.55rem;
      }

      .section-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.58);
        font-size: 0.72rem;
        line-height: 1;
        font-weight: 800;
        text-transform: uppercase;
      }

      .app-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.55rem;
      }

      .category-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.65rem;
      }

      .category-card {
        display: grid;
        gap: 0.55rem;
        min-width: 0;
        padding: 0.7rem;
        border-radius: 0.8rem;
        background: rgba(255, 255, 255, 0.055);
        border: 0.0625rem solid rgba(255, 255, 255, 0.07);
      }

      .category-card .section-title {
        color: rgba(255, 255, 255, 0.7);
      }

      .app-tile {
        min-width: 0;
        min-height: 3.25rem;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: 0.55rem;
        padding: 0.65rem;
        border-radius: 0.75rem;
        background: rgba(255, 255, 255, 0.07);
        border: 0;
        color: white;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.16s ease;
      }

      .app-tile:hover,
      .all-apps-button:hover,
      .context-menu button:hover,
      .context-row:hover > button {
        background: rgba(255, 255, 255, 0.14);
      }

      .app-tile:focus-visible,
      .menu-button:focus-visible,
      .window-square:focus-visible {
        outline: 0.125rem solid rgba(255, 255, 255, 0.82);
        outline-offset: 0.125rem;
      }

      .app-name {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.86rem;
        line-height: 1.15;
        font-weight: 750;
      }

      .app-tag {
        display: block;
        margin-top: 0.15rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.56);
        font-size: 0.72rem;
        line-height: 1.15;
        font-weight: 650;
      }

      .fallback-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 0.55rem;
        display: grid;
        place-items: center;
        background: var(--icon-color, #4f8cff);
        color: white;
        box-shadow: inset 0 0 0 0.0625rem rgba(255, 255, 255, 0.16);
      }

      .fallback-icon svg {
        width: 1.12rem;
        height: 1.12rem;
        display: block;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.9;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .context-menu {
        position: fixed;
        z-index: 1100;
        width: 13rem;
        padding: 0.35rem;
        border-radius: 0.75rem;
        background: rgba(16, 22, 30, 0.96);
        border: 0.0625rem solid rgba(255, 255, 255, 0.22);
        box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.38);
        backdrop-filter: blur(20px);
      }

      .command-palette {
        position: fixed;
        z-index: 1600;
        top: 4rem;
        left: 50%;
        transform: translateX(-50%);
        width: min(40rem, calc(100% - 2rem));
        border-radius: 1rem;
        border: 0.0625rem solid rgba(255, 255, 255, 0.26);
        background: rgba(16, 22, 30, 0.96);
        color: white;
        box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(28px);
        overflow: hidden;
      }

      .command-palette[hidden] {
        display: none;
      }

      .command-search {
        width: 100%;
        height: 3.4rem;
        border: 0;
        border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.12);
        padding: 0 1rem;
        background: rgba(255, 255, 255, 0.04);
        color: white;
        outline: none;
        font: 800 1rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .command-search::placeholder {
        color: rgba(255, 255, 255, 0.42);
      }

      .command-results {
        max-height: min(29rem, calc(100vh - 9rem));
        overflow: auto;
        padding: 0.55rem;
      }

      .command-group-title {
        margin: 0.45rem 0.45rem 0.35rem;
        color: rgba(255, 255, 255, 0.5);
        font: 850 0.7rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
        text-transform: uppercase;
      }

      .command-result {
        width: 100%;
        min-height: 3rem;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.65rem;
        border: 0;
        border-radius: 0.7rem;
        padding: 0.5rem 0.65rem;
        background: transparent;
        color: white;
        text-align: left;
        cursor: pointer;
      }

      .command-result:hover,
      .command-result.active {
        background: rgba(255, 255, 255, 0.12);
      }

      .command-primary,
      .command-secondary,
      .command-kind {
        min-width: 0;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .command-primary {
        font: 800 0.86rem/1.15 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .command-secondary,
      .command-kind {
        color: rgba(255, 255, 255, 0.55);
        font: 700 0.72rem/1.2 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .command-empty {
        margin: 0;
        padding: 1.5rem;
        color: rgba(255, 255, 255, 0.58);
        text-align: center;
        font: 750 0.82rem/1.35 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .context-menu[hidden] {
        display: none;
      }

      .context-row {
        position: relative;
      }

      .context-menu button,
      .context-row > button {
        width: 100%;
        min-height: 2.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 0;
        border-radius: 0.55rem;
        padding: 0 0.65rem;
        background: transparent;
        color: white;
        font: 700 0.82rem/1 inherit;
        cursor: pointer;
      }

      .context-menu button:disabled,
      .context-row > button:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .context-menu button:disabled:hover,
      .context-row > button:disabled:hover {
        background: transparent;
      }

      .context-separator {
        height: 0.0625rem;
        margin: 0.35rem 0.45rem;
        background: rgba(255, 255, 255, 0.12);
      }

      .submenu {
        position: absolute;
        top: -0.35rem;
        left: calc(100% + 0.35rem);
        min-width: 13rem;
        padding: 0.35rem;
        border-radius: 0.75rem;
        background: rgba(16, 22, 30, 0.96);
        border: 0.0625rem solid rgba(255, 255, 255, 0.22);
        box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.38);
        backdrop-filter: blur(20px);
        display: none;
      }

      .context-row:hover .submenu,
      .context-row:focus-within .submenu {
        display: block;
      }

      @media (max-width: 42rem) {
        .taskbar {
          width: calc(100% - 1.25rem);
          grid-template-columns: auto minmax(0, 1fr);
        }

        .clock {
          display: none;
        }

        .launcher {
          width: min(22rem, calc(100% - 1.25rem));
        }

        .app-grid,
        .category-grid {
          grid-template-columns: 1fr;
        }
      }
    `;

    Shadow.appendChild(Style);

    this.Container = Container;
    this.Launcher = Launcher;
    this.ContextMenu = ContextMenu;
    this.CommandPalette = CommandPalette;
    this.RevealZone = RevealZone;
    this.ShowAllApps = false;
    this.commandQuery = "";
    this.commandResults = [];
    this.commandActiveIndex = 0;
    this.clockTimer = null;
    this.outsidePointerHandler = null;
    this.keydownHandler = null;
    this.contextMenuHandler = null;
    this.showContextMenuHandler = null;
    this.openAppHandler = null;
    this.openFileBrowserHandler = null;
    this.observer = null;
  }

  connectedCallback() {
    this.initializeTaskbar();
    this.outsidePointerHandler = (event) => {
      if (!event.composedPath().includes(this)) {
        this.closeLauncher();
        this.closeContextMenu();
        this.closeCommandPalette();
      }
    };
    this.keydownHandler = (event) => {
      if (event.key === "Escape") {
        if (!this.CommandPalette.hidden) {
          this.closeCommandPalette();
          return;
        }
        this.closeLauncher();
        this.closeContextMenu();
      }
      if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === "k" || event.code === "Space")) {
        event.preventDefault();
        this.toggleCommandPalette();
      }
    };
    this.contextMenuHandler = (event) => {
      event.preventDefault();
      if (event.composedPath().includes(this)) return;
      if (this.isInsideWindow(event)) {
        this.showWindowContextMenu(event);
        return;
      }
      this.showDesktopContextMenu(event);
    };
    this.showContextMenuHandler = (event) => {
      const { x, y, items, width } = event.detail || {};
      if (!Array.isArray(items)) return;
      this.closeLauncher();
      this.renderContextMenu(items, x, y, width);
    };
    this.openAppHandler = async (event) => {
      const { availableApplications } = await import("../entry.js");
      const App = availableApplications.find((app) => app.componentTag === event.detail?.componentTag);
      if (App) this.openApp(App, event.detail || {});
    };
    this.openFileBrowserHandler = async (event) => {
      const { availableApplications } = await import("../entry.js");
      const App = availableApplications.find((app) => app.componentTag === "app-file-browser");
      if (App) this.openApp(App, { folderId: event.detail?.folderId, selectedId: event.detail?.selectedId });
    };
    this.RevealZone.addEventListener("pointerenter", () => this.setAttribute("fullscreen-revealed", ""));
    this.Container.addEventListener("pointerleave", () => this.removeAttribute("fullscreen-revealed"));
    document.addEventListener("pointerdown", this.outsidePointerHandler, true);
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("contextmenu", this.contextMenuHandler);
    document.addEventListener("browseros:show-context-menu", this.showContextMenuHandler);
    document.addEventListener("browseros:open-app", this.openAppHandler);
    document.addEventListener("browseros:open-file-browser", this.openFileBrowserHandler);
  }

  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.outsidePointerHandler, true);
    document.removeEventListener("keydown", this.keydownHandler);
    document.removeEventListener("contextmenu", this.contextMenuHandler);
    document.removeEventListener("browseros:show-context-menu", this.showContextMenuHandler);
    document.removeEventListener("browseros:open-app", this.openAppHandler);
    document.removeEventListener("browseros:open-file-browser", this.openFileBrowserHandler);
    this.observer?.disconnect();
    clearInterval(this.clockTimer);
  }

  initializeTaskbar() {
    this.Container.innerHTML = "";

    const MenuButton = document.createElement("button");
    MenuButton.classList.add("menu-button");
    MenuButton.setAttribute("aria-label", "Open app menu");
    MenuButton.innerHTML = `
      <span class="menu-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
      <span>Apps</span>
    `;
    MenuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.toggleLauncher();
    });

    const RunningApps = document.createElement("div");
    RunningApps.classList.add("running-apps");

    const Clock = document.createElement("div");
    Clock.classList.add("clock");

    this.Container.appendChild(MenuButton);
    this.Container.appendChild(RunningApps);
    this.Container.appendChild(Clock);

    this.RunningApps = RunningApps;
    this.Clock = Clock;

    this.updateClock();
    this.clockTimer = setInterval(() => this.updateClock(), 60000);
    this.updateTaskbar();

    this.observer = new MutationObserver(() => {
      this.updateTaskbar();
      this.updateFullscreenState();
    });
    this.observer.observe(this.parentNode, {
      attributes: true,
      attributeFilter: ["fullscreen"],
      childList: true,
      subtree: true,
    });
    this.updateFullscreenState();
  }

  updateClock() {
    this.Clock.textContent = new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  }

  async toggleLauncher() {
    if (this.hasAttribute("fullscreen-hidden")) return;

    this.Launcher.hidden = !this.Launcher.hidden;

    if (!this.Launcher.hidden) {
      const { availableApplications } = await import("../entry.js");
      this.renderLauncher(availableApplications);
    }
  }

  closeLauncher() {
    this.Launcher.hidden = true;
  }

  async toggleCommandPalette() {
    if (this.CommandPalette.hidden) {
      await this.openCommandPalette();
    } else {
      this.closeCommandPalette();
    }
  }

  async openCommandPalette() {
    this.closeLauncher();
    this.closeContextMenu();
    const { availableApplications } = await import("../entry.js");
    this.currentApplications = availableApplications;
    this.commandQuery = "";
    this.commandActiveIndex = 0;
    this.CommandPalette.hidden = false;
    this.renderCommandPalette();
  }

  closeCommandPalette() {
    this.CommandPalette.hidden = true;
  }

  renderCommandPalette() {
    this.commandResults = this.getCommandResults(this.commandQuery);
    this.CommandPalette.innerHTML = `
      <input class="command-search" type="search" placeholder="Search apps and files" value="${this.escapeHtml(this.commandQuery)}" />
      <div class="command-results">
        ${this.commandResults.length ? this.renderCommandGroups(this.commandResults) : "<p class=\"command-empty\">No apps or files found.</p>"}
      </div>
    `;

    const Search = this.CommandPalette.querySelector(".command-search");
    Search?.focus();
    Search?.setSelectionRange(Search.value.length, Search.value.length);
    Search?.addEventListener("input", (event) => {
      this.commandQuery = event.target.value;
      this.commandActiveIndex = 0;
      this.renderCommandPalette();
    });
    Search?.addEventListener("keydown", (event) => this.commandKeydownHandler(event));

    this.CommandPalette.querySelectorAll(".command-result").forEach((button) => {
      button.addEventListener("click", () => {
        const Result = this.commandResults[Number(button.dataset.index)];
        if (Result) this.runCommandResult(Result);
      });
    });
  }

  renderCommandGroups(results) {
    const Groups = [
      ["Apps", results.filter((result) => result.kind === "app")],
      ["Files", results.filter((result) => result.kind !== "app")],
    ].filter(([, items]) => items.length);

    let Index = 0;
    return Groups.map(([title, items]) => `
      <section>
        <h3 class="command-group-title">${title}</h3>
        ${items.map((result) => {
          const CurrentIndex = Index;
          Index += 1;
          return this.renderCommandResult(result, CurrentIndex);
        }).join("")}
      </section>
    `).join("");
  }

  renderCommandResult(result, index) {
    return `
      <button class="command-result ${index === this.commandActiveIndex ? "active" : ""}" data-index="${index}" type="button">
        ${result.icon}
        <span>
          <span class="command-primary">${this.escapeHtml(result.name)}</span>
          <span class="command-secondary">${this.escapeHtml(result.detail)}</span>
        </span>
        <span class="command-kind">${this.escapeHtml(result.label)}</span>
      </button>
    `;
  }

  commandKeydownHandler(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.commandActiveIndex = Math.min(this.commandResults.length - 1, this.commandActiveIndex + 1);
      this.renderCommandPalette();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.commandActiveIndex = Math.max(0, this.commandActiveIndex - 1);
      this.renderCommandPalette();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const Result = this.commandResults[this.commandActiveIndex];
      if (Result) this.runCommandResult(Result);
    }
  }

  getCommandResults(query) {
    const Needle = query.trim().toLowerCase();
    const Apps = (this.currentApplications || [])
      .filter((app) => this.commandMatches([app.name, app.tag], Needle))
      .map((app) => ({
        kind: "app",
        label: app.tag || "App",
        name: app.name,
        detail: "Open application",
        icon: this.createIconElement(app.iconLabel || app.name, app.iconColor, app.name).outerHTML,
        app,
      }));

    const Tree = FileSystem.loadTree();
    const Files = Object.values(Tree.nodes || {})
      .filter((node) => node.id !== FileSystem.ROOT_ID && this.commandMatches([node.name, node.type, this.getNodePathLabel(node.id)], Needle))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 18)
      .map((node) => ({
        kind: node.type,
        label: node.type === "folder" ? "Folder" : node.type === "shortcut" ? "Shortcut" : "File",
        name: node.name,
        detail: this.getNodePathLabel(node.id),
        icon: this.createIconElement(node.metadata?.iconLabel || node.name, node.metadata?.iconColor || (node.type === "folder" ? "#f59e0b" : "#38bdf8"), node.name).outerHTML,
        node,
      }));

    return [...Apps, ...Files].slice(0, 24);
  }

  commandMatches(values, query) {
    if (!query) return true;
    return values.filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
  }

  getNodePathLabel(id) {
    return FileSystem.getPath(id).map((node) => node.name).join(" / ");
  }

  async runCommandResult(result) {
    this.closeCommandPalette();
    if (result.kind === "app") {
      this.openApp(result.app);
      return;
    }

    if (result.node.type === "folder") {
      const { availableApplications } = await import("../entry.js");
      const FilesApp = availableApplications.find((app) => app.componentTag === "app-file-browser");
      if (FilesApp) this.openApp(FilesApp, { folderId: result.node.id });
      return;
    }

    if (result.node.type === "shortcut" && result.node.target?.kind === "app") {
      const { availableApplications } = await import("../entry.js");
      const App = availableApplications.find((app) => app.componentTag === result.node.target.componentTag);
      if (App) this.openApp(App);
      return;
    }

    document.dispatchEvent(new CustomEvent("browseros:open-app", {
      detail: String(result.node.metadata?.mimeType || "").startsWith("image/")
        ? { componentTag: "app-image-viewer", selectedId: result.node.id }
        : { componentTag: "app-notepad", fileId: result.node.id },
    }));
  }

  updateFullscreenState() {
    const HasFullscreenWindow = Boolean(this.parentNode?.querySelector('window-c[fullscreen="true"]'));

    if (HasFullscreenWindow) {
      this.closeLauncher();
      this.setAttribute("fullscreen-hidden", "");
    } else {
      this.removeAttribute("fullscreen-hidden");
      this.removeAttribute("fullscreen-revealed");
    }
  }

  updateTaskbar() {
    this.RunningApps.querySelectorAll(".window-square").forEach((square) => square.remove());

    const Windows = this.parentNode.querySelectorAll("window-c");

    Windows.forEach((Window) => {
      const WindowSquare = document.createElement("button");
      WindowSquare.classList.add("window-square");
      WindowSquare.setAttribute("aria-label", "Restore or minimize window");

      const AppIcon = Window.querySelector("[data-window-icon]");
      WindowSquare.appendChild(this.createIconElement(
        AppIcon?.dataset.iconLabel || "App",
        AppIcon?.dataset.iconColor,
        AppIcon?.dataset.iconName
      ));

      WindowSquare.addEventListener("click", () => {
        Window.toggleMinimize(Window.Container);
      });

      this.RunningApps.appendChild(WindowSquare);
    });
  }

  renderLauncher(availableApplications) {
    this.currentApplications = availableApplications;
    this.Launcher.innerHTML = "";
    this.closeContextMenu();

    const Shell = document.createElement("div");
    Shell.classList.add("launcher-shell");

    const Header = document.createElement("div");
    Header.classList.add("launcher-header");
    Header.innerHTML = `
      <div>
        <h2 class="launcher-title">Applications</h2>
        <p class="launcher-subtitle">Favorites, categories, and installed apps</p>
      </div>
    `;

    const AllAppsButton = document.createElement("button");
    AllAppsButton.classList.add("all-apps-button");
    AllAppsButton.textContent = this.ShowAllApps ? "Show sections" : "All apps";
    AllAppsButton.addEventListener("click", () => {
      this.ShowAllApps = !this.ShowAllApps;
      this.renderLauncher(availableApplications);
    });
    Header.appendChild(AllAppsButton);

    Shell.appendChild(Header);

    if (this.ShowAllApps) {
      Shell.appendChild(this.createAppSection("All apps", availableApplications));
    } else {
      const Favorites = availableApplications.filter((app) => this.isFavorite(app));
      Shell.appendChild(this.createAppSection("Favorites", Favorites));
      Shell.appendChild(this.createCategorySections(availableApplications));
    }

    this.Launcher.appendChild(Shell);
  }

  createCategorySections(availableApplications) {
    const Section = document.createElement("section");
    Section.classList.add("section");

    const Title = document.createElement("h3");
    Title.classList.add("section-title");
    Title.textContent = "Categories";
    Section.appendChild(Title);

    const Grid = document.createElement("div");
    Grid.classList.add("category-grid");

    const Categories = [...new Set(availableApplications.map((app) => app.tag || "Other"))];
    Categories.forEach((category) => {
      const Card = document.createElement("section");
      Card.classList.add("category-card");

      const CategoryTitle = document.createElement("h4");
      CategoryTitle.classList.add("section-title");
      CategoryTitle.textContent = category;
      Card.appendChild(CategoryTitle);

      availableApplications
        .filter((app) => (app.tag || "Other") === category)
        .forEach((app) => Card.appendChild(this.createAppTile(app)));

      Grid.appendChild(Card);
    });

    Section.appendChild(Grid);
    return Section;
  }

  createAppSection(title, apps) {
    const Section = document.createElement("section");
    Section.classList.add("section");

    const Title = document.createElement("h3");
    Title.classList.add("section-title");
    Title.textContent = title;
    Section.appendChild(Title);

    const Grid = document.createElement("div");
    Grid.classList.add("app-grid");
    if (apps.length) {
      apps.forEach((app) => Grid.appendChild(this.createAppTile(app)));
    } else {
      const Empty = document.createElement("p");
      Empty.classList.add("launcher-subtitle");
      Empty.textContent = "Right-click an app to add favorites.";
      Grid.appendChild(Empty);
    }
    Section.appendChild(Grid);

    return Section;
  }

  createAppTile(app) {
    const Tile = document.createElement("div");
    Tile.classList.add("app-tile");
    Tile.setAttribute("role", "button");
    Tile.setAttribute("tabindex", "0");
    Tile.setAttribute("aria-label", `Open ${app.name}`);

    const Text = document.createElement("span");
    Text.innerHTML = `
      <span class="app-name">${app.name}</span>
      <span class="app-tag">${app.tag || "App"}</span>
    `;

    Tile.appendChild(this.createIconElement(app.iconLabel || app.name, app.iconColor, app.name));
    Tile.appendChild(Text);
    Tile.addEventListener("click", () => this.openApp(app));
    Tile.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      this.openApp(app);
    });
    Tile.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.showAppContextMenu(event, app);
    });

    return Tile;
  }

  showAppContextMenu(event, app) {
    this.ContextMenu.innerHTML = "";
    const IsFavorite = this.isFavorite(app);
    this.ContextMenu.appendChild(this.createContextMenuButton("Open", () => this.openApp(app)));
    this.ContextMenu.appendChild(this.createContextMenuButton(IsFavorite ? "Remove favorite" : "Add favorite", () => this.toggleFavorite(app)));
    this.ContextMenu.appendChild(this.createContextMenuButton("Add to desktop", () => this.addAppToDesktop(app)));
    this.ContextMenu.appendChild(this.createContextMenuButton("All apps", () => {
      this.ShowAllApps = true;
      this.renderLauncher(this.currentApplications || []);
    }));
    this.positionContextMenu(event.clientX, event.clientY);
  }

  async showDesktopContextMenu(event) {
    const { availableApplications } = await import("../entry.js");
    const Favorites = availableApplications.filter((app) => this.isFavorite(app));
    const FilesApp = availableApplications.find((app) => app.componentTag === "app-file-browser");
    const Items = [{
      label: "Open apps",
      action: () => this.toggleLauncher(),
      submenu: Favorites.length
        ? Favorites.map((app) => ({ label: app.name, action: () => this.openApp(app) }))
        : [{ label: "No favorites yet", disabled: true }],
    }];
    if (FilesApp) {
      Items.push({ label: "Open Files", action: () => this.openApp(FilesApp, { folderId: "desktop" }) });
    }
    Items.push(
      { label: "New folder", action: () => this.createDesktopFolder(event.clientX, event.clientY) },
      { separator: true },
      { label: "Close menu", action: () => this.closeContextMenu() }
    );
    this.renderContextMenu(Items, event.clientX, event.clientY);
  }

  showWindowContextMenu(event) {
    this.renderContextMenu([
      { label: "Close menu", action: () => this.closeContextMenu() },
    ], event.clientX, event.clientY);
  }

  renderContextMenu(items, x, y, width = null) {
    this.ContextMenu.innerHTML = "";
    if (width) this.ContextMenu.style.width = width;
    else this.ContextMenu.style.removeProperty("width");

    items.forEach((item) => {
      if (item.separator) {
        const Separator = document.createElement("div");
        Separator.classList.add("context-separator");
        this.ContextMenu.appendChild(Separator);
        return;
      }
      if (item.submenu) {
        this.ContextMenu.appendChild(this.createContextMenuSubmenu(item.label, item.submenu, item.action, item.disabled));
        return;
      }
      this.ContextMenu.appendChild(this.createContextMenuButton(item.label, item.action, item.disabled));
    });

    this.positionContextMenu(x, y);
  }

  createContextMenuButton(label, action = () => {}, disabled = false) {
    const Button = document.createElement("button");
    Button.type = "button";
    Button.textContent = label;
    Button.disabled = disabled;
    Button.addEventListener("click", () => {
      if (Button.disabled) return;
      action();
      this.closeContextMenu();
    });
    return Button;
  }

  createContextMenuSubmenu(label, items, action = () => {}, disabled = false) {
    const Row = document.createElement("div");
    Row.classList.add("context-row");

    const Button = this.createContextMenuButton(label, action, disabled);
    const Submenu = document.createElement("div");
    Submenu.classList.add("submenu");

    if (items.length) {
      items.forEach((item) => {
        Submenu.appendChild(this.createContextMenuButton(item.label, item.action, item.disabled));
      });
    } else {
      const Empty = document.createElement("button");
      Empty.type = "button";
      Empty.textContent = "No favorites yet";
      Empty.disabled = true;
      Submenu.appendChild(Empty);
    }

    Row.appendChild(Button);
    Row.appendChild(Submenu);
    return Row;
  }

  positionContextMenu(x, y) {
    this.ContextMenu.hidden = false;
    const Rect = this.ContextMenu.getBoundingClientRect();
    const Left = Math.min(x, window.innerWidth - Rect.width - 8);
    const Top = Math.min(y, window.innerHeight - Rect.height - 8);
    this.ContextMenu.style.left = `${Math.max(8, Left)}px`;
    this.ContextMenu.style.top = `${Math.max(8, Top)}px`;
  }

  closeContextMenu() {
    this.ContextMenu.hidden = true;
  }

  isInsideWindow(event) {
    return event.composedPath().some((node) => node?.tagName?.toLowerCase?.() === "window-c");
  }

  loadFavoriteOverrides() {
    try {
      return JSON.parse(localStorage.getItem("browserOS:favorites") || "{}");
    } catch {
      return {};
    }
  }

  saveFavoriteOverrides(overrides) {
    localStorage.setItem("browserOS:favorites", JSON.stringify(overrides));
  }

  isFavorite(app) {
    const Overrides = this.loadFavoriteOverrides();
    return Object.prototype.hasOwnProperty.call(Overrides, app.componentTag)
      ? Boolean(Overrides[app.componentTag])
      : Boolean(app.favorite);
  }

  toggleFavorite(app) {
    const Overrides = this.loadFavoriteOverrides();
    Overrides[app.componentTag] = !this.isFavorite(app);
    this.saveFavoriteOverrides(Overrides);
    this.renderLauncher(this.currentApplications || []);
  }

  addAppToDesktop(app) {
    document.dispatchEvent(new CustomEvent("browseros:add-desktop-app", {
      detail: {
        name: app.name,
        componentTag: app.componentTag,
        iconLabel: app.iconLabel,
        iconColor: app.iconColor,
        tag: app.tag,
      },
    }));
  }

  createDesktopFolder(x, y) {
    document.dispatchEvent(new CustomEvent("browseros:create-folder", {
      detail: { x, y },
    }));
  }

  openApp(app, options = {}) {
    const NewWindow = document.createElement("window-c");
    const WindowCount = this.parentNode.querySelectorAll("window-c").length;
    NewWindow.setAttribute("window-index", String(Math.min(WindowCount, 5)));
    if (app.windowWidth) NewWindow.setAttribute("window-width", app.windowWidth);
    if (app.windowHeight) NewWindow.setAttribute("window-height", app.windowHeight);

    const AppComponent = document.createElement(app.componentTag);
    if (options.folderId) AppComponent.setAttribute("folder-id", options.folderId);
    if (options.selectedId) AppComponent.setAttribute("selected-id", options.selectedId);
    if (options.fileId) AppComponent.setAttribute("file-id", options.fileId);
    AppComponent.style.display = "block";
    AppComponent.style.width = "100%";
    AppComponent.style.height = "100%";
    NewWindow.appendChild(AppComponent);

    const WindowIcon = document.createElement("span");
    WindowIcon.dataset.windowIcon = "true";
    WindowIcon.dataset.iconLabel = app.iconLabel || app.name;
    WindowIcon.dataset.iconColor = app.iconColor || "#4f8cff";
    WindowIcon.dataset.iconName = app.name;
    WindowIcon.hidden = true;

    NewWindow.appendChild(WindowIcon);
    this.parentNode.appendChild(NewWindow);
    this.updateTaskbar();
    this.closeLauncher();
    document.dispatchEvent(new CustomEvent("browseros:notify", {
      detail: {
        title: app.name,
        message: "Window opened",
        tone: "success",
        duration: 1800,
      },
    }));
  }

  createIconElement(label, color = "#4f8cff", iconName = label) {
    const Icon = document.createElement("span");
    Icon.classList.add("fallback-icon");
    Icon.style.setProperty("--icon-color", color);
    Icon.innerHTML = this.createAppIconSvg(iconName || label);
    return Icon;
  }

  escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  createAppIconSvg(name) {
    const Key = name.toLowerCase();
    if (Key.includes("browser")) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M4 12h16M12 4c2.2 2.4 3.2 5.1 3.2 8S14.2 17.6 12 20M12 4C9.8 6.4 8.8 9.1 8.8 12s1 5.6 3.2 8"></path></svg>`;
    }
    if (Key.includes("settings")) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"></path><path d="m19 13.2.1-1.2-.1-1.2 2-1.5-2-3.4-2.4 1a8.2 8.2 0 0 0-2.1-1.2L12.2 3H8.8l-.4 2.7c-.8.3-1.5.7-2.1 1.2l-2.4-1-2 3.4 2 1.5-.1 1.2.1 1.2-2 1.5 2 3.4 2.4-1c.6.5 1.3.9 2.1 1.2l.4 2.7h3.4l.4-2.7c.8-.3 1.5-.7 2.1-1.2l2.4 1 2-3.4-2.1-1.5Z"></path></svg>`;
    }
    if (Key.includes("run")) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4.5v15l11-7.5-11-7.5Z"></path><path d="M4 7h3M3 12h4M4 17h3"></path></svg>`;
    }
    if (Key.includes("slide")) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="12" rx="2"></rect><path d="M8 20h8M12 17v3M8 13l2.4-2.4 2.1 2.1 2.8-3.2L18 13"></path></svg>`;
    }
    if (Key.includes("image")) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"></rect><circle cx="9" cy="10" r="1.4"></circle><path d="m6.8 16 4-4 2.8 2.8 1.7-1.7L18.5 16"></path></svg>`;
    }
    if (Key.includes("64") || Key.includes("base")) {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12"></path></svg>`;
    }
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="3"></rect><path d="M9 9h6v6H9z"></path></svg>`;
  }
}

customElements.define("taskbar-c", Taskbar);
