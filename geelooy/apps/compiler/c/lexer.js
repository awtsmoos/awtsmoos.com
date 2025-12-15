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
    'switch', 'case', 'default', 'break', 'continue'
]);

export function tokenize(source) {
    const tokens = [];
    let cursor = 0;
    
    // Remove comments
    source = source.replace(/\/\*[\s\S]*?\*\//g, ' ');
    source = source.replace(/\/\/.*$/gm, ' ');

    while (cursor < source.length) {
        const char = source[cursor];

        if (/\s/.test(char)) {
            cursor++;
            continue;
        }

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

        if (char === '"') {
            let value = '';
            cursor++;
            while (cursor < source.length && source[cursor] !== '"') {
                if (source[cursor] === '\\') {
                    cursor++;
                    const next = source[cursor];
                    if (next === 'n') { value += '\n'; cursor++; }
                    else if (next === 'r') { value += '\r'; cursor++; }
                    else if (next === 't') { value += '\t'; cursor++; }
                    else if (next === '0') { value += '\0'; cursor++; }
                    else if (next === '"') { value += '"'; cursor++; }
                    else if (next === '\\') { value += '\\'; cursor++; }
                    else if (next === 'x' || next === 'X') {
                         cursor++;
                         const hex = source.substr(cursor, 2);
                         if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
                             value += String.fromCharCode(parseInt(hex, 16));
                             cursor += 2;
                         } else {
                             value += 'x';
                         }
                    }
                    else { value += next; cursor++; }
                } else {
                    value += source[cursor++];
                }
            }
            cursor++; 
            tokens.push({ type: TOKENS.STRING, value });
            continue;
        }

        // Multi-char Operators
        const twoChar = source.substr(cursor, 2);
        if (['==', '!=', '>=', '<=', '+=', '-=', '*=', '/=', '++', '--', '&&', '||', '->'].includes(twoChar)) {
            tokens.push({ type: TOKENS.OP, value: twoChar });
            cursor += 2;
            continue;
        }

        if ('(){};,[]:'.includes(char)) {
            tokens.push({ type: TOKENS.PUNCT, value: char });
            cursor++;
            continue;
        }
        
        // Added '.' to operators for struct access
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