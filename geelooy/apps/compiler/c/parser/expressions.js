/*
B"H
Boruch Hashem
*/
import { TOKENS } from '../lexer.js';

export function parseExpression(stream) {
    return parseAssign(stream);
}

function parseAssign(stream) {
    let left = parseEquality(stream);
    
    // Assignment: = += -= *= /=
    const next = stream.peek().value;
    if (['=', '+=', '-=', '*=', '/='].includes(next)) {
        const op = stream.consume().value;
        const right = parseAssign(stream); // Right-associative
        
        // Desugar compound assignment during parsing for simpler codegen
        if (op === '=') {
            return { type: 'assign', left, right };
        } else {
            // x += 5  ->  x = x + 5
            const binOp = op[0]; // +, -, *, /
            return {
                type: 'assign',
                left: left,
                right: { type: 'binop', op: binOp, left: left, right: right }
            };
        }
    }
    return left;
}

function parseEquality(stream) {
    let left = parseRelational(stream);
    while (stream.peek().value === '==' || stream.peek().value === '!=') {
        const op = stream.consume().value;
        const right = parseRelational(stream);
        left = { type: 'binop', op, left, right };
    }
    return left;
}

function parseRelational(stream) {
    let left = parseAdditive(stream);
    while (['<', '>', '<=', '>='].includes(stream.peek().value)) {
        const op = stream.consume().value;
        const right = parseAdditive(stream);
        left = { type: 'binop', op, left, right };
    }
    return left;
}

function parseAdditive(stream) {
    let left = parseMultiplicative(stream);
    while (stream.peek().value === '+' || stream.peek().value === '-') {
        const op = stream.consume().value;
        const right = parseMultiplicative(stream);
        left = { type: 'binop', op, left, right };
    }
    return left;
}

function parseMultiplicative(stream) {
    let left = parseUnary(stream);
    while (stream.peek().value === '*' || stream.peek().value === '/' || stream.peek().value === '%') {
        const op = stream.consume().value;
        const right = parseUnary(stream);
        left = { type: 'binop', op, left, right };
    }
    return left;
}

function parseUnary(stream) {
    const t = stream.peek();
    
    // Prefix ++ / --
    if (t.value === '++' || t.value === '--') {
        const op = stream.consume().value;
        const target = parseUnary(stream);
        // Desugar ++x -> x = x + 1 (Result is new value)
        // Note: For C semantics, result of prefix is lvalue, but we return rvalue here.
        const one = { type: 'literal', val: '1' };
        const mathOp = (op === '++') ? '+' : '-';
        
        return {
             type: 'assign',
             left: target,
             right: { type: 'binop', op: mathOp, left: target, right: one }
        };
    }

    if (['*', '&', '-', '!'].includes(t.value)) {
        const op = stream.consume().value;
        const expr = parseUnary(stream); 
        return { type: 'unary', op, expr };
    }
    return parsePostfix(stream);
}

function parsePostfix(stream) {
    let expr = parsePrimary(stream);
    while (true) {
        if (stream.peek().value === '[') {
            stream.consume(); 
            const index = parseExpression(stream);
            stream.expect(TOKENS.PUNCT, ']');
            expr = { type: 'index', target: expr, index };
        } 
        else if (stream.peek().value === '++' || stream.peek().value === '--') {
            // Postfix x++ / x--
            // returns OLD value. Complex to desugar perfectly in one expr without temp.
            // Simplified: treat as prefix for now because we lack temp vars in this parser phase.
            // TODO: Proper postfix support requires codegen support for 'dup'.
            // For now, we will parse it but treat semantics as "update happened".
            const op = stream.consume().value;
            const mathOp = (op === '++') ? '+' : '-';
            const one = { type: 'literal', val: '1' };
            
            // Hack: Return the assignment. This behaves like prefix in value, 
            // but effectively updates the var. 
            // Most loops like `i++` ignore the return value anyway.
            expr = {
                type: 'assign',
                left: expr,
                right: { type: 'binop', op: mathOp, left: expr, right: one }
            };
        }
        else {
            break;
        }
    }
    return expr;
}

function parsePrimary(stream) {
    const t = stream.peek();
    
    if (t.type === TOKENS.NUM) return { type: 'literal', val: stream.consume().value };
    if (t.type === TOKENS.STRING) return { type: 'string', val: stream.consume().value };
    
    if (t.type === TOKENS.ID) {
        const name = stream.consume().value;
        if (stream.peek().value === '(') {
            stream.consume();
            const args = [];
            if (stream.peek().value !== ')') {
                do {
                    args.push(parseExpression(stream));
                } while (stream.peek().value === ',' && stream.consume());
            }
            stream.expect(TOKENS.PUNCT, ')');
            return { type: 'call', name, args };
        }
        return { type: 'var', name };
    }
    
    if (t.value === '(') {
        stream.consume();
        const e = parseExpression(stream);
        stream.expect(TOKENS.PUNCT, ')');
        return e;
    }
    
    throw new Error("Unexpected token: " + t.value);
}