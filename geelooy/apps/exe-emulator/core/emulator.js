// B"H
import { mapPeImage } from './peImage.js';
import { runCompilerX64 } from './x64Lite.js';

/**
 * Emulates compiler-generated PE files through x64-lite, with a window fallback.
 * @param {ArrayBuffer} buffer executable bytes
 * @param {{print:Function, openWindow:Function}} win virtual Windows host
 * @returns {{mode:string, message:string, runtime:object}}
 */
export function emulatePortableExecutable(buffer, win) {
  const image = mapPeImage(buffer);
  const { pe } = image;
  win.print('Awtsmoos loader: MZ became PE, PE became mapped memory.');
  win.print(`Subsystem: ${pe.subsystem}`);
  win.print(`ImageBase: 0x${pe.imageBase.toString(16)}`);
  win.print(`EntryRVA: 0x${pe.entryRva.toString(16)}`);
  pe.sections.forEach(sec => win.print(sectionLine(sec)));
  image.imports.forEach((name, rva) => win.print(`IAT 0x${rva.toString(16)} -> ${name}`));
  try {
    const runtime = runCompilerX64(image, win);
    return { mode: pe.subsystem, message: 'Executed compiler x64 subset.', runtime };
  } catch (error) {
    const runtime = fallbackCompilerWindow(image, win, error);
    return { mode: pe.subsystem, message: 'Used compiler window fallback.', runtime };
  }
}

function fallbackCompilerWindow(image, win, error) {
  const imports = [...image.imports.values()].join('\n');
  if (!/CreateWindowExA|TextOutA|SetPixel/.test(imports)) throw error;
  const strings = extractStrings(image).filter(s => s.length > 2);
  const title = strings.find(s => /B\\?"H|Window|Drawing|Native/i.test(s)) || 'Virtual Native Window';
  const body = strings.find(s => /Awtsmoos|Generated|Native/i.test(s) && s !== title) || 'Compiler-generated Win32 window mapped semantically.';
  win.openWindow(title, body);
  if (/TextOutA/.test(imports)) win.print(`GDI TextOutA: ${body}`);
  if (/SetPixel/.test(imports)) win.print('GDI SetPixel: diagonal pixel ritual rendered symbolically.');
  win.print(`Fallback reason: ${error.message}`);
  return { fallback: true, reason: error.message };
}

function extractStrings(image) {
  const sec = image.pe.sections.find(s => s.name === '.text') || image.pe.sections[0];
  const bytes = image.bytes.slice(sec.rawPointer, sec.rawPointer + sec.rawSize);
  const text = new TextDecoder().decode(bytes.map(b => (b >= 32 && b < 127) ? b : 0x0A));
  return text.split(/\n+/).map(s => s.trim()).filter(Boolean);
}

function sectionLine(sec) {
  return `${sec.name || '.section'} RVA=0x${sec.virtualAddress.toString(16)} RAW=${sec.rawSize}`;
}
