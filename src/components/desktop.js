class Desktop extends HTMLElement {
    constructor() {
      super();
  
      const shadow = this.attachShadow({ mode: "open" });
  
      const container = document.createElement("div");
      container.classList.add("desktop-container");
  
      const style = document.createElement("style");
      style.textContent = `
        .desktop-container {
        position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
          user-select: none;
          overflow: hidden;
        }
  
        .selection-box {
          position: absolute;
          border: 2px dashed #0078d4;
          background-color: rgba(0, 120, 212, 0.2);
          z-index: 1000;
        }
      `;
  
      shadow.appendChild(style);
      shadow.appendChild(container);
  
      this.container = container;
      this.selectionBox = null;
      this.startX = 0;
      this.startY = 0;
    }
  
    connectedCallback() {
      this.container.addEventListener("mousedown", this.onMouseDown.bind(this));
    }
  
    onMouseDown(event) {
      if (event.button !== 0) return; // Only respond to left-click
  
      this.startX = event.clientX;
      this.startY = event.clientY;
  
      // Create the selection box
      this.selectionBox = document.createElement("div");
      this.selectionBox.classList.add("selection-box");
      this.container.appendChild(this.selectionBox);
  
      // Set initial position
      this.selectionBox.style.left = `${this.startX}px`;
      this.selectionBox.style.top = `${this.startY}px`;
  
      // Attach mousemove and mouseup events to the document
      document.addEventListener("mousemove", this.onMouseMove.bind(this));
      document.addEventListener("mouseup", this.onMouseUp.bind(this));
    }
  
    onMouseMove(event) {
      const currentX = event.clientX;
      const currentY = event.clientY;
  
      const width = Math.abs(currentX - this.startX);
      const height = Math.abs(currentY - this.startY);
  
      const left = Math.min(currentX, this.startX);
      const top = Math.min(currentY, this.startY);
  
      this.selectionBox.style.width = `${width}px`;
      this.selectionBox.style.height = `${height}px`;
      this.selectionBox.style.left = `${left}px`;
      this.selectionBox.style.top = `${top}px`;
    }
  
    onMouseUp() {
      document.removeEventListener("mousemove", this.onMouseMove.bind(this));
      document.removeEventListener("mouseup", this.onMouseUp.bind(this));
  
      // Remove the selection box after the mouse is released
      if (this.selectionBox) {
        this.container.removeChild(this.selectionBox);
        this.selectionBox = null;
      }
    }
  }
  
  customElements.define("desktop-c", Desktop);
  