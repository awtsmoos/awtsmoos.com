// B"H
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const Omni = require('../utils/compression/omni.js');

function run() {
  const text = 'B"H '.repeat(1024) + 'awtsmoos '.repeat(1024);
  const packed = Omni.pack(text);
  const unpacked = Omni.unpack(packed);
  assert(unpacked === text, 'Text roundtrip failed');

  const binary = Buffer.allocUnsafe(4096);
  for (let i = 0; i < binary.length; i++) binary[i] = i % 251;
  const binaryAsLatin = binary.toString('latin1');
  const repacked = Omni.pack(binaryAsLatin);
  const restored = Omni.unpack(repacked);
  assert(restored === binaryAsLatin, 'Binary-like latin1 roundtrip failed');

  const rawTextBytes = Buffer.byteLength(text, 'utf8');
  assert(
    packed.length < rawTextBytes / 2,
    `Text compression too weak: packed=${packed.length}, raw=${rawTextBytes}`
  );

  const repeatedBinary = Buffer.allocUnsafe(4096);
  for (let i = 0; i < repeatedBinary.length; i++) repeatedBinary[i] = i % 32;
  const packedBinary = Omni.packBinary(repeatedBinary);
  const restoredBinary = Omni.unpackBuffer(packedBinary.buffer);

  assert(packedBinary.compressed, 'Repeated binary should compress');
  assert(Buffer.compare(restoredBinary, repeatedBinary) === 0, 'Compressed binary roundtrip failed');
  assert(
    packedBinary.buffer.length < repeatedBinary.length / 2,
    `Binary compression too weak: packed=${packedBinary.buffer.length}, raw=${repeatedBinary.length}`
  );
  console.log('B"H compression_extreme_test PASS');
}

run();
