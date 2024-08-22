export const name = "Settings";
export const iconSrc = "/public/bg.jpg";
export const componentTag = "app-settings";

class AppSettings extends HTMLElement {
  constructor() {
    super();

    const Shadow = this.attachShadow({ mode: 'open' });

    const Container = document.createElement('div');
    Container.classList.add('settings-container');

    // Example Setting 1: Toggle Dark Mode
    const DarkModeLabel = document.createElement('label');
    DarkModeLabel.textContent = 'Dark Mode:';

    const DarkModeToggle = document.createElement('input');
    DarkModeToggle.type = 'checkbox';
    DarkModeToggle.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode', DarkModeToggle.checked);
    });

    DarkModeLabel.appendChild(DarkModeToggle);

    // Example Setting 2: Adjust Font Size
    const FontSizeLabel = document.createElement('label');
    FontSizeLabel.textContent = 'Font Size:';

    const FontSizeInput = document.createElement('input');
    FontSizeInput.type = 'range';
    FontSizeInput.min = '12';
    FontSizeInput.max = '24';
    FontSizeInput.value = '16';
    FontSizeInput.addEventListener('input', () => {
      document.body.style.fontSize = `${FontSizeInput.value}px`;
    });

    FontSizeLabel.appendChild(FontSizeInput);

    // Add elements to container
    Container.appendChild(DarkModeLabel);
    Container.appendChild(FontSizeLabel);

    const Style = document.createElement('style');
    Style.textContent = `
      .settings-container {
        font-family: Arial, sans-serif;
        background-color: white;
        z-Index: 0;
        border-radius: 0.325rem;
      }

      label {
        display: block;
        margin-bottom: 1rem;
      }

      input[type="checkbox"] {
        margin-left: 0.5rem;
      }

      input[type="range"] {
        margin-left: 0.5rem;
      }

      .body.dark-mode {
        background-color: #121212;
        color: #ffffff;
      }
    `;

    Shadow.appendChild(Style);
    Shadow.appendChild(Container);
  }
}

customElements.define(componentTag, AppSettings);
