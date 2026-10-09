/*
B"H
Boruch Hashem
*/
import { TOKENS } from '../lexer.js';

/** Type qualifiers the subset accepts. `unsigned` selects zero-extending loads;
 * `signed`, `const`, and `static` are accepted and ignored for codegen. */
const QUALIFIERS = new Set(["const", "static", "unsigned", "signed"]);

function skipQualifiers(stream) {
	let unsigned = false;
	while (stream.peek().type === TOKENS.KEYWORD && QUALIFIERS.has(stream.peek().value)) {
		if (stream.peek().value === "unsigned") unsigned = true;
		stream.consume();
	}
	return { unsigned };
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
    const { unsigned } = skipQualifiers(stream);
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
            return { base: 'int', ptr: options.stars === false ? 0 : parseStars(stream), unsigned: false };
        } else {
            base = stream.consume().value; // int, char, float, ...
        }
    } else if (t.type === TOKENS.ID) {
        const name = stream.consume().value;
        const aliased = stream.typedefs ? stream.typedefs.get(name) : undefined;
        if (aliased) {
            // A typedef name resolves to its aliased type before stars.
            return { base: aliased.base, ptr: aliased.ptr + (options.stars === false ? 0 : parseStars(stream)), unsigned: Boolean(aliased.unsigned) };
        }
        base = name;
    } else {
        throw new Error("Expected type, got " + t.value);
    }

    // Pointers: `*` binds to the declarator, so comma-separated declarators
    // (int *p, q) opt out of star consumption here and parse their own.
    const ptr = options.stars === false ? 0 : parseStars(stream);

    return { base, ptr, unsigned };
}

/** True when the stream opens a declaration (type, qualifier, or typedef name). */
export function isDeclarationStart(stream) {
	const t = stream.peek();
	if (t.type === TOKENS.KEYWORD) {
		return ["int", "char", "short", "void", "long", "float", "double", "struct", "union", "enum", "const", "static", "unsigned", "signed", "typedef"].includes(t.value);
	}
	return t.type === TOKENS.ID && !!stream.typedefs && stream.typedefs.has(t.value);
}
