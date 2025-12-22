// B"H
const { TOKENS } = require('../lexer.js');
const { parseExpression } = require('./expressions.js');

function parseBlock(parser) {
    parser.expect(TOKENS.PUNCT, '{');
    const stmts = [];
    while (parser.peek().value !== '}' && parser.peek().type !== TOKENS.EOF) {
        stmts.push(parseStatement(parser));
    }
    parser.expect(TOKENS.PUNCT, '}');
    return { type: 'Block', body: stmts };
}

function parseStatement(parser) {
    const t = parser.peek();
    
    if (t.type === TOKENS.KEYWORD) {
        if (t.value === 'while') {
            parser.consume();
            parser.expect(TOKENS.PUNCT, '(');
            const cond = parseExpression(parser);
            parser.expect(TOKENS.PUNCT, ')');
            const body = parseStatement(parser);
            return { type: 'While', cond, body };
        }
        if (['int','float'].includes(t.value)) {
            return parseDeclaration(parser);
        }
    }
    
    if (t.value === '{') return parseBlock(parser);
    
    const expr = parseExpression(parser);
    parser.expect(TOKENS.PUNCT, ';');
    return { type: 'ExpressionStmt', expr };
}

function parseDeclaration(parser) {
    // Note: Calling parser.parseType() works because 'parser' is an instance passed at runtime.
    // We do NOT import the Parser class here.
    const typeNode = parser.parseType();
    const name = parser.expect(TOKENS.ID).value;
    let init = null;
    if (parser.peek().value === '=') {
        parser.consume();
        init = parseExpression(parser);
    }
    parser.expect(TOKENS.PUNCT, ';');
    return { type: 'VarDecl', varType: typeNode, name, init };
}

module.exports = { parseStatement, parseBlock };