// B"H
import { makeByteVessel, readAscii } from './bytes.js';

const SUBSYSTEMS = { 2: 'windows-gui', 3: 'windows-console' };

/**
 * Parses enough PE32+ structure to reverse the compiler's PE building path.
 * @param {ArrayBuffer} buffer executable bytes
 * @returns {{valid:boolean, subsystem:string, entryRva:number, imageBase:number, sections:Array}}
 */
export function parsePortableExecutable(buffer) {
  const { bytes, view } = makeByteVessel(buffer);
  if (view.getUint16(0, true) !== 0x5A4D) throw new Error('Missing MZ header.');
  const peAt = view.getUint32(0x3C, true);
  if (view.getUint32(peAt, true) !== 0x4550) throw new Error('Missing PE signature.');
  const sections = view.getUint16(peAt + 6, true);
  const optionalSize = view.getUint16(peAt + 20, true);
  const opt = peAt + 24;
  const entryRva = view.getUint32(opt + 16, true);
  const imageBase = Number(view.getBigUint64(opt + 24, true));
  const subsystemId = view.getUint16(opt + 68, true);
  const table = opt + optionalSize;
  return {
    valid: true,
    subsystem: SUBSYSTEMS[subsystemId] || `unknown-${subsystemId}`,
    entryRva,
    imageBase,
    sections: readSections(bytes, view, table, sections)
  };
}

function readSections(bytes, view, table, count) {
  return Array.from({ length: count }, (_, index) => {
    const at = table + index * 40;
    return {
      name: readAscii(bytes, at, 8),
      virtualSize: view.getUint32(at + 8, true),
      virtualAddress: view.getUint32(at + 12, true),
      rawSize: view.getUint32(at + 16, true),
      rawPointer: view.getUint32(at + 20, true),
      characteristics: view.getUint32(at + 36, true)
    };
  });
}
