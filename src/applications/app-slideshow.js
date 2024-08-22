export const name = "RandomSlideshow";
export const iconSrc = "/public/bg.jpg";
export const componentTag = "app-random-slideshow";

class AppRandomSlideshow extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const container = document.createElement('div');
    container.classList.add('slideshow-container');

    // Image element
    const image = document.createElement('img');
    image.classList.add('slide');

    // Load a new random image
    function loadNewImage() {
      const width = 200;  // desired image width
      const height = 300; // desired image height
      image.src = `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;
      
      // Adjust container size based on image dimensions
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
    }

    // Initial image load
    loadNewImage();

    // Button to manually load the next image
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.classList.add('nav-button');
    nextButton.addEventListener('click', loadNewImage);

    // Auto-refresh every 5 seconds
    setInterval(loadNewImage, 5000);

    // Add elements to container
    container.appendChild(image);
    container.appendChild(nextButton);

    const style = document.createElement('style');
    style.textContent = `
      .slideshow-container {
        position: relative;
        width: 200px;
        height: 300px;
        margin: auto;
        font-family: Arial, sans-serif;
      }

      .slide {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .nav-button {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 1rem;
      }

      .nav-button:focus {
        outline: none;
      }

      .nav-button:hover {
        background-color: rgba(0, 0, 0, 0.8);
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);
  }
}

customElements.define(componentTag, AppRandomSlideshow);
