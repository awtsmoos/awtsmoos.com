// B"H
import { parsePortableExecutable } from './peParser.js';
import { makeByteVessel, readAscii } from './bytes.js';

/**
 * Maps a PE image into a reversible JS description with sections and imports.
 * @param {ArrayBuffer} buffer executable bytes
 * @returns {{pe:object, bytes:Uint8Array, view:DataView, imports:Map, rvaToOffset:Function, readCString:Function}}
 */
export function mapPeImage(buffer) {
  const pe = parsePortableExecutable(buffer);
  const { bytes, view } = makeByteVessel(buffer);
  const image = {
    pe, bytes, view,
    imports: new Map(),
    rvaToOffset: rva => rvaToOffset(pe.sections, rva),
    readCString: rva => readCString(bytes, rvaToOffset(pe.sections, rva))
  };
  readImportTable(image);
  return image;
}

function rvaToOffset(sections, rva) {
  const sec = sections.find(s => rva >= s.virtualAddress && rva < s.virtualAddress + Math.max(s.virtualSize, s.rawSize));
  if (!sec) return rva;
  return sec.rawPointer + (rva - sec.virtualAddress);
}

function readImportTable(image) {
  const peAt = image.view.getUint32(0x3C, true);
  const opt = peAt + 24;
  const importRva = image.view.getUint32(opt + 120, true);
  if (!importRva) return;
  let desc = image.rvaToOffset(importRva);
  while (image.view.getUint32(desc + 12, true)) {
    const dll = image.readCString(image.view.getUint32(desc + 12, true));
    let thunk = image.rvaToOffset(image.view.getUint32(desc + 16, true));
    while (image.view.getUint32(thunk, true)) {
      const hintNameRva = image.view.getUint32(thunk, true);
      const fn = readCString(image.bytes, image.rvaToOffset(hintNameRva) + 2);
      image.imports.set(image.view.getUint32(desc + 16, true) + (thunk - image.rvaToOffset(image.view.getUint32(desc + 16, true))), `${dll}!${fn}`);
      thunk += 8;
    }
    desc += 20;
  }
}

function readCString(bytes, offset) {
  let end = offset;
  while (end < bytes.length && bytes[end] !== 0) end++;
  return readAscii(bytes, offset, end - offset);
}
