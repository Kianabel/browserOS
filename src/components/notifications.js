class Notifications extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.items = [];
    this.notifyHandler = this.notifyHandler.bind(this);
  }

  connectedCallback() {
    this.render();
    document.addEventListener("browseros:notify", this.notifyHandler);
  }

  disconnectedCallback() {
    document.removeEventListener("browseros:notify", this.notifyHandler);
  }

  notifyHandler(event) {
    const Detail = event.detail || {};
    const Id = `notice-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const Item = {
      id: Id,
      title: Detail.title || "BrowserOS",
      message: Detail.message || "",
      tone: Detail.tone || "info",
    };
    this.items = [Item, ...this.items].slice(0, 4);
    this.render();
    window.setTimeout(() => this.dismiss(Id), Detail.duration || 3600);
  }

  dismiss(id) {
    const Next = this.items.filter((item) => item.id !== id);
    if (Next.length === this.items.length) return;
    this.items = Next;
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          right: 1rem;
          bottom: calc(var(--browseros-taskbar-height, 3.45rem) + 2rem);
          z-index: 1800;
          pointer-events: none;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .stack {
          display: grid;
          gap: 0.55rem;
          width: min(22rem, calc(100vw - 2rem));
        }

        .toast {
          pointer-events: auto;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 0.65rem;
          align-items: start;
          min-width: 0;
          padding: 0.8rem;
          border-radius: 0.85rem;
          border: 0.0625rem solid rgba(255, 255, 255, 0.24);
          background: rgba(16, 22, 30, 0.9);
          color: white;
          box-shadow: 0 1rem 2.75rem rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(22px);
        }

        .mark {
          width: 0.75rem;
          height: 0.75rem;
          margin-top: 0.15rem;
          border-radius: 999px;
          background: #38bdf8;
          box-shadow: 0 0 0 0.3rem rgba(56, 189, 248, 0.14);
        }

        .toast[data-tone="success"] .mark {
          background: #22c55e;
          box-shadow: 0 0 0 0.3rem rgba(34, 197, 94, 0.14);
        }

        .toast[data-tone="warning"] .mark {
          background: #f59e0b;
          box-shadow: 0 0 0 0.3rem rgba(245, 158, 11, 0.14);
        }

        h3,
        p {
          margin: 0;
        }

        h3 {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.86rem;
          line-height: 1.2;
        }

        p {
          margin-top: 0.18rem;
          color: rgba(255, 255, 255, 0.66);
          font-size: 0.76rem;
          line-height: 1.35;
        }

        button {
          width: 1.7rem;
          height: 1.7rem;
          border: 0;
          border-radius: 0.45rem;
          background: transparent;
          color: rgba(255, 255, 255, 0.72);
          cursor: pointer;
          font: 900 1rem/1 Inter, ui-sans-serif, system-ui, sans-serif;
        }

        button:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }
      </style>
      <div class="stack">
        ${this.items.map((item) => `
          <article class="toast" data-tone="${this.escapeHtml(item.tone)}">
            <span class="mark"></span>
            <div>
              <h3>${this.escapeHtml(item.title)}</h3>
              ${item.message ? `<p>${this.escapeHtml(item.message)}</p>` : ""}
            </div>
            <button type="button" data-dismiss="${this.escapeHtml(item.id)}" aria-label="Dismiss">x</button>
          </article>
        `).join("")}
      </div>
    `;

    this.shadowRoot.querySelectorAll("[data-dismiss]").forEach((button) => {
      button.addEventListener("click", () => this.dismiss(button.dataset.dismiss));
    });
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

customElements.define("notifications-c", Notifications);
