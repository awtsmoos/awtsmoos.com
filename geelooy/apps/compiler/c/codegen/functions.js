/* B"H */
import { genBlock } from './statements.js';

export function genFunction(func, ctx) {
    const lines = [];
    lines.push(`${func.name}:`);
    
    lines.push(`PUSH RBP`);
    lines.push(`MOV RBP, RSP`);
    
    const locals = new Map();
    let localOffset = 0;
    
    // Args
    func.args.forEach((arg, i) => {
        locals.set(arg.name, { 
            type: 'arg', 
            offset: 16 + (i * 8), 
            reg: ['RCX','RDX','R8','R9'][i], 
            varType: arg.type 
        });
    });

    // Scan Locals
    function scanLocals(stmts) {
        for (const s of stmts) {
            if (s.type === 'decl') {
                let size = 8;
                let align = 8;
                
                // Determine size from type
                if (s.varType.ptr === 0) {
                     // Check struct
                     const sl = ctx.structLayouts.get(s.varType.base);
                     if (sl) {
                         size = sl.size;
                     } else {
                         // Primitive
                         if (s.varType.base === 'char') { size = 1; align = 1; }
                         if (s.varType.base === 'int') { size = 8; } // Local ints as 64-bit for ease
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
                    offset: -localOffset, 
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
        }
    }
    scanLocals(func.body.stmts);
    
    let stackSize = localOffset; 
    if (stackSize % 16 !== 0) stackSize += (16 - (stackSize % 16)); 
    if (stackSize > 0) lines.push(`SUB RSP, ${stackSize}`);

    // Flush args to shadow
    func.args.forEach((arg, i) => {
         const reg = ['RCX','RDX','R8','R9'][i];
         if (reg) lines.push(`MOV [RBP+${16+i*8}], ${reg}`);
    });

    genBlock(func.body, lines, locals, 0, [], ctx);

    if (!lines[lines.length-1].includes('RET')) {
         lines.push(`MOV RSP, RBP`);
         lines.push(`POP RBP`);
         lines.push(`RET`);
    }
    
    return lines.join('\n') + '\n';
}