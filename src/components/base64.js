export function encode64(input, mimeType = "text/plain") {
  const bytes = new TextEncoder().encode(input);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return `data:${mimeType};base64,${btoa(binary)}`;
}

export function decode64(input) {
  const cleanBase64 = input.replace(/^.*base64,/, "").trim();
  const binary = atob(cleanBase64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}
