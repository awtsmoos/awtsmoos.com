// B"H
const { Encoder, WASM } = require('./wasm_defs.js');
const { generateStmt } = require('./statements.js');

class Emitter {
    constructor() {
        this.code = [];
        this.locals = new Map();
        this.localCount = 0;
        this.params = new Map();
        this.labelStack = [];
    }

    emit(ast) {
        const func = ast.body.find(n => n.type === 'Function');
        
        const paramTypes = func.params.map(p => {
            const t = (p.type.base === 'float' && p.type.pointers === 0) ? WASM.F32 : WASM.I32;
            this.params.set(p.name, { index: this.localCount++, type: t });
            return t;
        });

        // Generate Body Code
        for(const stmt of func.body.body) {
            generateStmt(this, stmt);
        }

        // --- Build Sections ---
        // 1. Type
        const typePayload = [0x60, ...Encoder.vec(paramTypes), ...Encoder.vec([])];
        const typeSec = Encoder.section(1, Encoder.vec([typePayload]));

        // 2. Func
        const funcSec = Encoder.section(3, Encoder.vec([0]));

        // 3. Memory
        const memLimits = [0x00, ...Encoder.toLEB128(256)];
        const memSec = Encoder.section(5, Encoder.vec([memLimits]));

        // 4. Export
        const expVec = [
            [...Encoder.str("mem"), 0x02, 0x00],
            [...Encoder.str(func.name), 0x00, 0x00]
        ];
        const expSec = Encoder.section(7, Encoder.vec(expVec));

        // 5. Code
        // Locals
        const varLocals = Array.from(this.locals.values()).filter(l => l.index >= paramTypes.length);
        varLocals.sort((a,b) => a.index - b.index);
        
        const localDefs = [];
        if (varLocals.length > 0) {
            let currentType = varLocals[0].type;
            let count = 0;
            for(const l of varLocals) {
                if (l.type === currentType) count++;
                else {
                    localDefs.push([...Encoder.toLEB128(count), currentType]);
                    currentType = l.type;
                    count = 1;
                }
            }
            localDefs.push([...Encoder.toLEB128(count), currentType]);
        }

        const funcBody = [...Encoder.vec(localDefs), ...this.code, WASM.END];
        const codeSec = Encoder.section(10, Encoder.vec([[...Encoder.toLEB128(funcBody.length), ...funcBody]]));

        return new Uint8Array([
            0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
            ...typeSec, ...funcSec, ...memSec, ...expSec, ...codeSec
        ]);
    }

    resolveVar(name) {
        if (this.locals.has(name)) return this.locals.get(name);
        if (this.params.has(name)) return this.params.get(name);
        return null; // Return null instead of throwing to allow checking existence
    }

    getOrDeclareLocal(name, type) {
        // Reuse existing slot if available (Flat scope optimization)
        let v = this.resolveVar(name);
        if (v) return v;
        
        const index = this.localCount++;
        v = { index, type };
        this.locals.set(name, v);
        return v;
    }
}

module.exports = { Emitter };