
// B"H
/**
 * C Lexer
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
    'break', 'continue'
]);

function tokenize(source) {
    const tokens = [];
    let i = 0;
    const len = source.length;
    let line = 1;

    while (i < len) {
        const c = source[i];
        if (c === '\n') { line++; i++; continue; }
        if (/\s/.test(c)) { i++; continue; }

        if (c === '/' && source[i+1] === '/') {
            i += 2; while (i < len && source[i] !== '\n') i++;
            continue;
        }

        // Identifiers
        if (/[a-zA-Z_]/.test(c)) {
            let start = i;
            while (i < len && /[a-zA-Z0-9_]/.test(source[i])) i++;
            const val = source.slice(start, i);
            tokens.push({ type: KEYWORDS.has(val) ? TOKENS.KEYWORD : TOKENS.ID, value: val, line });
            continue;
        }

        // Numbers
        if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(source[i+1]))) {
            let start = i;
            while (i < len && /[0-9.eE+-]/.test(source[i])) i++;
            tokens.push({ type: TOKENS.NUM, value: source.slice(start, i), line });
            continue;
        }

        // Multichar Operators
        const two = source.slice(i, i+2);
        if (['==','!=','<=','>=','+=','-=','*=','/='].includes(two)) {
            tokens.push({ type: TOKENS.OP, value: two, line });
            i += 2; continue;
        }

        if ('(){}[],;:.?'.includes(c)) {
            tokens.push({ type: TOKENS.PUNCT, value: c, line });
            i++; continue;
        }

        if ('+-*/=<>&|!^'.includes(c)) {
            tokens.push({ type: TOKENS.OP, value: c, line });
            i++; continue;
        }

        i++;
    }
    tokens.push({ type: TOKENS.EOF, value: null, line });
    return tokens;
}

module.exports = { tokenize, TOKENS };
