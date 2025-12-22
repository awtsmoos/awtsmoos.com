// B"H
const { TOKENS } = require('../lexer.js');

// Helper precedence table
const PRECEDENCE = {
    '<': 10, '>': 10, '<=': 10, '>=': 10,
    '==': 9, '!=': 9,
    '+': 20, '-': 20,
    '*': 30, '/': 30, '%': 30
};

function parseExpression(parser) {
    return parseAssignment(parser);
}

function parseAssignment(parser) {
    let left = parseBinary(parser, 0);
    if (parser.peek().type === TOKENS.OP && (parser.peek().value === '=' || parser.peek().value === '+=')) {
        const op = parser.consume().value;
        const right = parseAssignment(parser);
        return { type: 'Assignment', op, left, right };
    }
    return left;
}

function parseBinary(parser, minPrec) {
    let left = parseUnary(parser);
    
    while (true) {
        const t = parser.peek();
        if (t.type !== TOKENS.OP) break;
        
        const prec = PRECEDENCE[t.value];
        if (!prec || prec < minPrec) break;
        
        const op = parser.consume().value;
        const right = parseBinary(parser, prec + 1);
        left = { type: 'Binary', op, left, right };
    }
    return left;
}

function parseUnary(parser) {
    const t = parser.peek();
    // Pointers deref *
    if (t.value === '*') {
        parser.consume();
        const expr = parseUnary(parser);
        // Treat *ptr as array[0] access for flat memory model
        return { type: 'ArrayAccess', target: expr, index: { type: 'Literal', value: '0' } };
    }
    return parsePostfix(parser);
}

function parsePostfix(parser) {
    let expr = parsePrimary(parser);
    while (true) {
        if (parser.peek().value === '[') {
            parser.consume();
            const index = parseExpression(parser);
            parser.expect(TOKENS.PUNCT, ']');
            expr = { type: 'ArrayAccess', target: expr, index };
        } else {
            break;
        }
    }
    return expr;
}

function parsePrimary(parser) {
    const t = parser.peek();
    if (t.type === TOKENS.NUM) {
        parser.consume();
        return { type: 'Literal', value: t.value };
    }
    if (t.type === TOKENS.ID) {
        parser.consume();
        return { type: 'Identifier', name: t.value };
    }
    if (t.value === '(') {
        parser.consume();
        const expr = parseExpression(parser);
        parser.expect(TOKENS.PUNCT, ')');
        return expr;
    }
    throw new Error(`Unexpected token in expression: ${t.value} at line ${t.line}`);
}

module.exports = { parseExpression };