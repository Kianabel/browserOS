import { FileSystem } from "../components/filesystem.js";

export const name = "Notepad";
export const componentTag = "app-notepad";
export const iconLabel = "NP";
export const iconColor = "#22c55e";
export const tag = "Utility";
export const favorite = true;
export const windowWidth = "860px";
export const windowHeight = "600px";

class AppNotepad extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.fileId = null;
    this.content = "";
    this.fileName = "Untitled.txt";
    this.dirty = false;
  }

  static get observedAttributes() {
    return ["file-id"];
  }

  connectedCallback() {
    this.loadFile(this.getAttribute("file-id"));
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== "file-id" || oldValue === newValue) return;
    this.loadFile(newValue);
    if (this.isConnected) this.render();
  }

  loadFile(fileId) {
    const Node = fileId ? FileSystem.getNode(fileId) : null;
    if (!Node || Node.type !== "file") {
      this.fileId = null;
      this.content = "";
      this.fileName = "Untitled.txt";
      this.dirty = false;
      return;
    }

    this.fileId = Node.id;
    this.content = Node.content || "";
    this.fileName = Node.name || "Untitled.txt";
    this.dirty = false;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <section class="notepad">
        <header class="toolbar">
          <div class="document-title">
            <span class="doc-icon">${this.iconSvg("file")}</span>
            <div>
              <h2>${this.escapeHtml(this.fileName)}${this.dirty ? " *" : ""}</h2>
              <p>${this.fileId ? this.escapeHtml(this.getPathLabel()) : "New document"}</p>
            </div>
          </div>
          <div class="actions">
            <button type="button" data-action="new">${this.iconSvg("new")}<span>New</span></button>
            <button type="button" data-action="save">${this.iconSvg("save")}<span>Save</span></button>
            <button type="button" data-action="save-as">${this.iconSvg("save-as")}<span>Save as</span></button>
            <button type="button" data-action="rename" ${!this.fileId ? "disabled" : ""}>${this.iconSvg("edit")}<span>Rename</span></button>
          </div>
        </header>
        <textarea class="editor" spellcheck="false" placeholder="Start typing...">${this.escapeHtml(this.content)}</textarea>
        <footer class="status">
          <span>${this.content.length} chars</span>
          <span>${this.getWordCount()} words</span>
          <span>${this.dirty ? "Unsaved changes" : "Saved"}</span>
        </footer>
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
        color: #172033;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      .notepad {
        height: 100%;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
        background: #f7f8fb;
      }

      .toolbar,
      .status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.75rem 0.9rem;
        border-bottom: 0.0625rem solid rgba(15, 23, 42, 0.1);
        background: rgba(255, 255, 255, 0.82);
      }

      .document-title {
        min-width: 0;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: 0.7rem;
      }

      .doc-icon {
        width: 2.35rem;
        height: 2.35rem;
        display: grid;
        place-items: center;
        border-radius: 0.65rem;
        background: #22c55e;
        color: white;
      }

      h2,
      p {
        margin: 0;
      }

      h2 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 1rem;
        line-height: 1.2;
      }

      p,
      .status {
        color: rgba(23, 32, 51, 0.58);
        font-size: 0.75rem;
        font-weight: 700;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        overflow-x: auto;
      }

      button {
        min-height: 2.15rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        border: 0;
        border-radius: 0.55rem;
        padding: 0 0.7rem;
        background: #e8edf4;
        color: #172033;
        cursor: pointer;
        font: 800 0.76rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      button:hover {
        background: #dce4ef;
      }

      button:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .editor {
        width: 100%;
        height: 100%;
        min-height: 0;
        resize: none;
        border: 0;
        outline: none;
        padding: 1rem 1.1rem;
        background:
          linear-gradient(to right, rgba(34, 197, 94, 0.06) 0.0625rem, transparent 0.0625rem) 0 0 / 2.25rem 2.25rem,
          #fbfcff;
        color: #111827;
        font: 500 0.95rem/1.65 Consolas, "Courier New", monospace;
        tab-size: 2;
      }

      .status {
        justify-content: flex-start;
        border-top: 0.0625rem solid rgba(15, 23, 42, 0.1);
        border-bottom: 0;
        padding: 0.45rem 0.9rem;
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

      @media (max-width: 42rem) {
        .toolbar {
          align-items: stretch;
          flex-direction: column;
        }

        .actions {
          width: 100%;
        }
      }
    `;
  }

  bindEvents() {
    const Editor = this.shadowRoot.querySelector(".editor");
    Editor.addEventListener("input", (event) => {
      this.content = event.target.value;
      this.dirty = true;
      this.updateStatus();
    });
    Editor.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        this.save();
      }
    });

    this.shadowRoot.querySelector("[data-action='new']").addEventListener("click", () => this.newDocument());
    this.shadowRoot.querySelector("[data-action='save']").addEventListener("click", () => this.save());
    this.shadowRoot.querySelector("[data-action='save-as']").addEventListener("click", () => this.saveAs());
    this.shadowRoot.querySelector("[data-action='rename']").addEventListener("click", () => this.rename());
  }

  updateStatus() {
    const Title = this.shadowRoot.querySelector("h2");
    const Status = this.shadowRoot.querySelector(".status");
    if (Title) Title.textContent = `${this.fileName}${this.dirty ? " *" : ""}`;
    if (Status) {
      Status.innerHTML = `
        <span>${this.content.length} chars</span>
        <span>${this.getWordCount()} words</span>
        <span>${this.dirty ? "Unsaved changes" : "Saved"}</span>
      `;
    }
  }

  newDocument() {
    if (this.dirty && !confirm("Discard unsaved changes?")) return;
    this.fileId = null;
    this.fileName = "Untitled.txt";
    this.content = "";
    this.dirty = false;
    this.render();
  }

  save() {
    if (!this.fileId) {
      this.saveAs();
      return;
    }
    FileSystem.updateNode(this.fileId, { content: this.content });
    this.dirty = false;
    this.updateStatus();
    document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
  }

  saveAs() {
    const Name = prompt("Save as", this.fileName);
    if (!Name?.trim()) return;
    const File = FileSystem.createFile(FileSystem.DESKTOP_ID, Name.trim(), this.content);
    if (!File) return;
    this.fileId = File.id;
    this.fileName = File.name;
    this.dirty = false;
    this.render();
    document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
  }

  rename() {
    if (!this.fileId) return;
    const Name = prompt("Rename", this.fileName);
    if (!Name?.trim()) return;
    const File = FileSystem.renameNode(this.fileId, Name.trim());
    if (File) {
      this.fileName = File.name;
      this.render();
      document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
    }
  }

  getPathLabel() {
    return FileSystem.getPath(this.fileId).map((node) => node.name).join(" / ");
  }

  getWordCount() {
    return this.content.trim() ? this.content.trim().split(/\s+/).length : 0;
  }

  iconSvg(type) {
    const Icons = {
      edit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.5 4 4-.5L18.8 8.7l-3.5-3.5L4 16.5Z"></path><path d="m14 6.5 3.5 3.5"></path></svg>`,
      file: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z"></path><path d="M13 3.5V8h4M9 13h6M9 16h6"></path></svg>`,
      new: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z"></path><path d="M13 3.5V8h4M12 12v6M9 15h6"></path></svg>`,
      save: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h12l2 2v14H5V4Z"></path><path d="M8 4v6h8V4M8 20v-6h8v6"></path></svg>`,
      "save-as": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h12l2 2v14H5V4Z"></path><path d="M8 4v6h8V4M8 20v-5h5"></path><path d="m14 16 4 4M18 16l-4 4"></path></svg>`,
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

customElements.define(componentTag, AppNotepad);
