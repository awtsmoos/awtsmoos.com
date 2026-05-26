// B"H

/**
 * B"H
 * Small token stream for the C++ parser.
 *
 * Chapter 2: the stream remembers where each word stands. When syntax stumbles,
 * it names the exact stone in the road.
 */
export class CppTokenStream {
  constructor(tokens) { this.tokens = tokens; this.index = 0; }
  peek(offset = 0) { return this.tokens[this.index + offset] || this.tokens[this.tokens.length - 1]; }
  consume() { return this.tokens[this.index++]; }
  match(value) { if (this.peek().value === value) { this.consume(); return true; } return false; }
  expectValue(value) {
    const token = this.consume();
    if (token.value !== value) this.error(`Expected ${value}, got ${token.value || token.type}`);
    return token;
  }
  expectType(type) {
    const token = this.consume();
    if (token.type !== type) this.error(`Expected ${type}, got ${token.value || token.type}`);
    return token;
  }
  error(message) {
    const token = this.peek();
    throw new Error(`${message} at ${token.line}:${token.col}`);
  }
}
