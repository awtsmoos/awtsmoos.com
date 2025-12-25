
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
    
    // Empty Statement
    if (t.value === ';') {
        parser.consume();
        return { type: 'Empty' };
    }

    if (t.type === TOKENS.KEYWORD) {
        if (t.value === 'if') {
            parser.consume();
            parser.expect(TOKENS.PUNCT, '(');
            const cond = parseExpression(parser);
            parser.expect(TOKENS.PUNCT, ')');
            const then = parseStatement(parser);
            let alt = null;
            if (parser.peek().value === 'else') {
                parser.consume();
                alt = parseStatement(parser);
            }
            return { type: 'If', cond, then, alt };
        }
        if (t.value === 'return') {
            parser.consume();
            let expr = null;
            if (parser.peek().value !== ';') {
                expr = parseExpression(parser);
            }
            parser.expect(TOKENS.PUNCT, ';');
            return { type: 'Return', expr };
        }
        if (t.value === 'while') {
            parser.consume();
            parser.expect(TOKENS.PUNCT, '(');
            const cond = parseExpression(parser);
            parser.expect(TOKENS.PUNCT, ')');
            const body = parseStatement(parser);
            return { type: 'While', cond, body };
        }
        // B"H: Added char, void, double to allowed declaration types
        if (['int','float','char','void','double'].includes(t.value)) {
            return parseDeclaration(parser);
        }
    }
    
    if (t.value === '{') return parseBlock(parser);
    
    const expr = parseExpression(parser);
    parser.expect(TOKENS.PUNCT, ';');
    return { type: 'ExpressionStmt', expr };
}

function parseDeclaration(parser) {
    const typeNode = parser.parseType();
    const decls = [];
    while (true) {
        const name = parser.expect(TOKENS.ID).value;
        let init = null;
        if (parser.peek().value === '=') {
            parser.consume();
            init = parseExpression(parser);
        }
        decls.push({ type: 'VarDecl', varType: typeNode, name, init });
        if (parser.peek().value === ',') parser.consume();
        else break;
    }
    parser.expect(TOKENS.PUNCT, ';');
    return decls.length === 1 ? decls[0] : { type: 'Block', body: decls };
}

module.exports = { parseStatement, parseBlock };
