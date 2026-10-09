/*
B"H
Boruch Hashem
*/
import { TOKENS } from '../lexer.js';

/** Type qualifiers the subset accepts and ignores: no const checking. */
const QUALIFIERS = new Set(["const", "static", "unsigned", "signed"]);

function skipQualifiers(stream) {
	while (stream.peek().type === TOKENS.KEYWORD && QUALIFIERS.has(stream.peek().value)) {
		stream.consume();
	}
}

function parseStars(stream) {
	let ptr = 0;
	while (stream.peek().type === TOKENS.OP && stream.peek().value === '*') {
		stream.consume();
		ptr++;
		skipQualifiers(stream); // `char * const p`
	}
	return ptr;
}

export function parseType(stream, options = {}) {
    skipQualifiers(stream);
    const t = stream.peek();

    let base = '';
    if (t.type === TOKENS.KEYWORD) {
        if (t.value === 'struct' || t.value === 'union') {
            stream.consume();
            skipQualifiers(stream);
            base = stream.expect(TOKENS.ID).value; // Name
        } else if (t.value === 'enum') {
            // Enums desugar to int; the tag is only documentation.
            stream.consume();
            skipQualifiers(stream);
            if (stream.peek().type === TOKENS.ID) stream.consume();
            return { base: 'int', ptr: options.stars === false ? 0 : parseStars(stream) };
        } else {
            base = stream.consume().value; // int, char, void
        }
    } else if (t.type === TOKENS.ID) {
        const name = stream.consume().value;
        const aliased = stream.typedefs ? stream.typedefs.get(name) : undefined;
        if (aliased) {
            // A typedef name resolves to its aliased type before stars.
            return { base: aliased.base, ptr: aliased.ptr + (options.stars === false ? 0 : parseStars(stream)) };
        }
        base = name;
    } else {
        throw new Error("Expected type, got " + t.value);
    }

    // Pointers: `*` binds to the declarator, so comma-separated declarators
    // (int *p, q) opt out of star consumption here and parse their own.
    const ptr = options.stars === false ? 0 : parseStars(stream);

    return { base, ptr };
}

/** True when the stream opens a declaration (type, qualifier, or typedef name). */
export function isDeclarationStart(stream) {
	const t = stream.peek();
	if (t.type === TOKENS.KEYWORD) {
		return ["int", "char", "void", "long", "struct", "union", "enum", "const", "static", "typedef"].includes(t.value);
	}
	return t.type === TOKENS.ID && !!stream.typedefs && stream.typedefs.has(t.value);
}
