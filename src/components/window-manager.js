class CustomWindow extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    // Window structure
    const container = document.createElement("div");
    container.classList.add("windowClass");

    const topBar = document.createElement("div");
    topBar.classList.add("topBar");

    const minimizeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    minimizeIcon.setAttribute("fill", "none");
    minimizeIcon.setAttribute("viewBox", "0 0 24 24");
    minimizeIcon.setAttribute("stroke-width", "1.3");
    minimizeIcon.setAttribute("stroke", "currentColor");
    minimizeIcon.classList.add("icon", "minimize");

    const minimizePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    minimizePath.setAttribute("stroke-linecap", "round");
    minimizePath.setAttribute("stroke-linejoin", "round");
    minimizePath.setAttribute("d", "M5 12h14");
    minimizeIcon.appendChild(minimizePath);

    const fullWindowIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    fullWindowIcon.setAttribute("fill", "none");
    fullWindowIcon.setAttribute("viewBox", "0 0 24 24");
    fullWindowIcon.setAttribute("stroke-width", "1.3");
    fullWindowIcon.setAttribute("stroke", "currentColor");
    fullWindowIcon.classList.add("icon", "makefull-window");

    const fullWindowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    fullWindowPath.setAttribute("stroke-linecap", "round");
    fullWindowPath.setAttribute("stroke-linejoin", "round");
    fullWindowPath.setAttribute(
      "d",
      "M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
    );
    fullWindowIcon.appendChild(fullWindowPath);

    const closeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    closeIcon.setAttribute("fill", "none");
    closeIcon.setAttribute("viewBox", "0 0 24 24");
    closeIcon.setAttribute("stroke-width", "1.3");
    closeIcon.setAttribute("stroke", "currentColor");
    closeIcon.classList.add("icon", "closeWindow");

    const closePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    closePath.setAttribute("stroke-linecap", "round");
    closePath.setAttribute("stroke-linejoin", "round");
    closePath.setAttribute("d", "M6 18 18 6M6 6l12 12");
    closeIcon.appendChild(closePath);

    topBar.appendChild(minimizeIcon);
    topBar.appendChild(fullWindowIcon);
    topBar.appendChild(closeIcon);

    const resizeHandle = document.createElement("div");
    resizeHandle.classList.add("resize-handle", "bottom-right");

    container.appendChild(topBar);
    container.appendChild(resizeHandle);

    // Attach
    shadow.appendChild(container);

    // Apply styles
    const style = document.createElement("style");
    style.textContent = `
      .windowClass {
        height: 360px;
        width: 480px;
        position: absolute;
        min-height: 144px;
        min-width: 192px;
        border-radius: 10px;
        background-color: ${this.getRandomColor()};
      }

      .topBar {
        width: inherit;
        height: 33px;
        background-color: #3f3f3f;
        border-top-left-radius: 7px;
        border-top-right-radius: 7px;
        display: flex;
        justify-content: right;
      }

      .icon {
        margin: 2px 6px 0 0;
        color: rgb(131, 131, 131);
        cursor: pointer;
        width: 30px;
        height: 30px;
      }

      .icon:hover {
        transform: scale(1.1);
      }

      .icon:active {
        color: rgb(141, 141, 141);
      }

      .resize-handle {
        position: absolute;
        width: 10px;
        height: 10px;
        background-color: rgba(0, 0, 0, 0.342);
      }

      .bottom-right {
        right: 0;
        bottom: 0;
        cursor: nwse-resize;
        border-bottom-right-radius: 7px;
      }
    `;

    shadow.appendChild(style);

    // Add interaction logic
    this.initInteractions(container, topBar, resizeHandle);
  }

  getRandomColor() {
    let randomColor = "#" + (((1 << 24) * Math.random()) | 0).toString(16);
    return randomColor;
  }

  initInteractions(container, topBar, resizeHandle) {
    let isFullScreen = false;
    let previousSize = {};

    // Handle window focus
    container.addEventListener("mousedown", () => this.setZ(container));

    // Minimize
    const minimizeIcon = topBar.querySelector(".minimize");
    minimizeIcon.addEventListener("click", () => {
      container.style.display = "none";
    });

    // Maximize/Restore
    const fullWindowIcon = topBar.querySelector(".makefull-window");
    fullWindowIcon.addEventListener("click", () => {
      if (!isFullScreen) {
        previousSize.width = container.style.width;
        previousSize.height = container.style.height;
        previousSize.left = container.style.left;
        previousSize.top = container.style.top;

        container.style.width = window.innerWidth + "px";
        container.style.height = window.innerHeight + "px";
        container.style.left = "0px";
        container.style.top = "0px";
        isFullScreen = true;
      } else {
        container.style.width = previousSize.width;
        container.style.height = previousSize.height;
        container.style.left = previousSize.left;
        container.style.top = previousSize.top;
        isFullScreen = false;
      }
    });

    // Close
    const closeIcon = topBar.querySelector(".closeWindow");
    closeIcon.addEventListener("click", () => {
      container.remove();
    });

    // Dragging
    topBar.addEventListener("mousedown", (event) => {
      const offsetX = event.clientX - container.offsetLeft;
      const offsetY = event.clientY - container.offsetTop;

      function onMouseMove(e) {
        container.style.left = e.clientX - offsetX + "px";
        container.style.top = e.clientY - offsetY + "px";
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    // Resizing
    resizeHandle.addEventListener("mousedown", (event) => {
      const initialWidth = container.offsetWidth;
      const initialHeight = container.offsetHeight;
      const startX = event.clientX;
      const startY = event.clientY;

      function onMouseMove(e) {
        container.style.width = initialWidth + (e.clientX - startX) + "px";
        container.style.height = initialHeight + (e.clientY - startY) + "px";
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  setZ(targetElement) {
    const windows = document.querySelectorAll("window-c");
    windows.forEach((window) => {
      window.shadowRoot.querySelector(".windowClass").style.zIndex = "0";
    });
    targetElement.style.zIndex = "1";
  }
}

customElements.define("window-c", CustomWindow);
