const BinaryToBase64 = {
    '000000': 'A', '000001': 'B', '000010': 'C', '000011': 'D',
    '000100': 'E', '000101': 'F', '000110': 'G', '000111': 'H',
    '001000': 'I', '001001': 'J', '001010': 'K', '001011': 'L',
    '001100': 'M', '001101': 'N', '001110': 'O', '001111': 'P',
    '010000': 'Q', '010001': 'R', '010010': 'S', '010011': 'T',
    '010100': 'U', '010101': 'V', '010110': 'W', '010111': 'X',
    '011000': 'Y', '011001': 'Z', '011010': 'a', '011011': 'b',
    '011100': 'c', '011101': 'd', '011110': 'e', '011111': 'f',
    '100000': 'g', '100001': 'h', '100010': 'i', '100011': 'j',
    '100100': 'k', '100101': 'l', '100110': 'm', '100111': 'n',
    '101000': 'o', '101001': 'p', '101010': 'q', '101011': 'r',
    '101100': 's', '101101': 't', '101110': 'u', '101111': 'v',
    '110000': 'w', '110001': 'x', '110010': 'y', '110011': 'z',
    '110100': '0', '110101': '1', '110110': '2', '110111': '3',
    '111000': '4', '111001': '5', '111010': '6', '111011': '7',
    '111100': '8', '111101': '9', '111110': '+', '111111': '/'
};
const Base64ToBinary = {}; //inverse binaryMap
for (const [key, value] of Object.entries(BinaryToBase64)) {
    Base64ToBinary[value] = key;
}

String.prototype.encode64 = function(mimeType = 'text/plain') {
    let input = this;
    let out = "";
    let padding = '';
    let binaryString = input
        .split('') 
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('');

    let bitChunks = chunkBits(binaryString, 6);

    if (bitChunks[bitChunks.length - 1].length < 6) {
        bitChunks[bitChunks.length - 1] = bitChunks[bitChunks.length - 1].padEnd(6, '0');
    }

    bitChunks.forEach(bits => {
        out += BinaryToBase64[bits];
    });

    if (input.length % 3 === 1) {
        padding = '==';
    } else if (input.length % 3 === 2) {
        padding = '=';
    }

    out += padding;

    // Add data: prefix with the specified MIME type
    return `data:${mimeType};base64,${out}`;
};

String.prototype.decode64 = function() {
    let input = this;
    let cleanBase64 = input.replace(/^.*base64,/, "").replace(/=+$/, ""); //clean Base64
    let letterArray = cleanBase64.split('');
    
    let binaryString = "";
    letterArray.forEach(letter => {
        binaryString += Base64ToBinary[letter];
    });
    
    let bitChunks = chunkBits(binaryString, 8);
    let out = bitChunks
        .map(bin => String.fromCharCode(parseInt(bin, 2))) //binary to ascii
        .join('');
    return out;
};

function chunkBits(binaryString, chunkSize) {
    let chunks = [];
    for (let i = 0; i < binaryString.length; i += chunkSize) {
      chunks.push(binaryString.slice(i, i + chunkSize));
    }
    return chunks;
}