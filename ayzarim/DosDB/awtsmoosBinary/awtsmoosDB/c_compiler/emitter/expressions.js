
// B"H
const { WASM, Encoder } = require('./wasm/defs.js');

function generateExpr(ctx, node) {
    if (!node) return WASM.VOID;

    if (node.type === 'Literal') {
        const val = node.value;
        if (val.includes('.') || val.toLowerCase().includes('e') || val.toLowerCase().endsWith('f')) {
            const f = parseFloat(val);
            ctx.code.push(WASM.F32_CONST, ...Encoder.ieee754(f));
            return WASM.F32;
        } else {
            const i = parseInt(val);
            ctx.code.push(WASM.I32_CONST, ...Encoder.toLEB128(i));
            return WASM.I32;
        }
    }

    if (node.type === 'Identifier') {
        const v = ctx.resolveVar(node.name);
        if (!v) throw new Error(`B"H Error: Identifier '${node.name}' not found.`);
        ctx.code.push(WASM.LOCAL_GET, ...Encoder.toLEB128(v.index));
        return v.type;
    }

    if (node.type === 'Unary') {
        const type = generateExpr(ctx, node.argument);
        if (node.op === '-') {
            if (type === WASM.F32) {
                ctx.code.push(WASM.F32_NEG);
                return WASM.F32;
            } else {
                ctx.code.push(WASM.I32_CONST, ...Encoder.toLEB128(-1));
                ctx.code.push(WASM.I32_MUL);
                return WASM.I32;
            }
        }
        return type;
    }

    if (node.type === 'ArrayAccess') {
        let stride = 2; 
        let loadOp = WASM.F32_LOAD;
        let retType = WASM.F32;
        let alignment = 2; 

        if (node.target.type === 'Identifier') {
            const v = ctx.resolveVar(node.target.name);
            if (v && v.cType) {
                if (v.cType.base === 'char') {
                    stride = 0; 
                    loadOp = WASM.I32_LOAD8_U;
                    retType = WASM.I32;
                    alignment = 0; 
                } else if (v.cType.base === 'int') {
                    stride = 2; 
                    loadOp = WASM.I32_LOAD;
                    retType = WASM.I32;
                    alignment = 2; 
                } else if (v.cType.base === 'float') {
                    stride = 2; 
                    loadOp = WASM.F32_LOAD;
                    retType = WASM.F32;
                    alignment = 2;
                }
            }
        }

        if (node.index.type === 'Literal') {
            const idxVal = parseInt(node.index.value);
            const byteOffset = idxVal << stride;
            
            generateExpr(ctx, node.target);
            
            ctx.code.push(loadOp, ...Encoder.toLEB128(alignment), ...Encoder.toLEB128(byteOffset));
            return retType;
        }

        const targetType = generateExpr(ctx, node.target);
        generateExpr(ctx, node.index);
        
        if (stride > 0) {
            ctx.code.push(WASM.I32_CONST, ...Encoder.toLEB128(stride));
            ctx.code.push(WASM.I32_SHL);
        }
        
        ctx.code.push(WASM.I32_ADD);
        ctx.code.push(loadOp, ...Encoder.toLEB128(alignment), ...Encoder.toLEB128(0));
        return retType;
    }

    if (node.type === 'Assignment') {
        if (node.left.type === 'ArrayAccess') {
            let stride = 2; 
            let storeOp = WASM.F32_STORE;
            let alignment = 2;
            
            if (node.left.target.type === 'Identifier') {
                const v = ctx.resolveVar(node.left.target.name);
                if (v && v.cType) {
                    if (v.cType.base === 'char') { 
                        stride = 0; 
                        storeOp = WASM.I32_STORE8; 
                        alignment = 0; 
                    }
                    else if (v.cType.base === 'int') { 
                        stride = 2; 
                        storeOp = WASM.I32_STORE; 
                        alignment = 2;
                    }
                }
            }

            if (node.left.index.type === 'Literal') {
                const idxVal = parseInt(node.left.index.value);
                const byteOffset = idxVal << stride;
                
                generateExpr(ctx, node.left.target); 
                generateExpr(ctx, node.right);       
                
                ctx.code.push(storeOp, ...Encoder.toLEB128(alignment), ...Encoder.toLEB128(byteOffset));
                return WASM.VOID;
            }

            generateExpr(ctx, node.left.target);
            generateExpr(ctx, node.left.index);
            if (stride > 0) {
                ctx.code.push(WASM.I32_CONST, ...Encoder.toLEB128(stride));
                ctx.code.push(WASM.I32_SHL);
            }
            ctx.code.push(WASM.I32_ADD); 
            
            const valType = generateExpr(ctx, node.right);
            ctx.code.push(storeOp, ...Encoder.toLEB128(alignment), ...Encoder.toLEB128(0));
            return WASM.VOID;
        } else {
            const v = ctx.resolveVar(node.left.name);
            const valType = generateExpr(ctx, node.right);
            if (valType === WASM.I32 && v.type === WASM.F32) ctx.code.push(WASM.F32_CONVERT_I32_S);
            else if (valType === WASM.F32 && v.type === WASM.I32) ctx.code.push(WASM.I32_TRUNC_F32_S);
            ctx.code.push(WASM.LOCAL_SET, ...Encoder.toLEB128(v.index));
            return WASM.VOID;
        }
    }

    if (node.type === 'Binary') {
        const leftT = generateExpr(ctx, node.left);
        const rightT = generateExpr(ctx, node.right);
        const isFloat = (leftT === WASM.F32 || rightT === WASM.F32);
        
        if (isFloat) {
            if (leftT === WASM.I32) ctx.code.push(WASM.F32_CONVERT_I32_S);
            if (rightT === WASM.I32) ctx.code.push(WASM.F32_CONVERT_I32_S);
            
            switch(node.op) {
                case '+': ctx.code.push(WASM.F32_ADD); break;
                case '-': ctx.code.push(WASM.F32_SUB); break;
                case '*': ctx.code.push(WASM.F32_MUL); break;
                case '/': ctx.code.push(WASM.F32_DIV); break;
                case '==': ctx.code.push(WASM.F32_EQ); break;
                case '!=': ctx.code.push(WASM.F32_NE); break;
                case '<': ctx.code.push(WASM.F32_LT); break;
                case '>': ctx.code.push(WASM.F32_GT); break;
                case '<=': ctx.code.push(WASM.F32_LE); break;
                case '>=': ctx.code.push(WASM.F32_GE); break;
            }
            return (['==','!=','<','>','<=','>='].includes(node.op)) ? WASM.I32 : WASM.F32;
        } else {
            switch(node.op) {
                case '+': ctx.code.push(WASM.I32_ADD); break;
                case '-': ctx.code.push(WASM.I32_SUB); break;
                case '*': ctx.code.push(WASM.I32_MUL); break;
                case '/': ctx.code.push(WASM.I32_DIV_S); break;
                case '<': ctx.code.push(WASM.I32_LT_S); break;
                case '<=': ctx.code.push(WASM.I32_LE_S); break;
                case '>': ctx.code.push(WASM.I32_GT_S); break;
                case '>=': ctx.code.push(WASM.I32_GE_S); break;
                case '==': ctx.code.push(WASM.I32_EQ); break;
                case '!=': ctx.code.push(WASM.I32_NE); break;
                case '&': ctx.code.push(WASM.I32_AND); break;
                case '|': ctx.code.push(WASM.I32_OR); break;
                case '^': ctx.code.push(WASM.I32_XOR); break;
                case '<<': ctx.code.push(WASM.I32_SHL); break;
                case '>>': ctx.code.push(WASM.I32_SHR_U); break; 
            }
            return WASM.I32;
        }
    }

    if (node.type === 'Call') {
        if (node.name === 'sqrt' || node.name === '__builtin_sqrtf') {
            generateExpr(ctx, node.args[0]);
            ctx.code.push(WASM.F32_SQRT);
            return WASM.F32;
        }

        const idx = ctx.resolveFuncIndex(node.name);
        for(const arg of node.args) generateExpr(ctx, arg);
        ctx.code.push(WASM.CALL, ...Encoder.toLEB128(idx));
        return WASM.VOID;
    }

    if (node.type === 'Cast') {
        const sourceT = generateExpr(ctx, node.argument);
        const targetT = (node.targetType.base === 'float') ? WASM.F32 : WASM.I32;
        if (sourceT === WASM.I32 && targetT === WASM.F32) ctx.code.push(WASM.F32_CONVERT_I32_S);
        else if (sourceT === WASM.F32 && targetT === WASM.I32) ctx.code.push(WASM.I32_TRUNC_F32_S);
        return targetT;
    }

    return WASM.VOID;
}

module.exports = { generateExpr };
