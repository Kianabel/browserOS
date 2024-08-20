class Taskbar extends HTMLElement {
  constructor() {
    super();

    const Shadow = this.attachShadow({ mode: "open" });

    const Container = document.createElement("div");
    Container.classList.add("taskbarClass");

    Shadow.appendChild(Container);

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

      .window-square {
        width: 1.875rem;
        height: 1.875rem;
        background-color: rgba(255, 255, 255, 0.3);
        margin-right: 0.625rem;
        cursor: pointer;
        border-radius: 0.3125rem;
        flex-shrink: 0;
      }

      .window-square:hover {
        background-color: rgba(255, 255, 255, 0.5);
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
      }

      .add-button:hover {
        background-color: #555555;
      }

      .add-button:active {
        background-color: #6b6b6b;
      }
    `;

    Shadow.appendChild(Style);

    this.updateTaskbar(Container);

    const Observer = new MutationObserver(() => this.updateTaskbar(Container));
    Observer.observe(document.body, { childList: true, subtree: true });

    const AddButton = document.createElement('div');
    AddButton.classList.add('add-button');
    AddButton.textContent = '+';

    AddButton.addEventListener('click', () => {
      const NewWindow = document.createElement('window-c');
      document.body.appendChild(NewWindow);
    });

    Container.appendChild(AddButton);
  }

  updateTaskbar(Container) {
    Container.querySelectorAll('.window-square').forEach(square => square.remove());

    const Windows = document.querySelectorAll('window-c');

    Windows.forEach((Window, Index) => {
      const WindowSquare = document.createElement('div');
      WindowSquare.classList.add('window-square');
      WindowSquare.setAttribute('data-window-id', Index);

      WindowSquare.addEventListener('click', () => {
        const CustomWindow = Window;
        CustomWindow.toggleMinimize(CustomWindow.Container);
      });

      Container.insertBefore(WindowSquare, Container.querySelector('.add-button'));
    });
  }
}

customElements.define("taskbar-c", Taskbar);
