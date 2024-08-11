class Taskbar extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const container = document.createElement("div");
    container.classList.add("taskbarClass");

    const fullWindowIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    fullWindowIcon.setAttribute("fill", "none");
    fullWindowIcon.setAttribute("viewBox", "0 0 24 24");
    fullWindowIcon.setAttribute("stroke-width", "1.3");
    fullWindowIcon.setAttribute("stroke", "currentColor");
    fullWindowIcon.classList.add("icon", "makefull-window");

    const fullWindowPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    fullWindowPath.setAttribute("stroke-linecap", "round");
    fullWindowPath.setAttribute("stroke-linejoin", "round");
    fullWindowPath.setAttribute(
      "d",
      "M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
    );
    fullWindowIcon.appendChild(fullWindowPath);

    shadow.appendChild(container);
    container.appendChild(fullWindowIcon);

    const style = document.createElement("style");
    style.textContent = `
      .taskbarClass {
        height: 4vh;
        width: 50vw;
        position: absolute;
        border-radius: 10px;
        background-color: #3f3f3f
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

    `;

    shadow.appendChild(style);
  }
}

customElements.define("taskbar-c", Taskbar);
