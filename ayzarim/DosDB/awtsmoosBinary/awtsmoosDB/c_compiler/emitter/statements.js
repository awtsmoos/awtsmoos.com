
// B"H
const { WASM, Encoder } = require('./wasm/defs.js');
const { generateExpr } = require('./expressions.js');

function generateStmt(ctx, stmt) {
    if (stmt.type === 'Empty') return;
    
    if (stmt.type === 'VarDecl') {
        const type = (stmt.varType.base === 'float' && stmt.varType.pointers === 0) ? WASM.F32 : WASM.I32;
        const v = ctx.getOrDeclareLocal(stmt.name, type, stmt.varType);
        
        if (stmt.init) {
            const initType = generateExpr(ctx, stmt.init);
            if (initType === WASM.I32 && type === WASM.F32) {
                ctx.code.push(WASM.F32_CONVERT_I32_S);
            } else if (initType === WASM.F32 && type === WASM.I32) {
                ctx.code.push(WASM.I32_TRUNC_F32_S);
            }
            ctx.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
        }
    } else if (stmt.type === 'Block') {
        for (const s of stmt.body) generateStmt(ctx, s);
    } else if (stmt.type === 'If') {
        generateExpr(ctx, stmt.cond);
        ctx.code.push(0x04, WASM.VOID); 
        generateStmt(ctx, stmt.then);
        if (stmt.alt) {
            ctx.code.push(0x05); 
            generateStmt(ctx, stmt.alt);
        }
        ctx.code.push(0x0B); 
    } else if (stmt.type === 'Return') {
        if (stmt.expr) generateExpr(ctx, stmt.expr);
        ctx.code.push(0x0F);
    } else if (stmt.type === 'While') {
        ctx.code.push(WASM.BLOCK, WASM.VOID);
        ctx.code.push(WASM.LOOP, WASM.VOID);
        generateExpr(ctx, stmt.cond);
        ctx.code.push(0x45); 
        ctx.code.push(WASM.BR_IF, ...Encoder.toLEB128(1));
        const body = (stmt.body.type === 'Block') ? stmt.body : { type: 'Block', body: [stmt.body] };
        for (const s of body.body) generateStmt(ctx, s);
        ctx.code.push(WASM.BR, ...Encoder.toLEB128(0));
        ctx.code.push(WASM.END, WASM.END);
    } else if (stmt.type === 'ExpressionStmt') {
        const type = generateExpr(ctx, stmt.expr);
        if (type !== WASM.VOID && type !== undefined) ctx.code.push(WASM.DROP);
    }
}

module.exports = { generateStmt };
