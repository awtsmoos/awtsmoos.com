// B"H
/**
 * C Parser (AST Generator)
 * Supports functions, blocks, loops, expressions, pointers.
 */
const { TOKENS } = require('./lexer.js');

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
            throw new Error(`Parse Error: Expected ${value || type}, got '${t.value}'`);
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
        // Assume function or declaration
        // int name(...)
        const typeNode = this.parseType();
        const name = this.expect(TOKENS.ID).value;
        
        if (this.peek().value === '(') {
            return this.parseFunction(typeNode, name);
        } else {
            // Global variable (Not implemented fully for this kernel usage, but placeholder)
            this.expect(TOKENS.PUNCT, ';');
            return { type: 'GlobalDecl', varType: typeNode, name };
        }
    }

    parseType() {
        let base = this.expect(TOKENS.KEYWORD).value; // int, float, void
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
        const body = this.parseBlock();
        return { type: 'Function', name, retType, params, body };
    }

    parseBlock() {
        this.expect(TOKENS.PUNCT, '{');
        const stmts = [];
        while (this.peek().value !== '}' && this.peek().type !== TOKENS.EOF) {
            stmts.push(this.parseStatement());
        }
        this.expect(TOKENS.PUNCT, '}');
        return { type: 'Block', body: stmts };
    }

    parseStatement() {
        const t = this.peek();
        
        if (t.type === TOKENS.KEYWORD) {
            if (t.value === 'return') {
                this.consume();
                let expr = null;
                if (this.peek().value !== ';') expr = this.parseExpression();
                this.expect(TOKENS.PUNCT, ';');
                return { type: 'Return', expr };
            }
            if (t.value === 'while') {
                this.consume();
                this.expect(TOKENS.PUNCT, '(');
                const cond = this.parseExpression();
                this.expect(TOKENS.PUNCT, ')');
                const body = this.parseStatement(); // Can be block or single
                return { type: 'While', cond, body };
            }
            if (t.value === 'if') {
                this.consume();
                this.expect(TOKENS.PUNCT, '(');
                const cond = this.parseExpression();
                this.expect(TOKENS.PUNCT, ')');
                const then = this.parseStatement();
                let els = null;
                if (this.peek().value === 'else') {
                    this.consume();
                    els = this.parseStatement();
                }
                return { type: 'If', cond, then, els };
            }
            if (t.value === 'for') {
                // Minimal For loop support: for(init; cond; step)
                this.consume();
                this.expect(TOKENS.PUNCT, '(');
                // Init (Decl or Expr)
                let init = null;
                if (['int','float'].includes(this.peek().value)) {
                    init = this.parseDeclaration();
                } else if (this.peek().value !== ';') {
                    init = this.parseExpression();
                    this.expect(TOKENS.PUNCT, ';');
                } else {
                    this.consume(); // ;
                }
                
                let cond = null;
                if (this.peek().value !== ';') cond = this.parseExpression();
                this.expect(TOKENS.PUNCT, ';');
                
                let step = null;
                if (this.peek().value !== ')') step = this.parseExpression();
                this.expect(TOKENS.PUNCT, ')');
                
                const body = this.parseStatement();
                return { type: 'For', init, cond, step, body };
            }
            // Variable Declaration
            if (['int','float','char'].includes(t.value)) {
                return this.parseDeclaration();
            }
        }
        
        if (t.value === '{') return this.parseBlock();
        
        const expr = this.parseExpression();
        this.expect(TOKENS.PUNCT, ';');
        return { type: 'ExpressionStmt', expr };
    }

    parseDeclaration() {
        const typeNode = this.parseType();
        const name = this.expect(TOKENS.ID).value;
        let init = null;
        if (this.peek().value === '=') {
            this.consume();
            init = this.parseExpression();
        }
        this.expect(TOKENS.PUNCT, ';');
        return { type: 'VarDecl', varType: typeNode, name, init };
    }

    // --- Expression Parsing (Precedence) ---
    parseExpression() { return this.parseAssignment(); }

    parseAssignment() {
        let left = this.parseLogical();
        if (this.peek().value === '=' || this.peek().value === '+=' || this.peek().value === '-=') {
            const op = this.consume().value;
            const right = this.parseAssignment(); // Right-associative
            return { type: 'Assignment', op, left, right };
        }
        return left;
    }

    parseLogical() { return this.parseRelational(); } // Skipping && || for kernel speed, assuming mostly math

    parseRelational() {
        let left = this.parseAdditive();
        while (['<', '>', '<=', '>=', '==', '!='].includes(this.peek().value)) {
            const op = this.consume().value;
            const right = this.parseAdditive();
            left = { type: 'Binary', op, left, right };
        }
        return left;
    }

    parseAdditive() {
        let left = this.parseMultiplicative();
        while (['+', '-'].includes(this.peek().value)) {
            const op = this.consume().value;
            const right = this.parseMultiplicative();
            left = { type: 'Binary', op, left, right };
        }
        return left;
    }

    parseMultiplicative() {
        let left = this.parsePrefix();
        while (['*', '/'].includes(this.peek().value)) {
            const op = this.consume().value;
            const right = this.parsePrefix();
            left = { type: 'Binary', op, left, right };
        }
        return left;
    }

    parsePrefix() {
        // dereference *, address &, logical !
        // also negative -
        // Not handling pointers extensively in parsing, treating * as deref if it appears here?
        // Actually, pointer access is often `p[i]` (Postfix). 
        // `*p` is prefix.
        if (this.peek().value === '*') {
            this.consume();
            const expr = this.parsePrefix();
            return { type: 'Deref', expr };
        }
        return this.parsePostfix();
    }

    parsePostfix() {
        let expr = this.parsePrimary();
        while (true) {
            if (this.peek().value === '[') {
                this.consume();
                const index = this.parseExpression();
                this.expect(TOKENS.PUNCT, ']');
                expr = { type: 'ArrayAccess', target: expr, index };
            } else if (this.peek().value === '++' || this.peek().value === '--') {
                const op = this.consume().value;
                expr = { type: 'Update', op, arg: expr, prefix: false };
            } else {
                break;
            }
        }
        return expr;
    }

    parsePrimary() {
        const t = this.peek();
        if (t.type === TOKENS.NUM) {
            this.consume();
            return { type: 'Literal', value: t.value };
        }
        if (t.type === TOKENS.ID) {
            this.consume();
            return { type: 'Identifier', name: t.value };
        }
        if (t.value === '(') {
            this.consume();
            const expr = this.parseExpression();
            this.expect(TOKENS.PUNCT, ')');
            return expr;
        }
        throw new Error(`Unexpected token in expression: ${t.value}`);
    }
}

module.exports = { Parser };