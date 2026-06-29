// B"H

/**
 * Tiny max-priority queue for SentencePiece merge candidates.
 *
 * The glyphs stand like sparks in a narrow alley.  The highest scored pair
 * steps forward, two sparks become one flame, and the hidden word emerges
 * without the whole street forgetting its order.
 */
class PriorityQueue {
  constructor(compare) {
    this.heap = [];
    this.compare = compare;
  }

  get size() {
    return this.heap.length;
  }

  push(value) {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (!this.heap.length) return null;
    const top = this.heap[0];
    const tail = this.heap.pop();
    if (this.heap.length) {
      this.heap[0] = tail;
      this.sinkDown(0);
    }
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

module.exports = { PriorityQueue };
