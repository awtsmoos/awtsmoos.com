
// B"H
/**
 * @file tokenizer.js
 * @description The specific knowledge for each language resides here. Each function
 * is a "sense" that can perceive the structure of a specific language.
 */

// --- Helper Functions (Shared Knowledge) ---
function _findUnescaped(line, searchString, startIndex) {
    for (let i = startIndex; i < line.length; i++) {
        if (line.substring(i).startsWith(searchString)) {
            if (i > 0 && line[i - 1] === '\\') {
                let backslashCount = 0;
                let p = i - 1;
                while (p >= 0 && line[p] === '\\') {
                    backslashCount++;
                    p--;
                }
                if (backslashCount % 2 !== 0) {
                    continue;
                }
            }
            return i;
        }
    }
    return -1;
}

function _escape(s) {
    return s ? s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
}

function _wrap(s, t) {
    return `<span class="token-${t}">${_escape(s)}</span>`;
}

function _isWS(c) { return " \t\n\r".includes(c); }
function _isD(c) { return c >= "0" && c <= "9"; }
function _isIS(c) { return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_" || c === "$"; }
function _isIP(c) { return _isIS(c) || _isD(c); }
function _isFC(line, i) {
    while (i < line.length) {
        if (!_isWS(line[i])) return line[i] === "(";
        i++;
    }
    return false;
}

export const helpers = { _findUnescaped, _escape, _wrap };

// --- JavaScript Tokenizer ---
export function getJSToken(line, i, state) {
    // B"H - Updated Fold Marker Detection
    // Look for the specific comment pattern: /* [FOLD:123] */
    if (line[i] === '/' && line[i+1] === '*') {
        const rest = line.substring(i);
        const match = rest.match(/^\/\* \[FOLD:(\d+)\] \*\//);
        if (match) {
            // Render it as a 'folded' token which will be styled as a badge
            return { html: _wrap(match[0], 'folded'), newIndex: i + match[0].length };
        }
    }

    const char = line[i];
    
    // B"H - Tikkun for Template Literals: Explicit State Handling
    const context = state.contextStack.length > 0 ? state.contextStack[state.contextStack.length - 1] : null;

    // 1. Handle Active Template Literal Content
    if (context && context.mode === 'template_literal') {
        // If we hit the backtick, close the template
        if (char === '`') {
            state.contextStack.pop();
            return { html: _wrap('`', 'string'), newIndex: i + 1 };
        }
        // If we hit ${, switch to interpolation mode
        if (line.substring(i).startsWith('${')) {
            state.contextStack.push({ mode: 'javascript_interpolation', terminator: '}', depth: 0 });
            return { html: _wrap('${', 'controlKeyword'), newIndex: i + 2 };
        }
        // Otherwise, consume as string content
        let p = i + 1;
        while (p < line.length) {
            if (line[p] === '`') break;
            if (line.substring(p).startsWith('${')) break;
            if (line[p] === '\\') p++; // Skip escaped char
            p++;
        }
        return { html: _wrap(line.substring(i, p), 'string'), newIndex: p };
    }

    // 2. Handle Active Interpolation Logic (${...})
    if (context && context.mode === 'javascript_interpolation') {
        if (char === '{') {
            context.depth = (context.depth || 0) + 1;
        } else if (char === '}') {
            if (context.depth && context.depth > 0) {
                context.depth--;
            } else {
                // Closing the interpolation. Pop context and consume '}'
                state.contextStack.pop();
                return { html: _wrap('}', 'controlKeyword'), newIndex: i + 1 };
            }
        }
    }

    // 3. Regex Detection (Standard)
    if (char === '/') {
        if (line.substring(i, i + 2) === '/*') {
            state.contextStack.push({ mode: 'comment', terminator: '*/' });
            return { html: _wrap('/*', 'comment'), newIndex: i + 2 };
        }
        if (line.substring(i, i + 2) === '//') {
            return { html: _wrap(line.substring(i), 'comment'), newIndex: line.length };
        }

        let p = i - 1;
        while (p >= 0 && _isWS(line[p])) p--;
        let isDivision = false;
        if (p >= 0) {
            const prevChar = line[p];
            if (_isIP(prevChar) || ")]}".includes(prevChar)) isDivision = true;
            if ("+-".includes(prevChar) && p > 0 && line[p-1] === prevChar) isDivision = true; // Handles ++ --
        }

        if (!isDivision) {
            let regexBodyEnd = -1, inCharSet = false;
            for (let j = i + 1; j < line.length; j++) {
                const c = line[j];
                if (c === '\\') { j++; continue; }
                if (c === '[') inCharSet = true;
                else if (c === ']' && inCharSet) inCharSet = false;
                else if (c === '/' && !inCharSet) { regexBodyEnd = j; break; }
            }
            if (regexBodyEnd !== -1) {
                let flagsEnd = regexBodyEnd + 1;
                while (flagsEnd < line.length && 'gimsuy'.includes(line[flagsEnd])) flagsEnd++;
                return { html: _wrap(line.substring(i, flagsEnd), 'string'), newIndex: flagsEnd };
            }
        }
    }
    
    // 4. Start of Template Literal
    if (char === '`') {
        state.contextStack.push({ mode: 'template_literal', terminator: '`' });
        return { html: _wrap('`', 'string'), newIndex: i + 1 };
    }

    // 5. Start of Strings
    if ("'\"".includes(char)) {
        const mode = 'string';
        state.contextStack.push({ mode, terminator: char });
        return { html: _wrap(char, 'string'), newIndex: i + 1 };
    }

    const ctlK = new Set(['import', 'as', 'from', 'export', 'throw', 'instanceof', 'default', 'async', 'function', 'await', 'if', 'else', 'return', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'class', 'extends', 'get', 'set', 'typeof', 'of', 'delete']);
    const defK = new Set(['const', 'let', 'var', 'true', 'false', 'null', 'undefined', 'this', 'new', 'super']);

    if (_isIS(char)) {
        let buffer = '', p = i;
        while (p < line.length && _isIP(line[p])) buffer += line[p++];
        let type = 'variable';
        if (state.isNextTokenFunctionName) {
            type = 'functionName';
            state.isNextTokenFunctionName = false;
        } else if (buffer === 'function') {
            type = 'controlKeyword';
            state.isNextTokenFunctionName = true;
        } else if (ctlK.has(buffer)) type = 'controlKeyword';
        else if (defK.has(buffer)) type = 'definitionKeyword';
        else if (_isFC(line, p)) type = 'functionName';
        return { html: _wrap(buffer, type), newIndex: p };
    }

    if (_isD(char)) {
        let buffer = '', p = i;
        while (p < line.length && (_isD(line[p]) || line[p] === '.')) buffer += line[p++];
        return { html: _wrap(buffer, 'number'), newIndex: p };
    }

    state.isNextTokenFunctionName = false;
    const type = "{}[]().,;".includes(char) ? 'punctuation' : 'operator';
    return { html: _wrap(char, type), newIndex: i + 1 };
}

// --- HTML Tokenizer ---
export function getHTMLToken(line, i, state) {
    const tagStart = line.indexOf('<', i);
    if (tagStart === -1) return { html: _escape(line.substring(i)), newIndex: line.length };
    
    let html = _escape(line.substring(i, tagStart));
    
    if (line.substring(tagStart).startsWith('<!--')) {
        state.contextStack.push({ mode: 'comment', terminator: '-->' });
        return { html: html + _wrap('<!--', 'comment'), newIndex: tagStart + 4 };
    }

    const tagEnd = line.indexOf('>', tagStart);
    if (tagEnd === -1) return { html: html + _escape(line.substring(tagStart)), newIndex: line.length };

    const isClosing = line[tagStart + 1] === '/';
    html += _wrap(isClosing ? '</' : '<', 'punctuation');
    let p = isClosing ? tagStart + 2 : tagStart + 1;
    let tagName = '';
    while (p < tagEnd && !_isWS(line[p]) && line[p] !== '>') tagName += line[p++];
    html += _wrap(tagName, 'tag');

    while (p < tagEnd) {
        let attrStart = p;
        while (p < tagEnd && _isWS(line[p])) p++;
        if (p > attrStart) html += _escape(line.substring(attrStart, p));
        if (p >= tagEnd) break;
        
        let attrNameStart = p;
        while (p < tagEnd && !"='\"<> \t\n\r".includes(line[p])) p++;
        const attrName = line.substring(attrNameStart, p);
        if (attrName) html += _wrap(attrName, 'attribute-name');
        
        attrStart = p;
        while (p < tagEnd && _isWS(line[p])) p++;
        if (p > attrStart) html += _escape(line.substring(attrStart, p));
        if (p >= tagEnd || line[p] !== '=') continue;

        html += _wrap('=', 'operator');
        p++;
        attrStart = p;
        while (p < tagEnd && _isWS(line[p])) p++;
        if (p > attrStart) html += _escape(line.substring(attrStart, p));
        
        const quote = line[p];
        if ("'\"".includes(quote)) {
            p++;
            const valueStart = p;
            while(p < tagEnd && line[p] !== quote) p++;
            html += _wrap(quote, 'string') + _wrap(line.substring(valueStart, p), 'attribute-value') + _wrap(quote, 'string');
            p++;
        } else {
            const valueStart = p;
            while (p < tagEnd && !_isWS(line[p]) && line[p] !== '>') p++;
            html += _wrap(line.substring(valueStart, p), 'attribute-value');
        }
    }

    html += _wrap('>', 'punctuation');
    const lowerTagName = tagName.toLowerCase();
    if (!isClosing && (lowerTagName === 'script' || lowerTagName === 'style')) {
        const lang = lowerTagName === 'script' ? 'javascript' : 'css';
        state.contextStack.push({ mode: lang, terminator: `</${tagName}>` });
    }
    return { html, newIndex: tagEnd + 1 };
}

// --- CSS Tokenizer ---
export function getCssToken(line, i, state) {
    if (line.substring(i, i + 2) === '/*') {
        state.contextStack.push({ mode: 'comment', terminator: '*/' });
        return { html: _wrap('/*', 'comment'), newIndex: i + 2 };
    }
    const char = line[i];
    if (_isWS(char)) {
        let p = i + 1;
        while (p < line.length && _isWS(line[p])) p++;
        return { html: line.substring(i, p), newIndex: p };
    }
    if (state.inCssRuleBlock) {
        if (char === '}') {
            state.inCssRuleBlock = false;
            return { html: _wrap('}', 'punctuation'), newIndex: i + 1 };
        }
        let p = i;
        while (p < line.length && !':;{}'.includes(line[p])) p++;
        const buffer = line.substring(i, p);
        
        let next_p = p;
        while (next_p < line.length && _isWS(line[next_p])) next_p++;
        
        const type = (next_p < line.length && line[next_p] === ':') ? 'property' : 'attribute-value';
        return { html: _wrap(buffer, type), newIndex: p };
    } else {
        if (char === '{') {
            state.inCssRuleBlock = true;
            return { html: _wrap('{', 'punctuation'), newIndex: i + 1 };
        }
        const braceIndex = line.indexOf('{', i);
        const end = braceIndex !== -1 ? braceIndex : line.length;
        return { html: _wrap(line.substring(i, end), 'selector'), newIndex: end };
    }
}

// --- C Tokenizer ---
export function getCToken(line, i, state) {
    const char = line[i];

    if (line.substring(i, i + 2) === '/*') {
        state.contextStack.push({ mode: 'comment', terminator: '*/' });
        return { html: _wrap('/*', 'comment'), newIndex: i + 2 };
    }
    if (line.substring(i, i + 2) === '//') {
        return { html: _wrap(line.substring(i), 'comment'), newIndex: line.length };
    }
    if (char === "'" || char === '"') {
        state.contextStack.push({ mode: 'string', terminator: char });
        return { html: _wrap(char, 'string'), newIndex: i + 1 };
    }
    
    let p = i;
    while (_isWS(line[p])) p++;
    if (p === 0 && line[p] === '#') { // Preprocessor
        return { html: _wrap(line, 'controlKeyword'), newIndex: line.length };
    }


    const keywords = new Set(['auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while']);
    const defKeywords = new Set(['NULL']);

    if (_isIS(char)) {
        let buffer = '', p = i;
        while (p < line.length && _isIP(line[p])) buffer += line[p++];
        let type = 'variable';
        if (keywords.has(buffer)) type = 'controlKeyword';
        else if (defKeywords.has(buffer)) type = 'definitionKeyword';
        else if (_isFC(line, p)) type = 'functionName';
        return { html: _wrap(buffer, type), newIndex: p };
    }
    
    if (_isD(char) || (char === '.' && i + 1 < line.length && _isD(line[i+1]))) {
        let buffer = '', p = i;
        while (p < line.length && (_isD(line[p]) || '.eE+-'.includes(line[p]) || (p > 0 && 'xX'.includes(line[p-1]) && 'abcdefABCDEF'.includes(line[p])))) {
            buffer += line[p++];
        }
        return { html: _wrap(buffer, 'number'), newIndex: p };
    }

    const type = "{}[]().,;".includes(char) ? 'punctuation' : 'operator';
    return { html: _wrap(char, type), newIndex: i + 1 };
}

// --- JSON Tokenizer ---
export function getJSONToken(line, i, state) {
    const char = line[i];

    if (_isWS(char)) {
        let p = i;
        while (p < line.length && _isWS(line[p])) p++;
        return { html: line.substring(i, p), newIndex: p };
    }
    
    if (char === '"') {
        const endQuoteIndex = _findUnescaped(line, '"', i + 1);
        if (endQuoteIndex === -1) {
            const text = line.substring(i);
            return { html: _wrap(text, 'string'), newIndex: line.length };
        }

        const p = endQuoteIndex + 1;
        const text = line.substring(i, p);

        // Check if it's a key by looking for a colon after whitespace
        let next_p = p;
        while (next_p < line.length && _isWS(line[next_p])) next_p++;
        const type = (next_p < line.length && line[next_p] === ':') ? 'property' : 'string';
        
        return { html: _wrap(text, type), newIndex: p };
    }
    
    if ('-0123456789'.includes(char)) {
        let p = i;
        while(p < line.length && '-.eE0123456789'.includes(line[p])) p++;
        return { html: _wrap(line.substring(i, p), 'number'), newIndex: p };
    }
    
    const keywords = ['true', 'false', 'null'];
    for (const kw of keywords) {
        if (line.substring(i).startsWith(kw)) {
            return { html: _wrap(kw, 'definitionKeyword'), newIndex: i + kw.length };
        }
    }
    
    if ('{}[]:,.'.includes(char)) {
        return { html: _wrap(char, 'punctuation'), newIndex: i + 1 };
    }

    return { html: _escape(char), newIndex: i + 1 };
}
