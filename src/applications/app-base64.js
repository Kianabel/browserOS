export const name = "Base64";
export const iconLabel = "64";
export const iconColor = "#2563eb";
export const componentTag = "app-base64-converter-component";
export const tag = "Utilities";
export const favorite = false;
import { decode64, encode64 } from "../components/base64.js";

class Base64ConverterComponent extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    // Create a scrollable container
    const scrollContainer = document.createElement('div');
    scrollContainer.classList.add('scroll-container');

    const container = document.createElement('div');
    container.classList.add('main-container');
    container.innerHTML = `
      <div class="header">
        <h2>Base64 Converter & Decoder Tool</h2>
        <p>Quickly encode or decode your text using Base64</p>
      </div>
      <div class="converter">
        <h3>Base64 Encoder</h3>
        <label for="mimeType">Select MIME Type:</label>
        <select id="mimeType">
            <option value="text/plain">Plain Text (text/plain)</option>
            <option value="text/html">HTML (text/html)</option>
        </select>

        <label for="inputField">String Input:</label>
        <textarea id="inputField" rows="4" placeholder="Enter text to encode..."></textarea>

        <button id="convertButton">Convert to Base64</button>

        <label for="outputField">Encoded Output:</label>
        <textarea id="outputField" rows="4" readonly></textarea>
      </div>

      <div class="decoder">
        <h3>Base64 Decoder</h3>
        <label for="decodeInputField">Base64 Input:</label>
        <textarea id="decodeInputField" rows="4" placeholder="Enter Base64 text to decode..."></textarea>

        <button id="decodeButton">Convert to String</button>

        <label for="decodeOutputField">Decoded Output:</label>
        <textarea id="decodeOutputField" rows="4" readonly></textarea>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .scroll-container {
        height: 100%;
        overflow: auto;
        padding: 1rem;
        box-sizing: border-box;
        background: #eef2f7;
      }
      .main-container {
        display: grid;
        gap: 1rem;
        max-width: 48rem;
        margin: 0 auto;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .header {
        margin-bottom: 0.25rem;
      }
      h2 {
        font-size: 1.35rem;
        line-height: 1.2;
        margin: 0;
        color: #111827;
      }
      p {
        font-size: 0.92rem;
        color: #64748b;
        margin: 0.35rem 0 0;
      }
      label {
        font-weight: bold;
        margin-top: 10px;
        display: block;
      }
      textarea, select, button {
        width: 100%;
        box-sizing: border-box;
        padding: 0.7rem;
        margin-top: 5px;
        border: 1px solid #cbd5e1;
        border-radius: 0.45rem;
        font: 500 0.92rem/1.35 inherit;
      }
      button {
        background-color: #2563eb;
        color: white;
        border: none;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      button:hover {
        background-color: #1d4ed8;
      }
      .converter, .decoder {
        padding: 1rem;
        background: #fff;
        border: 1px solid #dbe3ee;
        border-radius: 0.65rem;
        box-shadow: 0 0.75rem 2rem rgba(15, 23, 42, 0.08);
      }
      .converter h3, .decoder h3 {
        margin-bottom: 10px;
        color: #333;
      }
    `;

    // Append the container inside the scrollContainer and shadow root
    scrollContainer.appendChild(container);
    shadow.appendChild(style);
    shadow.appendChild(scrollContainer);

    // Add event listener for the convert button
    shadow.getElementById('convertButton').addEventListener('click', () => {
      const input = shadow.getElementById('inputField').value;
      const mimeType = shadow.getElementById('mimeType').value;

      if (!input) {
        alert("Please enter a string to encode.");
        return;
      }

      try {
        let encodedString = encode64(input, mimeType);
        shadow.getElementById('outputField').value = encodedString;
      } catch (error) {
        alert("Unable to encode the input string to Base64.");
      }
    });

    // Add event listener for the decode button
    shadow.getElementById('decodeButton').addEventListener('click', () => {
      const input = shadow.getElementById('decodeInputField').value;

      if (!input) {
        alert("Please enter a Base64 encoded text.");
        return;
      }

      try {
        let decodedString = decode64(input);
        shadow.getElementById('decodeOutputField').value = decodedString;
      } catch (error) {
        alert("Invalid Base64 string or unable to decode.");
      }
    });
  }
}

customElements.define(componentTag, Base64ConverterComponent);
