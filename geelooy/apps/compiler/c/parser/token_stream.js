/*
B"H
Boruch Hashem
*/
export class TokenStream {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    peek(offset = 0) {
        if (this.pos + offset >= this.tokens.length) {
            return this.tokens[this.tokens.length - 1]; // EOF
        }
        return this.tokens[this.pos + offset];
    }

    consume() {
        if (this.pos < this.tokens.length) {
            return this.tokens[this.pos++];
        }
        return this.tokens[this.tokens.length - 1];
    }

    expect(type, val = null) {
        const t = this.peek();
        if (t.type !== type || (val && t.value !== val)) {
            const loc = `Line ${t.line}, Col ${t.col}`;
            throw new Error(`[${loc}] Expected ${type} '${val || ''}' but got ${t.type} '${t.value}'`);
        }
        return this.consume();
    }

    // Helper to throw error at current position
    error(msg) {
        const t = this.peek();
        const loc = `Line ${t.line}, Col ${t.col}`;
        throw new Error(`[${loc}] ${msg}`);
    }
}