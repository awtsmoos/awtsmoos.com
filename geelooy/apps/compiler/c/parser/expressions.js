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
    
    const t = stream.peek();
    if (t.type === TOKENS.OP && ['=', '+=', '-=', '*=', '/='].includes(t.value)) {
        const op = stream.consume().value;
        const right = parseAssign(stream);
        
        if (op === '=') {
            return { type: 'assign', left, right };
        } else {
            const binOp = op[0];
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
    
    if (t.value === '++' || t.value === '--') {
        const op = stream.consume().value;
        const target = parseUnary(stream);
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
        const t = stream.peek();
        if (t.value === '[') {
            stream.consume(); 
            const index = parseExpression(stream);
            stream.expect(TOKENS.PUNCT, ']');
            expr = { type: 'index', target: expr, index };
        } 
        else if (t.value === '.') {
            stream.consume();
            const id = stream.expect(TOKENS.ID);
            expr = { type: 'binop', op: '.', left: expr, right: { type: 'var', name: id.value } };
        }
        else if (t.value === '->') {
            stream.consume();
            const id = stream.expect(TOKENS.ID);
            expr = { type: 'binop', op: '->', left: expr, right: { type: 'var', name: id.value } };
        }
        else if (t.value === '++' || t.value === '--') {
            const op = stream.consume().value;
            const mathOp = (op === '++') ? '+' : '-';
            const one = { type: 'literal', val: '1' };
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
    
    // Check specifically for closing parenthesis appearing where an expression is expected
    if (t.value === ')') {
        throw new Error("Syntax Error: Unexpected closing parenthesis ')'. You may have a trailing comma, missing argument, or empty parenthesis '()'.");
    }

    if (t.type === TOKENS.NUM) return { type: 'literal', val: stream.consume().value };
    if (t.type === TOKENS.STRING) return { type: 'string', val: stream.consume().value };
    
    if (t.type === TOKENS.ID) {
        const name = stream.consume().value;
        if (stream.peek().value === '(') {
            stream.consume(); // (
            const args = [];
            
            // Argument Parsing Loop
            // Supports: func(), func(a), func(a,b), func(a,)
            
            if (stream.peek().value !== ')') {
                while (true) {
                    if (stream.peek().value === ')') break;
                    
                    args.push(parseExpression(stream));
                    
                    if (stream.peek().value === ',') {
                        stream.consume();
                        // If next is ')', we handle it in next iteration loop check
                    } else {
                        break;
                    }
                }
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
    
    throw new Error(`Unexpected token: '${t.value}' (Type: ${t.type})`);
}