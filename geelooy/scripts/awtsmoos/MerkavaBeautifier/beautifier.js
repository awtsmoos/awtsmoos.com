// B"H

// This module-level variable will cache the loaded parser class.
let MerkavaParser;

/**
 * Loads and initializes the MerkavaASTParser class one time.
 */
async function initializeParser() {
    if (MerkavaParser) {
        return; // Already loaded
    }
    
    // Check if the script has already been loaded by some other means
    if (window.MerkavahParserPromise) {
        MerkavaParser = await window.MerkavahParserPromise;
        return;
    }

    try {
        // --- THE FIX IS HERE ---

        // 1. We use 'import' ONLY for its side-effect: to execute the script.
        //    We do not need the module object it returns, because it is empty.
        await import('/scripts/awtsmoos/MerkavaASTParser/parser-core.js');

        // 2. The script, having been executed, has now created a global variable
        //    called 'MerkavaParserPromise'. We access it from the window object.
        if (!window.MerkavahParserPromise) {
            throw new Error("The parser script loaded, but did not create the global 'MerkavaParserPromise'.");
        }
        
        // 3. We await this promise to get the actual parser class.
        MerkavaParser = await window.MerkavahParserPromise;
        
        // --- END OF FIX ---
        
        if (typeof MerkavaParser !== 'function') {
            throw new Error("Failed to load the MerkavaParser class correctly. The promise did not resolve to a function.");
        }
        console.log("B'H - MerkavaASTParser has been successfully loaded for beautification.");
    } catch (e) {
        console.error("A critical error occurred while loading the parser:", e);
        throw new Error("Could not load the MerkavaASTParser. Check the path and browser console for details.");
    }
}

/**
 * The main exported function. Takes JS code and returns a formatted version.
 * @param {string} code The JavaScript code to beautify.
 * @param {object} options Formatting options.
 * @returns {Promise<string>} A promise that resolves to the beautified code.
 */
export async function beautify(code, options = {}) {
    await initializeParser();

    const parser = new MerkavaParser(code);
    parser.registerExpressionParsers();
    parser.registerStatementParsers();
    parser.registerDeclarationParsers();
    const ast = parser.parse();

    if (parser.errors.length > 0) {
        throw new Error("Parsing failed:\n" + parser.errors.join('\n'));
    }

    const defaultOptions = {
        indentChar: '\t',
        braceOnSameLine: true,
        expandArrays: true,
        expandObjects: true,
    };
    const finalOptions = { ...defaultOptions, ...options };

    function walk(node, indent = '') {
        if (!node) return '';

        switch (node.type) {
            case 'Program':
                return node.body.map(n => walk(n, indent)).join('\n\n');

            case 'ExpressionStatement':
                return indent + walk(node.expression, indent) + ';';
            
            case 'VariableDeclaration':
                let decls = node.declarations.map(d => walk(d, '')).join(', ');
                return `${indent}${node.kind} ${decls};`;

            case 'VariableDeclarator':
                let init = node.init ? ` = ${walk(node.init, '')}` : '';
                return `${walk(node.id, '')}${init}`;
            
            case 'Identifier':
                return node.name;

            case 'Literal':
                if (typeof node.value === 'string') return `'${node.raw}'`;
                return node.raw;

            case 'IfStatement':
                let ifStr = `${indent}if (${walk(node.test, '')}) `;
                if (finalOptions.braceOnSameLine) {
                   ifStr += walk(node.consequent, indent);
                } else {
                   ifStr += `\n${indent}${walk(node.consequent, indent)}`;
                }
                if (node.alternate) {
                    if (finalOptions.braceOnSameLine) {
                        ifStr += ` else ${walk(node.alternate, indent)}`;
                    } else {
                        ifStr += `\n${indent}else ${walk(node.alternate, indent)}`;
                    }
                }
                return ifStr;

            case 'BlockStatement':
                if (node.body.length === 0) return '{}';
                let blockContent = node.body.map(n => walk(n, indent + finalOptions.indentChar)).join('\n');
                return `{\n${blockContent}\n${indent}}`;

            case 'ArrayExpression':
                 if (!finalOptions.expandArrays || node.elements.length === 0) {
                    return `[${node.elements.map(e => e ? walk(e, '') : '').join(', ')}]`;
                 }
                 let arrContent = node.elements.map(e => `${indent + finalOptions.indentChar}${e ? walk(e, indent + finalOptions.indentChar) : ''}`).join(',\n');
                 return `[\n${arrContent}\n${indent}]`;
            
            case 'ObjectExpression':
                if (!finalOptions.expandObjects || node.properties.length === 0) {
                    return `{ ${node.properties.map(p => walk(p, '')).join(', ')} }`;
                }
                let objContent = node.properties.map(p => `${indent + finalOptions.indentChar}${walk(p, indent + finalOptions.indentChar)}`).join(',\n');
                return `{\n${objContent}\n${indent}}`;

            case 'Property':
                return `${walk(node.key, '')}: ${walk(node.value, indent)}`;

            case 'FunctionDeclaration':
                let params = node.params.map(p => walk(p, '')).join(', ');
                let funcHeader = `${indent}function ${node.id.name}(${params}) `;
                return funcHeader + walk(node.body, indent);

            case 'CallExpression':
                let args = node.arguments.map(a => walk(a, '')).join(', ');
                return `${walk(node.callee, '')}(${args})`;
            
            case 'TemplateLiteral':
                let quasis = node.quasis.map(q => q.value.raw);
                let expressions = node.expressions.map(e => `\${${walk(e, '')}}`);
                let result = '`';
                for (let i = 0; i < quasis.length; i++) {
                    result += quasis[i];
                    if (i < expressions.length) {
                        result += expressions[i];
                    }
                }
                result += '`';
                return result;

            default:
                // Fallback for unhandled nodes to prevent crashes
                console.warn(`Beautifier: Unhandled node type "${node.type}"`);
                return `/* Unhandled AST Node: ${node.type} */`;
        }
    }

    return walk(ast, '');
}