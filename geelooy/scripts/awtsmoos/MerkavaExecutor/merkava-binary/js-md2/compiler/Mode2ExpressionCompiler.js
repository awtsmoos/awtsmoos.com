// B"H
'use strict';

/**
 * Chapter 8: The Awtsmoos threads sparks through an expression veil.
 *
 * This small compiler sidecar holds expression emitters that were duplicated
 * inside the MD2 monolith. It does not invent a new IR, does not eval, and does
 * not summon JSON shadows. It only writes the same MD2 instructions into the
 * caller-owned code arena so extraction can proceed one narrow verified pulse
 * at a time.
 */
class Mode2ExpressionCompiler {
  /**
   * Emits a template literal as the legacy MD2 concatenation sequence.
   *
   * @param {object} node ESTree TemplateLiteral node.
   * @param {Array<Array>} code Mutable MD2 instruction stream.
   * @param {(node: object) => void} emitExpression Recursive expression emitter.
   * @param {{CONST:number,ADD:number}} op MD2 opcode table.
   * @returns {void}
   */
  emitTemplateLiteral(node, code, emitExpression, op) {
    const quasis = node.quasis || [];
    const expressions = node.expressions || [];
    code.push([op.CONST, quasis[0]?.value?.cooked || quasis[0]?.value?.raw || '']);
    for (let i = 0; i < expressions.length; i++) {
      emitExpression(expressions[i]);
      code.push([op.ADD], [op.CONST, quasis[i + 1]?.value?.cooked || quasis[i + 1]?.value?.raw || ''], [op.ADD]);
    }
  }

  /**
   * Emits a ChainExpression by delegating to its wrapped expression.
   *
   * @param {object} node ESTree ChainExpression node.
   * @param {(node: object) => void} emitExpression Recursive expression emitter.
   * @returns {void}
   */
  emitChainExpression(node, emitExpression) {
    emitExpression(node.expression);
  }
}

const mode2ExpressionCompiler = new Mode2ExpressionCompiler();

module.exports = { Mode2ExpressionCompiler, mode2ExpressionCompiler };
