export const name = "Base64ConverterComponent";
export const iconSrc = "/public/bg.jpg";
export const componentTag = "app-base64-converter-component";
import "../components/base64.js";

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
        max-height: 100%;
        overflow: auto; /* Enable scrolling */
        padding: 10px;
        box-sizing: border-box;
      }
      .main-container {
        padding: 20px;
        background: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        font-family: Arial, sans-serif;
        overflow: hidden;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      h2 {
        font-size: 1.8em;
        margin: 0;
      }
      p {
        font-size: 1em;
        color: #555;
      }
      label {
        font-weight: bold;
        margin-top: 10px;
        display: block;
      }
      textarea, select, button {
        width: 100%;
        padding: 10px;
        margin-top: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1em;
      }
      button {
        background-color: #007BFF;
        color: white;
        border: none;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      button:hover {
        background-color: #0056b3;
      }
      .converter, .decoder {
        padding: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
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
        // Use the encode64 function from base64.js (attached to String prototype)
        let encodedString = input.encode64(mimeType);
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
        // Use the decode64 function from base64.js (attached to String prototype)
        let decodedString = input.decode64();
        shadow.getElementById('decodeOutputField').value = decodedString;
      } catch (error) {
        alert("Invalid Base64 string or unable to decode.");
      }
    });
  }
}

customElements.define(componentTag, Base64ConverterComponent);
