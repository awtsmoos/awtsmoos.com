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
        if (!v) throw new Error(`Undefined variable: ${expr.name}`); // B"H: Explicit check
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
        else if (expr.op === '>') ctx.code.push(0x4A); 
        else if (expr.op === '<=') ctx.code.push(0x4C); 
        else if (expr.op === '>=') ctx.code.push(0x4E); 
        
        type = (['<','>','<=','>=','==','!='].includes(expr.op)) ? WASM.I32 : (isFloat ? WASM.F32 : WASM.I32);
    }
    else if (expr.type === 'Assignment') {
        if (expr.left.type === 'Identifier') {
            const v = ctx.resolveVar(expr.left.name);
            if (!v) throw new Error(`Undefined variable: ${expr.left.name}`); // B"H: Explicit check
            
            if (expr.op === '=') {
                generateExpr(ctx, expr.right);
                ctx.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
            } else { 
                ctx.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
                generateExpr(ctx, expr.right);
                ctx.code.push(v.type === WASM.F32 ? WASM.F32_ADD : WASM.I32_ADD);
                ctx.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
            }
        } 
        else if (expr.left.type === 'ArrayAccess') {
            generateAddress(ctx, expr.left); 
            if (expr.op === '=') {
                generateExpr(ctx, expr.right);
                ctx.code.push(WASM.F32_STORE, 2, 0); 
            } else {
                throw new Error("Array compound assignment not supported.");
            }
        }
    }
    else if (expr.type === 'ArrayAccess') {
        generateAddress(ctx, expr);
        ctx.code.push(WASM.F32_LOAD, 2, 0); 
        type = WASM.F32;
    }
    
    return type;
}

function generateAddress(ctx, expr) {
    generateExpr(ctx, expr.target); 
    generateExpr(ctx, expr.index);  
    ctx.code.push(WASM.I32_CONST, 2);
    ctx.code.push(WASM.I32_SHL);    
    ctx.code.push(WASM.I32_ADD);    
}

module.exports = { generateExpr };