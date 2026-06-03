export const name = "Run 3";
export const iconLabel = "R3";
export const iconColor = "#dc2626";
export const componentTag = "app-run3";
export const tag = "Gaming";
export const favorite = true;

class AppRun3 extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const container = document.createElement('div');
    container.classList.add('iframe-container');

    // Iframe element
    const iframe = document.createElement('iframe');
    iframe.classList.add('frame');
    iframe.setAttribute('id', 'html5game');
    iframe.setAttribute('src', 'https://lekug.github.io/tn6pS9dCf37xAhkJv/');
    iframe.setAttribute('title', 'Run 3 game');
    iframe.setAttribute('allow', 'web-share; clipboard-read; clipboard-write');

    // Set the container size as needed
    //container.style.width = `600px`;
    //container.style.height = `400px`;

    // Add iframe to container
    container.appendChild(iframe);

    const style = document.createElement('style');
    style.textContent = `
      .iframe-container {
        position: relative;
        width: 100%;
        height: 100%;
        margin: auto;
        font-family: Arial, sans-serif;
      }

      .frame {
        width: 100%;
        height: 100%;
        display: block;
        border: 0;
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);
  }
}

customElements.define(componentTag, AppRun3);
