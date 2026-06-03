export const name = "Template";
export const iconLabel = "Tp";
export const iconColor = "#475569";
export const componentTag = "app-template-component";
export const tag = "Template";
export const favorite = false;

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
