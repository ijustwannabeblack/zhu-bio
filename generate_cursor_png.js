const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPNG(width, height, rgbaBuffer) {
  // CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.slice(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // filter type None
    rgbaBuffer.copy(scanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw a crisp, angled pointer cursor (white filled, black border, rounded tip, dark accent)
const W = 32;
const H = 32;
const rgba = Buffer.alloc(W * H * 4, 0);

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = (y * W + x) * 4;
  rgba[idx] = r;
  rgba[idx + 1] = g;
  rgba[idx + 2] = b;
  rgba[idx + 3] = a;
}

// Cursor shape matrix (tip at (0, 0))
// 0: transparent, 1: black border, 2: white body, 3: dark gray shadow/accent
const pattern = [
  "1100000000000000",
  "1210000000000000",
  "1221000000000000",
  "1222100000000000",
  "1222210000000000",
  "1222221000000000",
  "1222222100000000",
  "1222222210000000",
  "1222222221000000",
  "1222222222100000",
  "1222222222210000",
  "1222222222221000",
  "1222222222222100",
  "1222222111111100",
  "1222122100000000",
  "1221012210000000",
  "1210012210000000",
  "1100001221000000",
  "1000001221000000",
  "0000000122100000",
  "0000000122100000",
  "0000000011000000"
];

for (let y = 0; y < pattern.length; y++) {
  const row = pattern[y];
  for (let x = 0; x < row.length; x++) {
    const char = row[x];
    if (char === '1') {
      setPixel(x, y, 10, 10, 15, 255); // Black border
    } else if (char === '2') {
      setPixel(x, y, 255, 255, 255, 255); // White body
    } else if (char === '3') {
      setPixel(x, y, 90, 90, 105, 255); // Dark accent
    }
  }
}

const pngBuf = createPNG(W, H, rgba);
fs.writeFileSync(path.join(__dirname, 'assets', 'cursor.png'), pngBuf);
console.log('Generated valid 32x32 PNG cursor with exact (0,0) tip! Size:', pngBuf.length, 'bytes');
