
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
    let currentLine = 1;

    while (i < len) {
        const c = source[i];
        if (c === '\n') { currentLine++; i++; continue; }
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
            tokens.push({ type: KEYWORDS.has(val) ? TOKENS.KEYWORD : TOKENS.ID, value: val, line: currentLine });
            continue;
        }

        // Numbers (including scientific notation and 'f' suffix)
        if (/[0-9]/.test(c) || (c === '.' && i + 1 < len && /[0-9]/.test(source[i+1]))) {
            let start = i;
            // 1. Digits and dot
            while (i < len && /[0-9.]/.test(source[i])) i++;
            
            // 2. Scientific notation
            if (i < len && /[eE]/.test(source[i])) {
                i++;
                if (i < len && /[+-]/.test(source[i])) i++;
                while (i < len && /[0-9]/.test(source[i])) i++;
            }
            
            // 3. Float suffix 'f' or 'F'
            if (i < len && /[fF]/.test(source[i])) {
                i++;
            }
            
            tokens.push({ type: TOKENS.NUM, value: source.slice(start, i), line: currentLine });
            continue;
        }

        // Multichar Operators
        const two = source.slice(i, i+2);
        if (['==','!=','<=','>=','+=','-=','*=','/=','++','--','<<','>>'].includes(two)) {
            tokens.push({ type: TOKENS.OP, value: two, line: currentLine });
            i += 2; continue;
        }

        if ('(){}[],;:.?'.includes(c)) {
            tokens.push({ type: TOKENS.PUNCT, value: c, line: currentLine });
            i++; continue;
        }

        if ('+-*/=<>&|!^'.includes(c)) {
            tokens.push({ type: TOKENS.OP, value: c, line: currentLine });
            i++; continue;
        }

        i++;
    }
    tokens.push({ type: TOKENS.EOF, value: null, line: currentLine });
    return tokens;
}

module.exports = { tokenize, TOKENS };
