/* B"H */

export function genAddr(expr, lines, locals, depth, ctx) {
    const formatOffset = (o) => (o >= 0 ? `+${o}` : `${o}`);

    if (expr.type === 'var') {
        const loc = locals.get(expr.name);
        if (loc) {
            lines.push(`LEA RAX, [RBP${formatOffset(loc.offset)}]`);
            return { type: loc.varType, isArray: loc.isArray };
        } else {
            lines.push(`LEA RAX, [${expr.name}]`); // Global
            // Assume globals are pointers/arrays or int?
            // For now, return a generic type that assumes 8-byte access unless cast
            return { type: { base: 'void', ptr: 0 }, isArray: false }; 
        }
    } 
    else if (expr.type === 'unary' && expr.op === '*') {
        genExpr(expr.expr, lines, locals, depth, ctx);
        // RAX is now the value of the pointer (which is an address).
        
        // Try to infer type
        if (expr.expr.type === 'var') {
            const loc = locals.get(expr.expr.name);
            if (loc && loc.varType.ptr > 0) {
                 return { type: { base: loc.varType.base, ptr: loc.varType.ptr - 1 } };
            }
        }
        return { type: { base: 'unknown', ptr: 0 } }; 
    }
    else if (expr.type === 'binop' && (expr.op === '.' || expr.op === '->')) {
        // Struct Access
        const fieldName = expr.right.name;
        let baseType;
        
        if (expr.op === '.') {
            const meta = genAddr(expr.left, lines, locals, depth, ctx);
            baseType = meta.type;
        } else {
            // -> means left is a pointer
            genExpr(expr.left, lines, locals, depth, ctx);
            if (expr.left.type === 'var') {
                const l = locals.get(expr.left.name);
                if(l) baseType = { base: l.varType.base, ptr: l.varType.ptr - 1 };
            }
        }

        if (baseType && ctx.structLayouts.has(baseType.base)) {
            const layout = ctx.structLayouts.get(baseType.base);
            const field = layout.fields.get(fieldName);
            if (field) {
                lines.push(`ADD RAX, ${field.offset}`);
                return { type: field.type, isArray: field.isArray };
            }
            throw new Error(`Field '${fieldName}' not found in struct '${baseType.base}'`);
        }
        
        throw new Error("Cannot infer type for struct access");
    }
    
    // Indexing
    if (expr.type === 'index') {
        const meta = genAddr(expr.target, lines, locals, depth, ctx);
        lines.push(`PUSH RAX`);
        genExpr(expr.index, lines, locals, depth+8, ctx);
        lines.push(`POP RBX`);
        
        let size = 8;
        if (meta.type) {
             // If pointer or array, determine element size
             if (meta.type.ptr > 0 || meta.isArray) {
                 if (meta.type.base === 'char') size = 1;
                 else if (meta.type.base === 'int') size = 8; 
             }
        }
        
        lines.push(`IMUL RAX, ${size}`);
        lines.push(`ADD RAX, RBX`);
        
        const elemType = (meta.type && (meta.type.ptr > 0 || meta.isArray)) 
            ? { base: meta.type.base, ptr: Math.max(0, meta.type.ptr - 1) }
            : { base: 'unknown', ptr: 0 };
            
        return { type: elemType };
    }
    
    throw new Error("Cannot take address of expression type: " + expr.type);
}

export function genExpr(expr, lines, locals, depth, ctx) {
    const formatOffset = (o) => (o >= 0 ? `+${o}` : `${o}`);

    if (expr.type === 'literal') {
        lines.push(`MOV RAX, ${expr.val}`);
    } else if (expr.type === 'string') {
        const lbl = ctx.getStringLabel(expr.val);
        lines.push(`LEA RAX, ${lbl}`);
    } else if (expr.type === 'var') {
        const loc = locals.get(expr.name);
        if (loc) {
            // Arrays decay to pointer
            if (loc.isArray || (loc.varType.base !== 'int' && loc.varType.base !== 'char' && loc.varType.ptr === 0)) {
                lines.push(`LEA RAX, [RBP${formatOffset(loc.offset)}]`);
            } else {
                // Char check
                if (loc.varType.base === 'char' && loc.varType.ptr === 0) {
                     lines.push(`MOVSX RAX, BYTE PTR [RBP${formatOffset(loc.offset)}]`);
                } else {
                     lines.push(`MOV RAX, [RBP${formatOffset(loc.offset)}]`);
                }
            }
        } else {
            if (ctx.definedFunctions.has(expr.name)) lines.push(`LEA RAX, ${expr.name}`);
            else lines.push(`MOV RAX, [${expr.name}]`);
        }
    } else if (expr.type === 'call') {
         if (!ctx.definedFunctions.has(expr.name) && !ctx.importedFunctions.has(expr.name)) {
             throw new Error(`Call to undefined function: '${expr.name}'. Did you import it or define it?`);
         }

         const num = expr.args.length;
         const alloc = (Math.max(4, num) * 8) + ( (depth % 16 !== 0) ? 8 : 0);
         lines.push(`SUB RSP, ${alloc}`);
         expr.args.forEach((a,i) => {
             genExpr(a, lines, locals, depth, ctx);
             lines.push(`MOV [RSP+${i*8}], RAX`);
         });
         for(let i=0; i<Math.min(4,num); i++) lines.push(`MOV ${['RCX','RDX','R8','R9'][i]}, [RSP+${i*8}]`);
         lines.push(`CALL ${expr.name}`);
         lines.push(`ADD RSP, ${alloc}`);
    } else if (expr.type === 'binop') {
        if (expr.op === '.' || expr.op === '->') {
            // Member Access
            const meta = genAddr(expr, lines, locals, depth, ctx);
            if (meta.isArray) return; 
            
            if (meta.type.ptr === 0 && meta.type.base === 'char') lines.push(`MOVSX RAX, BYTE PTR [RAX]`);
            else if (meta.type.ptr === 0 && meta.type.base === 'int') lines.push(`MOVSX RAX, DWORD PTR [RAX]`); 
            else lines.push(`MOV RAX, [RAX]`);
            return;
        }

        genExpr(expr.right, lines, locals, depth, ctx);
        lines.push(`PUSH RAX`);
        genExpr(expr.left, lines, locals, depth+8, ctx);
        lines.push(`POP RBX`);
        
        if (expr.op === '+') lines.push(`ADD RAX, RBX`);
        if (expr.op === '-') lines.push(`SUB RAX, RBX`);
        if (expr.op === '*') lines.push(`IMUL RAX, RBX`);
        if (expr.op === '/') { lines.push(`CQO`); lines.push(`IDIV RBX`); }
        if (expr.op === '==') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETE AL`); }
        if (expr.op === '!=') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETNE AL`); }
        if (expr.op === '<') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETL AL`); }
        if (expr.op === '>') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETG AL`); }
        if (expr.op === '<=') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETLE AL`); }
        if (expr.op === '>=') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETGE AL`); }
        
        if (expr.op === '&&') { lines.push(`AND RAX, RBX`); lines.push(`CMP RAX, 0`); lines.push(`SETNE AL`); }
        if (expr.op === '||') { lines.push(`OR RAX, RBX`); lines.push(`CMP RAX, 0`); lines.push(`SETNE AL`); }
        if (expr.op === '%') { lines.push(`CQO`); lines.push(`IDIV RBX`); lines.push(`MOV RAX, RDX`); }

    } else if (expr.type === 'unary') {
        if (expr.op === '&') {
            genAddr(expr.expr, lines, locals, depth, ctx);
        } else if (expr.op === '*') {
            genExpr(expr.expr, lines, locals, depth, ctx);
            // Check type if possible to do MOVSX for char*
            let isChar = false;
            // Simple check: if sub-expr is variable, look it up.
            // This catches *ptr where ptr is char*
            if (expr.expr.type === 'var') {
                 const loc = locals.get(expr.expr.name);
                 if (loc && loc.varType.base === 'char' && loc.varType.ptr === 1) isChar = true;
                 if (loc && loc.varType.base === 'char' && loc.isArray) isChar = true; 
            }
            
            if (isChar) lines.push(`MOVSX RAX, BYTE PTR [RAX]`);
            else lines.push(`MOV RAX, [RAX]`);
            
        } else if (expr.op === '-') {
            genExpr(expr.expr, lines, locals, depth, ctx);
            lines.push(`NEG RAX`);
        } else if (expr.op === '!') {
            genExpr(expr.expr, lines, locals, depth, ctx);
            lines.push(`CMP RAX, 0`);
            lines.push(`MOV RAX, 0`);
            lines.push(`SETE AL`);
        }
    } else if (expr.type === 'assign') {
        genExpr(expr.right, lines, locals, depth, ctx);
        lines.push(`PUSH RAX`);
        const meta = genAddr(expr.left, lines, locals, depth+8, ctx);
        lines.push(`POP RBX`);
        
        if (meta && meta.type && meta.type.base === 'char' && meta.type.ptr === 0) {
            lines.push(`MOV [RAX], BL`);
        } else if (meta && meta.type && meta.type.base === 'int' && meta.type.ptr === 0) {
            lines.push(`MOV [RAX], EBX`);
        } else {
            lines.push(`MOV [RAX], RBX`);
        }
        lines.push(`MOV RAX, RBX`); 
    }
}