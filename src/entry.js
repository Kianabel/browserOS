// Import components
import "./components/window-manager.js";
import "./components/taskbar.js";
import "./components/desktop.js";

// Import applications
import * as AppSettings from "./applications/app-settings.js";
import * as Run3 from "./applications/app-run3.js";
import * as ImageViewer from "./applications/app-imageviewer.js"
import * as base64 from "./applications/app-base64.js"
import * as BrowserApp from "./applications/app-browser.js";
import * as FileBrowser from "./applications/app-filebrowser.js";
import * as Notepad from "./applications/app-notepad.js";

export const availableApplications = [FileBrowser, Notepad, BrowserApp, AppSettings, Run3, ImageViewer, base64];

class BrowserOS extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const osContainer = document.createElement("div");
    osContainer.classList.add("os-container");

    const desktop = document.createElement("desktop-c");
    const taskbar = document.createElement("taskbar-c");

    osContainer.appendChild(desktop);
    osContainer.appendChild(taskbar);

    const style = document.createElement("style");
    style.textContent = `
      .os-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        margin: 0;
        background-color: #131820;
        background-image:
          radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.18), transparent 23rem),
          linear-gradient(rgba(14, 18, 25, var(--browseros-wallpaper-dim, 0.42)), rgba(14, 18, 25, var(--browseros-wallpaper-dim, 0.42))),
          var(--browseros-wallpaper, url(../public/bg.jpg));
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        scrollbar-color: white transparent;
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(osContainer);
  }

  connectedCallback() {
    AppSettings.applySettings();
  }
}

customElements.define("browser-os", BrowserOS);
