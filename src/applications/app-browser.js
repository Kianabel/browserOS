export const name = "Browser";
export const iconLabel = "Br";
export const iconColor = "#0891b2";
export const componentTag = "app-browser";
export const windowWidth = "50rem";
export const windowHeight = "33rem";
export const tag = "Web";
export const favorite = true;

class BrowserApp extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    const container = document.createElement("div");
    container.classList.add("browser-app");
    container.innerHTML = `
      <form class="toolbar">
        <input id="address" type="search" autocomplete="off" spellcheck="false" value="https://www.google.com/webhp?igu=1" aria-label="Search or enter a URL">
        <button type="submit">Go</button>
      </form>
      <section class="blocked-notice" hidden>
        <div>
          <h2>This site blocks embedded browsers</h2>
          <p id="blockedMessage"></p>
          <button id="openExternal" type="button">Open in real browser</button>
        </div>
      </section>
      <iframe title="Browser app content" referrerpolicy="no-referrer" src="https://www.google.com/webhp?igu=1"></iframe>
    `;

    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .browser-app {
        display: grid;
        grid-template-rows: 3.25rem minmax(0, 1fr);
        width: 100%;
        height: 100%;
        background: #eef2f7;
        color: #111827;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .toolbar {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.6rem;
        align-items: center;
        padding: 0.65rem;
        border-bottom: 0.0625rem solid #d7dee8;
        background: #f8fafc;
        box-sizing: border-box;
      }

      input {
        min-width: 0;
        height: 2.1rem;
        border: 0.0625rem solid #cbd5e1;
        border-radius: 0.45rem;
        padding: 0 0.75rem;
        color: #111827;
        background: white;
        font: 500 0.9rem/1.2 inherit;
        outline: none;
      }

      input:focus {
        border-color: #0891b2;
        box-shadow: 0 0 0 0.1875rem rgba(8, 145, 178, 0.16);
      }

      button {
        height: 2.1rem;
        border: 0;
        border-radius: 0.45rem;
        padding: 0 0.9rem;
        background: #0891b2;
        color: white;
        font: 700 0.85rem/1 inherit;
        cursor: pointer;
      }

      button:hover {
        background: #0e7490;
      }

      iframe {
        grid-row: 2;
        min-height: 0;
        width: 100%;
        height: 100%;
        border: 0;
        background: white;
      }

      .blocked-notice {
        grid-row: 2;
        min-height: 0;
        display: grid;
        place-items: center;
        padding: 1.5rem;
        background: #eef2f7;
      }

      .blocked-notice[hidden] {
        display: none;
      }

      .blocked-notice div {
        max-width: 28rem;
        padding: 1.25rem;
        border: 1px solid #d7dee8;
        border-radius: 0.75rem;
        background: white;
        box-shadow: 0 0.75rem 2rem rgba(15, 23, 42, 0.08);
      }

      .blocked-notice h2 {
        margin: 0;
        color: #111827;
        font-size: 1.15rem;
        line-height: 1.25;
      }

      .blocked-notice p {
        margin: 0.55rem 0 1rem;
        color: #64748b;
        font-size: 0.92rem;
        line-height: 1.45;
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);

    const form = shadow.querySelector("form");
    const input = shadow.getElementById("address");
    const frame = shadow.querySelector("iframe");
    const blockedNotice = shadow.querySelector(".blocked-notice");
    const blockedMessage = shadow.getElementById("blockedMessage");
    const openExternal = shadow.getElementById("openExternal");
    let externalTarget = "";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const target = this.resolveTarget(input.value);
      input.value = target.displayValue;

      if (target.blocked) {
        externalTarget = target.externalUrl;
        blockedMessage.textContent = target.message;
        blockedNotice.hidden = false;
        frame.hidden = true;
        return;
      }

      blockedNotice.hidden = true;
      frame.hidden = false;
      frame.src = target.url;
    });

    openExternal.addEventListener("click", () => {
      if (externalTarget) {
        window.open(externalTarget, "_blank", "noopener,noreferrer");
      }
    });
  }

  resolveTarget(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return {
        displayValue: "https://www.google.com/webhp?igu=1",
        url: "https://www.google.com/webhp?igu=1",
      };
    }

    const urlLikeValue = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : trimmed.includes(".") && !trimmed.includes(" ")
        ? `https://${trimmed}`
        : null;

    if (this.isYoutubeShortcut(trimmed)) {
      return this.blockedTarget("https://www.youtube.com", "YouTube does not allow its homepage or search pages to render inside iframes. Open it as a real browser tab so YouTube sees a normal top-level visit.");
    }

    if (urlLikeValue) {
      const youtubeEmbedUrl = this.toYoutubeEmbedUrl(urlLikeValue);
      if (youtubeEmbedUrl) {
        return {
          displayValue: urlLikeValue,
          url: youtubeEmbedUrl,
        };
      }

      if (this.isBlockedEmbedUrl(urlLikeValue)) {
        return this.blockedTarget(urlLikeValue, "This site refuses to load inside embedded browsers. Open it as a normal tab instead.");
      }

      return {
        displayValue: urlLikeValue,
        url: urlLikeValue,
      };
    }

    return {
      displayValue: trimmed,
      url: `https://www.google.com/search?igu=1&q=${encodeURIComponent(trimmed)}`,
    };
  }

  blockedTarget(externalUrl, message) {
    return {
      blocked: true,
      displayValue: externalUrl,
      externalUrl,
      message,
    };
  }

  isYoutubeShortcut(value) {
    return /^(youtube|yt)$/i.test(value.trim());
  }

  isBlockedEmbedUrl(value) {
    try {
      const url = new URL(value);
      return /(^|\.)youtube\.com$/i.test(url.hostname) || /(^|\.)youtu\.be$/i.test(url.hostname);
    } catch {
      return false;
    }
  }

  toYoutubeEmbedUrl(value) {
    try {
      const url = new URL(value);

      if (/youtu\.be$/i.test(url.hostname)) {
        const videoId = url.pathname.replace("/", "");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }

      if (/(^|\.)youtube\.com$/i.test(url.hostname) && url.pathname === "/watch") {
        const videoId = url.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }
    } catch {
      return "";
    }

    return "";
  }
}

customElements.define(componentTag, BrowserApp);
