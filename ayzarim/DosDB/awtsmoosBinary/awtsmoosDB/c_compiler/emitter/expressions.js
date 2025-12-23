// B"H
const { WASM, Encoder } = require('./wasm_defs.js');

/**
 * Generates WASM instructions for an expression.
 * Returns the resulting WASM type (I32 or F32).
 */
function generateExpr(ctx, expr) {
    if (expr.type === 'Literal') {
        if (expr.value.includes('.') || expr.value.includes('e') || expr.value.includes('E')) {
            ctx.code.push(WASM.F32_CONST, ...Encoder.ieee754(parseFloat(expr.value)));
            return WASM.F32;
        }
        ctx.code.push(WASM.I32_CONST, ...Encoder.toLEB128(parseInt(expr.value)));
        return WASM.I32;
    }
    
    if (expr.type === 'Identifier') {
        const v = ctx.resolveVar(expr.name);
        if (!v) throw new Error(`Undefined variable: ${expr.name}`);
        ctx.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
        return v.type;
    }
    
    if (expr.type === 'Unary') {
        const type = generateExpr(ctx, expr.argument);
        if (expr.op === '-') {
            if (type === WASM.F32) ctx.code.push(0x8C); // f32.neg
            else { 
                // i32.neg (0 - x)
                ctx.code.push(WASM.I32_CONST, 0, 0x6B); // i32.sub
            }
        }
        return type;
    }
    
    if (expr.type === 'Cast') {
        const srcType = generateExpr(ctx, expr.argument);
        const targetType = (expr.targetType.base === 'float' && expr.targetType.pointers === 0) ? WASM.F32 : WASM.I32;
        if (srcType === targetType) return srcType;
        
        if (srcType === WASM.F32 && targetType === WASM.I32) {
            ctx.code.push(0xA8); // i32.trunc_f32_s
        } else if (srcType === WASM.I32 && targetType === WASM.F32) {
            ctx.code.push(0xB2); // f32.convert_i32_s
        }
        return targetType;
    }
    
    if (expr.type === 'Call') {
        for (const arg of expr.args) {
            generateExpr(ctx, arg);
            // B"H: Basic calls assume float args for math libs. 
            // In a fuller compiler, we'd check parameter types.
        }
        if (expr.name === '__builtin_sqrtf') {
            ctx.code.push(0x8F); // f32.sqrt
            return WASM.F32;
        }
        ctx.code.push(0x10, ...Encoder.toLEB128(ctx.resolveFuncIndex(expr.name)));
        return WASM.F32; // Standard math return
    }
    
    if (expr.type === 'Binary') {
        const t1 = generateExpr(ctx, expr.left);
        const t2 = generateExpr(ctx, expr.right);
        const isF = (t1 === WASM.F32 || t2 === WASM.F32);
        
        // Coercion for Binary Ops (Limited to converting top or using temp)
        if (t1 === WASM.I32 && t2 === WASM.F32) {
            // [i32, f32] -> swap -> convert -> swap
            const tmpF = ctx.getOrDeclareLocal('__tmp_f_bin', WASM.F32);
            ctx.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(tmpF.index)); // [i32]
            ctx.code.push(0xB2); // convert to f32. [f32]
            ctx.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(tmpF.index)); // [f32, f32]
        } else if (t1 === WASM.F32 && t2 === WASM.I32) {
            ctx.code.push(0xB2); // convert top i32 to f32. [f32, f32]
        }

        const ops = {
            '+': isF ? 0x92 : 0x6A, '-': isF ? 0x93 : 0x6B, '*': isF ? 0x94 : 0x6C, '/': isF ? 0x95 : 0x6D,
            '==': isF ? 0x5B : 0x46, '!=': isF ? 0x5C : 0x47, '<': isF ? 0x5D : 0x48, '>': isF ? 0x5E : 0x4A,
            '<=': isF ? 0x5F : 0x4C, '>=': isF ? 0x60 : 0x4E
        };
        ctx.code.push(ops[expr.op]);
        return ['+','-','*','/'].includes(expr.op) ? (isF ? WASM.F32 : WASM.I32) : WASM.I32;
    }
    
    if (expr.type === 'Assignment') {
        if (expr.left.type === 'Identifier') {
            const v = ctx.resolveVar(expr.left.name);
            const valType = generateExpr(ctx, expr.right);
            
            // Implicit Coercion
            if (valType === WASM.I32 && v.type === WASM.F32) {
                ctx.code.push(0xB2); // f32.convert_i32_s
            } else if (valType === WASM.F32 && v.type === WASM.I32) {
                ctx.code.push(0xA8); // i32.trunc_f32_s
            }
            
            ctx.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
        } else if (expr.left.type === 'ArrayAccess') {
            generateAddr(ctx, expr.left);
            generateExpr(ctx, expr.right);
            // ArrayAccess assumes float pointers (f32.store)
            ctx.code.push(WASM.F32_STORE, 2, 0);
        }
        return WASM.VOID;
    }
    
    if (expr.type === 'ArrayAccess') {
        generateAddr(ctx, expr);
        ctx.code.push(WASM.F32_LOAD, 2, 0);
        return WASM.F32;
    }
    
    if (expr.type === 'UpdateExpression') {
        const v = ctx.resolveVar(expr.argument.name);
        ctx.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
        ctx.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
        
        if (v.type === WASM.F32) {
            ctx.code.push(WASM.F32_CONST, ...Encoder.ieee754(1.0));
            ctx.code.push(expr.op === '++' ? 0x92 : 0x93);
        } else {
            ctx.code.push(WASM.I32_CONST, 1, expr.op === '++' ? 0x6A : 0x6B);
        }
        ctx.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
        return v.type;
    }
}

/**
 * Calculates the memory address of an array access.
 */
function generateAddr(ctx, expr) {
    generateExpr(ctx, expr.target); // Ptr (I32)
    generateExpr(ctx, expr.index);  // Index (I32)
    ctx.code.push(WASM.I32_CONST, 2, WASM.I32_SHL, WASM.I32_ADD);
}

module.exports = { generateExpr };
