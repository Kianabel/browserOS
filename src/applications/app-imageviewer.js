export const name = "ImageViewer";
export const iconSrc = "/public/bg.jpg";
export const componentTag = "app-image-viewer";

const Images = [
  "https://www.kinderfilmwelt.de/fileadmin/user_upload/movies/images/die_wilden_kerle/die_wilden_kerle_5.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ1HHE8ZXUZMehpItjgFQ9FxcNzKIvnLiCkA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ1HHE8ZXUZMehpItjgFQ9FxcNzKIvnLiCkA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ1HHE8ZXUZMehpItjgFQ9FxcNzKIvnLiCkA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ1HHE8ZXUZMehpItjgFQ9FxcNzKIvnLiCkA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY-GDROFk3XZFBOzCD_Nr2fnnhn4kPayldBQ&s",
];

class ImageViewer extends HTMLElement {
  constructor() {
    super();

    this.viewMode = "grid"; // Start im Grid-Modus
    this.zoomLevel = 1; // Standard-Zoomlevel

    const shadow = this.attachShadow({ mode: 'open' });

    // Hauptcontainer für Grid und Einzelansicht
    const container = document.createElement('div');
    container.classList.add('image-container');
    shadow.appendChild(container);

    // Stil-Elemente
    const style = document.createElement('style');
    style.textContent = `
      .image-container {
        font-family: Arial, sans-serif;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }
      
      .grid-view {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      .grid-item {
        width: 100px;
        height: 100px;
        cursor: pointer;
      }

      .grid-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .single-view {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        position: relative;
      }

      .single-view img {
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        transition: transform 0.3s; /* Smoothes Zoom-Animation */
      }

      .back-button {
        position: absolute;
        top: 10px;
        left: 10px;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 14px;
        border-radius: 5px;
      }
    `;

    shadow.appendChild(style);

    this.container = container;
    this.renderGrid();
  }

  renderGrid() {
    this.container.innerHTML = ""; // Container zurücksetzen
    this.viewMode = "grid";

    const grid = document.createElement('div');
    grid.classList.add('grid-view');

    Images.forEach((src, index) => {
      const item = document.createElement('div');
      item.classList.add('grid-item');
      const img = document.createElement('img');
      img.src = src;
      img.addEventListener('click', () => this.showSingleImage(index));
      item.appendChild(img);
      grid.appendChild(item);
    });

    this.container.appendChild(grid);
  }

  showSingleImage(index) {
    this.container.innerHTML = ""; // Container zurücksetzen
    this.viewMode = "single";
    this.zoomLevel = 1; // Zoom auf Standard zurücksetzen

    const singleView = document.createElement('div');
    singleView.classList.add('single-view');

    const img = document.createElement('img');
    img.src = Images[index];
    img.style.transform = `scale(${this.zoomLevel})`;

    // Event-Listener für das Scrollen (Zoom-In und Zoom-Out)
    singleView.addEventListener('wheel', (event) => this.handleZoom(event, img));

    const backButton = document.createElement('button');
    backButton.textContent = "Zurück";
    backButton.classList.add('back-button');
    backButton.addEventListener('click', () => this.renderGrid());

    singleView.appendChild(img);
    singleView.appendChild(backButton);
    this.container.appendChild(singleView);
  }

  handleZoom(event, img) {
    event.preventDefault();
    const zoomStep = 0.1;
    this.zoomLevel += event.deltaY < 0 ? zoomStep : -zoomStep;
    this.zoomLevel = Math.max(0.1, Math.min(this.zoomLevel, 3)); // Begrenzung von 0.1 bis 3
    img.style.transform = `scale(${this.zoomLevel})`;
  }
}

customElements.define(componentTag, ImageViewer);
