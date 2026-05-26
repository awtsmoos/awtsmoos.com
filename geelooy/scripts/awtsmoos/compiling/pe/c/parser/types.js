/*
B"H
Boruch Hashem
*/
import { TOKENS } from '../lexer.js';

export function parseType(stream) {
    const t = stream.peek();
    
    let base = '';
    if (t.type === TOKENS.KEYWORD) {
        if (t.value === 'struct') {
            stream.consume(); // struct
            base = stream.expect(TOKENS.ID).value; // Name
        } else {
            base = stream.consume().value; // int, char, void
        }
    } else if (t.type === TOKENS.ID) {
        // Fallback if struct was omitted or typedef (not supported yet but good to have)
        base = stream.consume().value;
    } else {
        throw new Error("Expected type, got " + t.value);
    }

    // Pointers: *
    let ptr = 0;
    while (stream.peek().value === '*') {
        stream.consume();
        ptr++;
    }

    return { base, ptr };
}