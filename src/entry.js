// Import components
import "./components/window-manager.js";
import "./components/taskbar.js";
import "./components/desktop.js";

// Import applications
import * as AppSettings from "./applications/app-settings.js";
import * as RandomSlideshow from "./applications/app-slideshow.js";
import * as Run3 from "./applications/app-run3.js";

export const availableApplications = [AppSettings, RandomSlideshow, Run3];

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
  background-color: white;
  overflow: hidden;
  background-image: url(../public/bg.jpg);
  background-repeat: no-repeat;
  background-size: cover;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */
  scrollbar-color: white transparent;
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(osContainer);
  }

  connectedCallback() {}
}

customElements.define("browser-os", BrowserOS);
