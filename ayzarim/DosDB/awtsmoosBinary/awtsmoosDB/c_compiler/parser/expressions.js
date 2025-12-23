
// B"H
const { TOKENS } = require('../lexer.js');

const PRECEDENCE = {
    '<': 10, '>': 10, '<=': 10, '>=': 10, '==': 9, '!=': 9,
    '+': 20, '-': 20, '*': 30, '/': 30
};

function parseExpression(parser) {
    return parseAssignment(parser);
}

function parseAssignment(parser) {
    let left = parseBinary(parser, 0);
    const t = parser.peek();
    if (t.type === TOKENS.OP && (t.value === '=' || t.value === '+=')) {
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
        const prec = PRECEDENCE[t.value];
        if (t.type !== TOKENS.OP || !prec || prec < minPrec) break;
        const op = parser.consume().value;
        const right = parseBinary(parser, prec + 1);
        left = { type: 'Binary', op, left, right };
    }
    return left;
}

function parseUnary(parser) {
    const t = parser.peek();
    if (t.value === '*') {
        parser.consume();
        const target = parseUnary(parser);
        return { type: 'ArrayAccess', target, index: { type: 'Literal', value: '0' } };
    }
    return parsePostfix(parser);
}

function parsePostfix(parser) {
    let expr = parsePrimary(parser);
    while (true) {
        const t = parser.peek();
        if (t.value === '[') {
            parser.consume();
            const index = parseExpression(parser);
            parser.expect(TOKENS.PUNCT, ']');
            expr = { type: 'ArrayAccess', target: expr, index };
        } else if (t.value === '++' || t.value === '--') {
            expr = { type: 'UpdateExpression', op: parser.consume().value, argument: expr };
        } else break;
    }
    return expr;
}

function parsePrimary(parser) {
    const t = parser.peek();
    if (t.type === TOKENS.NUM) return { type: 'Literal', value: parser.consume().value };
    if (t.type === TOKENS.ID) {
        const name = parser.consume().value;
        if (parser.peek().value === '(') {
            parser.consume();
            const args = [];
            if (parser.peek().value !== ')') {
                while(true) {
                    args.push(parseExpression(parser));
                    if (parser.peek().value === ',') parser.consume();
                    else break;
                }
            }
            parser.expect(TOKENS.PUNCT, ')');
            return { type: 'Call', name, args };
        }
        return { type: 'Identifier', name };
    }
    if (t.value === '(') {
        parser.consume();
        const e = parseExpression(parser);
        parser.expect(TOKENS.PUNCT, ')');
        return e;
    }
    throw new Error(`Unexpected token in expression: ${t.value} at line ${t.line}`);
}

module.exports = { parseExpression };
