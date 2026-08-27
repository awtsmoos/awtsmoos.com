
// B"H
/**
 * @module Preprocessor
 * @description Refines the source by expanding macros before parsing.
 */
class Preprocessor {
    constructor() {
        this.macros = new Map();
    }

    process(source) {
        // 1. Handle Multi-line continuations
        let code = source.replace(/\\\r?\n/g, ' ');
        
        const lines = code.split('\n');
        const cleaned = [];

        // 2. Extract Macros
        for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#define')) {
                this._parseDefine(trimmed);
                cleaned.push(""); 
            } else {
                cleaned.push(line);
            }
        }

        let expanded = cleaned.join('\n');

        // 3. Iterative Expansion (up to 5 levels deep)
        for (let i = 0; i < 5; i++) {
            const prev = expanded;
            expanded = this._expandAll(expanded);
            if (prev === expanded) break;
        }

        return expanded;
    }

    _parseDefine(line) {
        const match = line.match(/^#define\s+([A-Za-z_][A-Za-z0-9_]*)(?:\(([^)]*)\))?\s*(.*)$/);
        if (match) {
            const name = match[1];
            const args = match[2] ? match[2].split(',').map(a => a.trim()) : null;
            const body = match[3] || "";
            this.macros.set(name, { args, body });
        }
    }

    _expandAll(code) {
        let result = code;
        for (const [name, macro] of this.macros) {
            if (macro.args) {
                // Find name(...) respecting nested parentheses
                const regex = new RegExp(`\\b${name}\\s*\\(`, 'g');
                let match;
                while ((match = regex.exec(result)) !== null) {
                    const startIdx = match.index;
                    let parenDepth = 1;
                    let endIdx = -1;
                    for (let j = regex.lastIndex; j < result.length; j++) {
                        if (result[j] === '(') parenDepth++;
                        else if (result[j] === ')') parenDepth--;
                        if (parenDepth === 0) {
                            endIdx = j;
                            break;
                        }
                    }
                    if (endIdx !== -1) {
                        const argStr = result.substring(regex.lastIndex, endIdx);
                        const providedArgs = this._splitArgs(argStr);
                        let expandedBody = macro.body;
                        macro.args.forEach((argName, i) => {
                            const val = providedArgs[i] || "";
                            expandedBody = expandedBody.replace(new RegExp(`\\b${argName}\\b`, 'g'), val);
                        });
                        result = result.substring(0, startIdx) + expandedBody + result.substring(endIdx + 1);
                        regex.lastIndex = startIdx + expandedBody.length;
                    }
                }
            } else {
                result = result.replace(new RegExp(`\\b${name}\\b`, 'g'), macro.body);
            }
        }
        return result;
    }

    _splitArgs(str) {
        const args = [];
        let start = 0;
        let depth = 0;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '(') depth++;
            else if (str[i] === ')') depth--;
            else if (str[i] === ',' && depth === 0) {
                args.push(str.substring(start, i).trim());
                start = i + 1;
            }
        }
        args.push(str.substring(start).trim());
        return args;
    }
}

module.exports = Preprocessor;
