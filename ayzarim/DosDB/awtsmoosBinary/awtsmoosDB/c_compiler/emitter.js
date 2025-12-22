// B"H
/**
 * WASM Emitter
 * Converts C AST to WebAssembly Binary.
 * Fixes Section Header Length Encoding.
 */

const WASM = {
    I32: 0x7F, F32: 0x7D, VOID: 0x40,
    BLOCK: 0x02, LOOP: 0x03, IF: 0x04, ELSE: 0x05, END: 0x0B,
    BR: 0x0C, BR_IF: 0x0D,
    LOCAL_GET: 0x20, LOCAL_SET: 0x21, LOCAL_TEE: 0x22,
    
    I32_CONST: 0x41, F32_CONST: 0x43,
    
    I32_ADD: 0x6A, I32_SUB: 0x6B, I32_MUL: 0x6C,
    I32_LT_S: 0x48, I32_GE_S: 0x4E, 
    
    F32_ADD: 0x92, F32_SUB: 0x93, F32_MUL: 0x94,
    
    // Memory
    I32_LOAD: 0x28, F32_LOAD: 0x2A,
    I32_STORE: 0x36, F32_STORE: 0x38,
    
    I32_SHL: 0x74
};

const Encoder = {
    toLEB128: (num) => {
        const bytes = [];
        let n = num;
        while (true) {
            let byte = n & 0x7f;
            n >>>= 7;
            if (n === 0) { bytes.push(byte); break; }
            bytes.push(byte | 0x80);
        }
        return bytes;
    },
    // Create a Vector: [Count, ItemBytes...]
    vec: (arr) => {
        let bytes = [];
        for (const item of arr) {
            if (Array.isArray(item)) bytes.push(...item);
            else bytes.push(item);
        }
        return [...Encoder.toLEB128(arr.length), ...bytes];
    },
    str: (str) => {
        const b = Buffer.from(str);
        return [...Encoder.toLEB128(b.length), ...b];
    },
    ieee754: (v) => {
        const b = new ArrayBuffer(4);
        new Float32Array(b)[0] = v;
        return new Uint8Array(b);
    },
    // Create a Section: [ID, ByteLength, ContentBytes...]
    section: (id, contentBytes) => {
        return [id, ...Encoder.toLEB128(contentBytes.length), ...contentBytes];
    }
};

class Emitter {
    constructor() {
        this.code = [];
        this.locals = new Map(); // Name -> {index, type}
        this.localCount = 0;
        this.params = new Map();
        this.labelStack = []; // For break/continue loops
    }

    emit(ast) {
        // Only one function support for now
        const func = ast.body.find(n => n.type === 'Function');
        if (!func) throw new Error("No function found.");

        const paramTypes = func.params.map(p => {
            const t = this.toWasmType(p.type);
            this.params.set(p.name, { index: this.localCount++, type: t });
            return t;
        });

        this.generateBlock(func.body);

        // --- Build WASM Sections ---
        
        // 1. Type Section: Vector of FuncTypes
        // FuncType: 0x60, Vector(Params), Vector(Results)
        const typePayload = [0x60, ...Encoder.vec(paramTypes), ...Encoder.vec([])]; 
        const typeSecBytes = Encoder.vec([typePayload]); // Vector of types
        const typeSec = Encoder.section(1, typeSecBytes);

        // 2. Function Section: Vector of TypeIndices
        // Maps func index to type index. We have 1 func, type 0.
        const funcSecBytes = Encoder.vec([0]);
        const funcSec = Encoder.section(3, funcSecBytes);

        // 3. Memory Section: Vector of Limits
        // 1 Memory, min 128 pages, max 512 pages (optional max, helps engines)
        // Limits: flags(1), min, max
        const memType = [0x01, 0x80, 0x02, 0x00, 0x02]; // Flags=1, Min=256(LEB), Max=512(LEB)
        // Re-encoding manually to be safe with LEB
        const memLimits = [0x01, ...Encoder.toLEB128(256), ...Encoder.toLEB128(512)];
        const memSecBytes = Encoder.vec([memLimits]);
        const memSec = Encoder.section(5, memSecBytes);

        // 4. Export Section: Vector of Exports
        const exportMem = [...Encoder.str("mem"), 0x02, 0x00]; // Kind=Mem(2), Idx=0
        const exportRun = [...Encoder.str(func.name), 0x00, 0x00]; // Kind=Func(0), Idx=0
        const expSecBytes = Encoder.vec([exportMem, exportRun]);
        const expSec = Encoder.section(7, expSecBytes);
        
        // 5. Code Section: Vector of Code Entries
        // Local Declarations
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
        
        // Code Entry: Size(u32), LocalVec, Body, END
        const funcBody = [...Encoder.vec(localDefs), ...this.code, WASM.END];
        const funcEntry = [...Encoder.toLEB128(funcBody.length), ...funcBody];
        const codeSecBytes = Encoder.vec([funcEntry]);
        const codeSec = Encoder.section(10, codeSecBytes);

        // Concat All
        return new Uint8Array([
            0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // Magic + Ver
            ...typeSec, ...funcSec, ...memSec, ...expSec, ...codeSec
        ]);
    }

    toWasmType(t) {
        if (t.pointers > 0) return WASM.I32;
        if (t.base === 'float') return WASM.F32;
        return WASM.I32;
    }

    resolveVar(name) {
        if (this.locals.has(name)) return this.locals.get(name);
        if (this.params.has(name)) return this.params.get(name);
        return null;
    }

    getOrDeclareLocal(name, type) {
        let v = this.resolveVar(name);
        if (v) return v;
        const index = this.localCount++;
        v = { index, type };
        this.locals.set(name, v);
        return v;
    }

    generateBlock(node) {
        for(const stmt of node.body) {
            this.generateStmt(stmt);
        }
    }

    generateStmt(stmt) {
        if (stmt.type === 'VarDecl') {
            const wType = this.toWasmType(stmt.varType);
            const v = this.getOrDeclareLocal(stmt.name, wType);
            if (stmt.init) {
                this.generateExpr(stmt.init);
                this.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
            }
        }
        else if (stmt.type === 'ExpressionStmt') {
            this.generateExpr(stmt.expr);
            // Drop unused values if necessary, but MVP allows values on stack if valid
        }
        else if (stmt.type === 'While') {
            this.code.push(WASM.BLOCK, WASM.VOID);
            this.code.push(WASM.LOOP, WASM.VOID);
            
            // Condition
            this.generateExpr(stmt.cond);
            this.code.push(0x45); // I32.EQZ
            this.code.push(WASM.BR_IF, ...Encoder.toLEB128(1)); // Break
            
            this.labelStack.push({ type: 'loop' });
            if (stmt.body.type === 'Block') this.generateBlock(stmt.body);
            else this.generateStmt(stmt.body);
            this.labelStack.pop();
            
            this.code.push(WASM.BR, ...Encoder.toLEB128(0));
            this.code.push(WASM.END);
            this.code.push(WASM.END);
        }
        else if (stmt.type === 'If') {
            this.generateExpr(stmt.cond);
            this.code.push(WASM.IF, WASM.VOID);
            if (stmt.then.type === 'Block') this.generateBlock(stmt.then);
            else this.generateStmt(stmt.then);
            if (stmt.els) {
                this.code.push(WASM.ELSE);
                if (stmt.els.type === 'Block') this.generateBlock(stmt.els);
                else this.generateStmt(stmt.els);
            }
            this.code.push(WASM.END);
        }
    }

    generateExpr(expr) {
        if (expr.type === 'Literal') {
            if (expr.value.includes('.')) {
                this.code.push(WASM.F32_CONST, ...Encoder.ieee754(parseFloat(expr.value)));
            } else {
                this.code.push(WASM.I32_CONST, ...Encoder.toLEB128(parseInt(expr.value)));
            }
        }
        else if (expr.type === 'Identifier') {
            const v = this.resolveVar(expr.name);
            this.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
        }
        else if (expr.type === 'Assignment') {
            if (expr.left.type === 'Identifier') {
                const v = this.resolveVar(expr.left.name);
                if (expr.op === '=') {
                    this.generateExpr(expr.right);
                    this.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
                } else {
                    this.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
                    this.generateExpr(expr.right);
                    // Assume float add for += in this kernel
                    // Real compiler would check type. For now:
                    this.code.push(WASM.F32_ADD);
                    this.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
                }
            }
        }
        else if (expr.type === 'Binary') {
            this.generateExpr(expr.left);
            this.generateExpr(expr.right);
            switch(expr.op) {
                case '+': this.code.push(WASM.F32_ADD); break; // float add
                case '-': this.code.push(WASM.I32_SUB); break; // int sub (loop)
                case '*': this.code.push(WASM.I32_MUL); break; // int mul (offset)
                // Note: Kernel uses * for float AND int. 
                // We need smarter inference for a general compiler.
                // But for THIS kernel:
                // i * n_in -> Int
                // w[] * x[] -> Float
                
                // Hack: If one operand is Identifier starting with 'i', 'j', 'n', it's int.
                // If 'w', 'x', 'out', 'sum', it's float? No 'w' is float*.
                
                // Better: Check types of operands in `generateExpr`?
                // For now, let's just implement `*` as F32_MUL if we detect float context?
                
                // HACK FOR KERNEL:
                // C Parser sees `sum + w[...] * x[...]`.
                // w[...] is F32 load. x[...] is F32 load. So * is F32_MUL.
                // i * n_in is I32 * I32. So * is I32_MUL.
                
                // We will defer the opcode decision to a type-check pass?
                // OR simpler:
                // Just use I32_MUL for index math and F32_MUL for values.
                // In `generateExpr`, if we push variables, we know their types.
            }
        }
        else if (expr.type === 'ArrayAccess') {
            this.generateAddress(expr);
            this.code.push(WASM.F32_LOAD, 2, 0);
        }
    }
    
    // Fixed Type-Aware Binary Op Generator
    // Replaces the naive switch block above
    emitBinaryOp(op, typeLeft, typeRight) {
        if (typeLeft === WASM.F32 || typeRight === WASM.F32) {
            if (op === '+') this.code.push(WASM.F32_ADD);
            if (op === '-') this.code.push(WASM.F32_SUB);
            if (op === '*') this.code.push(WASM.F32_MUL);
        } else {
            if (op === '+') this.code.push(WASM.I32_ADD);
            if (op === '-') this.code.push(WASM.I32_SUB);
            if (op === '*') this.code.push(WASM.I32_MUL);
            if (op === '<') this.code.push(WASM.I32_LT_S);
        }
    }

    // Overriding generateExpr to track types (Simple Inference)
    generateExpr(expr) {
        let type = WASM.I32; // Default
        
        if (expr.type === 'Literal') {
            if (expr.value.includes('.')) {
                this.code.push(WASM.F32_CONST, ...Encoder.ieee754(parseFloat(expr.value)));
                type = WASM.F32;
            } else {
                this.code.push(WASM.I32_CONST, ...Encoder.toLEB128(parseInt(expr.value)));
                type = WASM.I32;
            }
        }
        else if (expr.type === 'Identifier') {
            const v = this.resolveVar(expr.name);
            this.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
            type = v.type;
        }
        else if (expr.type === 'Binary') {
            const t1 = this.generateExpr(expr.left);
            const t2 = this.generateExpr(expr.right);
            this.emitBinaryOp(expr.op, t1, t2);
            type = (t1 === WASM.F32 || t2 === WASM.F32) ? WASM.F32 : WASM.I32;
            if (['<','>','=='].includes(expr.op)) type = WASM.I32; // bool
        }
        else if (expr.type === 'ArrayAccess') {
            this.generateAddress(expr);
            this.code.push(WASM.F32_LOAD, 2, 0); // Assume arrays are F32 in this kernel
            type = WASM.F32;
        }
        else if (expr.type === 'Assignment') {
            if (expr.left.type === 'Identifier') {
                const v = this.resolveVar(expr.left.name);
                if (expr.op === '=') {
                    this.generateExpr(expr.right);
                    this.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
                } else { // +=
                    this.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
                    this.generateExpr(expr.right);
                    // Use variable type to decide ADD op
                    if (v.type === WASM.F32) this.code.push(WASM.F32_ADD);
                    else this.code.push(WASM.I32_ADD);
                    this.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
                }
            }
        }
        
        return type;
    }

    generateAddress(expr) {
        // Ptr + Index * 4
        this.generateExpr(expr.target); // Base
        this.generateExpr(expr.index);  // Index
        this.code.push(WASM.I32_CONST, 2);
        this.code.push(WASM.I32_SHL);
        this.code.push(WASM.I32_ADD);
    }
}

module.exports = { Emitter };