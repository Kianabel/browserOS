import { FileSystem } from "../components/filesystem.js";

export const name = "Images";
export const iconLabel = "IM";
export const iconColor = "#7c3aed";
export const componentTag = "app-image-viewer";
export const tag = "Media";
export const favorite = false;
export const windowWidth = "900px";
export const windowHeight = "620px";

class ImageViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.selectedId = null;
    this.zoom = 1;
    this.fit = true;
  }

  connectedCallback() {
    const SelectedId = this.getAttribute("selected-id");
    if (SelectedId && FileSystem.getNode(SelectedId)) this.selectedId = SelectedId;
    this.render();
  }

  static get observedAttributes() {
    return ["selected-id"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== "selected-id" || oldValue === newValue) return;
    if (newValue && FileSystem.getNode(newValue)) {
      this.selectedId = newValue;
      if (this.isConnected) this.render();
    }
  }

  render() {
    const Images = this.getImageFiles();
    const Selected = this.selectedId ? FileSystem.getNode(this.selectedId) : Images[0] || null;
    if (!this.selectedId && Selected) this.selectedId = Selected.id;

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <section class="images-app">
        <aside class="library">
          <header class="library-header">
            <div>
              <h2>Images</h2>
              <p>${Images.length} saved image(s)</p>
            </div>
            <label class="import-button">
              ${this.iconSvg("upload")}
              <span>Import</span>
              <input type="file" accept="image/*" multiple>
            </label>
          </header>
          <div class="add-url">
            <input type="url" placeholder="Paste image URL" aria-label="Image URL">
            <button type="button" data-action="save-url">${this.iconSvg("save")}<span>Save</span></button>
          </div>
          <div class="thumb-list">
            ${Images.length ? Images.map((image) => this.renderThumb(image)).join("") : this.renderEmptyLibrary()}
          </div>
        </aside>
        <main class="viewer">
          <header class="viewer-toolbar">
            <div class="title-block">
              <h3>${Selected ? this.escapeHtml(Selected.name) : "No image selected"}</h3>
              <p>${Selected ? this.escapeHtml(Selected.metadata?.mimeType || "image") : "Import an image or save one by URL"}</p>
            </div>
            <div class="viewer-actions">
              <button type="button" data-action="zoom-out" ${!Selected ? "disabled" : ""}>${this.iconSvg("minus")}</button>
              <button type="button" data-action="fit" ${!Selected ? "disabled" : ""}>${this.fit ? "Fit" : `${Math.round(this.zoom * 100)}%`}</button>
              <button type="button" data-action="zoom-in" ${!Selected ? "disabled" : ""}>${this.iconSvg("plus")}</button>
              <button type="button" data-action="download" ${!Selected ? "disabled" : ""}>${this.iconSvg("download")}<span>Save</span></button>
              <button type="button" data-action="delete" ${!Selected ? "disabled" : ""}>${this.iconSvg("trash")}</button>
            </div>
          </header>
          <div class="stage">
            ${Selected ? this.renderSelectedImage(Selected) : this.renderEmptyStage()}
          </div>
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
        color: #eef2ff;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      .images-app {
        height: 100%;
        display: grid;
        grid-template-columns: 18rem minmax(0, 1fr);
        background: #10131c;
        overflow: hidden;
      }

      .library {
        min-width: 0;
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr);
        gap: 0.75rem;
        padding: 0.85rem;
        border-right: 0.0625rem solid rgba(255, 255, 255, 0.09);
        background: #151a26;
      }

      .library-header,
      .viewer-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      h2,
      h3 {
        font-size: 1rem;
        line-height: 1.2;
      }

      p,
      .meta {
        color: rgba(238, 242, 255, 0.58);
        font-size: 0.74rem;
        line-height: 1.3;
        font-weight: 700;
      }

      button,
      .import-button {
        min-height: 2.1rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        border: 0;
        border-radius: 0.55rem;
        padding: 0 0.7rem;
        background: rgba(255, 255, 255, 0.1);
        color: #eef2ff;
        cursor: pointer;
        font: 800 0.75rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
      }

      button:hover,
      .import-button:hover,
      .thumb:hover,
      .thumb.active {
        background: rgba(255, 255, 255, 0.16);
      }

      button:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .import-button input {
        display: none;
      }

      .add-url {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.45rem;
      }

      input {
        min-width: 0;
        height: 2.1rem;
        border: 0.0625rem solid rgba(255, 255, 255, 0.14);
        border-radius: 0.55rem;
        padding: 0 0.65rem;
        background: rgba(255, 255, 255, 0.08);
        color: #eef2ff;
        outline: none;
      }

      input:focus {
        border-color: rgba(168, 85, 247, 0.85);
      }

      .thumb-list {
        min-height: 0;
        display: grid;
        align-content: start;
        gap: 0.5rem;
        overflow: auto;
      }

      .thumb {
        min-width: 0;
        display: grid;
        grid-template-columns: 4rem minmax(0, 1fr);
        align-items: center;
        gap: 0.6rem;
        border: 0;
        border-radius: 0.7rem;
        padding: 0.45rem;
        background: rgba(255, 255, 255, 0.06);
        color: #eef2ff;
        text-align: left;
      }

      .thumb img {
        width: 4rem;
        height: 3.2rem;
        border-radius: 0.45rem;
        object-fit: cover;
        background: rgba(255, 255, 255, 0.08);
      }

      .thumb strong {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.78rem;
      }

      .viewer {
        min-width: 0;
        min-height: 0;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
      }

      .viewer-toolbar {
        min-width: 0;
        padding: 0.75rem 0.9rem;
        border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.09);
        background: rgba(255, 255, 255, 0.04);
      }

      .title-block {
        min-width: 0;
      }

      .title-block h3,
      .title-block p {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .viewer-actions {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .stage {
        min-width: 0;
        min-height: 0;
        display: grid;
        place-items: center;
        overflow: auto;
        padding: 1rem;
        background:
          linear-gradient(45deg, rgba(255,255,255,0.045) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(255,255,255,0.045) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.045) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.045) 75%),
          #0c0f17;
        background-size: 1.5rem 1.5rem;
        background-position: 0 0, 0 0.75rem, 0.75rem -0.75rem, -0.75rem 0;
      }

      .stage img {
        display: block;
        max-width: ${this.fit ? "100%" : "none"};
        max-height: ${this.fit ? "100%" : "none"};
        object-fit: contain;
        transform: scale(${this.fit ? 1 : this.zoom});
        transform-origin: center;
        border-radius: 0.4rem;
        box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.35);
      }

      .empty {
        max-width: 18rem;
        text-align: center;
        color: rgba(238, 242, 255, 0.62);
      }

      svg {
        width: 1.05rem;
        height: 1.05rem;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.9;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      @media (max-width: 48rem) {
        .images-app {
          grid-template-columns: 1fr;
        }

        .library {
          max-height: 13rem;
          border-right: 0;
          border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.09);
        }
      }
    `;
  }

  bindEvents() {
    this.shadowRoot.querySelector("input[type='file']")?.addEventListener("change", (event) => this.importFiles(event.target.files));
    this.shadowRoot.querySelector("[data-action='save-url']")?.addEventListener("click", () => this.saveUrl());
    this.shadowRoot.querySelectorAll(".thumb").forEach((button) => {
      button.addEventListener("click", () => {
        this.selectedId = button.dataset.id;
        this.fit = true;
        this.zoom = 1;
        this.render();
      });
    });
    this.shadowRoot.querySelector("[data-action='zoom-in']")?.addEventListener("click", () => this.zoomBy(0.15));
    this.shadowRoot.querySelector("[data-action='zoom-out']")?.addEventListener("click", () => this.zoomBy(-0.15));
    this.shadowRoot.querySelector("[data-action='fit']")?.addEventListener("click", () => {
      this.fit = !this.fit;
      if (this.fit) this.zoom = 1;
      this.render();
    });
    this.shadowRoot.querySelector("[data-action='download']")?.addEventListener("click", () => this.downloadSelected());
    this.shadowRoot.querySelector("[data-action='delete']")?.addEventListener("click", () => this.deleteSelected());
    this.shadowRoot.querySelector(".stage")?.addEventListener("wheel", (event) => {
      if (!this.selectedId) return;
      event.preventDefault();
      this.zoomBy(event.deltaY < 0 ? 0.1 : -0.1);
    });
  }

  getImageFiles() {
    const Tree = FileSystem.loadTree();
    return Object.values(Tree.nodes)
      .filter((node) => node.type === "file" && String(node.metadata?.mimeType || "").startsWith("image/"))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  renderThumb(image) {
    return `
      <button class="thumb ${image.id === this.selectedId ? "active" : ""}" type="button" data-id="${image.id}">
        <img src="${this.escapeHtml(image.content || image.metadata?.sourceUrl || "")}" alt="">
        <span>
          <strong>${this.escapeHtml(image.name)}</strong>
          <span class="meta">${this.escapeHtml(image.metadata?.mimeType || "image")}</span>
        </span>
      </button>
    `;
  }

  renderSelectedImage(image) {
    return `<img src="${this.escapeHtml(image.content || image.metadata?.sourceUrl || "")}" alt="${this.escapeHtml(image.name)}">`;
  }

  renderEmptyLibrary() {
    return `<div class="empty"><p>No saved images yet.</p></div>`;
  }

  renderEmptyStage() {
    return `<div class="empty"><h3>No image selected</h3><p>Import a local image or save an image URL to add it to the filesystem.</p></div>`;
  }

  importFiles(fileList) {
    const Files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    if (!Files.length) return;

    let Remaining = Files.length;
    Files.forEach((file) => {
      const Reader = new FileReader();
      Reader.addEventListener("load", () => {
        const ImageFile = FileSystem.createFile(FileSystem.DESKTOP_ID, file.name, Reader.result, {
          mimeType: file.type,
          iconColor: "#7c3aed",
          source: "upload",
          size: file.size,
        });
        this.selectedId = ImageFile?.id || this.selectedId;
        Remaining -= 1;
        if (Remaining === 0) {
          document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
          this.render();
        }
      });
      Reader.readAsDataURL(file);
    });
  }

  saveUrl() {
    const Input = this.shadowRoot.querySelector(".add-url input");
    const Url = Input?.value.trim();
    if (!Url) return;
    const Name = this.nameFromUrl(Url);
    const File = FileSystem.createFile(FileSystem.DESKTOP_ID, Name, Url, {
      mimeType: this.mimeFromName(Name),
      iconColor: "#7c3aed",
      source: "url",
      sourceUrl: Url,
    });
    this.selectedId = File?.id || null;
    document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
    this.render();
  }

  nameFromUrl(url) {
    try {
      const Parsed = new URL(url);
      const Name = decodeURIComponent(Parsed.pathname.split("/").filter(Boolean).pop() || "Saved image");
      return /\.[a-z0-9]{2,5}$/i.test(Name) ? Name : `${Name}.jpg`;
    } catch {
      return "Saved image.jpg";
    }
  }

  mimeFromName(name) {
    const Lower = name.toLowerCase();
    if (Lower.endsWith(".png")) return "image/png";
    if (Lower.endsWith(".gif")) return "image/gif";
    if (Lower.endsWith(".webp")) return "image/webp";
    if (Lower.endsWith(".svg")) return "image/svg+xml";
    return "image/jpeg";
  }

  zoomBy(delta) {
    this.fit = false;
    this.zoom = Math.max(0.2, Math.min(4, this.zoom + delta));
    this.render();
  }

  downloadSelected() {
    const Image = FileSystem.getNode(this.selectedId);
    if (!Image) return;
    const Link = document.createElement("a");
    Link.href = Image.content || Image.metadata?.sourceUrl || "";
    Link.download = Image.name;
    Link.target = "_blank";
    Link.rel = "noreferrer";
    Link.click();
  }

  deleteSelected() {
    const Image = FileSystem.getNode(this.selectedId);
    if (!Image || !confirm(`Delete "${Image.name}"?`)) return;
    FileSystem.deleteNode(Image.id);
    this.selectedId = null;
    document.dispatchEvent(new CustomEvent("browseros:filesystem-changed"));
    this.render();
  }

  iconSvg(type) {
    const Icons = {
      download: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10"></path><path d="m8 10 4 4 4-4"></path><path d="M5 20h14"></path></svg>`,
      minus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path></svg>`,
      plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>`,
      save: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h12l2 2v14H5V4Z"></path><path d="M8 4v6h8V4M8 20v-6h8v6"></path></svg>`,
      trash: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"></path></svg>`,
      upload: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V10"></path><path d="m8 14 4-4 4 4"></path><path d="M5 4h14"></path></svg>`,
    };
    return Icons[type] || Icons.save;
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

customElements.define(componentTag, ImageViewer);
