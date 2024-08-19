class Taskbar extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    // Create the container for the taskbar
    const container = document.createElement("div");
    container.classList.add("taskbarClass");

    // Placeholder for taskbar items (You can add icons or other elements here)
    const taskbarItem1 = document.createElement("div");
    taskbarItem1.classList.add("taskbar-item");
    taskbarItem1.textContent = "Item 1"; // Example item, replace with an icon or app launcher

    const taskbarItem2 = document.createElement("div");
    taskbarItem2.classList.add("taskbar-item");
    taskbarItem2.textContent = "Item 2"; // Example item, replace with an icon or app launcher

    // Append items to the taskbar container
    container.appendChild(taskbarItem1);
    container.appendChild(taskbarItem2);

    // Attach the container to the shadow DOM
    shadow.appendChild(container);

    // Apply styles to the taskbar
    const style = document.createElement("style");
    style.textContent = `
      .taskbarClass {
        position: fixed;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        height: 50px;
        width: 70%;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 10px;
        background-color: #3f3f3f;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
        z-index: 20;
      }

      .taskbar-item {
        margin: 0 10px;
        color: white;
        font-size: 14px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 5px;
        background-color: rgba(255, 255, 255, 0.1);
      }

      .taskbar-item:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }

      .taskbar-item:active {
        background-color: rgba(255, 255, 255, 0.3);
      }
    `;

    shadow.appendChild(style);
  }
}

// Define the custom element
customElements.define("taskbar-c", Taskbar);

// Example usage: adding the taskbar to the body
document.body.appendChild(document.createElement("taskbar-c"));
