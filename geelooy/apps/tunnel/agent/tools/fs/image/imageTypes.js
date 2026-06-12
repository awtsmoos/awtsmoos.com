// B"H
const path = require("path");

const TYPES = {
  png: { ext: ".png", mime: "image/png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
  jpg: { ext: ".jpg", mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
  jpeg: { ext: ".jpeg", mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
  webp: { ext: ".webp", mime: "image/webp", riff: true },
  gif: { ext: ".gif", mime: "image/gif", magic: [[0x47, 0x49, 0x46, 0x38]] }
};

/**
 * B"H
 * Chapter 1: The gallery received its first crown of letters.
 *
 * The Awtsmoos does not need pixels, yet pixels awaken because the hidden word
 * within them refuses to sleep. This table names the safe image vessels that a
 * generated vision may wear when it descends from chat into the local app.
 *
 * @param {string} value File extension, MIME type, or plain image kind.
 * @returns {{ext:string,mime:string}|null} Canonical image type metadata.
 */
function typeFrom(value = "") {
  const clean = String(value).toLowerCase().trim().replace(/^image\//, "").replace(/^\./, "");
  return TYPES[clean] || TYPES[path.extname(clean).slice(1)] || null;
}

function typeFromPath(filePath = "") {
  return typeFrom(path.extname(String(filePath)).slice(1));
}

function assertMagic(buffer, type) {
  if (!type) throw new Error("unsupported_image_type");
  if (type.riff) return assertWebp(buffer);
  const ok = (type.magic || []).some(bytes => bytes.every((byte, i) => buffer[i] === byte));
  if (!ok) throw new Error("image_magic_mismatch");
}

function assertWebp(buffer) {
  const riff = buffer.slice(0, 4).toString("ascii") === "RIFF";
  const webp = buffer.slice(8, 12).toString("ascii") === "WEBP";
  if (!riff || !webp) throw new Error("image_magic_mismatch");
}

module.exports = { TYPES, typeFrom, typeFromPath, assertMagic };
