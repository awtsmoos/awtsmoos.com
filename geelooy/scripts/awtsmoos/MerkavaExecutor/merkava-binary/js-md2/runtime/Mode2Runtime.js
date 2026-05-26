// B"H
'use strict';

/**
 * Chapter 4: The Awtsmoos measures the chariot in typed-array bones.
 *
 * The MD2 runtime keeps execution compact by exposing opcode and operand lanes
 * as typed arenas. This class preserves the exact existing arena accounting
 * while moving it out of the monolith for smaller future runtime organs.
 */
class Mode2RuntimeArenaBuilder {
  /**
   * @param {{code:Array<Array<number>>,functions?:Array<{code:Array,params:Array}>}} program
   * @returns {{opcodes:Uint8Array,operands:Uint32Array,bytes:number}}
   */
  makeArenas(program) {
    const opcodes = new Uint8Array(program.code.map(x => x[0]));
    const operands = new Uint32Array(program.code.length * 2);
    program.code.forEach((x, i) => {
      operands[i * 2] = x[1] || 0;
      operands[i * 2 + 1] = x[2] || 0;
    });
    let fnBytes = 0;
    for (const fn of program.functions || []) {
      fnBytes += fn.code.length * 9 + fn.params.length * 2;
    }
    return { opcodes, operands, bytes: opcodes.byteLength + operands.byteLength + fnBytes };
  }
}

const mode2RuntimeArenaBuilder = new Mode2RuntimeArenaBuilder();

/**
 * @param {object} program - Decoded MD2 JS program.
 * @returns {{opcodes:Uint8Array,operands:Uint32Array,bytes:number}}
 */
function makeMode2JsArenas(program) {
  return mode2RuntimeArenaBuilder.makeArenas(program);
}

module.exports = { Mode2RuntimeArenaBuilder, mode2RuntimeArenaBuilder, makeMode2JsArenas };
