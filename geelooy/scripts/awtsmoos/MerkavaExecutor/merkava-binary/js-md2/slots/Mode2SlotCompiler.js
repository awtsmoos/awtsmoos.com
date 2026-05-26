// B"H
'use strict';

/**
 * Chapter 10: The Awtsmoos numbers the vessels of local speech.
 *
 * This compiler helper discovers local names that can become compact numeric
 * slots. The first integration is deliberately conservative: it produces a
 * symbol table/plan and never rewrites globals or properties by itself.
 */
class Mode2SlotCompiler {
  /**
   * @param {{code:Array<Array<number>>,functions?:Array<object>,pool?:Array<string>}} program
   * @returns {{main:object,functions:Array<object>}}
   */
  createSlotPlan(program) {
    return {
      main: this.createCodePlan(program, program.code, '<main>'),
      functions: (program.functions || []).map((fn, id) => this.createCodePlan(program, fn.code, `fn#${id}`))
    };
  }

  /**
   * @param {object} program
   * @param {Array<Array<number>>} code
   * @param {string} label
   * @returns {{label:string,names:Array<string>,slots:Record<string,number>}}
   */
  createCodePlan(program, code, label) {
    const names = [];
    const slots = Object.create(null);
    for (const ins of code || []) {
      const name = this.localDeclarationName(program, ins);
      if (!name || slots[name] !== undefined) continue;
      slots[name] = names.length;
      names.push(name);
    }
    return { label, names, slots };
  }

  /**
   * @param {object} program
   * @param {Array<number>} ins
   * @returns {string|null}
   */
  localDeclarationName(program, ins) {
    const opName = program.__opNames?.[ins[0]];
    if (opName !== 'DECLARE' && opName !== 'DECLARE_CONST') return null;
    const name = program.pool?.[ins[1]];
    if (!name || name.startsWith('__md2_') || name === '__awtsmoosResult') return null;
    return name;
  }
}

const mode2SlotCompiler = new Mode2SlotCompiler();

module.exports = { Mode2SlotCompiler, mode2SlotCompiler };
