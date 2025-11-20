// B"H

// This module-level variable will cache the loaded parser class.
let MerkavaParser;

/**
 * Loads and initializes the MerkavaASTParser class one time.
 * The path is relative to this file's location.
 */
async function initializeParser() {
    if (MerkavaParser) {
        return; // Already loaded
    }
    try {
        // Dynamically import the parser-core.js from its existing location.
        // This path assumes `geelooy` and `merkava-beautifier` are sibling folders.
        const parserModule = await import('/scripts/awtsmoos/MerkavaASTParser/parser-core.js');
        
        // The parser-core.js returns a promise that resolves to the class itself.
        MerkavaParser = await parserModule.default;
        
        if (typeof MerkavaParser !== 'function') {
            throw new Error("Failed to load the MerkavaParser class correctly.");
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
    // 1. Ensure the parser is loaded and ready.
    await initializeParser();

    // 2. Parse the code into an AST.
    const parser = new MerkavaParser(code);
    parser.registerExpressionParsers();
    parser.registerStatementParsers();
    parser.registerDeclarationParsers();
    const ast = parser.parse();

    // 3. Check for parsing errors.
    if (parser.errors.length > 0) {
        throw new Error("Parsing failed:\n" + parser.errors.join('\n'));
    }

    // 4. Define default options and walk the AST to generate the string.
    const defaultOptions = {
        indentChar: '\t',
        braceOnSameLine: true,
        expandArrays: true,
        expandObjects: true,
    };
    const finalOptions = { ...defaultOptions, ...options };

    // The walk function is the core of the beautifier.
    // It's a large recursive function that handles each AST node type.
    function walk(node, indent = '') {
        if (!node) return '';

        switch (node.type) {
            case 'Program':
                return node.body.map(n => walk(n, indent)).join('\n');

            case 'ExpressionStatement':
                return walk(node.expression, indent) + ';';
            
            case 'VariableDeclaration':
                let decls = node.declarations.map(d => walk(d, '')).join(', ');
                return `${indent}${node.kind} ${decls};`;

            case 'VariableDeclarator':
                let init = node.init ? ` = ${walk(node.init, '')}` : '';
                return `${walk(node.id, '')}${init}`;
            
            case 'Identifier':
                return node.name;

            case 'Literal':
                if (typeof node.value === 'string') return `'${node.value}'`;
                return node.raw;

            case 'IfStatement':
                let ifStr = `${indent}if (${walk(node.test, '')}) `;
                if (finalOptions.braceOnSameLine) {
                   ifStr += walk(node.consequent, indent);
                } else {
                   ifStr += `\n${indent}${walk(node.consequent, indent)}`;
                }
                if (node.alternate) {
                    ifStr += ` else ${walk(node.alternate, indent)}`;
                }
                return ifStr;

            case 'BlockStatement':
                if (node.body.length === 0) return '{}';
                let blockContent = node.body.map(n => walk(n, indent + finalOptions.indentChar)).join('\n');
                return `{\n${blockContent}\n${indent}}`;

            case 'ArrayExpression':
                 if (!finalOptions.expandArrays || node.elements.length === 0) {
                    return `[${node.elements.map(e => walk(e, '')).join(', ')}]`;
                 }
                 let arrContent = node.elements.map(e => `${indent + finalOptions.indentChar}${walk(e, indent + finalOptions.indentChar)}`).join(',\n');
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

            // Add more cases for other node types as needed...
            default:
                console.warn(`Beautifier: Unhandled node type "${node.type}"`);
                return `/* Unhandled: ${node.type} */`;
        }
    }

    return walk(ast, '');
}