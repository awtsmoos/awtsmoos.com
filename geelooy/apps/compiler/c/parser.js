/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { TOKENS } from './lexer.js';

export function parse(tokens) {
    let pos = 0;

    function peek() { return tokens[pos]; }
    function consume() { return tokens[pos++]; }
    function expect(type, val = null) {
        const t = peek();
        if (t.type !== type || (val && t.value !== val)) {
            throw new Error(`Expected ${type} ${val || ''} but got ${t.type} ${t.value}`);
        }
        return consume();
    }

    // AST Nodes
    const program = { imports: [], functions: [], globals: [] };

    while (peek().type !== TOKENS.EOF) {
        const t = peek();
        if (t.type === TOKENS.KEYWORD && t.value === 'import') {
            parseImport();
        } else {
            // Either Global Var or Function
            // type name ...
            const type = consume().value; // int/void
            const name = expect(TOKENS.ID).value;
            
            if (peek().value === '(') {
                parseFunction(type, name);
            } else {
                parseGlobal(type, name);
            }
        }
    }

    function parseImport() {
        consume(); // import
        const dll = expect(TOKENS.STRING).value;
        const func = expect(TOKENS.ID).value;
        expect(TOKENS.PUNCT, ';');
        program.imports.push({ dll, func });
    }

    function parseGlobal(type, name) {
        let value = null;
        if (peek().value === '=') {
            consume();
            if (peek().type === TOKENS.NUM) value = consume().value;
            else if (peek().type === TOKENS.STRING) value = consume().value;
            else throw new Error("Globals must be initialized with constants");
        }
        expect(TOKENS.PUNCT, ';');
        program.globals.push({ type, name, value });
    }

    function parseFunction(retType, name) {
        consume(); // (
        const args = [];
        while (peek().value !== ')') {
            const argType = expect(TOKENS.KEYWORD).value;
            const argName = expect(TOKENS.ID).value;
            args.push({ type: argType, name: argName });
            if (peek().value === ',') consume();
        }
        consume(); // )
        const body = parseBlock();
        program.functions.push({ retType, name, args, body });
    }

    function parseBlock() {
        expect(TOKENS.PUNCT, '{');
        const stmts = [];
        while (peek().value !== '}') {
            stmts.push(parseStatement());
        }
        consume(); // }
        return { type: 'block', stmts };
    }

    function parseStatement() {
        const t = peek();
        if (t.type === TOKENS.KEYWORD) {
            if (t.value === 'return') {
                consume();
                let expr = null;
                if (peek().value !== ';') expr = parseExpression();
                expect(TOKENS.PUNCT, ';');
                return { type: 'return', expr };
            }
            if (t.value === 'if') {
                consume();
                expect(TOKENS.PUNCT, '(');
                const cond = parseExpression();
                expect(TOKENS.PUNCT, ')');
                const then = parseBlock();
                let el = null;
                if (peek().value === 'else') {
                    consume();
                    el = parseBlock();
                }
                return { type: 'if', cond, then, el };
            }
            if (t.value === 'while') {
                consume();
                expect(TOKENS.PUNCT, '(');
                const cond = parseExpression();
                expect(TOKENS.PUNCT, ')');
                const body = parseBlock();
                return { type: 'while', cond, body };
            }
            if (t.value === 'int' || t.value === 'char') {
                // Local Decl
                const varType = consume().value;
                const name = expect(TOKENS.ID).value;
                let init = null;
                if (peek().value === '=') {
                    consume();
                    init = parseExpression();
                }
                expect(TOKENS.PUNCT, ';');
                return { type: 'decl', varType, name, init };
            }
        }
        
        // Expression Stmt
        const expr = parseExpression();
        expect(TOKENS.PUNCT, ';');
        return { type: 'expr', expr };
    }

    function parseExpression() {
        return parseAssign();
    }

    function parseAssign() {
        let left = parseEquality();
        if (peek().value === '=') {
            consume();
            const right = parseAssign();
            return { type: 'assign', left, right };
        }
        return left;
    }

    function parseEquality() {
        let left = parseAdditive();
        while (peek().value === '==' || peek().value === '!=') {
            const op = consume().value;
            const right = parseAdditive();
            left = { type: 'binop', op, left, right };
        }
        return left;
    }

    function parseAdditive() {
        let left = parsePrimary();
        while (peek().value === '+' || peek().value === '-') {
            const op = consume().value;
            const right = parsePrimary();
            left = { type: 'binop', op, left, right };
        }
        return left;
    }

    function parsePrimary() {
        const t = peek();
        if (t.type === TOKENS.NUM) return { type: 'literal', val: consume().value };
        if (t.type === TOKENS.STRING) return { type: 'string', val: consume().value };
        if (t.type === TOKENS.ID) {
            const name = consume().value;
            if (peek().value === '(') {
                // Function Call
                consume();
                const args = [];
                if (peek().value !== ')') {
                    do {
                        args.push(parseExpression());
                    } while (peek().value === ',' && consume());
                }
                expect(TOKENS.PUNCT, ')');
                return { type: 'call', name, args };
            }
            return { type: 'var', name };
        }
        if (t.value === '(') {
            consume();
            const e = parseExpression();
            expect(TOKENS.PUNCT, ')');
            return e;
        }
        throw new Error("Unexpected token in expression: " + t.value);
    }

    return program;
}