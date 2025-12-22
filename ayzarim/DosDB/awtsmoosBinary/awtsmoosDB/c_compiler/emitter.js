// B"H
/**
 * WASM Emitter
 * Converts C AST to WebAssembly Binary.
 */

const WASM = {
    I32: 0x7F, F32: 0x7D,
    BLOCK: 0x02, LOOP: 0x03, IF: 0x04, END: 0x0B,
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
    vec: (arr) => [ ...Encoder.toLEB128(arr.length), ...arr.flat() ],
    str: (str) => {
        const buf = Buffer.from(str);
        return [...Encoder.toLEB128(buf.length), ...buf];
    },
    ieee754: (v) => {
        const b = new ArrayBuffer(4);
        new Float32Array(b)[0] = v;
        return new Uint8Array(b);
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

        // Build WASM Binary
        
        // 1. Type Section
        // (param...) -> void
        const typePayload = [0x60, ...Encoder.vec(paramTypes), 0x00]; 
        
        // 2. Local Declarations
        // Group by type for compactness? No, simplicity first.
        // WASM requires locals grouped: count, type.
        // We iterate our locals map (which contains only non-params locals)
        // Params are locals 0..N.
        
        const localDefs = [];
        // Extract locals that are NOT params
        const varLocals = Array.from(this.locals.values()).filter(l => l.index >= paramTypes.length);
        varLocals.sort((a,b) => a.index - b.index);
        
        // Grouping
        if (varLocals.length > 0) {
            let currentType = varLocals[0].type;
            let count = 0;
            for(const l of varLocals) {
                if (l.type === currentType) count++;
                else {
                    localDefs.push(Encoder.toLEB128(count));
                    localDefs.push(currentType);
                    currentType = l.type;
                    count = 1;
                }
            }
            localDefs.push(Encoder.toLEB128(count));
            localDefs.push(currentType);
        }
        
        // Construct Local Vec
        const localVec = [ ...Encoder.toLEB128(localDefs.length / 2), ...localDefs.flat() ];

        const codeBody = [...localVec, ...this.code, WASM.END];
        
        // Sections
        const typeSec = [0x01, ...Encoder.vec([typePayload])];
        const funcSec = [0x03, ...Encoder.vec([0x00])];
        const memSec = [0x05, ...Encoder.vec([[0x00, 0x80, 0x02]])]; // Limit min 128 max 512
        const expSec = [0x07, ...Encoder.vec([
            [...Encoder.str("mem"), 0x02, 0x00],
            [...Encoder.str(func.name), 0x00, 0x00]
        ])];
        const codeSec = [0x0A, ...Encoder.vec([[...Encoder.toLEB128(codeBody.length), ...codeBody]])];

        return new Uint8Array([
            0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
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
        // implicit int declaration?
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
            // If expr pushed result, drop it? Not strict in MVP
        }
        else if (stmt.type === 'While') {
            // Block -> Loop -> If Break
            this.code.push(WASM.BLOCK, WASM.VOID);
            this.code.push(WASM.LOOP, WASM.VOID);
            
            // Condition
            this.generateExpr(stmt.cond);
            this.code.push(0x45); // I32.EQZ
            this.code.push(WASM.BR_IF, ...Encoder.toLEB128(1)); // Break Block
            
            // Body
            this.labelStack.push({ type: 'loop' });
            if (stmt.body.type === 'Block') this.generateBlock(stmt.body);
            else this.generateStmt(stmt.body);
            this.labelStack.pop();
            
            this.code.push(WASM.BR, ...Encoder.toLEB128(0)); // Continue Loop
            this.code.push(WASM.END); // End Loop
            this.code.push(WASM.END); // End Block
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
                
                // If op is +=, need to load, add, store
                if (expr.op === '=') {
                    this.generateExpr(expr.right);
                    this.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
                } else {
                    this.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
                    this.generateExpr(expr.right);
                    if (v.type === WASM.F32) this.code.push(WASM.F32_ADD); 
                    else this.code.push(WASM.I32_ADD);
                    this.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
                }
            } else if (expr.left.type === 'ArrayAccess') {
                // array[idx] = val
                // Calculate address
                this.generateAddress(expr.left); // Pushes addr
                
                // Pushes val
                if (expr.op === '=') {
                    this.generateExpr(expr.right);
                    this.code.push(WASM.F32_STORE, 2, 0); // Assume F32 array
                } else {
                    // +=
                    // Duplicate Addr
                    // We need a complex stack op or locals to do += on memory
                    // Addr, Addr, Load, Val, Add, Store
                    // Simple hack: Assume expr.left doesn't have side effects and re-gen
                    this.generateAddress(expr.left);
                    this.code.push(WASM.F32_LOAD, 2, 0);
                    this.generateExpr(expr.right);
                    this.code.push(WASM.F32_ADD);
                    this.code.push(WASM.F32_STORE, 2, 0);
                }
            }
        }
        else if (expr.type === 'Binary') {
            this.generateExpr(expr.left);
            this.generateExpr(expr.right);
            
            // Assume Float math for kernel
            // Real compiler infers type. We assume float logic for matrix mul
            switch(expr.op) {
                case '+': this.code.push(WASM.F32_ADD); break;
                case '-': this.code.push(WASM.F32_SUB); break;
                case '*': this.code.push(WASM.F32_MUL); break;
                case '<': this.code.push(WASM.I32_LT_S); break; // loop counter
                case '>': this.code.push(0x4A); break; // gt_s
            }
        }
        else if (expr.type === 'ArrayAccess') {
            this.generateAddress(expr);
            this.code.push(WASM.F32_LOAD, 2, 0);
        }
    }

    generateAddress(expr) {
        // Base + Index * 4
        this.generateExpr(expr.target); // Base Pointer
        this.generateExpr(expr.index);  // Index
        this.code.push(WASM.I32_CONST, 2);
        this.code.push(WASM.I32_SHL);   // * 4
        this.code.push(WASM.I32_ADD);
    }
}

module.exports = { Emitter };