import assert from 'node:assert/strict';

export function findAscii(bytes, text) {
  const needle = [...text].map(c => c.charCodeAt(0));
  return bytes.findIndex((_, i) => needle.every((v, j) => bytes[i + j] === v));
}

export function countId(bytes, id) {
  let count = 0;
  for (let i = 0; i <= bytes.length - id.length; i++) if (id.every((v, j) => bytes[i + j] === v)) count++;
  return count;
}

export function assertAscii(bytes, text) { assert.ok(findAscii(bytes, text) > 0, `missing ${text}`); }
export function assertIdCountAtLeast(bytes, id, min, name) { assert.ok(countId(bytes, id) >= min, `missing enough ${name}`); }
export function assertDurationElement(bytes) { assert.ok(countId(bytes, [0x44,0x89]) >= 1, 'missing Info.Duration'); }

export function assertOpusHeadLittleEndian(bytes) {
  const at = findAscii(bytes, 'OpusHead');
  assert.ok(at > 0, 'missing OpusHead');
  assert.equal(bytes[at + 8], 1, 'OpusHead version');
  assert.equal(bytes[at + 10], 0x38, 'Opus pre-skip little byte 0');
  assert.equal(bytes[at + 11], 0x01, 'Opus pre-skip little byte 1');
  assert.deepEqual([...bytes.slice(at + 12, at + 16)], [0x80,0xbb,0x00,0x00], 'Opus sample rate little-endian');
}
