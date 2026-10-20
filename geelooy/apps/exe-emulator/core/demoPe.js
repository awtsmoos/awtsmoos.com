// B"H
const PE = 0x40;
const OPT = PE + 24;
const SECTION = OPT + 0xF0;

/**
 * Builds a tiny PE-shaped buffer for emulator demos.
 * @param {'console'|'gui'} mode subsystem flavor
 * @returns {ArrayBuffer} valid-enough PE32+ demo bytes
 */
export function createDemoPe(mode) {
  const bytes = new Uint8Array(1024);
  const view = new DataView(bytes.buffer);
  view.setUint16(0, 0x5A4D, true);
  view.setUint32(0x3C, PE, true);
  view.setUint32(PE, 0x4550, true);
  view.setUint16(PE + 4, 0x8664, true);
  view.setUint16(PE + 6, 1, true);
  view.setUint16(PE + 20, 0xF0, true);
  view.setUint16(PE + 22, 0x0023, true);
  view.setUint16(OPT, 0x020B, true);
  view.setUint32(OPT + 16, 0x1000, true);
  view.setBigUint64(OPT + 24, 0x140000000n, true);
  view.setUint16(OPT + 68, mode === 'gui' ? 2 : 3, true);
  writeAscii(bytes, SECTION, '.text');
  view.setUint32(SECTION + 8, 0x200, true);
  view.setUint32(SECTION + 12, 0x1000, true);
  view.setUint32(SECTION + 16, 0x200, true);
  view.setUint32(SECTION + 20, 0x200, true);
  view.setUint32(SECTION + 36, 0xE0000060, true);
  // A demo must contain a program: write a minimal instruction sequence
  // from the emulator's supported x64 subset at the .text raw offset
  // (PointerToRawData = 0x200, the entry point's file position).
  // ret on the initially empty stack is the subset's halt.
  const CODE = 0x200;
  const program = mode === 'gui'
    ? [0x31, 0xC9,                   // xor ecx, ecx
       0xB8, 0x07, 0x00, 0x00, 0x00, // mov eax, 7
       0xC3]                         // ret (halt)
    : [0xB8, 0x2A, 0x00, 0x00, 0x00, // mov eax, 42
       0xC3];                        // ret (halt)
  program.forEach((b, i) => { bytes[CODE + i] = b; });
  return bytes.buffer;
}

function writeAscii(bytes, offset, text) {
  [...text].forEach((ch, i) => { bytes[offset + i] = ch.charCodeAt(0); });
}
