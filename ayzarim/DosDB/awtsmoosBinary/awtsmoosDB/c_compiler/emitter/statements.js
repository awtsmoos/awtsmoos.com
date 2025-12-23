// B"H
const { WASM, Encoder } = require('./wasm_defs.js');
const { generateExpr } = require('./expressions.js');

/**
 * Generates WASM instructions for a statement.
 */
function generateStmt(ctx, stmt) {
    if (stmt.type === 'Empty') return;
    
    if (stmt.type === 'VarDecl') {
        const type = (stmt.varType.base === 'float' && stmt.varType.pointers === 0) ? WASM.F32 : WASM.I32;
        const v = ctx.getOrDeclareLocal(stmt.name, type);
        if (stmt.init) {
            const initType = generateExpr(ctx, stmt.init);
            
            // Implicit Coercion: Convert expression type to variable type
            if (initType === WASM.I32 && type === WASM.F32) {
                ctx.code.push(0xB2); // f32.convert_i32_s
            } else if (initType === WASM.F32 && type === WASM.I32) {
                ctx.code.push(0xA8); // i32.trunc_f32_s
            }
            
            ctx.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
        }
    } else if (stmt.type === 'Block') {
        for (const s of stmt.body) generateStmt(ctx, s);
    } else if (stmt.type === 'If') {
        generateExpr(ctx, stmt.cond);
        ctx.code.push(0x04, WASM.VOID); // IF block
        generateStmt(ctx, stmt.then);
        if (stmt.alt) {
            ctx.code.push(0x05); // ELSE block
            generateStmt(ctx, stmt.alt);
        }
        ctx.code.push(0x0B); // END
    } else if (stmt.type === 'Return') {
        if (stmt.expr) {
            generateExpr(ctx, stmt.expr);
            // B"H: Return automatically picks the top value if function signature expects it
        }
        ctx.code.push(0x0F); // RETURN
    } else if (stmt.type === 'While') {
        ctx.code.push(WASM.BLOCK, WASM.VOID);
        ctx.code.push(WASM.LOOP, WASM.VOID);
        generateExpr(ctx, stmt.cond);
        ctx.code.push(0x45); // I32_EQZ (Condition is false)
        ctx.code.push(WASM.BR_IF, ...Encoder.toLEB128(1)); // Break if cond false
        
        const body = (stmt.body.type === 'Block') ? stmt.body : { type: 'Block', body: [stmt.body] };
        for (const s of body.body) generateStmt(ctx, s);
        
        ctx.code.push(WASM.BR, ...Encoder.toLEB128(0)); // Loop back
        ctx.code.push(WASM.END, WASM.END); // End loop, End block
    } else if (stmt.type === 'ExpressionStmt') {
        const type = generateExpr(ctx, stmt.expr);
        if (type !== WASM.VOID && type !== undefined) ctx.code.push(WASM.DROP);
    }
}

module.exports = { generateStmt };
