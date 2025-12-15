/*
B"H
Boruch Hashem
*/
import { TOKENS } from '../lexer.js';
import { parseType } from './types.js';
import { parseExpression } from './expressions.js';

export function parseBlock(stream) {
    stream.expect(TOKENS.PUNCT, '{');
    const stmts = [];
    while (stream.peek().value !== '}' && stream.peek().type !== TOKENS.EOF) {
        stmts.push(parseStatement(stream));
    }
    stream.expect(TOKENS.PUNCT, '}');
    return { type: 'block', stmts };
}

export function parseStatement(stream) {
    const t = stream.peek();

    if (t.value === '{') {
        return parseBlock(stream);
    }
    
    if (t.type === TOKENS.KEYWORD) {
        // Return
        if (t.value === 'return') {
            stream.consume();
            let expr = null;
            if (stream.peek().value !== ';') expr = parseExpression(stream);
            stream.expect(TOKENS.PUNCT, ';');
            return { type: 'return', expr };
        }
        // Break
        if (t.value === 'break') {
            stream.consume();
            stream.expect(TOKENS.PUNCT, ';');
            return { type: 'break' };
        }
        // Continue
        if (t.value === 'continue') {
            stream.consume();
            stream.expect(TOKENS.PUNCT, ';');
            return { type: 'continue' };
        }
        
        // If
        if (t.value === 'if') {
            stream.consume();
            stream.expect(TOKENS.PUNCT, '(');
            const cond = parseExpression(stream);
            stream.expect(TOKENS.PUNCT, ')');
            
            const then = parseStatement(stream);
            let el = null;
            if (stream.peek().value === 'else') {
                stream.consume();
                el = parseStatement(stream);
            }
            const thenBlock = then.type === 'block' ? then : { type: 'block', stmts: [then] };
            const elBlock = el ? (el.type === 'block' ? el : { type: 'block', stmts: [el] }) : null;
            return { type: 'if', cond, then: thenBlock, el: elBlock };
        }

        // While
        if (t.value === 'while') {
            stream.consume();
            stream.expect(TOKENS.PUNCT, '(');
            const cond = parseExpression(stream);
            stream.expect(TOKENS.PUNCT, ')');
            const body = parseStatement(stream);
            const bodyBlock = body.type === 'block' ? body : { type: 'block', stmts: [body] };
            return { type: 'while', cond, body: bodyBlock };
        }

        // Do-While
        if (t.value === 'do') {
            stream.consume();
            const body = parseStatement(stream);
            stream.expect(TOKENS.KEYWORD, 'while');
            stream.expect(TOKENS.PUNCT, '(');
            const cond = parseExpression(stream);
            stream.expect(TOKENS.PUNCT, ')');
            stream.expect(TOKENS.PUNCT, ';');
            const bodyBlock = body.type === 'block' ? body : { type: 'block', stmts: [body] };
            return { type: 'do_while', body: bodyBlock, cond };
        }

        // For Loop
        if (t.value === 'for') {
            stream.consume();
            stream.expect(TOKENS.PUNCT, '(');
            
            let init = null;
            if (stream.peek().value !== ';') {
                // Check if init is a declaration or expression
                // Simple parser assumption: decl starts with keyword type
                if (['int', 'char', 'void', 'struct'].includes(stream.peek().value)) {
                    init = parseStatement(stream); // This handles the semicolon
                } else {
                    init = { type: 'expr', expr: parseExpression(stream) };
                    stream.expect(TOKENS.PUNCT, ';');
                }
            } else {
                stream.expect(TOKENS.PUNCT, ';');
            }

            let cond = null;
            if (stream.peek().value !== ';') cond = parseExpression(stream);
            else cond = { type: 'literal', val: '1' }; // Default true
            stream.expect(TOKENS.PUNCT, ';');

            let step = null;
            if (stream.peek().value !== ')') step = parseExpression(stream);
            stream.expect(TOKENS.PUNCT, ')');

            const body = parseStatement(stream);
            const bodyBlock = body.type === 'block' ? body : { type: 'block', stmts: [body] };
            
            return { type: 'for', init, cond, step, body: bodyBlock };
        }

        // Switch
        if (t.value === 'switch') {
            stream.consume();
            stream.expect(TOKENS.PUNCT, '(');
            const expr = parseExpression(stream);
            stream.expect(TOKENS.PUNCT, ')');
            stream.expect(TOKENS.PUNCT, '{');
            
            const cases = [];
            let defaultCase = null;

            while (stream.peek().value !== '}' && stream.peek().type !== TOKENS.EOF) {
                if (stream.peek().value === 'case') {
                    stream.consume();
                    const val = parseExpression(stream); // usually constant
                    stream.expect(TOKENS.PUNCT, ':');
                    const stmts = [];
                    // Capture stmts until next case/default/end
                    while (
                        stream.peek().value !== 'case' && 
                        stream.peek().value !== 'default' && 
                        stream.peek().value !== '}'
                    ) {
                        stmts.push(parseStatement(stream));
                    }
                    cases.push({ val, stmts: { type: 'block', stmts } });
                } else if (stream.peek().value === 'default') {
                    stream.consume();
                    stream.expect(TOKENS.PUNCT, ':');
                    const stmts = [];
                    while (
                        stream.peek().value !== 'case' && 
                        stream.peek().value !== 'default' && 
                        stream.peek().value !== '}'
                    ) {
                        stmts.push(parseStatement(stream));
                    }
                    defaultCase = { type: 'block', stmts };
                } else {
                     // Stray statements inside switch not under case? (ignore or error)
                     // For simplicity, just consume
                     parseStatement(stream);
                }
            }
            stream.expect(TOKENS.PUNCT, '}');
            return { type: 'switch', expr, cases, defaultCase };
        }
        
        // Declaration
        if (['int', 'char', 'void', 'struct'].includes(t.value)) {
            const varType = parseType(stream);
            const name = stream.expect(TOKENS.ID).value;
            let arraySize = null;
            if (stream.peek().value === '[') {
                stream.consume(); 
                const szToken = stream.expect(TOKENS.NUM);
                arraySize = parseInt(szToken.value);
                stream.expect(TOKENS.PUNCT, ']');
            }
            let init = null;
            if (stream.peek().value === '=') {
                stream.consume();
                init = parseExpression(stream);
            }
            stream.expect(TOKENS.PUNCT, ';');
            return { type: 'decl', varType, name, arraySize, init };
        }
    }

    const expr = parseExpression(stream);
    stream.expect(TOKENS.PUNCT, ';');
    return { type: 'expr', expr };
}