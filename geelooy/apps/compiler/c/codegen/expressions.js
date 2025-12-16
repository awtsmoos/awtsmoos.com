/* B"H */

export function genAddr(expr, lines, locals, depth, ctx) {
    const formatOffset = (o) => (o >= 0 ? `+${o}` : `${o}`);

    if (expr.type === 'var') {
        const loc = locals.get(expr.name);
        if (loc) {
            lines.push(`LEA RAX, [RBP${formatOffset(loc.offset)}]`);
            return { type: loc.varType, isArray: loc.isArray, isStructField: false };
        } else {
            lines.push(`LEA RAX, [${expr.name}]`); // Global
            // Lookup in globals for type inference
            if (ctx.globals && ctx.globals.has(expr.name)) {
                return { type: ctx.globals.get(expr.name), isArray: false, isStructField: false };
            }
            return { type: { base: 'void', ptr: 0 }, isArray: false, isStructField: false }; 
        }
    } 
    else if (expr.type === 'assign') {
        // Evaluate the assignment first (Side Effect)
        genExpr(expr, lines, locals, depth, ctx);
        // Now get address of target
        return genAddr(expr.left, lines, locals, depth, ctx);
    }
    else if (expr.type === 'unary' && expr.op === '*') {
        genExpr(expr.expr, lines, locals, depth, ctx);
        // RAX is now the value of the pointer (which is an address).
        
        // Try to infer type
        if (expr.expr.type === 'var') {
            const loc = locals.get(expr.expr.name);
            if (loc && loc.varType.ptr > 0) {
                 return { type: { base: loc.varType.base, ptr: loc.varType.ptr - 1 }, isStructField: false };
            }
            // Check globals
            if (!loc && ctx.globals && ctx.globals.has(expr.expr.name)) {
                const gType = ctx.globals.get(expr.expr.name);
                if (gType.ptr > 0) return { type: { base: gType.base, ptr: gType.ptr - 1 }, isStructField: false };
            }
        }
        return { type: { base: 'unknown', ptr: 0 }, isStructField: false }; 
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
            
            // Try to infer type of left expression
            if (expr.left.type === 'var') {
                const l = locals.get(expr.left.name);
                if(l) {
                    baseType = { base: l.varType.base, ptr: l.varType.ptr - 1 };
                } else if (ctx.globals && ctx.globals.has(expr.left.name)) {
                    const gType = ctx.globals.get(expr.left.name);
                    baseType = { base: gType.base, ptr: gType.ptr - 1 };
                }
            } else if (expr.left.type === 'assign') {
                // Infer from assignment target
                 if (expr.left.left.type === 'var') {
                    const l = locals.get(expr.left.left.name);
                    if(l) baseType = { base: l.varType.base, ptr: l.varType.ptr - 1 };
                }
            }
        }

        if (baseType && ctx.structLayouts.has(baseType.base)) {
            const layout = ctx.structLayouts.get(baseType.base);
            const field = layout.fields.get(fieldName);
            if (field) {
                lines.push(`ADD RAX, ${field.offset}`);
                return { type: field.type, isArray: field.isArray, isStructField: true };
            }
            throw new Error(`Field '${fieldName}' not found in struct '${baseType.base}'`);
        }
        
        throw new Error(`Cannot infer type for struct access '${expr.op}' on field '${fieldName}'. Base type unknown.`);
    }
    
    // Indexing
    if (expr.type === 'index') {
        const meta = genAddr(expr.target, lines, locals, depth, ctx);
        
        // Fix: If target is a pointer (and not an array decay), dereference it to get base address.
        // Array decay (e.g., struct field array) means genAddr returned the address of the array start.
        // Pointer variable (e.g., char* p) means genAddr returned the address of 'p'. We need value of 'p'.
        if (meta.type && meta.type.ptr > 0 && !meta.isArray) {
            lines.push(`MOV RAX, [RAX]`);
        }

        lines.push(`PUSH RAX`);
        genExpr(expr.index, lines, locals, depth+8, ctx);
        lines.push(`POP RBX`);
        
        let size = 8;
        if (meta.type) {
             // If pointer or array, determine element size
             if (meta.type.ptr > 0 || meta.isArray) {
                 if (meta.type.base === 'char') size = 1;
                 else if (meta.type.base === 'int') size = 8; // Default 64-bit int
             }
        }
        
        lines.push(`IMUL RAX, ${size}`);
        lines.push(`ADD RAX, RBX`);
        
        const elemType = (meta.type && (meta.type.ptr > 0 || meta.isArray)) 
            ? { base: meta.type.base, ptr: Math.max(0, meta.type.ptr - 1) }
            : { base: 'unknown', ptr: 0 };
            
        return { type: elemType, isStructField: meta.isStructField };
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
                     // Int or Ptr. In this compiler, Int locals are 64-bit.
                     lines.push(`MOV RAX, [RBP${formatOffset(loc.offset)}]`);
                }
            }
        } else {
            if (ctx.definedFunctions.has(expr.name)) lines.push(`LEA RAX, ${expr.name}`);
            else lines.push(`MOV RAX, [${expr.name}]`);
        }
    } else if (expr.type === 'index') {
        const meta = genAddr(expr, lines, locals, depth, ctx);
        if (meta.type && meta.type.base === 'char' && meta.type.ptr === 0) {
            lines.push(`MOVSX RAX, BYTE PTR [RAX]`);
        } else if (meta.type && meta.type.base === 'int' && meta.type.ptr === 0) {
             lines.push(`MOVSX RAX, DWORD PTR [RAX]`);
        } else {
            lines.push(`MOV RAX, [RAX]`);
        }
    } else if (expr.type === 'call') {
         if (!ctx.definedFunctions.has(expr.name) && !ctx.importedFunctions.has(expr.name)) {
             throw new Error(`Call to undefined function: '${expr.name}'. Did you import it or define it?`);
         }

         const num = expr.args.length;
         let alloc = Math.max(4, num) * 8;
         
         // Stack Alignment: (RSP_before - alloc) must be 16-byte aligned.
         // Current RSP is (AlignedFrame - depth).
         // Target: (depth + alloc) % 16 == 0.
         const misalignment = (depth + alloc) % 16;
         if (misalignment !== 0) {
             alloc += (16 - misalignment);
         }

         lines.push(`SUB RSP, ${alloc}`);
         expr.args.forEach((a,i) => {
             genExpr(a, lines, locals, depth, ctx);
             lines.push(`MOV [RSP+${i*8}], RAX`);
         });
         for(let i=0; i<Math.min(4,num); i++) lines.push(`MOV ${['RCX','RDX','R8','R9'][i]}, [RSP+${i*8}]`);
         
         // ABI: AL must contain the number of vector registers used for varargs.
         // We don't support floats yet, so 0 is correct.
         lines.push(`MOV RAX, 0`); 
         
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
        if (expr.op === '%') { lines.push(`CQO`); lines.push(`IDIV RBX`); lines.push(`MOV RAX, RDX`); }
        if (expr.op === '==') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETE AL`); }
        if (expr.op === '!=') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETNE AL`); }
        if (expr.op === '<') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETL AL`); }
        if (expr.op === '>') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETG AL`); }
        if (expr.op === '<=') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETLE AL`); }
        if (expr.op === '>=') { lines.push(`CMP RAX, RBX`); lines.push(`MOV RAX, 0`); lines.push(`SETGE AL`); }
        
        // Logical AND / OR (Eager Evaluation, Normalized Boolean)
        if (expr.op === '&&') { 
            // Normalize RAX (Right)
            lines.push(`CMP RAX, 0`);
            lines.push(`SETNE AL`);
            // Normalize RBX (Left)
            lines.push(`CMP RBX, 0`);
            lines.push(`SETNE BL`);
            // AND
            lines.push(`AND AL, BL`);
            lines.push(`MOVZX RAX, AL`);
        }
        if (expr.op === '||') { 
            // Normalize RAX
            lines.push(`CMP RAX, 0`);
            lines.push(`SETNE AL`);
            // Normalize RBX
            lines.push(`CMP RBX, 0`);
            lines.push(`SETNE BL`);
            // OR
            lines.push(`OR AL, BL`);
            lines.push(`MOVZX RAX, AL`);
        }

    } else if (expr.type === 'unary') {
        if (expr.op === '&') {
            genAddr(expr.expr, lines, locals, depth, ctx);
        } else if (expr.op === '*') {
            genExpr(expr.expr, lines, locals, depth, ctx);
            let isChar = false;
            let isInt = false;
            // Variable Check
            if (expr.expr.type === 'var') {
                 const loc = locals.get(expr.expr.name);
                 if (loc) {
                     if (loc.varType.base === 'char' && loc.varType.ptr === 1) isChar = true;
                     if (loc.varType.base === 'int' && loc.varType.ptr === 1) isInt = true;
                 }
                 if (!loc && ctx.globals && ctx.globals.has(expr.expr.name)) {
                     const g = ctx.globals.get(expr.expr.name);
                     if (g.base === 'char' && g.ptr === 1) isChar = true;
                     if (g.base === 'int' && g.ptr === 1) isInt = true;
                 }
            }
            if (isChar) lines.push(`MOVSX RAX, BYTE PTR [RAX]`);
            else if (isInt) lines.push(`MOVSX RAX, DWORD PTR [RAX]`);
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
            if (meta.isStructField) {
                 lines.push(`MOV DWORD PTR [RAX], EBX`);
            } else {
                 lines.push(`MOV [RAX], RBX`);
            }
        } else {
            lines.push(`MOV [RAX], RBX`);
        }
        lines.push(`MOV RAX, RBX`); 
    }
}