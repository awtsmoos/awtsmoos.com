/*
B"H
Boruch Hashem
*/
import { TokenStream } from './token_stream.js';
import { parseProgram } from './declarations.js';

export function parse(tokens) {
    const stream = new TokenStream(tokens);
    stream.typedefs = new Map();
    return parseProgram(stream);
}