// B"H
const { WASM, Encoder } = require('./wasm_defs.js');
const { generateExpr } = require('./expressions.js');

function generateStmt(ctx, stmt) {
    if (stmt.type === 'VarDecl') {
        const type = (stmt.varType.base === 'float' && stmt.varType.pointers === 0) ? WASM.F32 : WASM.I32;
        
        // B"H: FIX - Use getOrDeclareLocal to handle shadowing/reuse correctly
        const v = ctx.getOrDeclareLocal(stmt.name, type);
        
        if (stmt.init) {
            generateExpr(ctx, stmt.init);
            ctx.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
        }
    }
    else if (stmt.type === 'While') {
        ctx.code.push(WASM.BLOCK, WASM.VOID);
        ctx.code.push(WASM.LOOP, WASM.VOID);
        
        generateExpr(ctx, stmt.cond);
        ctx.code.push(0x45); // I32.EQZ
        ctx.code.push(WASM.BR_IF, ...Encoder.toLEB128(1)); // Break
        
        generateBlock(ctx, stmt.body);
        
        ctx.code.push(WASM.BR, ...Encoder.toLEB128(0)); // Loop
        ctx.code.push(WASM.END, WASM.END);
    }
    else if (stmt.type === 'ExpressionStmt') {
        generateExpr(ctx, stmt.expr);
    }
}

function generateBlock(ctx, node) {
    if (node.type === 'Block') {
        for(const s of node.body) generateStmt(ctx, s);
    } else {
        generateStmt(ctx, node);
    }
}

module.exports = { generateStmt, generateBlock };