// B"H
/**
 * C Lexer
 * Handles comments (single line and multi line), preprocessor directives, and tokens.
 */

const TOKENS = {
    ID: 'ID',
    NUM: 'NUM',
    STRING: 'STRING',
    KEYWORD: 'KEYWORD',
    OP: 'OP',
    PUNCT: 'PUNCT',
    EOF: 'EOF'
};

const KEYWORDS = new Set([
    'void', 'int', 'float', 'char', 'double', 
    'return', 'if', 'else', 'while', 'for', 'do', 
    'break', 'continue', 'struct', 'typedef', 'sizeof'
]);

function tokenize(source) {
    const tokens = [];
    let i = 0;
    const len = source.length;

    while (i < len) {
        const c = source[i];

        // 1. Whitespace
        if (/\s/.test(c)) {
            i++;
            continue;
        }

        // 2. Comments & Division
        if (c === '/') {
            const next = source[i + 1];
            if (next === '/') {
                // Single line comment
                i += 2;
                while (i < len && source[i] !== '\n') i++;
                continue;
            } else if (next === '*') {
                // Multi line comment
                i += 2;
                while (i < len - 1 && !(source[i] === '*' && source[i+1] === '/')) i++;
                i += 2; // Skip closing slash
                continue;
            } else {
                // Division operator (assign handled later)
                if (source[i+1] === '=') {
                    tokens.push({ type: TOKENS.OP, value: '/=' });
                    i += 2;
                } else {
                    tokens.push({ type: TOKENS.OP, value: '/' });
                    i++;
                }
                continue;
            }
        }

        // 3. Preprocessor (Ignore for now, or handle basics)
        if (c === '#') {
            // Skip line
            while (i < len && source[i] !== '\n') i++;
            continue;
        }

        // 4. Identifiers & Keywords
        if (/[a-zA-Z_]/.test(c)) {
            let start = i;
            while (i < len && /[a-zA-Z0-9_]/.test(source[i])) i++;
            const val = source.slice(start, i);
            const type = KEYWORDS.has(val) ? TOKENS.KEYWORD : TOKENS.ID;
            tokens.push({ type, value: val });
            continue;
        }

        // 5. Numbers (Hex & Decimal & Float)
        if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(source[i+1]))) {
            let start = i;
            if (c === '0' && (source[i+1] === 'x' || source[i+1] === 'X')) {
                i += 2;
                while (i < len && /[0-9a-fA-F]/.test(source[i])) i++;
            } else {
                while (i < len && /[0-9]/.test(source[i])) i++;
                if (source[i] === '.' && /[0-9]/.test(source[i+1])) {
                    i++;
                    while (i < len && /[0-9]/.test(source[i])) i++;
                }
            }
            tokens.push({ type: TOKENS.NUM, value: source.slice(start, i) });
            continue;
        }

        // 6. Strings
        if (c === '"') {
            i++;
            let val = "";
            while (i < len && source[i] !== '"') {
                if (source[i] === '\\') i++; // Simple escape skip
                val += source[i++];
            }
            i++; // Skip closing "
            tokens.push({ type: TOKENS.STRING, value: val });
            continue;
        }

        // 7. Operators & Punctuation
        const twoChar = source.slice(i, i+2);
        if (['==','!=','<=','>=','&&','||','++','--','+=','-=','*=','->','<<','>>'].includes(twoChar)) {
            tokens.push({ type: TOKENS.OP, value: twoChar });
            i += 2;
            continue;
        }

        if ('(){}[],;:.?'.includes(c)) {
            tokens.push({ type: TOKENS.PUNCT, value: c });
            i++;
            continue;
        }

        if ('+-*&|^%!~=<'.includes(c)) { // / handled above, > handled in twoChar or here
             tokens.push({ type: TOKENS.OP, value: c });
             i++;
             continue;
        }
        
        if (c === '>') { // Check for >> handled above, > here
             tokens.push({ type: TOKENS.OP, value: '>' });
             i++;
             continue;
        }

        // Unknown
        console.warn(`[Lexer] Unexpected char: ${c}`);
        i++;
    }
    
    tokens.push({ type: TOKENS.EOF, value: null });
    return tokens;
}

module.exports = { tokenize, TOKENS };