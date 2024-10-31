export const name = "TemplateComponent";
export const iconSrc = "/public/bg.jpg";
export const componentTag = "app-template-component";

class TemplateComponent extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const container = document.createElement('div');
    container.classList.add('main-container');

    const style = document.createElement('style');
    style.textContent = `
      .main-container {
        position: relative;
        width: 100%;
        height: 100%;
        margin: auto;
        font-family: Arial, sans-serif;
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);
  }
}

customElements.define(componentTag, TemplateComponent);
