// B"H
'use strict';

/**
 * Chapter 8: The Awtsmoos gives the broken vessel a name and a path.
 *
 * MD2 execution does not use eval or generated JavaScript. When a bytecode
 * instruction fails, this runtime wraps the thrown value with a compact MD2
 * stack that names function id, instruction pointer, opcode, and opcode name.
 */
class Mode2RuntimeError extends Error {
  /**
   * @param {*} cause - Original thrown value.
   * @param {Array<object>} frames - MD2 frames, outermost last.
   */
  constructor(cause, frames = []) {
    const message = cause && cause.message ? cause.message : String(cause);
    super(message);
    this.name = 'Mode2RuntimeError';
    this.cause = cause;
    this.md2Stack = frames.slice();
    this.stack = this.formatStack();
  }

  /** @returns {string} readable MD2 stack without host interpreter frames. */
  formatStack() {
    const lines = [`${this.name}: ${this.message}`];
    for (const frame of this.md2Stack) {
      const fn = frame.functionId == null ? '<main>' : `fn#${frame.functionId}`;
      const op = frame.opName || `op${frame.op}`;
      lines.push(`    at ${fn} ip=${frame.ip} ${op}`);
    }
    return lines.join('\n');
  }
}

/**
 * @param {*} error - Any thrown value.
 * @returns {boolean} true if already wrapped as an MD2 runtime error.
 */
function isMode2RuntimeError(error) {
  return error instanceof Mode2RuntimeError || Boolean(error && error.md2Stack);
}

/**
 * @param {*} error - Any thrown value.
 * @param {object} frame - Current MD2 frame metadata.
 * @returns {Mode2RuntimeError} wrapped or augmented error.
 */
function attachMode2Frame(error, frame) {
  if (isMode2RuntimeError(error)) {
    error.md2Stack.unshift(frame);
    error.stack = error.formatStack ? error.formatStack() : error.stack;
    return error;
  }
  return new Mode2RuntimeError(error, [frame]);
}

module.exports = { Mode2RuntimeError, attachMode2Frame, isMode2RuntimeError };
