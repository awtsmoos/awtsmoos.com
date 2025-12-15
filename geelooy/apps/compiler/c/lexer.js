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
    let line = 1;
    let col = 1;

    while (cursor < source.length) {
        const char = source[cursor];

        // Whitespace
        if (/\s/.test(char)) {
            if (char === '\n') {
                line++;
                col = 1;
            } else {
                col++;
            }
            cursor++;
            continue;
        }

        const startCol = col;

        // Comments
        if (char === '/') {
            const next = source[cursor + 1];
            if (next === '/') {
                // Single-line comment: Skip until newline
                cursor += 2;
                col += 2;
                while (cursor < source.length && source[cursor] !== '\n') {
                    cursor++;
                    // col is tracked abstractly here, not strictly needed for skipping
                }
                // Don't consume newline here, let loop handle it
                continue;
            } else if (next === '*') {
                // Multi-line comment: Skip until */
                cursor += 2;
                col += 2;
                while (cursor < source.length && !(source[cursor] === '*' && source[cursor + 1] === '/')) {
                    if (source[cursor] === '\n') {
                        line++;
                        col = 1;
                    } else {
                        col++;
                    }
                    cursor++;
                }
                cursor += 2; // Skip closing */
                col += 2;
                continue;
            }
        }

        // Strings (Handle escapes)
        if (char === '"') {
            let value = '';
            cursor++; // Skip opening "
            col++;
            while (cursor < source.length && source[cursor] !== '"') {
                if (source[cursor] === '\\') {
                    cursor++; col++; // Consume backslash
                    if (cursor >= source.length) break;
                    const nextChar = source[cursor];
                    
                    if (nextChar === 'n') { value += '\n'; }
                    else if (nextChar === 'r') { value += '\r'; }
                    else if (nextChar === 't') { value += '\t'; }
                    else if (nextChar === '0') { value += '\0'; }
                    else if (nextChar === '"') { value += '"'; }
                    else if (nextChar === '\\') { value += '\\'; }
                    else if (nextChar === 'x' || nextChar === 'X') {
                         cursor++; col++;
                         const hex = source.substr(cursor, 2);
                         if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
                             value += String.fromCharCode(parseInt(hex, 16));
                             cursor += 1; col += 1; // hex logic consumes 2 more below
                         } else {
                             value += 'x';
                             cursor--; col--; // Backtrack for normal char processing
                         }
                    }
                    else { value += nextChar; }
                    
                    cursor++; col++;
                } else {
                    if (source[cursor] === '\n') { line++; col = 1; }
                    else { col++; }
                    value += source[cursor++];
                }
            }
            if (source[cursor] === '"') {
                cursor++; col++; // Skip closing "
            }
            tokens.push({ type: TOKENS.STRING, value, line, col: startCol });
            continue;
        }

        // IDs / Keywords
        if (/[a-zA-Z_]/.test(char)) {
            let value = '';
            while (cursor < source.length && /[a-zA-Z0-9_]/.test(source[cursor])) {
                value += source[cursor];
                cursor++;
                col++;
            }
            if (KEYWORDS.has(value)) {
                tokens.push({ type: TOKENS.KEYWORD, value, line, col: startCol });
            } else {
                tokens.push({ type: TOKENS.ID, value, line, col: startCol });
            }
            continue;
        }

        // Numbers (Hex or Decimal)
        if (/[0-9]/.test(char)) {
            let value = '';
            if (source.startsWith('0x', cursor)) {
                value += '0x';
                cursor += 2; col += 2;
                while (cursor < source.length && /[0-9a-fA-F]/.test(source[cursor])) {
                    value += source[cursor];
                    cursor++; col++;
                }
            } else {
                while (cursor < source.length && /[0-9]/.test(source[cursor])) {
                    value += source[cursor];
                    cursor++; col++;
                }
            }
            tokens.push({ type: TOKENS.NUM, value, line, col: startCol });
            continue;
        }

        // Punctuation (Must precede operators to catch parentheses early if needed, though structure handles it)
        if ('(){};,[]:'.includes(char)) {
            tokens.push({ type: TOKENS.PUNCT, value: char, line, col: startCol });
            cursor++;
            col++;
            continue;
        }

        // Multi-char Operators
        const twoChar = source.substr(cursor, 2);
        if (['==', '!=', '>=', '<=', '+=', '-=', '*=', '/=', '++', '--', '&&', '||', '->'].includes(twoChar)) {
            tokens.push({ type: TOKENS.OP, value: twoChar, line, col: startCol });
            cursor += 2;
            col += 2;
            continue;
        }
        
        // Single-char Operators
        if ('+-*/=<>!&|%.'.includes(char)) {
            tokens.push({ type: TOKENS.OP, value: char, line, col: startCol });
            cursor++;
            col++;
            continue;
        }

        throw new Error(`Unexpected character: '${char}' at line ${line}, col ${col}`);
    }

    tokens.push({ type: TOKENS.EOF, value: null, line, col });
    return tokens;
}