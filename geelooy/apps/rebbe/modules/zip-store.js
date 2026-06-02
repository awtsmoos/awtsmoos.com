//B"H

/**
 * B"H
 * A tiny no-compression ZIP writer. When many sichos must travel together, the
 * Awtsmoos braids raw bytes into one vessel without external libraries.
 * @param {{name:string, blob:Blob}[]} files Files to pack.
 * @returns {Promise<Blob>} ZIP blob.
 */
export async function makeZip(files) {
  const entries = [];
  const central = [];
  let offset = 0;
  for (const file of files) {
    const entry = await makeEntry(file, offset);
    entries.push(entry.local);
    central.push(entry.central);
    offset += entry.local.size;
  }
  const end = endRecord(central.length, sizeOf(central), offset);
  return new Blob([...entries, ...central, end], { type: 'application/zip' });
}

async function makeEntry(file, offset) {
  const bytes = new Uint8Array(await file.blob.arrayBuffer());
  const name = encodeName(file.name);
  const crc = crc32(bytes);
  const local = chunk([
    u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
    u32(crc), u32(bytes.length), u32(bytes.length), u16(name.length), u16(0), name, bytes
  ]);
  const central = chunk([
    u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
    u32(crc), u32(bytes.length), u32(bytes.length), u16(name.length), u16(0), u16(0),
    u16(0), u16(0), u32(0), u32(offset), name
  ]);
  return { local, central };
}

function endRecord(count, centralSize, centralOffset) {
  return chunk([
    u32(0x06054b50), u16(0), u16(0), u16(count), u16(count),
    u32(centralSize), u32(centralOffset), u16(0)
  ]);
}

function chunk(parts) {
  return new Blob(parts);
}

function sizeOf(blobs) {
  return blobs.reduce((sum, blob) => sum + blob.size, 0);
}

function encodeName(name) {
  return new TextEncoder().encode(safeName(name));
}

export function safeName(name) {
  return String(name || 'file')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140) || 'file';
}

function u16(value) {
  const out = new Uint8Array(2);
  new DataView(out.buffer).setUint16(0, value, true);
  return out;
}

function u32(value) {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value >>> 0, true);
  return out;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
