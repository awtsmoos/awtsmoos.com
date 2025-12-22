// B"H
const { WASM, Encoder } = require('./wasm_defs.js');

function generateExpr(ctx, expr) {
    let type = WASM.I32;

    if (expr.type === 'Literal') {
        if (expr.value.includes('.')) {
            ctx.code.push(WASM.F32_CONST, ...Encoder.ieee754(parseFloat(expr.value)));
            type = WASM.F32;
        } else {
            ctx.code.push(WASM.I32_CONST, ...Encoder.toLEB128(parseInt(expr.value)));
            type = WASM.I32;
        }
    }
    else if (expr.type === 'Identifier') {
        const v = ctx.resolveVar(expr.name);
        ctx.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
        type = v.type;
    }
    else if (expr.type === 'Binary') {
        const t1 = generateExpr(ctx, expr.left);
        const t2 = generateExpr(ctx, expr.right);
        
        const isFloat = (t1 === WASM.F32 || t2 === WASM.F32);
        
        if (expr.op === '+') ctx.code.push(isFloat ? WASM.F32_ADD : WASM.I32_ADD);
        else if (expr.op === '-') ctx.code.push(isFloat ? WASM.F32_SUB : WASM.I32_SUB);
        else if (expr.op === '*') ctx.code.push(isFloat ? WASM.F32_MUL : WASM.I32_MUL);
        else if (expr.op === '<') ctx.code.push(WASM.I32_LT_S);
        else if (expr.op === '>') ctx.code.push(0x4A); // i32.gt_s
        else if (expr.op === '<=') ctx.code.push(0x4C); // i32.le_s
        else if (expr.op === '>=') ctx.code.push(0x4E); // i32.ge_s
        
        type = (['<','>','<=','>=','==','!='].includes(expr.op)) ? WASM.I32 : (isFloat ? WASM.F32 : WASM.I32);
    }
    else if (expr.type === 'Assignment') {
        // Case 1: Variable Assignment (i = 0)
        if (expr.left.type === 'Identifier') {
            const v = ctx.resolveVar(expr.left.name);
            if (expr.op === '=') {
                generateExpr(ctx, expr.right);
                ctx.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
            } else { // +=
                ctx.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
                generateExpr(ctx, expr.right);
                ctx.code.push(v.type === WASM.F32 ? WASM.F32_ADD : WASM.I32_ADD);
                ctx.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
            }
        } 
        // Case 2: Array/Pointer Assignment (out[i] = sum)
        else if (expr.left.type === 'ArrayAccess') {
            // 1. Push Address (Base + Index*4)
            generateAddress(ctx, expr.left); 
            
            // 2. Push Value
            if (expr.op === '=') {
                generateExpr(ctx, expr.right);
                // 3. Store F32 (Kernel assumes float arrays)
                ctx.code.push(WASM.F32_STORE, 2, 0); 
            } else {
                throw new Error("Array compound assignment (+=) not implemented in this minimal compiler.");
            }
        }
        else {
            throw new Error(`Unsupported assignment target type: ${expr.left.type}`);
        }
    }
    else if (expr.type === 'ArrayAccess') {
        // Read: x = out[i]
        generateAddress(ctx, expr);
        ctx.code.push(WASM.F32_LOAD, 2, 0); // Assume Float Array
        type = WASM.F32;
    }
    
    return type;
}

function generateAddress(ctx, expr) {
    // Ptr + Index * 4
    generateExpr(ctx, expr.target); // Base Pointer
    generateExpr(ctx, expr.index);  // Index
    ctx.code.push(WASM.I32_CONST, 2);
    ctx.code.push(WASM.I32_SHL);    // Index * 4
    ctx.code.push(WASM.I32_ADD);    // Address
}

module.exports = { generateExpr };