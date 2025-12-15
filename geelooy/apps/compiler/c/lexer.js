/*
B"H
Boruch Hashem
Biezrash Hashem
*/

export const TOKENS = {
    ID: 'ID',
    NUM: 'NUM',
    STRING: 'STRING',
    KEYWORD: 'KEYWORD',
    OP: 'OP',
    PUNCT: 'PUNCT',
    EOF: 'EOF'
};

const KEYWORDS = new Set([
    'import', 'void', 'int', 'char', 'return', 
    'if', 'else', 'while', 'for', 'do', 
    'switch', 'case', 'default', 'break', 'continue',
    'struct'
]);

export function tokenize(source) {
    const tokens = [];
    let cursor = 0;

    while (cursor < source.length) {
        const char = source[cursor];

        // Whitespace
        if (/\s/.test(char)) {
            cursor++;
            continue;
        }

        // Comments
        if (char === '/') {
            const next = source[cursor + 1];
            if (next === '/') {
                // Single-line comment: Skip until newline
                cursor += 2;
                while (cursor < source.length && source[cursor] !== '\n') {
                    cursor++;
                }
                continue;
            } else if (next === '*') {
                // Multi-line comment: Skip until */
                cursor += 2;
                while (cursor < source.length && !(source[cursor] === '*' && source[cursor + 1] === '/')) {
                    cursor++;
                }
                cursor += 2; // Skip closing */
                continue;
            }
        }

        // Strings (Handle escapes)
        if (char === '"') {
            let value = '';
            cursor++; // Skip opening "
            while (cursor < source.length && source[cursor] !== '"') {
                if (source[cursor] === '\\') {
                    cursor++; // Consume backslash
                    if (cursor >= source.length) break;
                    const nextChar = source[cursor];
                    if (nextChar === 'n') { value += '\n'; cursor++; }
                    else if (nextChar === 'r') { value += '\r'; cursor++; }
                    else if (nextChar === 't') { value += '\t'; cursor++; }
                    else if (nextChar === '0') { value += '\0'; cursor++; }
                    else if (nextChar === '"') { value += '"'; cursor++; }
                    else if (nextChar === '\\') { value += '\\'; cursor++; }
                    else if (nextChar === 'x' || nextChar === 'X') {
                         cursor++;
                         const hex = source.substr(cursor, 2);
                         if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
                             value += String.fromCharCode(parseInt(hex, 16));
                             cursor += 2;
                         } else {
                             value += 'x';
                         }
                    }
                    else { value += nextChar; cursor++; }
                } else {
                    value += source[cursor++];
                }
            }
            if (source[cursor] === '"') cursor++; // Skip closing "
            tokens.push({ type: TOKENS.STRING, value });
            continue;
        }

        // IDs / Keywords
        if (/[a-zA-Z_]/.test(char)) {
            let value = '';
            while (cursor < source.length && /[a-zA-Z0-9_]/.test(source[cursor])) {
                value += source[cursor++];
            }
            if (KEYWORDS.has(value)) {
                tokens.push({ type: TOKENS.KEYWORD, value });
            } else {
                tokens.push({ type: TOKENS.ID, value });
            }
            continue;
        }

        // Numbers (Hex or Decimal)
        if (/[0-9]/.test(char)) {
            let value = '';
            if (source.startsWith('0x', cursor)) {
                value += '0x';
                cursor += 2;
                while (cursor < source.length && /[0-9a-fA-F]/.test(source[cursor])) {
                    value += source[cursor++];
                }
            } else {
                while (cursor < source.length && /[0-9]/.test(source[cursor])) {
                    value += source[cursor++];
                }
            }
            tokens.push({ type: TOKENS.NUM, value });
            continue;
        }

        // Multi-char Operators
        const twoChar = source.substr(cursor, 2);
        if (['==', '!=', '>=', '<=', '+=', '-=', '*=', '/=', '++', '--', '&&', '||', '->'].includes(twoChar)) {
            tokens.push({ type: TOKENS.OP, value: twoChar });
            cursor += 2;
            continue;
        }

        // Punctuation
        if ('(){};,[]:'.includes(char)) {
            tokens.push({ type: TOKENS.PUNCT, value: char });
            cursor++;
            continue;
        }
        
        // Single-char Operators
        if ('+-*/=<>!&|%.'.includes(char)) {
            tokens.push({ type: TOKENS.OP, value: char });
            cursor++;
            continue;
        }

        throw new Error(`Unexpected character: '${char}' at index ${cursor}`);
    }

    tokens.push({ type: TOKENS.EOF, value: null });
    return tokens;
}