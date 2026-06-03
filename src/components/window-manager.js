class CustomWindow extends HTMLElement {
  constructor() {
    super();

    const Shadow = this.attachShadow({ mode: "open" });
    
    const Container = document.createElement("div");
    Container.classList.add("windowClass");
    const Scale = document.documentElement.dataset.browserosWindowScale || "comfortable";
    const Defaults = {
      compact: { width: "44rem", height: "30rem" },
      comfortable: { width: "50rem", height: "34rem" },
      large: { width: "58rem", height: "38rem" },
    };
    Container.style.width = this.getAttribute("window-width") || Defaults[Scale]?.width || Defaults.comfortable.width;
    Container.style.height = this.getAttribute("window-height") || Defaults[Scale]?.height || Defaults.comfortable.height;

    const TopBar = document.createElement("div");
    TopBar.classList.add("topBar");

    const MinimizeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    MinimizeIcon.setAttribute("fill", "none");
    MinimizeIcon.setAttribute("viewBox", "0 0 24 24");
    MinimizeIcon.setAttribute("stroke-width", "1.3");
    MinimizeIcon.setAttribute("stroke", "currentColor");
    MinimizeIcon.classList.add("icon", "minimize");
    MinimizeIcon.setAttribute("role", "button");
    MinimizeIcon.setAttribute("aria-label", "Minimize window");
    MinimizeIcon.setAttribute("tabindex", "0");

    const MinimizePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    MinimizePath.setAttribute("stroke-linecap", "round");
    MinimizePath.setAttribute("stroke-linejoin", "round");
    MinimizePath.setAttribute("d", "M5 12h14");
    MinimizeIcon.appendChild(MinimizePath);

    const FullWindowIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    FullWindowIcon.setAttribute("fill", "none");
    FullWindowIcon.setAttribute("viewBox", "0 0 24 24");
    FullWindowIcon.setAttribute("stroke-width", "1.3");
    FullWindowIcon.setAttribute("stroke", "currentColor");
    FullWindowIcon.classList.add("icon", "makefull-window");
    FullWindowIcon.setAttribute("role", "button");
    FullWindowIcon.setAttribute("aria-label", "Toggle fullscreen");
    FullWindowIcon.setAttribute("tabindex", "0");

    const FullWindowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    FullWindowPath.setAttribute("stroke-linecap", "round");
    FullWindowPath.setAttribute("stroke-linejoin", "round");
    FullWindowPath.setAttribute(
      "d",
      "M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
    );
    FullWindowIcon.appendChild(FullWindowPath);

    const CloseIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    CloseIcon.setAttribute("fill", "none");
    CloseIcon.setAttribute("viewBox", "0 0 24 24");
    CloseIcon.setAttribute("stroke-width", "1.3");
    CloseIcon.setAttribute("stroke", "currentColor");
    CloseIcon.classList.add("icon", "closeWindow");
    CloseIcon.setAttribute("role", "button");
    CloseIcon.setAttribute("aria-label", "Close window");
    CloseIcon.setAttribute("tabindex", "0");

    const ClosePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    ClosePath.setAttribute("stroke-linecap", "round");
    ClosePath.setAttribute("stroke-linejoin", "round");
    ClosePath.setAttribute("d", "M6 18 18 6M6 6l12 12");
    CloseIcon.appendChild(ClosePath);

    TopBar.appendChild(MinimizeIcon);
    TopBar.appendChild(FullWindowIcon);
    TopBar.appendChild(CloseIcon);

    const ContentSlot = document.createElement("slot");
    ContentSlot.classList.add("window-content");

    const ResizeHandles = [
      "bottom-right",
      "bottom-left",
      "top-right",
      "top-left",
      "right",
      "left",
      "bottom",
    ];
    ResizeHandles.forEach((handle) => {
      const ResizeHandle = document.createElement("div");
      ResizeHandle.classList.add("resize-handle", handle);
      Container.appendChild(ResizeHandle);
    });

    Container.appendChild(TopBar);
    Container.appendChild(ContentSlot);

    Shadow.appendChild(Container);

    const Style = document.createElement("style");
    Style.textContent = `
      .windowClass {
        position: absolute;
        min-height: 9rem;
        min-width: 12rem;
        max-width: calc(100vw - 2rem);
        max-height: calc(100vh - 6.5rem);
        border-radius: 0.75rem;
        background-color: rgba(245, 247, 250, 0.94);
        backdrop-filter: blur(18px);
        border: solid 0.0625rem rgba(255, 255, 255, 0.58);
        box-shadow: 0 1.25rem 4rem rgba(0, 0, 0, 0.32);
        color: #111827;
        overflow: hidden;
      }

      :host([fullscreen="true"]) .windowClass {
        max-width: 100vw;
        max-height: 100vh;
        border-radius: 0;
      }

      .topBar {
        min-width: 12rem;
        height: 2.5rem;
        background: rgba(18, 24, 32, 0.92);
        display: flex;
        justify-content: flex-end;
        align-items: center;
        cursor: grab;
        padding: 0 0.35rem;
        box-sizing: border-box;
      }

      .icon {
        padding: 2px;
        color: white;
        cursor: pointer;
        width: 1.65rem;
        height: 1.65rem;
        margin-left: 0.15rem;
        border-radius: 0.375rem;
      }

      .icon:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: none;
      }

      .icon:active {
        color: rgb(141, 141, 141);
      }

      .icon:focus-visible {
        outline: 0.125rem solid rgba(255, 255, 255, 0.85);
        outline-offset: -0.25rem;
      }

      .closeWindow:hover {
        color: rgb(165, 42, 42);
      }

      .resize-handle {
        position: absolute;
        width: 0.625rem;
        height: 0.625rem;
        background-color: transparent;
        visibility: hidden;
        z-index: 10;
      }

      .bottom-right {
        right: 0;
        bottom: 0;
        cursor: nwse-resize;
        border-bottom-right-radius: 0.75rem;
      }

      .bottom-left {
        left: 0;
        bottom: 0;
        cursor: nesw-resize;
        border-bottom-left-radius: 0.75rem;
      }

      .top-right {
        right: 0;
        top: 0;
        cursor: nesw-resize;
        border-top-right-radius: 0.75rem;
      }

      .top-left {
        left: 0;
        top: 0;
        cursor: nwse-resize;
        border-top-left-radius: 0.75rem;
      }

      .right {
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 0.625rem;
        height: calc(100% - 1.25rem);
        cursor: ew-resize;
      }

      .left {
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 0.625rem;
        height: calc(100% - 1.25rem);
        cursor: ew-resize;
      }

      .bottom {
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        width: calc(100% - 1.25rem);
        height: 0.625rem;
        cursor: ns-resize;
      }

      .window-content {
        display: block;
        height: calc(100% - 2.5rem);
        overflow: hidden;
      }

      .windowClass:hover .resize-handle {
        visibility: visible;
      }
    `;
    Shadow.appendChild(Style);

    this.initInteractions(Container, TopBar);
  }

  initInteractions(Container, TopBar) {
    this.IsFullScreen = false;
    this.SavedSizeAndPosition = null;
    Container.addEventListener("mousedown", () => this.setZ(Container));

    const MinimizeIcon = TopBar.querySelector(".minimize");
    MinimizeIcon.addEventListener("click", () => this.toggleMinimize(Container));
    MinimizeIcon.addEventListener("keydown", (event) => this.runButtonAction(event, () => this.toggleMinimize(Container)));

    const FullWindowIcon = TopBar.querySelector(".makefull-window");
    FullWindowIcon.addEventListener("click", () => this.toggleFullScreen(Container));
    FullWindowIcon.addEventListener("keydown", (event) => this.runButtonAction(event, () => this.toggleFullScreen(Container)));

    const CloseIcon = TopBar.querySelector(".closeWindow");
    CloseIcon.addEventListener("click", () => this.remove());
    CloseIcon.addEventListener("keydown", (event) => this.runButtonAction(event, () => this.remove()));

    TopBar.addEventListener("mousedown", (event) =>
      this.startDragging(Container, event)
    );

    const ResizeHandles = Container.querySelectorAll(".resize-handle");
    ResizeHandles.forEach((handle) => {
      handle.addEventListener("mousedown", (event) =>
        this.startResizing(Container, event, handle)
      );
    });

    this.Container = Container;
    this.IsMinimized = false;
  }

  connectedCallback() {
    if (this.hasPositioned) return;
    this.hasPositioned = true;
    requestAnimationFrame(() => {
      this.centerWindow();
      this.setZ(this.Container);
    });
  }

  centerWindow() {
    const Rect = this.Container.getBoundingClientRect();
    const RootWidth = window.innerWidth;
    const RootHeight = window.innerHeight;
    const TaskbarSpace = 5.5 * 16;
    const CascadeIndex = Number(this.getAttribute("window-index") || 0);
    const Left = Math.max(16, (RootWidth - Rect.width) / 2 + CascadeIndex * 18);
    const Top = Math.max(16, (RootHeight - TaskbarSpace - Rect.height) / 2 + CascadeIndex * 18);

    this.Container.style.left = `${Left / 16}rem`;
    this.Container.style.top = `${Top / 16}rem`;
  }

  runButtonAction(event, action) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    action();
  }

  toggleMinimize(Container) {
    if (!this.IsMinimized) {
      const Rect = Container.getBoundingClientRect();
      this.SavedSizeAndPosition = {
        width: `${Rect.width / 16}rem`,
        height: `${Rect.height / 16}rem`,
        left: `${Container.offsetLeft / 16}rem`,
        top: `${Container.offsetTop / 16}rem`,
      };
      Container.style.display = "none";
      this.IsMinimized = true;
    } else {
      Container.style.display = "block";
      if (this.SavedSizeAndPosition) {
        Container.style.width = this.SavedSizeAndPosition.width;
        Container.style.height = this.SavedSizeAndPosition.height;
        Container.style.left = this.SavedSizeAndPosition.left;
        Container.style.top = this.SavedSizeAndPosition.top;
      }
      this.IsMinimized = false;
    }
  }

  toggleFullScreen(Container) {
    if (!this.IsFullScreen) {
      const Rect = Container.getBoundingClientRect();
      this.SavedSizeAndPosition = {
        width: `${Rect.width / 16}rem`,
        height: `${Rect.height / 16}rem`,
        left: `${Container.offsetLeft / 16}rem`,
        top: `${Container.offsetTop / 16}rem`,
      };

      Container.style.width = `${window.innerWidth / 16}rem`;
      Container.style.height = `${window.innerHeight / 16}rem`;
      Container.style.left = "0rem";
      Container.style.top = "0rem";
      this.IsFullScreen = true;
      this.setAttribute("fullscreen", "true");
    } else {
      Container.style.width = this.SavedSizeAndPosition.width;
      Container.style.height = this.SavedSizeAndPosition.height;
      Container.style.left = this.SavedSizeAndPosition.left;
      Container.style.top = this.SavedSizeAndPosition.top;
      this.IsFullScreen = false;
      this.setAttribute("fullscreen", "false");
    }
  }

  startDragging(Container, event) {
    event.preventDefault();

    if (this.IsFullScreen) {
      const OffsetX = event.clientX - window.innerWidth / 2;
      const OffsetY = event.clientY - 15;

      Container.style.left = `${(event.clientX - OffsetX) / 16}rem`;
      Container.style.top = `${(event.clientY - OffsetY) / 16}rem`;
      this.toggleFullScreen(Container);
    }

    const OffsetX = event.clientX - Container.offsetLeft;
    const OffsetY = event.clientY - Container.offsetTop;

    function onMouseMove(e) {
      Container.style.left = `${(e.clientX - OffsetX) / 16}rem`;
      Container.style.top = `${(e.clientY - OffsetY) / 16}rem`;
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  startResizing(Container, event, handle) {
    event.preventDefault();
    event.stopPropagation();

    const InitialWidth = Container.offsetWidth;
    const InitialHeight = Container.offsetHeight;
    const InitialLeft = Container.offsetLeft;
    const InitialTop = Container.offsetTop;
    const StartX = event.clientX;
    const StartY = event.clientY;

    function onMouseMove(e) {
      let NewWidth = InitialWidth;
      let NewHeight = InitialHeight;
      let NewLeft = InitialLeft;
      let NewTop = InitialTop;

      if (handle.classList.contains("bottom-right")) {
        NewWidth = InitialWidth + (e.clientX - StartX);
        NewHeight = InitialHeight + (e.clientY - StartY);
      } else if (handle.classList.contains("bottom-left")) {
        NewWidth = InitialWidth - (e.clientX - StartX);
        NewHeight = InitialHeight + (e.clientY - StartY);
        NewLeft = InitialLeft + (e.clientX - StartX);
      } else if (handle.classList.contains("top-right")) {
        NewWidth = InitialWidth + (e.clientX - StartX);
        NewHeight = InitialHeight - (e.clientY - StartY);
        NewTop = InitialTop + (e.clientY - StartY);
      } else if (handle.classList.contains("top-left")) {
        NewWidth = InitialWidth - (e.clientX - StartX);
        NewHeight = InitialHeight - (e.clientY - StartY);
        NewLeft = InitialLeft + (e.clientX - StartX);
        NewTop = InitialTop + (e.clientY - StartY);
      } else if (handle.classList.contains("right")) {
        NewWidth = InitialWidth + (e.clientX - StartX);
      } else if (handle.classList.contains("left")) {
        NewWidth = InitialWidth - (e.clientX - StartX);
        NewLeft = InitialLeft + (e.clientX - StartX);
      } else if (handle.classList.contains("bottom")) {
        NewHeight = InitialHeight + (e.clientY - StartY);
      }

      if (NewWidth >= 192) {
        Container.style.width = `${NewWidth / 16}rem`;
        Container.style.left = `${NewLeft / 16}rem`;
      }
      if (NewHeight >= 144) {
        Container.style.height = `${NewHeight / 16}rem`;
        Container.style.top = `${NewTop / 16}rem`;
      }
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  setZ(TargetElement) {
    // Keep a global count to track the highest z-index
    if (!window.maxZIndex) {
      window.maxZIndex = 6; // Initialize the max z-index to a reasonable default
    }

    // Update the clicked window's z-index to the highest + 1
    window.maxZIndex += 1;
    TargetElement.style.zIndex = window.maxZIndex;

    // Ensure other windows are set to a lower value if necessary
    const Windows = this.getRootNode().querySelectorAll("window-c");
    Windows.forEach((Window) => {
      const WindowContainer = Window.shadowRoot.querySelector(".windowClass");
      if (WindowContainer !== TargetElement) {
        WindowContainer.style.zIndex = "5"; // Reset others to base z-index
      }
    });
  }
}

customElements.define("window-c", CustomWindow);
