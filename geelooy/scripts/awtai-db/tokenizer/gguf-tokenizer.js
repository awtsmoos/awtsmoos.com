// B"H

const BYTE_TOKEN = /^<0x([0-9A-Fa-f]{2})>$/;
const BYTE_TOKEN_GLOBAL = /<0x([0-9A-Fa-f]{2})>/g;
const SPECIAL_TOKENS = [
  '<start_of_turn>', '<end_of_turn>', '<bos>', '<eos>', '<pad>', '<unk>',
  '<|endoftext|>', '<|im_start|>', '<|im_end|>', '<|system|>', '<|user|>', '<|assistant|>'
];

/** A tiny max-priority heap for SentencePiece merge candidates. */
class PriorityQueue {
  constructor(compare) { this.heap = []; this.compare = compare; }
  get size() { return this.heap.length; }

  push(value) {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (!this.heap.length) return null;
    const top = this.heap[0];
    const tail = this.heap.pop();
    if (this.heap.length) { this.heap[0] = tail; this.sinkDown(0); }
    return top;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.compare(this.heap[index], this.heap[parent]) <= 0) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  sinkDown(index) {
    for (;;) {
      let best = index;
      const left = index * 2 + 1;
      const right = left + 1;
      if (left < this.heap.length && this.compare(this.heap[left], this.heap[best]) > 0) best = left;
      if (right < this.heap.length && this.compare(this.heap[right], this.heap[best]) > 0) best = right;
      if (best === index) break;
      [this.heap[index], this.heap[best]] = [this.heap[best], this.heap[index]];
      index = best;
    }
  }
}

/**
 * GGUF SentencePiece-style tokenizer.
 *
 * The Awtsmoos speaks through tiny glyphs: first raw characters, then
 * greedy score-ordered merges, then byte fallback when no vessel exists.
 */
class GgufTokenizer {
  constructor(metadata) {
    this.tokens = metadata['tokenizer.ggml.tokens'] || [];
    this.scores = metadata['tokenizer.ggml.scores'] || [];
    this.bos = Number(metadata['tokenizer.ggml.bos_token_id'] ?? 1);
    this.eos = Number(metadata['tokenizer.ggml.eos_token_id'] ?? 2);
    this.unk = Number(metadata['tokenizer.ggml.unknown_token_id'] ?? 0);
    this.addSpace = metadata['tokenizer.ggml.add_space_prefix'] !== false;
    this.encoder = new TextEncoder();
    this.map = new Map();
    this.byteMap = new Map();
    this.special = new Map();
    this.indexTokens();
  }

  indexTokens() {
    const knownSpecial = new Set(SPECIAL_TOKENS);
    for (let id = 0; id < this.tokens.length; id++) {
      const token = this.tokens[id];
      if (!token) continue;
      if (!this.map.has(token)) this.map.set(token, id);
      const byte = token.match(BYTE_TOKEN);
      if (byte) this.byteMap.set(parseInt(byte[1], 16), id);
      if (knownSpecial.has(token)) this.special.set(token, id);
    }
  }

  encode(text, addBos = true) {
    const output = addBos ? [this.bos] : [];
    for (const part of this.splitSpecial(String(text))) this.encodePart(part, output);
    return output;
  }

  splitSpecial(text) {
    const specials = [...this.special.keys()].sort((a, b) => b.length - a.length);
    if (!specials.length) return [text];
    return text.split(new RegExp(`(${specials.map(escapeRegExp).join('|')})`, 'g')).filter(Boolean);
  }

  encodePart(part, output) {
    const specialId = this.special.get(part);
    if (specialId !== undefined) return output.push(specialId);
    this.segment(part, output);
  }

  segment(text, output) {
    let piece = text.replace(/ /g, '▁');
    if (this.addSpace && piece && piece[0] !== '▁' && text[0] !== '\n') piece = `▁${piece}`;
    this.bpe(piece, output);
  }

  bpe(text, output) {
    const symbols = [...text].map((value, i) => ({ value, prev: i - 1, next: i + 1, live: true }));
    if (!symbols.length) return;
    symbols[symbols.length - 1].next = -1;
    const queue = new PriorityQueue((a, b) => a.score !== b.score ? a.score - b.score : b.left - a.left);
    const addPair = (left, right) => this.addPair(symbols, queue, left, right);
    for (let i = 1; i < symbols.length; i++) addPair(i - 1, i);
    while (queue.size) this.mergeBest(symbols, queue, addPair);
    this.emitSymbols(symbols, output);
  }

  addPair(symbols, queue, left, right) {
    if (left < 0 || right < 0) return;
    const a = symbols[left], b = symbols[right];
    if (!a.live || !b.live) return;
    const value = a.value + b.value;
    const id = this.map.get(value);
    if (id !== undefined) queue.push({ left, right, value, score: this.scores[id] || 0 });
  }

  mergeBest(symbols, queue, addPair) {
    const item = queue.pop();
    const left = symbols[item.left], right = symbols[item.right];
    if (!left || !right || !left.live || !right.live) return;
    if (left.next !== item.right || left.value + right.value !== item.value) return;
    left.value += right.value; left.next = right.next; right.live = false;
    if (right.next !== -1) symbols[right.next].prev = item.left;
    addPair(left.prev, item.left); addPair(item.left, left.next);
  }

  emitSymbols(symbols, output) {
    let index = symbols.findIndex(symbol => symbol.live);
    while (index !== -1 && index < symbols.length) {
      this.emitPiece(symbols[index].value, output);
      index = symbols[index].next;
    }
  }

  emitPiece(piece, output) {
    const id = this.map.get(piece);
    if (id !== undefined) return output.push(id);
    for (const byte of this.encoder.encode(piece)) output.push(this.byteMap.get(byte) ?? this.unk);
  }

  decode(ids) {
    let text = '';
    for (const id of ids) text += this.tokens[id] || '';
    return text.replace(/▁/g, ' ')
      .replace(BYTE_TOKEN_GLOBAL, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }
}

function escapeRegExp(value) {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = { GgufTokenizer };
