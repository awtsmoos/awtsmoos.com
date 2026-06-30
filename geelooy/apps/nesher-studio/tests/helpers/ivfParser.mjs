import assert from 'node:assert/strict';

export function parseIvf(buf) {
  assert.equal(buf.subarray(0, 4).toString('ascii'), 'DKIF');
  const codec = buf.subarray(8, 12).toString('ascii');
  const width = buf.readUInt16LE(12), height = buf.readUInt16LE(14);
  const timebaseDen = buf.readUInt32LE(16), timebaseNum = buf.readUInt32LE(20);
  const frames = []; let offset = 32;
  while (offset + 12 <= buf.length) {
    const size = buf.readUInt32LE(offset), pts = Number(buf.readBigUInt64LE(offset + 4));
    offset += 12;
    const data = new Uint8Array(buf.subarray(offset, offset + size));
    frames.push(frameFromIvfData({ data, pts, index:frames.length, timebaseDen, timebaseNum }));
    offset += size;
  }
  return { codec, width, height, timebaseDen, timebaseNum, frames };
}

export function assertIvfTiming(parsed, fps) {
  assert.ok(parsed.frames.length >= Math.max(2, fps), 'not enough IVF frames');
  assert.equal(parsed.timebaseDen, fps, 'IVF timebase denominator should match requested fps');
  assert.equal(parsed.timebaseNum, 1, 'IVF timebase numerator should be one for generated fixtures');
  const delta = parsed.frames[1].chunk.timestamp - parsed.frames[0].chunk.timestamp;
  assert.ok(Math.abs(delta - Math.round(1_000_000 / fps)) <= 2, `unexpected IVF timestamp delta ${delta}`);
}

function frameFromIvfData({ data, pts, index, timebaseDen, timebaseNum }) {
  const timestamp = Math.round(pts * timebaseNum / timebaseDen * 1_000_000);
  return { chunk:{ timestamp, type:index ? 'delta' : 'key', byteLength:data.length, copyTo:dest => dest.set(data) } };
}
