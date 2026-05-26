// B"H
'use strict';

/**
 * Chapter 7: The Awtsmoos opens a gate out of the loop.
 *
 * This tiny helper owns loop break bookkeeping for the MD2 statement compiler.
 * It intentionally stores only patch indexes. The monolith still emits code;
 * this module merely keeps break stacks and labels honest while extraction
 * proceeds one verified spark at a time.
 */
class Mode2LoopExitCompiler {
  /** @param {Array} code - Mutable MD2 instruction stream. */
  ensure(code) {
    code.__md2BreakStack = code.__md2BreakStack || [];
    code.__md2BreakLabels = code.__md2BreakLabels || Object.create(null);
    return code;
  }

  /**
   * @param {Array} code - Mutable MD2 instruction stream.
   * @param {string|undefined|null} label - Optional loop label.
   * @returns {Array<number>} break patch list for this loop.
   */
  enterLoop(code, label) {
    this.ensure(code);
    const exits = [];
    code.__md2BreakStack.push(exits);
    if (label) code.__md2BreakLabels[label] = exits;
    return exits;
  }

  /** @param {Array} code @param {string|undefined|null} label */
  leaveLoop(code, label) {
    this.ensure(code);
    code.__md2BreakStack.pop();
    if (label) delete code.__md2BreakLabels[label];
  }

  /**
   * @param {Array} code - Mutable MD2 instruction stream.
   * @param {string|undefined|null} label - Optional requested break label.
   * @returns {number} instruction index to patch later.
   */
  emitBreak(code, label) {
    this.ensure(code);
    const stack = code.__md2BreakStack;
    const exits = label ? code.__md2BreakLabels[label] : stack[stack.length - 1];
    if (!exits) throw new Error('MD2 break outside loop or switch');
    const at = code.push([17, 0]) - 1;
    exits.push(at);
    return at;
  }

  /** @param {Array} code @param {Array<number>} exits @param {number} target */
  patchBreaks(code, exits, target) {
    for (const at of exits || []) code[at][1] = target;
  }
}

const mode2LoopExitCompiler = new Mode2LoopExitCompiler();

module.exports = { Mode2LoopExitCompiler, mode2LoopExitCompiler };
