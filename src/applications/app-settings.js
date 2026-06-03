import { FileSystem } from "../components/filesystem.js";

export const name = "Settings";
export const iconLabel = "SE";
export const iconColor = "#64748b";
export const componentTag = "app-settings";
export const tag = "System";
export const favorite = true;
export const windowWidth = "780px";
export const windowHeight = "560px";

const SETTINGS_KEY = "browserOS:settings";
const DEFAULT_SETTINGS = {
  accent: "#38bdf8",
  wallpaper: "../public/bg.jpg",
  wallpaperDim: 42,
  showDesktopIcons: true,
  compactTaskbar: false,
  windowScale: "comfortable",
};

export function loadSettings() {
  try {
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  const Next = { ...DEFAULT_SETTINGS, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(Next));
  applySettings(Next);
  document.dispatchEvent(new CustomEvent("browseros:settings-changed", { detail: Next }));
  return Next;
}

export function applySettings(settings = loadSettings()) {
  const Root = document.documentElement;
  Root.style.setProperty("--browseros-accent", settings.accent);
  Root.style.setProperty("--browseros-wallpaper", `url(${settings.wallpaper || DEFAULT_SETTINGS.wallpaper})`);
  Root.style.setProperty("--browseros-wallpaper-dim", `${Number(settings.wallpaperDim) / 100}`);
  Root.style.setProperty("--browseros-taskbar-height", settings.compactTaskbar ? "3rem" : "3.45rem");
  Root.toggleAttribute("browseros-hide-desktop-icons", !settings.showDesktopIcons);
  Root.dataset.browserosWindowScale = settings.windowScale;
}

class AppSettings extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.settings = loadSettings();
  }

  connectedCallback() {
    applySettings(this.settings);
    this.render();
  }

  render() {
    const Stats = this.getStats();
    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <section class="settings-app">
        <aside class="sidebar">
          <div class="brand">
            <span>${this.iconSvg("settings")}</span>
            <div>
              <h2>Settings</h2>
              <p>System preferences</p>
            </div>
          </div>
          <a href="#appearance">Appearance</a>
          <a href="#desktop">Desktop</a>
          <a href="#storage">Storage</a>
        </aside>
        <main class="content">
          <section class="panel" id="appearance">
            <header>
              <h3>Appearance</h3>
              <p>Change the desktop feel without touching app data.</p>
            </header>
            <label class="row">
              <span>
                <strong>Accent color</strong>
                <small>Used by system highlights and future app chrome.</small>
              </span>
              <input type="color" data-setting="accent" value="${this.escapeHtml(this.settings.accent)}">
            </label>
            <label class="row">
              <span>
                <strong>Wallpaper URL</strong>
                <small>Local paths or remote image URLs are both fine.</small>
              </span>
              <input type="text" data-setting="wallpaper" value="${this.escapeHtml(this.settings.wallpaper)}">
            </label>
            <label class="row">
              <span>
                <strong>Wallpaper dim</strong>
                <small>Darken the wallpaper for readability.</small>
              </span>
              <input type="range" data-setting="wallpaperDim" min="0" max="75" value="${this.escapeHtml(this.settings.wallpaperDim)}">
            </label>
          </section>

          <section class="panel" id="desktop">
            <header>
              <h3>Desktop</h3>
              <p>Small OS shell preferences that persist in localStorage.</p>
            </header>
            <label class="row">
              <span>
                <strong>Desktop icons</strong>
                <small>Hide icons without deleting filesystem items.</small>
              </span>
              <input type="checkbox" data-setting="showDesktopIcons" ${this.settings.showDesktopIcons ? "checked" : ""}>
            </label>
            <label class="row">
              <span>
                <strong>Compact taskbar</strong>
                <small>Use a tighter taskbar height.</small>
              </span>
              <input type="checkbox" data-setting="compactTaskbar" ${this.settings.compactTaskbar ? "checked" : ""}>
            </label>
            <label class="row">
              <span>
                <strong>Window density</strong>
                <small>Controls the preferred default app size.</small>
              </span>
              <select data-setting="windowScale">
                ${["compact", "comfortable", "large"].map((option) => `<option value="${option}" ${this.settings.windowScale === option ? "selected" : ""}>${option}</option>`).join("")}
              </select>
            </label>
          </section>

          <section class="panel" id="storage">
            <header>
              <h3>Storage</h3>
              <p>Everything here lives in plain JSON in localStorage.</p>
            </header>
            <div class="stats">
              <div><strong>${Stats.nodes}</strong><span>Items</span></div>
              <div><strong>${Stats.folders}</strong><span>Folders</span></div>
              <div><strong>${Stats.files}</strong><span>Files</span></div>
              <div><strong>${Stats.images}</strong><span>Images</span></div>
            </div>
            <div class="actions">
              <button type="button" data-action="export">${this.iconSvg("download")}<span>Export filesystem</span></button>
              <button type="button" data-action="reset-favorites">${this.iconSvg("star")}<span>Reset favorites</span></button>
              <button type="button" data-action="reset-settings">${this.iconSvg("reset")}<span>Reset settings</span></button>
            </div>
          </section>
        </main>
      </section>
    `;
    this.bindEvents();
  }

  styles() {
    return `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        color: #1e293b;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      .settings-app {
        height: 100%;
        display: grid;
        grid-template-columns: 13.5rem minmax(0, 1fr);
        background: #eef2f7;
        overflow: hidden;
      }

      .sidebar {
        display: grid;
        align-content: start;
        gap: 0.45rem;
        padding: 0.9rem;
        background: #111827;
        color: white;
      }

      .brand {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: 0.65rem;
        margin-bottom: 0.7rem;
      }

      .brand > span {
        width: 2.25rem;
        height: 2.25rem;
        display: grid;
        place-items: center;
        border-radius: 0.65rem;
        background: #64748b;
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      h2 {
        font-size: 1rem;
      }

      h3 {
        font-size: 1.05rem;
      }

      p,
      small {
        color: rgba(30, 41, 59, 0.58);
        font-size: 0.76rem;
        line-height: 1.35;
        font-weight: 650;
      }

      .brand p {
        color: rgba(255, 255, 255, 0.56);
      }

      .sidebar a {
        border-radius: 0.55rem;
        padding: 0.65rem 0.7rem;
        color: rgba(255, 255, 255, 0.82);
        text-decoration: none;
        font-size: 0.82rem;
        font-weight: 800;
      }

      .sidebar a:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .content {
        min-width: 0;
        display: grid;
        align-content: start;
        gap: 0.9rem;
        padding: 1rem;
        overflow: auto;
      }

      .panel {
        display: grid;
        gap: 0.75rem;
        border: 0.0625rem solid #dbe3ee;
        border-radius: 0.85rem;
        padding: 0.9rem;
        background: rgba(255, 255, 255, 0.86);
      }

      .row {
        min-height: 3.5rem;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(10rem, 14rem);
        align-items: center;
        gap: 1rem;
        border-top: 0.0625rem solid #edf1f6;
        padding-top: 0.75rem;
      }

      .row:first-of-type {
        border-top: 0;
        padding-top: 0;
      }

      .row strong {
        display: block;
        font-size: 0.88rem;
      }

      input,
      select {
        min-width: 0;
        height: 2.15rem;
        border: 0.0625rem solid #cbd5e1;
        border-radius: 0.55rem;
        padding: 0 0.65rem;
        background: white;
        color: #1e293b;
        font: 750 0.78rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      input[type="checkbox"] {
        justify-self: end;
        width: 1.15rem;
        height: 1.15rem;
      }

      input[type="color"] {
        padding: 0.2rem;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.6rem;
      }

      .stats div {
        min-width: 0;
        border-radius: 0.7rem;
        padding: 0.75rem;
        background: #f1f5f9;
      }

      .stats strong,
      .stats span {
        display: block;
      }

      .stats strong {
        font-size: 1.2rem;
      }

      .stats span {
        color: rgba(30, 41, 59, 0.58);
        font-size: 0.72rem;
        font-weight: 800;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      button {
        min-height: 2.15rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        border: 0;
        border-radius: 0.55rem;
        padding: 0 0.75rem;
        background: #dfe7f1;
        color: #1e293b;
        cursor: pointer;
        font: 850 0.76rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      button:hover {
        background: #d2ddea;
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

      @media (max-width: 44rem) {
        .settings-app {
          grid-template-columns: 1fr;
        }

        .sidebar {
          display: none;
        }

        .row {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  bindEvents() {
    this.shadowRoot.querySelectorAll("[data-setting]").forEach((Control) => {
      Control.addEventListener("input", () => this.updateSetting(Control));
      Control.addEventListener("change", () => this.updateSetting(Control));
    });
    this.shadowRoot.querySelector("[data-action='export']").addEventListener("click", () => this.exportFilesystem());
    this.shadowRoot.querySelector("[data-action='reset-favorites']").addEventListener("click", () => this.resetFavorites());
    this.shadowRoot.querySelector("[data-action='reset-settings']").addEventListener("click", () => this.resetSettings());
  }

  updateSetting(control) {
    const Key = control.dataset.setting;
    const Value = control.type === "checkbox" ? control.checked : control.value;
    this.settings = saveSettings({ ...this.settings, [Key]: Value });
  }

  getStats() {
    const Nodes = Object.values(FileSystem.loadTree().nodes);
    return {
      nodes: Nodes.length,
      folders: Nodes.filter((node) => node.type === "folder").length,
      files: Nodes.filter((node) => node.type === "file").length,
      images: Nodes.filter((node) => String(node.metadata?.mimeType || "").startsWith("image/")).length,
    };
  }

  exportFilesystem() {
    const Text = FileSystem.exportTree();
    navigator.clipboard?.writeText(Text);
    prompt("Filesystem JSON copied when clipboard access is available.", Text);
  }

  resetFavorites() {
    if (!confirm("Reset favorite apps?")) return;
    localStorage.removeItem("browserOS:favorites");
    document.dispatchEvent(new CustomEvent("browseros:settings-changed"));
  }

  resetSettings() {
    if (!confirm("Reset settings?")) return;
    localStorage.removeItem(SETTINGS_KEY);
    this.settings = saveSettings(DEFAULT_SETTINGS);
    this.render();
  }

  iconSvg(type) {
    const Icons = {
      download: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10"></path><path d="m8 10 4 4 4-4"></path><path d="M5 20h14"></path></svg>`,
      reset: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7"></path><path d="M4 5v5h5"></path></svg>`,
      settings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"></path><path d="m19 13.2.1-1.2-.1-1.2 2-1.5-2-3.4-2.4 1a8.2 8.2 0 0 0-2.1-1.2L12.2 3H8.8l-.4 2.7c-.8.3-1.5.7-2.1 1.2l-2.4-1-2 3.4 2 1.5-.1 1.2.1 1.2-2 1.5 2 3.4 2.4-1c.6.5 1.3.9 2.1 1.2l.4 2.7h3.4l.4-2.7c.8-.3 1.5-.7 2.1-1.2l2.4 1 2-3.4-2.1-1.5Z"></path></svg>`,
      star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z"></path></svg>`,
    };
    return Icons[type] || Icons.settings;
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

customElements.define(componentTag, AppSettings);
