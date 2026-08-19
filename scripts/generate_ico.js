import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate a simple uncompressed/deflated valid PNG 64x64 or 128x128
function createPngIcon(size) {
  // We construct a PNG image buffer with Gold Hexagon and Abel "A" glyph
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk: 13 bytes
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression method 0
  ihdrData.writeUInt8(0, 11); // filter method 0
  ihdrData.writeUInt8(0, 12); // interlace method 0

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data: scanlines with filter byte 0
  const rawRows = [];
  const center = size / 2;
  const radius = size * 0.44;

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // Filter: None
    for (let x = 0; x < size; x++) {
      const idx = 1 + x * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded container / Hexagon shape distance
      const hexDist = Math.max(Math.abs(dx) * 0.866025 + Math.abs(dy) * 0.5, Math.abs(dy));

      if (hexDist <= radius) {
        // Border ring
        if (hexDist >= radius - 3) {
          // Bright gold border
          row[idx] = 254; // R
          row[idx + 1] = 240; // G
          row[idx + 2] = 138; // B
          row[idx + 3] = 255; // A
        } else if (hexDist >= radius - 6) {
          // Deep gold border
          row[idx] = 245; // R
          row[idx + 1] = 158; // G
          row[idx + 2] = 11; // B
          row[idx + 3] = 255; // A
        } else {
          // Inner background: Obsidian Dark
          // Let's draw the "A" glyph
          const relY = (y - (center - radius * 0.6)) / (radius * 1.2);
          const relX = (x - center) / (radius * 0.8);

          let isGlyph = false;
          if (relY >= 0 && relY <= 1) {
            // Triangular / A leg shape
            const halfWidthAtY = relY * 0.7;
            const stroke = 0.22;
            const distFromLeg = Math.abs(Math.abs(relX) - halfWidthAtY);

            // Legs
            if (distFromLeg < stroke / 2 && relY > 0.05) {
              isGlyph = true;
            }
            // Crossbar
            if (relY >= 0.55 && relY <= 0.68 && Math.abs(relX) <= halfWidthAtY) {
              isGlyph = true;
            }
          }

          if (isGlyph) {
            // Gold glyph
            const grad = Math.min(255, Math.max(0, Math.floor(180 + relY * 70)));
            row[idx] = 251; // R
            row[idx + 1] = 191; // G
            row[idx + 2] = 36; // B
            row[idx + 3] = 255; // A
          } else {
            // Obsidian Black bg
            row[idx] = 10;
            row[idx + 1] = 12;
            row[idx + 2] = 18;
            row[idx + 3] = 255;
          }
        }
      } else {
        // Transparent
        row[idx] = 0;
        row[idx + 1] = 0;
        row[idx + 2] = 0;
        row[idx + 3] = 0;
      }
    }
    rawRows.push(row);
  }

  const rawBuffer = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawBuffer);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(4 + 4 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcData);
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

// Build standard Windows .ICO with 256x256, 128x128, 64x64, 32x32, 16x16 PNG entries
function buildIcoFile(sizes) {
  const images = sizes.map(s => ({ size: s, buffer: createPngIcon(s) }));

  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type (1 = icon, 2 = cursor)
  header.writeUInt16LE(images.length, 4); // count

  let currentOffset = 6 + images.length * 16;
  const dirEntries = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 0); // width (0 = 256)
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 1); // height
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // size of image data
    entry.writeUInt32LE(currentOffset, 12); // offset of image data
    dirEntries.push(entry);
    currentOffset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...images.map(i => i.buffer)]);
}

// Generate and write
const icoBuffer = buildIcoFile([256, 128, 64, 48, 32, 16]);
const publicDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'abel_icon.ico'), icoBuffer);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

// Also generate a 256x256 PNG for standalone use
const png256 = createPngIcon(256);
fs.writeFileSync(path.join(publicDir, 'abel_desktop_icon.png'), png256);
fs.writeFileSync(path.join(publicDir, 'icon.png'), png256);

console.log('Successfully generated authentic binary abel_icon.ico, favicon.ico, and abel_desktop_icon.png!');
