/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { genExpr } from './expressions.js';

export function genBlock(block, lines, locals, depth, loopStack, ctx) {
    for (const stmt of block.stmts) {
        genStmt(stmt, lines, locals, depth, loopStack, ctx);
    }
}

function genStmt(stmt, lines, locals, depth, loopStack, ctx) {
    const formatOffset = (o) => (o >= 0 ? `+${o}` : `${o}`);

    if (stmt.type === 'return') {
        if (stmt.expr) {
            genExpr(stmt.expr, lines, locals, depth, ctx); 
        }
        
        // Restore Callee-Saved Registers
        // The frame layout relative to RBP is:
        // [RBP] = Old RBP
        // [RBP-8] = RBX
        // [RBP-16] = RDI
        // [RBP-24] = RSI
        // [RBP-32] = R12
        // [RBP-40] = R13
        // [RBP-48] = R14
        // [RBP-56] = R15
        // Locals start at [RBP-56-...]
        
        // We restore RSP to point to the last pushed register (R15 at RBP-56)
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
    else if (stmt.type === 'break') {
        if (loopStack.length === 0) throw new Error("break outside of loop/switch");
        const target = loopStack[loopStack.length - 1].breakLabel;
        lines.push(`JMP ${target}`);
    }
    else if (stmt.type === 'continue') {
        if (loopStack.length === 0) throw new Error("continue outside of loop");
        const target = loopStack[loopStack.length - 1].continueLabel;
        if (!target) throw new Error("continue not valid here (switch?)");
        lines.push(`JMP ${target}`);
    }
    else if (stmt.type === 'decl') {
        if (stmt.init) {
            genExpr(stmt.init, lines, locals, depth, ctx); 
            const loc = locals.get(stmt.name);
            lines.push(`MOV [RBP${formatOffset(loc.offset)}], RAX`);
        }
    } 
    else if (stmt.type === 'expr') {
        genExpr(stmt.expr, lines, locals, depth, ctx);
    }
    else if (stmt.type === 'if') {
         const lblElse = `else_${Math.floor(Math.random()*1e5)}`;
         const lblEnd = `end_${Math.floor(Math.random()*1e5)}`;
         genExpr(stmt.cond, lines, locals, depth, ctx); 
         lines.push(`CMP RAX, 0`);
         lines.push(`JE ${stmt.el ? lblElse : lblEnd}`);
         
         const runBody = (b) => b.type === 'block' ? genBlock(b, lines, locals, depth, loopStack, ctx) : genStmt(b, lines, locals, depth, loopStack, ctx);
         
         runBody(stmt.then);
         lines.push(`JMP ${lblEnd}`);
         
         if (stmt.el) {
             lines.push(`${lblElse}:`);
             runBody(stmt.el);
         }
         lines.push(`${lblEnd}:`);
    }
    else if (stmt.type === 'while') {
         const lblLoop = `loop_${Math.floor(Math.random()*1e5)}`;
         const lblEnd = `end_${Math.floor(Math.random()*1e5)}`;
         lines.push(`${lblLoop}:`);
         genExpr(stmt.cond, lines, locals, depth, ctx);
         lines.push(`CMP RAX, 0`);
         lines.push(`JE ${lblEnd}`);
         
         loopStack.push({ breakLabel: lblEnd, continueLabel: lblLoop });
         if (stmt.body.type === 'block') genBlock(stmt.body, lines, locals, depth, loopStack, ctx);
         else genStmt(stmt.body, lines, locals, depth, loopStack, ctx);
         loopStack.pop();

         lines.push(`JMP ${lblLoop}`);
         lines.push(`${lblEnd}:`);
    }
    else if (stmt.type === 'do_while') {
         const lblStart = `do_${Math.floor(Math.random()*1e5)}`;
         const lblCond = `cond_${Math.floor(Math.random()*1e5)}`;
         const lblEnd = `end_${Math.floor(Math.random()*1e5)}`;
         
         lines.push(`${lblStart}:`);
         
         loopStack.push({ breakLabel: lblEnd, continueLabel: lblCond });
         if (stmt.body.type === 'block') genBlock(stmt.body, lines, locals, depth, loopStack, ctx);
         else genStmt(stmt.body, lines, locals, depth, loopStack, ctx);
         loopStack.pop();
         
         lines.push(`${lblCond}:`);
         genExpr(stmt.cond, lines, locals, depth, ctx);
         lines.push(`CMP RAX, 0`);
         lines.push(`JNE ${lblStart}`);
         lines.push(`${lblEnd}:`);
    }
    else if (stmt.type === 'for') {
         const lblLoop = `for_${Math.floor(Math.random()*1e5)}`;
         const lblStep = `step_${Math.floor(Math.random()*1e5)}`;
         const lblEnd = `end_${Math.floor(Math.random()*1e5)}`;
         
         // Init
         if (stmt.init) {
             if (stmt.init.type === 'decl' || stmt.init.type === 'expr') {
                 genStmt(stmt.init, lines, locals, depth, loopStack, ctx);
             }
         }
         
         lines.push(`${lblLoop}:`);
         // Cond
         if (stmt.cond) {
             genExpr(stmt.cond, lines, locals, depth, ctx);
             lines.push(`CMP RAX, 0`);
             lines.push(`JE ${lblEnd}`);
         }
         
         // Body
         loopStack.push({ breakLabel: lblEnd, continueLabel: lblStep });
         if (stmt.body.type === 'block') genBlock(stmt.body, lines, locals, depth, loopStack, ctx);
         else genStmt(stmt.body, lines, locals, depth, loopStack, ctx);
         loopStack.pop();
         
         // Step
         lines.push(`${lblStep}:`);
         if (stmt.step) genExpr(stmt.step, lines, locals, depth, ctx);
         
         lines.push(`JMP ${lblLoop}`);
         lines.push(`${lblEnd}:`);
    }
    else if (stmt.type === 'switch') {
        const lblEnd = `sw_end_${Math.floor(Math.random()*1e5)}`;
        
        // Eval switch expression
        genExpr(stmt.expr, lines, locals, depth, ctx);
        // Save switch value to R15 (Callee-saved, assumes no deep recursion trashing it)
        // Safe bet for toy compiler.
        lines.push(`MOV R15, RAX`);
        
        const caseLabels = [];
        for (let i = 0; i < stmt.cases.length; i++) {
            const lbl = `case_${i}_${Math.floor(Math.random()*1e5)}`;
            caseLabels.push(lbl);
            
            genExpr(stmt.cases[i].val, lines, locals, depth, ctx); // Result in RAX
            lines.push(`CMP R15, RAX`); // Compare with saved switch val
            lines.push(`JE ${lbl}`);
        }
        
        // Default fallthrough
        if (stmt.defaultCase) {
            const lblDef = `default_${Math.floor(Math.random()*1e5)}`;
            caseLabels.push(lblDef);
            lines.push(`JMP ${lblDef}`);
        } else {
            lines.push(`JMP ${lblEnd}`);
        }
        
        // Body
        loopStack.push({ breakLabel: lblEnd, continueLabel: null });
        let labelIdx = 0;
        for (const c of stmt.cases) {
            lines.push(`${caseLabels[labelIdx++]}:`);
            if (c.stmts.type === 'block') genBlock(c.stmts, lines, locals, depth, loopStack, ctx);
            else genStmt(c.stmts, lines, locals, depth, loopStack, ctx);
        }
        if (stmt.defaultCase) {
            lines.push(`${caseLabels[labelIdx]}:`);
            if (stmt.defaultCase.type === 'block') genBlock(stmt.defaultCase, lines, locals, depth, loopStack, ctx);
            else genStmt(stmt.defaultCase, lines, locals, depth, loopStack, ctx);
        }
        loopStack.pop();
        
        lines.push(`${lblEnd}:`);
    }
}