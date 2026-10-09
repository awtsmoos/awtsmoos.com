/*
B"H
Boruch Hashem
*/
import { TOKENS } from '../lexer.js';
import { isDeclarationStart, parseType } from './types.js';
import { parseExpression } from './expressions.js';

export function parseBlock(stream) {
    stream.expect(TOKENS.PUNCT, '{');
    const stmts = [];
    while (stream.peek().value !== '}' && stream.peek().type !== TOKENS.EOF) {
        const statement = parseStatement(stream);
        // A comma-separated declaration list desugars into sibling decls here,
        // so blocks, IR, and the legacy round-trip keep one canonical shape.
        // `typedef` produces no runtime statement and is dropped.
        if (statement.type === 'nop') continue;
        if (statement.type === 'decls') {
            stmts.push(...statement.declarators);
        } else {
            stmts.push(statement);
        }
    }
    stream.expect(TOKENS.PUNCT, '}');
    return { type: 'block', stmts };
}

/** Wraps one parsed statement as a block, expanding declaration lists. */
function asBlock(statement) {
    if (statement.type === 'nop') return { type: 'block', stmts: [] };
    if (statement.type === 'block') return statement;
    if (statement.type === 'decls') return { type: 'block', stmts: statement.declarators };
    return { type: 'block', stmts: [statement] };
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
            const thenBlock = asBlock(then);
            const elBlock = el ? asBlock(el) : null;
            return { type: 'if', cond, then: thenBlock, el: elBlock };
        }

        // While
        if (t.value === 'while') {
            stream.consume();
            stream.expect(TOKENS.PUNCT, '(');
            const cond = parseExpression(stream);
            stream.expect(TOKENS.PUNCT, ')');
            const body = parseStatement(stream);
            const bodyBlock = asBlock(body);
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
            const bodyBlock = asBlock(body);
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
                if (isDeclarationStart(stream)) {
                    const declared = parseStatement(stream); // This handles the semicolon
                    init = declared.type === 'nop' ? null
                        : declared.type === 'decls'
                            ? { type: 'block', stmts: declared.declarators }
                            : declared;
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
            const bodyBlock = asBlock(body);
            
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
                        const caseStatement = parseStatement(stream);
                        if (caseStatement.type !== 'nop') stmts.push(caseStatement);
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
                        const caseStatement = parseStatement(stream);
                        if (caseStatement.type !== 'nop') stmts.push(caseStatement);
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
        
        // Declaration (one or more comma-separated declarators sharing a type)
        if (isDeclarationStart(stream)) {
            return parseDeclarationStatement(stream, t);
        }
    }

    // A typedef alias lexes as an identifier but still opens a declaration.
    if (t.type === TOKENS.ID && stream.typedefs && stream.typedefs.has(t.value)) {
        return parseDeclarationStatement(stream, t);
    }

    const expr = parseExpression(stream);
    stream.expect(TOKENS.PUNCT, ';');
    return { type: 'expr', expr };
}

/** Parses a `typedef` alias registration or a variable declaration statement. */
function parseDeclarationStatement(stream, t) {
    if (t.value === 'typedef') {
        stream.consume();
        const aliased = parseType(stream);
        for (;;) {
            const one = { ...aliased };
            while (stream.peek().type === TOKENS.OP && stream.peek().value === '*') {
                stream.consume();
                one.ptr++;
            }
            if (stream.peek().value === '[') {
                stream.error("typedef of array type is not supported");
            }
            stream.typedefs.set(stream.expect(TOKENS.ID).value, one);
            if (stream.peek().value !== ',') break;
            stream.consume();
        }
        stream.expect(TOKENS.PUNCT, ';');
        return { type: 'nop' };
    }
    // Stars bind to each declarator (`int *p, q`), so the base type is
    // parsed star-free and every declarator consumes its own stars.
    const varType = parseType(stream, { stars: false });
    const declarators = [];
    for (;;) {
        // Each declarator carries its own pointer depth: `int *p, q;`
        let declaratorType = varType;
        while (stream.peek().type === TOKENS.OP && stream.peek().value === '*') {
            stream.consume();
            declaratorType = { base: declaratorType.base, ptr: declaratorType.ptr + 1 };
        }
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
        declarators.push({ type: 'decl', varType: declaratorType, name, arraySize, init });
        if (stream.peek().value !== ',') break;
        stream.consume();
    }
    stream.expect(TOKENS.PUNCT, ';');
    if (declarators.length === 1) return declarators[0];
    return { type: 'decls', declarators };
}