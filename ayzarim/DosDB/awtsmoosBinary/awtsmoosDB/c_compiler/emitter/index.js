
// B"H
const { Encoder, WASM } = require('./wasm/defs.js');
const { generateStmt } = require('./statements.js');

class Emitter {
    constructor() {
        this.code = [];
        this.locals = new Map();
        this.localCount = 0;
        this.params = new Map();
        this.funcTable = new Map(); 
    }

    emit(ast) {
        const funcs = ast.body.filter(n => n.type === 'Function');
        funcs.forEach((f, i) => this.funcTable.set(f.name, i));

        const funcBodies = funcs.map(f => this._emitFunc(f));

        const typePayloads = funcs.map(f => {
            const pt = f.params.map(p => (p.type.base === 'float' && p.type.pointers === 0) ? WASM.F32 : WASM.I32);
            const rt = (f.retType.base === 'void') ? [] : [(f.retType.base === 'float' && f.retType.pointers === 0) ? WASM.F32 : WASM.I32];
            return [0x60, ...Encoder.vec(pt), ...Encoder.vec(rt)];
        });
        const typeSec = Encoder.section(1, Encoder.vec(typePayloads));
        const funcSec = Encoder.section(3, Encoder.vec(funcs.map((_, i) => i)));
        const memSec = Encoder.section(5, Encoder.vec([[0x00, ...Encoder.toLEB128(256)]]));
        const expSec = Encoder.section(7, Encoder.vec([
            [...Encoder.str("mem"), 0x02, 0x00],
            ...funcs.map((f, i) => [...Encoder.str(f.name), 0x00, ...Encoder.toLEB128(i)])
        ]));
        const codeSec = Encoder.section(10, Encoder.vec(funcBodies));

        return new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, ...typeSec, ...funcSec, ...memSec, ...expSec, ...codeSec]);
    }

    _emitFunc(f) {
        this.code = []; this.locals.clear(); this.params.clear(); this.localCount = 0;
        f.params.forEach(p => {
            const t = (p.type.base === 'float' && p.type.pointers === 0) ? WASM.F32 : WASM.I32;
            this.params.set(p.name, { index: this.localCount++, type: t, cType: p.type });
        });
        f.body.body.forEach(s => generateStmt(this, s));
        
        const varLocals = Array.from(this.locals.values()).sort((a,b) => a.index - b.index);
        const localDefs = [];
        if (varLocals.length > 0) {
            let curT = varLocals[0].type, count = 0;
            for (const l of varLocals) {
                if (l.type === curT) count++;
                else { localDefs.push([...Encoder.toLEB128(count), curT]); curT = l.type; count = 1; }
            }
            localDefs.push([...Encoder.toLEB128(count), curT]);
        }
        const body = [...Encoder.vec(localDefs), ...this.code, WASM.END];
        return [...Encoder.toLEB128(body.length), ...body];
    }

    resolveVar(name) { return this.locals.get(name) || this.params.get(name); }
    resolveFuncIndex(name) { return this.funcTable.get(name) || 0; }
    
    getOrDeclareLocal(name, type, cType = null) {
        let v = this.resolveVar(name);
        if (!v) { 
            v = { index: this.localCount++, type, cType }; 
            this.locals.set(name, v); 
        }
        return v;
    }
}

module.exports = { Emitter };
