/*
B"H
Boruch Hashem
*/
import { TOKENS } from '../lexer.js';

export function parseType(stream) {
    // Base Type: int, char, void, or struct name
    const t = stream.peek();
    
    // In this subset, types are usually KEYWORDs (int, void) or IDs (structs)
    let base = '';
    if (t.type === TOKENS.KEYWORD) {
        base = stream.consume().value;
    } else if (t.type === TOKENS.ID) {
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