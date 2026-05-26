// B"H
'use strict';

/**
 * Chapter 9: The Awtsmoos lets the byte-song be read by human eyes.
 *
 * This is intentionally a conservative decompiler: it does not pretend to
 * recover the original formatting or AST. It converts decoded MD2 bytecode into
 * a readable pseudo-JS/disassembly hybrid that can be attached to errors or
 * used for diagnostics without eval, Function, or host execution.
 */
class Mode2DecompilerRuntime {
  /**
   * @param {Record<string, number>} opcodes - Opcode table.
   */
  constructor(opcodes) {
    this.names = Object.create(null);
    for (const [name, id] of Object.entries(opcodes || {})) this.names[id] = name;
  }

  /**
   * @param {object} program - Decoded MD2 JS program.
   * @param {Array<Array<number>>} code - Instruction stream.
   * @param {string} label - Code label.
   * @returns {Array<object>} readable instruction objects.
   */
  disassembleCode(program, code, label) {
    return (code || []).map((ins, ip) => ({
      label,
      ip,
      op: ins[0],
      opName: this.names[ins[0]] || `OP_${ins[0]}`,
      args: this.describeArgs(program, ins)
    }));
  }

  /**
   * @param {object} program - Decoded MD2 JS program.
   * @returns {Array<object>} all readable instructions.
   */
  disassembleProgram(program) {
    const rows = this.disassembleCode(program, program.code, '<main>');
    (program.functions || []).forEach((fn, id) => {
      rows.push(...this.disassembleCode(program, fn.code, `fn#${id}${fn.generator ? '*' : ''}`));
    });
    return rows;
  }

  /**
   * @param {object} program - Decoded MD2 JS program.
   * @param {number} functionId - Function id, or null for main.
   * @param {number} ip - Instruction pointer.
   * @param {number} radius - Context radius.
   * @returns {string} context snippet.
   */
  context(program, functionId, ip, radius = 3) {
    const code = functionId == null ? program.code : program.functions?.[functionId]?.code;
    const label = functionId == null ? '<main>' : `fn#${functionId}`;
    if (!code) return `${label}:<missing>`;
    const start = Math.max(0, (ip || 0) - radius);
    const end = Math.min(code.length, (ip || 0) + radius + 1);
    return this.disassembleCode(program, code.slice(start, end), label)
      .map((row, index) => {
        const realIp = start + index;
        const marker = realIp === ip ? '>>' : '  ';
        return `${marker} ${label}:${realIp} ${row.opName} ${row.args.join(' ')}`.trimEnd();
      })
      .join('\n');
  }

  /**
   * @param {object} program - Decoded MD2 JS program.
   * @returns {string} readable pseudo-code dump.
   */
  toPseudoCode(program) {
    const lines = ['// B"H', '// MD2 pseudo-code / disassembly'];
    lines.push(...this.disassembleCode(program, program.code, '<main>').map(row => this.formatRow(row)));
    (program.functions || []).forEach((fn, id) => {
      lines.push('', `function ${fn.generator ? '*' : ''}fn_${id}(${(fn.params || []).map(pid => program.pool?.[pid] || `p${pid}`).join(', ')}) {`);
      for (const row of this.disassembleCode(program, fn.code, `fn#${id}`)) lines.push(`  ${this.formatRow(row)}`);
      lines.push('}');
    });
    return lines.join('\n');
  }

  /** @param {object} row - Disassembled instruction. */
  formatRow(row) {
    return `${row.label}:${row.ip} ${row.opName}${row.args.length ? ' ' + row.args.join(' ') : ''}`;
  }

  /**
   * @param {object} program - Decoded MD2 JS program.
   * @param {Array<number>} ins - Instruction.
   * @returns {Array<string>} readable args.
   */
  describeArgs(program, ins) {
    const opName = this.names[ins[0]];
    if (opName === 'CONST') return [JSON.stringify(program.literals?.[ins[1]])];
    if (['LOAD','STORE','DECLARE','GET_PROP','SET_PROP','DELETE_PROP','CALL_METHOD','CALL_METHOD_SPREAD','ENTER_TRY'].includes(opName)) {
      const name = program.pool?.[ins[1]];
      return [`$${ins[1]}:${JSON.stringify(name)}`, ...ins.slice(2).map(String)];
    }
    if (opName === 'MAKE_FUNCTION') return [`fn#${ins[1]}`];
    if (['JUMP','JUMP_IF_FALSE'].includes(opName)) return [`->${ins[1]}`];
    if (['CALL_FUNCTION','NEW','CALL_FUNCTION_SPREAD','CALL_SUPER'].includes(opName)) return ins.slice(1).map(String);
    return ins.slice(1).map(String);
  }
}

module.exports = { Mode2DecompilerRuntime };
