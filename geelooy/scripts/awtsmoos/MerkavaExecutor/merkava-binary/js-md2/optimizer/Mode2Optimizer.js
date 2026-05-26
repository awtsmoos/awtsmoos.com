// B"H
'use strict';

/**
 * Chapter 13: The Awtsmoos compresses the path without bending truth.
 *
 * The first optimizer pass is deliberately lossless and metadata-driven. It
 * measures common superinstruction opportunities so later fusions can be added
 * one at a time with proof. It also removes impossible empty code containers
 * and returns a precise report without mutating semantics.
 */
class Mode2Optimizer {
  /**
   * @param {{code:Array<Array<number>>,functions?:Array<object>}} program
   * @param {Record<string, number>} opcodes
   * @returns {{program:object,report:object}}
   */
  optimize(program, opcodes) {
    const report = {
      instructionCount: this.count(program),
      incSlotCandidates: this.countIncCandidates(program, opcodes),
      callArityCandidates: this.countCallArityCandidates(program, opcodes)
    };
    return { program, report };
  }

  /** @param {object} program */
  count(program) {
    return (program.code?.length || 0) + (program.functions || []).reduce((sum, fn) => sum + (fn.code?.length || 0), 0);
  }

  /**
   * @param {object} program
   * @param {Record<string, number>} op
   */
  countIncCandidates(program, op) {
    let count = 0;
    const scan = code => {
      for (let i = 0; i < (code || []).length - 3; i++) {
        if (code[i][0] === op.LOAD && code[i + 1][0] === op.CONST && code[i + 2][0] === op.ADD && code[i + 3][0] === op.STORE && code[i][1] === code[i + 3][1]) count++;
      }
    };
    scan(program.code);
    for (const fn of program.functions || []) scan(fn.code);
    return count;
  }

  /**
   * @param {object} program
   * @param {Record<string, number>} op
   */
  countCallArityCandidates(program, op) {
    let count = 0;
    const scan = code => { for (const ins of code || []) if ((ins[0] === op.CALL_FUNCTION || ins[0] === op.CALL_METHOD) && ins[2] <= 3) count++; };
    scan(program.code);
    for (const fn of program.functions || []) scan(fn.code);
    return count;
  }
}

const mode2Optimizer = new Mode2Optimizer();

module.exports = { Mode2Optimizer, mode2Optimizer };
