export const name = "Run3";
export const iconSrc = "/public/bg.jpg";
export const componentTag = "app-run3";

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
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('marginwidth', '0');
    iframe.setAttribute('vspace', '0');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('hspace', '0');
    iframe.setAttribute('marginheight', '0');
    iframe.setAttribute('allow', 'web-share; clipboard-read; clipboard-write');

    // Set the container size as needed
    container.style.width = `600px`;
    container.style.height = `400px`;

    // Add iframe to container
    container.appendChild(iframe);

    const style = document.createElement('style');
    style.textContent = `
      .iframe-container {
        position: relative;
        width: 600px;
        height: 400px;
        margin: auto;
        font-family: Arial, sans-serif;
      }

      .frame {
        width: 100%;
        height: 100%;
        display: block;
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);
  }
}

customElements.define(componentTag, AppRun3);
