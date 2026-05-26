// B"H
'use strict';

/**
 * Chapter 12: The Awtsmoos guards the byte-road before the chariot runs.
 *
 * A compact VM should reject malformed bytecode early, the way a real CPU/VM
 * validates jump lanes and table references. This validator is intentionally
 * structural: it checks opcodes, jumps, function refs, pool refs, literal refs,
 * and reports small precise failures without executing code.
 */
class Mode2BytecodeValidator {
  /**
   * @param {Record<string, number>} opcodes
   */
  constructor(opcodes) {
    this.opcodes = opcodes;
    this.names = Object.create(null);
    for (const [name, id] of Object.entries(opcodes || {})) this.names[id] = name;
  }

  /**
   * @param {object} program
   * @returns {{ok:boolean,errors:Array<string>}}
   */
  validate(program) {
    const errors = [];
    this.validateCode(program, program.code, '<main>', errors);
    (program.functions || []).forEach((fn, id) => this.validateCode(program, fn.code, `fn#${id}`, errors));
    return { ok: errors.length === 0, errors };
  }

  /**
   * @param {object} program
   * @param {Array<Array<number>>} code
   * @param {string} label
   * @param {Array<string>} errors
   */
  validateCode(program, code, label, errors) {
    if (!Array.isArray(code)) return errors.push(`${label}: code is not an array`);
    code.forEach((ins, ip) => {
      if (!Array.isArray(ins)) return errors.push(`${label}:${ip} instruction is not array`);
      const op = ins[0];
      const name = this.names[op];
      if (!name) errors.push(`${label}:${ip} unknown opcode ${op}`);
      if ((name === 'JUMP' || name === 'JUMP_IF_FALSE') && !this.validTarget(code, ins[1])) errors.push(`${label}:${ip} bad jump ${ins[1]}`);
      if ((name === 'MAKE_FUNCTION' || name === 'MAKE_FUNCTION_SNAPSHOT') && !program.functions?.[ins[1]]) errors.push(`${label}:${ip} bad function ref ${ins[1]}`);
      if (name === 'CONST' && ins[1] != null && !Object.prototype.hasOwnProperty.call(program.literals || [], ins[1])) errors.push(`${label}:${ip} bad literal ref ${ins[1]}`);
      if (this.usesPool(name) && ins[1] != null && !Object.prototype.hasOwnProperty.call(program.pool || [], ins[1])) errors.push(`${label}:${ip} bad pool ref ${ins[1]}`);
    });
  }

  /** @param {Array<Array<number>>} code @param {number} target */
  validTarget(code, target) { return Number.isInteger(target) && target >= 0 && target <= code.length; }

  /** @param {string} name */
  usesPool(name) {
    return ['LOAD','STORE','DECLARE','DECLARE_CONST','GET_PROP','SET_PROP','DELETE_PROP','CALL_METHOD','CALL_METHOD_SPREAD','ENTER_TRY'].includes(name);
  }
}

module.exports = { Mode2BytecodeValidator };
