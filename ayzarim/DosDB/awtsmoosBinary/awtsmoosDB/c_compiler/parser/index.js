// B"H
const { TOKENS } = require('../lexer.js');
const { parseStatement, parseBlock } = require('./statements.js');

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    peek(offset = 0) {
        return this.tokens[this.pos + offset] || { type: TOKENS.EOF };
    }

    consume() {
        return this.tokens[this.pos++] || { type: TOKENS.EOF };
    }

    expect(type, value = null) {
        const t = this.peek();
        if (t.type !== type || (value !== null && t.value !== value)) {
            throw new Error(`Parse Error: Expected ${value || type}, got '${t.value}' at line ${t.line}`);
        }
        return this.consume();
    }

    parse() {
        const program = { type: 'Program', body: [] };
        while (this.peek().type !== TOKENS.EOF) {
            program.body.push(this.parseTopLevel());
        }
        return program;
    }

    parseTopLevel() {
        const typeNode = this.parseType();
        const name = this.expect(TOKENS.ID).value;
        
        if (this.peek().value === '(') {
            return this.parseFunction(typeNode, name);
        }
        throw new Error("Only functions supported at top level.");
    }

    parseType() {
        let base = this.expect(TOKENS.KEYWORD).value;
        let ptrCount = 0;
        while (this.peek().value === '*') {
            this.consume();
            ptrCount++;
        }
        return { base, pointers: ptrCount };
    }

    parseFunction(retType, name) {
        this.expect(TOKENS.PUNCT, '(');
        const params = [];
        if (this.peek().value !== ')') {
            while (true) {
                const pType = this.parseType();
                const pName = this.expect(TOKENS.ID).value;
                params.push({ type: pType, name: pName });
                if (this.peek().value === ',') this.consume();
                else break;
            }
        }
        this.expect(TOKENS.PUNCT, ')');
        const body = parseBlock(this);
        return { type: 'Function', name, retType, params, body };
    }
}

function parse(tokens) {
    return new Parser(tokens).parse();
}

module.exports = { parse, Parser };