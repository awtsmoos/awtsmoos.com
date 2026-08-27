/*
B"H
Boruch Hashem
*/
import { TOKENS } from '../lexer.js';
import { parseType } from './types.js';
import { parseBlock } from './statements.js';

export function parseProgram(stream) {
    const program = { imports: [], functions: [], globals: [], structs: [] };

    while (stream.peek().type !== TOKENS.EOF) {
        const t = stream.peek();
        
        if (t.type === TOKENS.KEYWORD && t.value === 'import') {
            stream.consume(); 
            const dll = stream.expect(TOKENS.STRING).value;
            while (stream.peek().type === TOKENS.ID) {
                const func = stream.consume().value;
                program.imports.push({ dll, func });
            }
            stream.expect(TOKENS.PUNCT, ';');
        } 
        else if (t.type === TOKENS.KEYWORD && t.value === 'struct') {
            // Ambiguity: struct Name { ... } (Def) vs struct Name var; (Global)
            // Look ahead
            // t = struct
            // peek(1) = Name (ID)
            // peek(2) = { OR * OR ID
            
            const next = stream.peek(1);
            const after = stream.peek(2);
            
            if (next.type === TOKENS.ID && after.value === '{') {
                // Struct Definition
                stream.consume(); // struct
                const name = stream.expect(TOKENS.ID).value;
                stream.expect(TOKENS.PUNCT, '{');
                const fields = [];
                while (stream.peek().value !== '}') {
                    const fType = parseType(stream);
                    const fName = stream.expect(TOKENS.ID).value;
                    let arrSize = 0;
                    if (stream.peek().value === '[') {
                        stream.consume();
                        arrSize = parseInt(stream.expect(TOKENS.NUM).value);
                        stream.expect(TOKENS.PUNCT, ']');
                    }
                    stream.expect(TOKENS.PUNCT, ';');
                    fields.push({ type: fType, name: fName, arraySize: arrSize });
                }
                stream.expect(TOKENS.PUNCT, '}');
                stream.expect(TOKENS.PUNCT, ';');
                program.structs.push({ name, fields });
            } else {
                // Global Variable Declaration
                parseGlobalOrFunc(stream, program);
            }
        }
        else {
            parseGlobalOrFunc(stream, program);
        }
    }
    return program;
}

function parseGlobalOrFunc(stream, program) {
    const type = parseType(stream);
    const name = stream.expect(TOKENS.ID).value;

    if (stream.peek().value === '(') {
        // Function
        stream.consume();
        const args = [];
        if (stream.peek().value !== ')') {
            while (true) {
                const argType = parseType(stream);
                const argName = stream.expect(TOKENS.ID).value;
                args.push({ type: argType, name: argName });
                if (stream.peek().value === ',') stream.consume();
                else break;
            }
        }
        stream.expect(TOKENS.PUNCT, ')');
        const body = parseBlock(stream);
        program.functions.push({ retType: type, name, args, body });
    } else {
        // Global
        let value = null;
        if (stream.peek().value === '=') {
            stream.consume();
            let modifier = '';
            if (stream.peek().value === '-') { stream.consume(); modifier = '-'; }

            if (stream.peek().type === TOKENS.NUM) {
                value = modifier + stream.consume().value;
            } 
            else if (stream.peek().type === TOKENS.STRING) {
                    if (modifier) throw new Error("Cannot negate string");
                    value = '"' + stream.consume().value + '"'; 
            }
            else { throw new Error("Globals must be initialized with constants"); }
        }
        stream.expect(TOKENS.PUNCT, ';');
        program.globals.push({ type, name, value });
    }
}