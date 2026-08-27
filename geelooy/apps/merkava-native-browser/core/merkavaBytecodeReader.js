// B"H

/**
 * B"H
 * Reads the outer Merkava bytecode header.
 *
 * The historical on-disk magic is still MD2\0, but the public language is now
 * Merkava bytecode: one executor, one vessel, one byte stream.
 *
 * @param {Uint8Array|Buffer|number[]} bytes Merkava bytecode bytes.
 * @returns {{ok: boolean, magic: string, section: number, bytes: Uint8Array}}
 */
export function readMerkavaBytecode(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  const magic = String.fromCharCode(...view.slice(0, 4));
  if (magic !== "MD2\0") return { ok: false, magic, section: -1, bytes: view };
  return { ok: true, magic: "MERKAVA", section: view[4] ?? 0, bytes: view };
}

/**
 * B"H
 * Converts bytes into a C array literal.
 *
 * @param {Uint8Array|Buffer|number[]} bytes Byte stream.
 * @param {string} name C symbol name.
 * @returns {string} Complete C declaration.
 */
export function bytesToCArray(bytes, name = "AWTSMOOS_MERKAVA_APP") {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  const rows = [];
  for (let i = 0; i < view.length; i += 16) {
    rows.push("  " + Array.from(view.slice(i, i + 16)).join(", "));
  }
  return [
    `static const unsigned char ${name}[] = {`,
    rows.join(",\n"),
    "};",
    `static const unsigned int ${name}_LEN = ${view.length};`
  ].join("\n");
}

export const readMd2 = readMerkavaBytecode;
