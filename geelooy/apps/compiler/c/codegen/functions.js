/* B"H */
import { genBlock } from './statements.js';

export function genFunction(func, ctx) {
    const lines = [];
    lines.push(`${func.name}:`);
    
    // Prologue: Standard Frame + Save Non-Volatiles (RBX, R12-R15, RDI, RSI)
    // We save them all to be safe and simple, though we could optimize.
    // Windows x64 ABI: RBX, RBP, RDI, RSI, RSP, R12, R13, R14, R15 are non-volatile.
    // We already handle RBP/RSP.
    
    lines.push(`PUSH RBP`);
    lines.push(`MOV RBP, RSP`);
    
    // Save Non-Volatiles
    lines.push(`PUSH RBX`);
    lines.push(`PUSH RDI`);
    lines.push(`PUSH RSI`);
    lines.push(`PUSH R12`);
    lines.push(`PUSH R13`);
    lines.push(`PUSH R14`);
    lines.push(`PUSH R15`);
    
    const locals = new Map();
    let localOffset = 0;
    
    // Args
    func.args.forEach((arg, i) => {
        locals.set(arg.name, { 
            type: 'arg', 
            offset: 16 + (i * 8), // Shadow space + RetAddr + RBP? 
            // Wait, RBP points to old RBP. RetAddr is RBP+8.
            // Shadow space is ABOVE RetAddr. RBP+16.
            // But wait, we pushed 7 registers AFTER RBP.
            // Stack: [RetAddr] [OldRBP] [RBX] [RDI] ...
            // RBP points to OldRBP.
            // Args are at RBP + 16 + (i*8). This assumes the caller allocated shadow space.
            // Correct.
            reg: ['RCX','RDX','R8','R9'][i], 
            varType: arg.type 
        });
    });

    // Scan Locals
    function scanLocals(stmts) {
        for (const s of stmts) {
            if (s.type === 'decl') {
                let size = 8;
                
                // Determine size from type
                if (s.varType.ptr === 0) {
                     // Check struct
                     const sl = ctx.structLayouts.get(s.varType.base);
                     if (sl) {
                         size = sl.size;
                     } else {
                         // Primitive
                         if (s.varType.base === 'char') { size = 1; }
                         if (s.varType.base === 'int') { size = 8; } 
                     }
                }
                
                if (s.arraySize) {
                    size = size * s.arraySize;
                }

                // Allocate
                localOffset += size;
                // Align stack?
                while(localOffset % 8 !== 0) localOffset++;
                
                locals.set(s.name, { 
                    type: 'local', 
                    offset: -localOffset, // Relative to RBP (must subtract Pushed Regs size?)
                    // No, locals are allocated by SUB RSP. They are at RBP - Pushes - LocalOffset?
                    // Usually: PUSH RBP; MOV RBP, RSP; SUB RSP, Locals.
                    // Access is [RBP - X].
                    // But if we PUSHed regs *after* MOV RBP, RSP...
                    // RBP is set. Then we PUSH. RSP decreases.
                    // Locals are allocated *after* PUSHes via SUB RSP.
                    // So [RBP - 8] is RBX. [RBP - 56] is R15.
                    // Locals start at [RBP - 56 - LocalOffset].
                    // We must adjust the offset calculation!
                    varType: s.varType,
                    isArray: s.arraySize > 0,
                    size: size
                });
            }
            // Recurse
            if (s.type === 'block') scanLocals(s.stmts);
            if (s.type === 'if') { 
                if (s.then.type === 'block') scanLocals(s.then.stmts);
                if (s.el && s.el.type === 'block') scanLocals(s.el.stmts);
            }
            if (s.type === 'while' || s.type === 'do_while') {
                 if (s.body.type === 'block') scanLocals(s.body.stmts);
            }
            if (s.type === 'for') {
                 if (s.body.type === 'block') scanLocals(s.body.stmts);
            }
            if (s.type === 'switch') {
                for (const c of s.cases) if (c.stmts.type === 'block') scanLocals(c.stmts.stmts);
                if (s.defaultCase && s.defaultCase.type === 'block') scanLocals(s.defaultCase.stmts);
            }
        }
    }
    
    const SAVED_REGS_SIZE = 7 * 8; // 56 bytes
    
    // We need to adjust local offsets because we pushed regs AFTER setting RBP
    // Actually, normally one PUSHes regs then sets RBP? No, standard is PUSH RBP; MOV RBP, RSP.
    // If we PUSH regs after, they are at RBP-8, RBP-16...
    // So we must add SAVED_REGS_SIZE to the localOffset base.
    
    scanLocals(func.body.stmts);
    
    // Fix up local offsets
    for (const loc of locals.values()) {
        if (loc.type === 'local') {
            loc.offset = loc.offset - SAVED_REGS_SIZE;
        }
    }
    
    let stackSize = localOffset; 
    if ((stackSize + SAVED_REGS_SIZE) % 16 !== 0) {
        // We need total RSP change to be 16-byte aligned.
        // PUSH RBP (8) + PUSH 7 Regs (56) = 64 bytes. (Aligned!)
        // So we just need stackSize to be 16-byte aligned.
        if (stackSize % 16 !== 0) stackSize += (16 - (stackSize % 16));
    }
    
    if (stackSize > 0) lines.push(`SUB RSP, ${stackSize}`);

    // Flush args to shadow (if any)
    func.args.forEach((arg, i) => {
         const reg = ['RCX','RDX','R8','R9'][i];
         if (reg) lines.push(`MOV [RBP+${16+i*8}], ${reg}`);
    });

    genBlock(func.body, lines, locals, 0, [], ctx);

    // Epilogue
    if (!lines[lines.length-1].includes('RET')) {
         if (stackSize > 0) lines.push(`ADD RSP, ${stackSize}`);
         lines.push(`POP R15`);
         lines.push(`POP R14`);
         lines.push(`POP R13`);
         lines.push(`POP R12`);
         lines.push(`POP RSI`);
         lines.push(`POP RDI`);
         lines.push(`POP RBX`);
         lines.push(`POP RBP`);
         lines.push(`RET`);
    }
    
    return lines.join('\n') + '\n';
}