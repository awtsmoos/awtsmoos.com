/* B"H */
import { genBlock } from './statements.js';

export function genFunction(func, ctx) {
    const lines = [];
    lines.push(`${func.name}:`);
    
    // Prologue: Standard Frame + Save Non-Volatiles (RBX, R12-R15, RDI, RSI)
    lines.push(`PUSH RBP`);
    lines.push(`MOV RBP, RSP`);
    
    // Save Non-Volatiles (7 registers = 56 bytes)
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
            offset: 16 + (i * 8), // Shadow space (32) is allocated by caller above RetAddr
            reg: ['RCX','RDX','R8','R9'][i], 
            varType: arg.type 
        });
    });

    // Scan Locals
    function scanLocals(stmts) {
        for (const s of stmts) {
            if (s.type === 'decl') {
                let size = 8;
                if (s.varType.ptr === 0) {
                     const sl = ctx.structLayouts.get(s.varType.base);
                     if (sl) size = sl.size;
                     else {
                         if (s.varType.base === 'char') { size = 1; }
                         if (s.varType.base === 'int') { size = 8; } 
                     }
                }
                if (s.arraySize) size = size * s.arraySize;

                // Allocate
                localOffset += size;
                while(localOffset % 8 !== 0) localOffset++;
                
                locals.set(s.name, { 
                    type: 'local', 
                    offset: -localOffset,
                    varType: s.varType,
                    isArray: s.arraySize > 0,
                    size: size
                });
            }
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
    scanLocals(func.body.stmts);
    
    // Fix up local offsets relative to RBP (must account for pushed regs)
    for (const loc of locals.values()) {
        if (loc.type === 'local') {
            loc.offset = loc.offset - SAVED_REGS_SIZE;
        }
    }
    
    // Stack Alignment Logic
    // We want RSP to be 16-byte aligned at the point where we make calls.
    // Standard Windows x64 Entry: RSP is 8 (mod 16) (due to CALL pushing RetAddr).
    // Push RBP (8) -> RSP is 0 (mod 16).
    // Push 7 Regs (56) -> RSP is -56 (mod 16) = 8 (mod 16).
    // So current RSP is 8 (mod 16).
    // We want (RSP - stackSize) to be 0 (mod 16).
    // So (8 - stackSize) = 0 (mod 16) -> stackSize must be 8 (mod 16).
    
    let stackSize = localOffset; 
    const wantedMod = 8;
    const currentMod = stackSize % 16;
    
    if (currentMod !== wantedMod) {
        // We need to add padding to make stackSize % 16 == 8.
        const padding = (wantedMod - currentMod + 16) % 16;
        stackSize += padding;
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
         // Restore Stack to saved regs position
         lines.push(`LEA RSP, [RBP-56]`);
         
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