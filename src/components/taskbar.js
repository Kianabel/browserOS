class Taskbar extends HTMLElement {
  constructor() {
    super();

    const Shadow = this.attachShadow({ mode: "open" });

    const Container = document.createElement("div");
    Container.classList.add("taskbarClass");

    const SecondaryTaskbar = document.createElement("div");
    SecondaryTaskbar.classList.add("secondary-taskbar");
    SecondaryTaskbar.style.display = "none"; // Hidden by default

    Shadow.appendChild(Container);
    Shadow.appendChild(SecondaryTaskbar);

    const Style = document.createElement("style");
    Style.textContent = `
      .taskbarClass {
        position: fixed;
        bottom: 0.625rem;
        left: 50%;
        transform: translateX(-50%);
        height: 3.125rem;
        width: 70%;
        display: flex;
        justify-content: left;
        align-items: center;
        border-radius: 0.625rem;
        background-color: #3f3f3f;
        box-shadow: 0rem 0rem 0.625rem rgba(0, 0, 0, 0.5);
        z-index: 1000;
        padding: 0 0.625rem;
        overflow-x: auto;
      }

      .secondary-taskbar {
        position: fixed;
        bottom: 4.5rem; /* Positioned above the main taskbar */
        left: 75%;
        transform: translateX(-50%);
        height: 30vh;
        width: 20%;
        display: flex;
        justify-content: left;
        align-items: start;
        border-radius: 0.625rem;
        background-color: #3f3f3f;
        box-shadow: 0rem 0rem 0.625rem rgba(0, 0, 0, 0.5);
        z-index: 1001;
        padding: 0.625rem;
        overflow-x: auto;
        flex-direction: column;
      }

      .window-square {
        width: 2.1rem;
        height: 2.1rem;
        background-color: rgba(255, 255, 255, 0.3);
        margin-right: 0.625rem;
        cursor: pointer;
        border-radius: 0.3125rem;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .window-square img {
        width: 2rem;
        height: 2rem;
        border-radius: 0.3125rem;
      }

      .window-square:hover {
        background-color: rgba(255, 255, 255, 0.5);
        transform: scale(1.1);
      }

      .window-square:active {
        background-color: rgba(255, 255, 255, 0.7);
      }

      .add-button {
        width: 2.5rem;
        height: 2.5rem;
        background-color: #3f3f3f;
        color: white;
        font-size: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        cursor: pointer;
        margin-left: auto;
        position: relative;
      }

      .add-button:hover {
        background-color: #555555;
      }

      .add-button:active {
        background-color: #6b6b6b;
      }

      .app-icon {
        width: 85%;
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        cursor: pointer;
        margin-right: 0.625rem;
      }

      .app-icon img {
        width: 1.875rem;
        height: 1.875rem;
        margin-right: 0.5rem;
      }

      .app-icon span {
        color: white;
        font-size: 0.875rem;
      }

      .app-icon:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 0.3125rem;
      }
    `;

    Shadow.appendChild(Style);

    this.Container = Container;
    this.SecondaryTaskbar = SecondaryTaskbar;
  }

  connectedCallback() {
    this.initializeTaskbar();

    document.addEventListener("click", (event) => {
      if (!this.contains(event.target)) {
        this.SecondaryTaskbar.style.display = "none";
      }
    });
  }

  initializeTaskbar() {
    const Container = this.Container;

    this.updateTaskbar(Container);

    const Observer = new MutationObserver(() => this.updateTaskbar(Container));
    Observer.observe(this.parentNode, { childList: true, subtree: true });

    const AddButton = document.createElement("div");
    AddButton.classList.add("add-button");
    AddButton.textContent = "+";

    AddButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.toggleSecondaryTaskbar();
    });

    Container.appendChild(AddButton);
  }

  async toggleSecondaryTaskbar() {
    if (this.SecondaryTaskbar.style.display === "none") {
      this.SecondaryTaskbar.style.display = "flex";
      if (!this.SecondaryTaskbar.hasChildNodes()) {
        const { availableApplications } = await import("../entry.js");
        this.createSecondaryTaskbar(availableApplications);
      }
    } else {
      this.SecondaryTaskbar.style.display = "none";
    }
  }

  updateTaskbar(Container) {
    Container.querySelectorAll(".window-square").forEach((square) =>
      square.remove()
    );

    const Windows = this.parentNode.querySelectorAll("window-c");

    Windows.forEach((Window) => {
      const AppIcon = Window.querySelector("img").src;
      const WindowSquare = document.createElement("div");
      WindowSquare.classList.add("window-square");

      const IconImg = document.createElement("img");
      IconImg.src = AppIcon;

      WindowSquare.appendChild(IconImg);

      WindowSquare.addEventListener("click", () => {
        const CustomWindow = Window;
        CustomWindow.toggleMinimize(CustomWindow.Container);
      });

      Container.insertBefore(
        WindowSquare,
        Container.querySelector(".add-button")
      );
    });
  }

  createSecondaryTaskbar(availableApplications) {
    availableApplications.forEach((app) => {
      const AppIconWrapper = document.createElement("div");
      AppIconWrapper.classList.add("app-icon");

      const AppIcon = document.createElement("img");
      AppIcon.src = app.iconSrc;

      const AppName = document.createElement("span");
      AppName.textContent = app.name;

      AppIconWrapper.appendChild(AppIcon);
      AppIconWrapper.appendChild(AppName);

      AppIconWrapper.addEventListener("click", () => {
        const NewWindow = document.createElement("window-c");

        const AppComponent = document.createElement(app.componentTag);
        AppComponent.style.width = "100px";
        AppComponent.style.height = "100px";
        NewWindow.appendChild(AppComponent);

        const WindowIcon = document.createElement("img");
        WindowIcon.src = app.iconSrc;
        WindowIcon.slot = "window-icon"; // Assuming you have a slot for icons in your window

        NewWindow.appendChild(WindowIcon);

        this.parentNode.appendChild(NewWindow); // Append the new window-c element to the same level as the taskbar

        this.updateTaskbar(this.Container); // Update the taskbar with the new window
        this.SecondaryTaskbar.style.display = "none";
      });

      this.SecondaryTaskbar.appendChild(AppIconWrapper);
    });
  }
}

customElements.define("taskbar-c", Taskbar);
