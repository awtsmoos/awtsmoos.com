// B"H
// Tiferet-ChaCha20.js: Beauty - A from-scratch, RFC 8439 compliant ChaCha20 implementation.
// This file has no dependency on the native 'crypto' module for its core logic.

'use strict';

// Helper function for 32-bit addition with wrapping (modulo 2^32).
const add = (a, b) => (a + b) >>> 0;

// Helper function for 32-bit left-rotation.
const rotl = (x, n) => (x << n) | (x >>> (32 - n));

/**
 * The ChaCha20 Quarter Round function.
 * Operates on a 4-word selection from the state.
 * @param {Uint32Array} x - The state array.
 * @param {number} a - Index of the first word.
 * @param {number} b - Index of the second word.
 * @param {number} c - Index of the third word.
 * @param {number} d - Index of the fourth word.
 */
function quarterRound(x, a, b, c, d) {
  x[a] = add(x[a], x[b]); x[d] = rotl(x[d] ^ x[a], 16);
  x[c] = add(x[c], x[d]); x[b] = rotl(x[b] ^ x[c], 12);
  x[a] = add(x[a], x[b]); x[d] = rotl(x[d] ^ x[a], 8);
  x[c] = add(x[c], x[d]); x[b] = rotl(x[b] ^ x[c], 7);
}

/**
 * Generates a 64-byte ChaCha20 keystream block.
 * @param {Buffer} key - The 32-byte (256-bit) key.
 * @param {Buffer} nonce - The 12-byte (96-bit) nonce.
 * @param {number} counter - The 32-bit block counter.
 * @returns {Buffer} A 64-byte keystream block.
 */
function chacha20_block(key, nonce, counter) {
  const state = new Uint32Array(16);

  // 1. Constants (Little-Endian)
  state[0] = 0x61707865;
  state[1] = 0x3320646e;
  state[2] = 0x79622d32;
  state[3] = 0x6b206574;

  // 2. Key (Little-Endian)
  for (let i = 0; i < 8; i++) {
    state[4 + i] = key.readUInt32LE(i * 4);
  }

  // 3. Counter and Nonce
  state[12] = counter;
  
  // =========================================================================
  // THE FINAL BUG FIX IS HERE
  // The OpenSSH protocol specifies a Big-Endian nonce (the sequence number).
  // We must read it from the buffer in Big-Endian format to match the spec.
  // =========================================================================
  state[13] = nonce.readUInt32BE(0);
  state[14] = nonce.readUInt32BE(4);
  state[15] = nonce.readUInt32BE(8);

  const workingState = new Uint32Array(state);

  // 20 rounds of quarter rounds
  for (let i = 0; i < 10; i++) {
    quarterRound(workingState, 0, 4, 8, 12);
    quarterRound(workingState, 1, 5, 9, 13);
    quarterRound(workingState, 2, 6, 10, 14);
    quarterRound(workingState, 3, 7, 11, 15);
    quarterRound(workingState, 0, 5, 10, 15);
    quarterRound(workingState, 1, 6, 11, 12);
    quarterRound(workingState, 2, 7, 8, 13);
    quarterRound(workingState, 3, 4, 9, 14);
  }

  for (let i = 0; i < 16; i++) {
    state[i] = add(state[i], workingState[i]);
  }

  const keystream = Buffer.alloc(64);
  for (let i = 0; i < 16; i++) {
    keystream.writeUInt32LE(state[i], i * 4);
  }

  return keystream;
}

function chacha20_openssh_block(key, seqno, counter) {
  const state = new Uint32Array(16);
  const nonce = Buffer.alloc(8);
  nonce.writeBigUInt64BE(BigInt(seqno), 0);

  state[0] = 0x61707865;
  state[1] = 0x3320646e;
  state[2] = 0x79622d32;
  state[3] = 0x6b206574;

  for (let i = 0; i < 8; i++) {
    state[4 + i] = key.readUInt32LE(i * 4);
  }

  state[12] = Number(BigInt(counter) & 0xffffffffn);
  state[13] = Number((BigInt(counter) >> 32n) & 0xffffffffn);
  state[14] = nonce.readUInt32LE(0);
  state[15] = nonce.readUInt32LE(4);

  const workingState = new Uint32Array(state);

  for (let i = 0; i < 10; i++) {
    quarterRound(workingState, 0, 4, 8, 12);
    quarterRound(workingState, 1, 5, 9, 13);
    quarterRound(workingState, 2, 6, 10, 14);
    quarterRound(workingState, 3, 7, 11, 15);
    quarterRound(workingState, 0, 5, 10, 15);
    quarterRound(workingState, 1, 6, 11, 12);
    quarterRound(workingState, 2, 7, 8, 13);
    quarterRound(workingState, 3, 4, 9, 14);
  }

  for (let i = 0; i < 16; i++) {
    state[i] = add(state[i], workingState[i]);
  }

  const keystream = Buffer.alloc(64);
  for (let i = 0; i < 16; i++) {
    keystream.writeUInt32LE(state[i], i * 4);
  }

  return keystream;
}

/**
 * Encrypts or decrypts data using the ChaCha20 stream cipher.
 * @param {Buffer} key - The 32-byte key.
 * @param {Buffer} nonce - The 12-byte nonce.
 * @param {number} initial_counter - The starting block counter.
 * @param {Buffer} plaintext - The data to encrypt.
 * @returns {Buffer} The resulting ciphertext.
 */
function chacha20_xor(key, nonce, initial_counter, plaintext) {
  const ciphertext = Buffer.alloc(plaintext.length);
  const block_size = 64;
  let counter = initial_counter;

  for (let i = 0; i < plaintext.length; i += block_size) {
    const keystream = chacha20_block(key, nonce, counter);
    const chunk = plaintext.slice(i, i + block_size);

    for (let j = 0; j < chunk.length; j++) {
      ciphertext[i + j] = chunk[j] ^ keystream[j];
    }
    counter++;
  }

  return ciphertext;
}

function chacha20_openssh_xor(key, seqno, initial_counter, plaintext) {
  const ciphertext = Buffer.alloc(plaintext.length);
  const blockSize = 64;
  let counter = BigInt(initial_counter);

  for (let i = 0; i < plaintext.length; i += blockSize) {
    const keystream = chacha20_openssh_block(key, seqno, counter);
    const chunk = plaintext.slice(i, i + blockSize);

    for (let j = 0; j < chunk.length; j++) {
      ciphertext[i + j] = chunk[j] ^ keystream[j];
    }
    counter++;
  }

  return ciphertext;
}

module.exports = { chacha20_xor, chacha20_openssh_xor };
