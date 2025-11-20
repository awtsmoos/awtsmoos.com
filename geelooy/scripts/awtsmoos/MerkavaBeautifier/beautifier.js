// B"H
/**
 * A self-contained, memoized promise that resolves with the MerkavahParser class.
 * It handles loading the non-module parser script from within this JS module
 * using the reliable callback pattern.
 */
const merkavaLoaderPromise = new Promise((resolve, reject) => {
    // If another script on the page has already loaded the parser, use the existing promise.
    if (window.MerkavahParserPromise) {
        console.log("Found existing MerkavahParserPromise, resolving immediately.");
        return window.MerkavahParserPromise.then(resolve).catch(reject);
    }

    // Create a unique, temporary callback function on the global scope.
    const callbackName = 'merkavaOnload_' + Date.now();
    window
    .merkavaCallback=callbackName;

    // The parser script will call this function once it's fully loaded and initialized.
    window[callbackName] = (loadedParser) => {
        console.log("B'H - Merkava callback has been executed. The promise is being resolved.");
        delete window[callbackName]; // Clean up the global scope
        resolve(loadedParser);      // Resolve the promise with the final parser class
    };

    // Create the <script> tag to inject into the document.
    const script = document.createElement('script');
    
    // Set its source, telling the parser which global function to call back when it's ready.
    script.src = `/scripts/awtsmoos/MerkavaASTParser/parser-core.js`;

    // Handle network errors (e.g., a 404 if the path is wrong).
    script.onerror = () => {
        console.error("Critical Error: The <script> tag for parser-core.js failed to load. Check the path in the 'src' attribute and the browser's Network tab.");
        delete window[callbackName]; // Clean up the failed callback
        reject(new Error("Could not load the MerkavahParser script from the server due to a network or path error."));
    };

    // Append the script to the document's head to begin loading.
    console.log("Injecting script tag to load Merkavah Parser...");
    document.head.appendChild(script);
});
/**
 * The main exported function. Takes JS code and returns a formatted version.
 * @param {string} code The JavaScript code to beautify.
 * @param {object} options Formatting options.
 * @returns {Promise<string>} A promise that resolves to the beautified code.
 */
export async function beautify(code, options = {}) {
    // 1. Await the promise to get the parser class.
    const MerkavaParser = await merkavaLoaderPromise;

    // 2. Now you can use it.
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

        // The comprehensive, alphabetized architect of code
        switch (node.type) {
            case 'ArrayExpression':
                if (!finalOptions.expandArrays || node.elements.length === 0) {
                    return `[${node.elements.map(e => e ? walk(e, '') : '').join(', ')}]`;
                }
                const arrContent = node.elements.map(e => `${indent + finalOptions.indentChar}${e ? walk(e, indent + finalOptions.indentChar) : ''}`).join(',\n');
                return `[\n${arrContent}\n${indent}]`;

            case 'ArrayPattern':
                return `[${node.elements.map(e => e ? walk(e, '') : '').join(', ')}]`;

            case 'ArrowFunctionExpression':
                const arrowParams = node.params.map(p => walk(p, '')).join(', ');
                const asyncArrow = node.async ? 'async ' : '';
                const arrowBody = walk(node.body, indent);
                return `${asyncArrow}(${arrowParams}) => ${arrowBody}`;

            case 'AssignmentExpression':
                return `${walk(node.left, indent)} ${node.operator} ${walk(node.right, indent)}`;

            case 'AssignmentPattern':
                return `${walk(node.left, '')} = ${walk(node.right, '')}`;

            case 'AwaitExpression':
                return `await ${walk(node.argument, '')}`;

            case 'BinaryExpression':
            case 'LogicalExpression':
                return `${walk(node.left, indent)} ${node.operator} ${walk(node.right, indent)}`;

            case 'BlockStatement':
                if (node.body.length === 0) return '{}';
                const blockContent = node.body.map(n => walk(n, indent + finalOptions.indentChar)).join('\n');
                return `{\n${blockContent}\n${indent}}`;

            case 'BreakStatement':
                return `${indent}break${node.label ? ' ' + node.label.name : ''};`;

            case 'CallExpression':
                const callee = walk(node.callee, '');

                // Rule: If there is ONE argument or FEWER, format on a single line.
                if (node.arguments.length <= 1) {
                    const args = node.arguments.map(a => walk(a, '')).join(', ');
                    return callee + '(' + args + ')';
                }

                // Rule: If there are TWO or MORE arguments, expand to new lines.
                const newIndent = indent + finalOptions.indentChar;
                const multiLineArgs = node.arguments.map(a => `${newIndent}${walk(a, newIndent)}`).join(',\n');
                
                // Build the string with simple, clear concatenation.
                return callee + '(\n' + 
                       multiLineArgs + '\n' + 
                       indent + ')';
                       
                       
            case 'CatchClause':
                const param = node.param ? `(${walk(node.param, '')})` : '';
                return `catch ${param} ${walk(node.body, indent)}`;

            case 'ClassBody':
                const classBodyContent = node.body.map(n => walk(n, indent + finalOptions.indentChar)).join('\n\n');
                return `{\n${classBodyContent}\n${indent}}`;

            case 'ClassDeclaration':
            case 'ClassExpression':
                const classKeyword = node.type === 'ClassDeclaration' ? `${indent}class` : 'class';
                const id = node.id ? ` ${walk(node.id, '')}` : '';
                const superClass = node.superClass ? ` extends ${walk(node.superClass, '')}` : '';
                return `${classKeyword}${id}${superClass} ${walk(node.body, indent)}`;

            case 'ConditionalExpression':
                return `${walk(node.test, indent)} ? ${walk(node.consequent, indent)} : ${walk(node.alternate, indent)}`;

            case 'ContinueStatement':
                return `${indent}continue${node.label ? ' ' + node.label.name : ''};`;

            case 'DoWhileStatement':
                const doBody = walk(node.body, indent).endsWith(';') ? walk(node.body, indent).slice(0,-1) : walk(node.body, indent);
                return `${indent}do ${doBody} while (${walk(node.test, '')});`;

            case 'EmptyStatement':
                return `${indent};`;

            case 'ExportAllDeclaration':
                return `${indent}export * from ${walk(node.source, '')};`;
            
            case 'ExportDefaultDeclaration':
                return `${indent}export default ${walk(node.declaration, indent)};`;

            case 'ExportNamedDeclaration':
                 if (node.declaration) {
                    return walk(node.declaration, indent);
                 }
                 const specifiers = node.specifiers.map(s => walk(s)).join(', ');
                 const from = node.source ? ` from ${walk(node.source)}` : '';
                 return `${indent}export { ${specifiers} }${from};`;
            
            case 'ExpressionStatement':
                return indent + walk(node.expression, indent) + ';';

            case 'ForInStatement':
            case 'ForOfStatement':
                const forType = node.type === 'ForOfStatement' ? 'of' : 'in';
                const forAwait = node.await ? 'await ' : '';
                const forLeft = walk(node.left, '').replace(';', '');
                return `${indent}for (${forAwait}${forLeft} ${forType} ${walk(node.right, '')}) ${walk(node.body, indent)}`;

            case 'ForStatement':
                var init = node.init ? walk(node.init, '').replace(';', '') : '';
                const test = node.test ? walk(node.test, '') : '';
                const update = node.update ? walk(node.update, '') : '';
                return `${indent}for (${init}; ${test}; ${update}) ${walk(node.body, indent)}`;

            case 'FunctionDeclaration':
            case 'FunctionExpression':
                const funcKind = node.type === 'FunctionDeclaration' ? `${indent}function` : 'function';
                const funcName = node.id ? ` ${node.id.name}` : '';
                const funcParams = node.params.map(p => walk(p, '')).join(', ');
                const asyncFunc = node.async ? 'async ' : '';
                return `${asyncFunc}${funcKind}${funcName}(${funcParams}) ${walk(node.body, indent)}`;

            case 'Identifier':
                return node.name;

            case 'IfStatement':
                let ifStr = `${indent}if (${walk(node.test, '')}) `;
                ifStr += walk(node.consequent, indent);
                if (node.alternate) {
                    const elseStr = walk(node.alternate, indent);
                    ifStr += (elseStr.trim().startsWith('if')) ? ` else ${elseStr.trim()}` : ` else ${elseStr}`;
                }
                return ifStr;

            case 'ImportDeclaration':
                const importDefault = node.specifiers.find(s => s.type === 'ImportDefaultSpecifier');
                const importNamed = node.specifiers.filter(s => s.type === 'ImportSpecifier');
                let importStr = 'import ';
                if (importDefault) {
                    importStr += walk(importDefault);
                }
                if (importDefault && importNamed.length > 0) {
                    importStr += ', ';
                }
                if (importNamed.length > 0) {
                    importStr += `{ ${importNamed.map(s => walk(s)).join(', ')} }`;
                }
                if (importStr === 'import ' && node.specifiers.length > 0) { // namespace import
                    importStr += walk(node.specifiers[0]);
                }
                importStr += ` from ${walk(node.source)};`;
                return indent + importStr;
                
            case 'ImportDefaultSpecifier':
                 return node.local.name;

            case 'ImportSpecifier':
                return node.imported.name === node.local.name ? node.imported.name : `${node.imported.name} as ${node.local.name}`;

            case 'LabeledStatement':
                return `${indent}${node.label.name}: ${walk(node.body, indent)}`;

            case 'Literal':
                return node.raw;

            case 'MemberExpression':
                const object = walk(node.object, '');
                const property = walk(node.property, '');
                return node.computed ? `${object}[${property}]` : `${object}.${property}`;

            case 'MetaProperty':
                return `${node.meta.name}.${node.property.name}`;

            case 'MethodDefinition':
            case 'PropertyDefinition':
                const staticStr = node.static ? 'static ' : '';
                const kindStr = node.kind === 'get' || node.kind === 'set' ? `${node.kind} ` : '';
                const key = node.computed ? `[${walk(node.key, '')}]` : walk(node.key, '');
                if (node.type === 'MethodDefinition') {
                    const funcVal = node.value;
                    const asyncMethod = funcVal.async ? 'async ' : '';
                    const genMethod = funcVal.generator ? '*' : '';
                    const methodParams = funcVal.params.map(p => walk(p, '')).join(', ');
                    return `${indent}${staticStr}${kindStr}${asyncMethod}${genMethod}${key}(${methodParams}) ${walk(funcVal.body, indent)}`;
                }
                // PropertyDefinition
                const propVal = node.value ? ` = ${walk(node.value, '')}` : '';
                return `${indent}${staticStr}${key}${propVal};`;

            case 'NewExpression':
                return `new ${walk(node.callee, '')}(${node.arguments.map(a => walk(a, '')).join(', ')})`;

            case 'ObjectExpression':
                if (!finalOptions.expandObjects || node.properties.length === 0) {
                    return `{ ${node.properties.map(p => walk(p, '')).join(', ')} }`;
                }
                const objContent = node.properties.map(p => `${indent + finalOptions.indentChar}${walk(p, indent + finalOptions.indentChar)}`).join(',\n');
                return `{\n${objContent}\n${indent}}`;

            case 'ObjectPattern':
                return `{ ${node.properties.map(p => walk(p, '')).join(', ')} }`;

            case 'PrivateIdentifier':
                return `#${node.name}`;
            
            case 'Program':
                return node.body.map(n => walk(n, indent)).join('\n\n');

            case 'Property':
                if (node.shorthand) return walk(node.key, '');
                return `${walk(node.key, '')}: ${walk(node.value, indent)}`;

            case 'RestElement':
                return `...${walk(node.argument, '')}`;

            case 'ReturnStatement':
                return `${indent}return${node.argument ? ' ' + walk(node.argument, '') : ''};`;

            case 'SequenceExpression':
                return `(${node.expressions.map(e => walk(e, '')).join(', ')})`;

            case 'Super':
                return 'super';

            case 'SwitchCase':
                const caseTest = node.test ? `case ${walk(node.test, '')}` : 'default';
                const caseContent = node.consequent.map(n => walk(n, indent + finalOptions.indentChar)).join('\n');
                return `${indent}${caseTest}:\n${caseContent}`;
            
            case 'SwitchStatement':
                const switchContent = node.cases.map(c => walk(c, indent + finalOptions.indentChar)).join('\n');
                return `${indent}switch (${walk(node.discriminant, '')}) {\n${switchContent}\n${indent}}`;

            case 'TaggedTemplateExpression':
                return `${walk(node.tag, '')}${walk(node.quasi, '')}`;
                
            case 'TemplateElement':
                 return node.value.raw;

            case 'TemplateLiteral':
                let result = '`';
                const newIndent = indent + finalOptions.indentChar;

                for (let i = 0; i < node.quasis.length; i++) {
                    // Add the static string part (e.g., "Hello, " or "!")
                    result += node.quasis[i].value.raw;

                    // If there is an expression that follows this string part...
                    if (i < node.expressions.length) {
                        const expressionContent = walk(node.expressions[i], newIndent);
                        
                        // Build the expression block with simple, clear concatenation.
                        result += '${' + '\n' +
                                  newIndent + expressionContent + '\n' +
                                  indent + '}';
                    }
                }

                result += '`';
                return result;

            case 'ThisExpression':
                return 'this';

            case 'ThrowStatement':
                return `${indent}throw ${walk(node.argument, '')};`;
            
            case 'TryStatement':
                let tryStr = `${indent}try ${walk(node.block, indent)}`;
                if (node.handler) tryStr += ` ${walk(node.handler, indent)}`;
                if (node.finalizer) tryStr += ` finally ${walk(node.finalizer, indent)}`;
                return tryStr;

            case 'UnaryExpression':
                return `${node.operator}${node.prefix ? '' : ' '}${walk(node.argument, '')}`;

            case 'UpdateExpression':
                return node.prefix ? `${node.operator}${walk(node.argument, '')}` : `${walk(node.argument, '')}${node.operator}`;

            case 'VariableDeclaration':
                const decls = node.declarations.map(d => walk(d, '')).join(', ');
                return `${indent}${node.kind} ${decls};`;

            case 'VariableDeclarator':
                var init = node.init ? ` = ${walk(node.init, '')}` : '';
                return `${walk(node.id, '')}${init}`;
            
            case 'WhileStatement':
                return `${indent}while (${walk(node.test, '')}) ${walk(node.body, indent)}`;
            
            case 'WithStatement':
                 return `${indent}with (${walk(node.object, '')}) ${walk(node.body, indent)}`;

            case 'YieldExpression':
                const yieldOp = node.delegate ? 'yield*' : 'yield';
                return `${yieldOp}${node.argument ? ' ' + walk(node.argument, '') : ''}`;

            default:
                console.error(`FATAL: Unhandled node type "${node.type}"`, node);
                return `/* FATAL: Unhandled AST Node: ${node.type} */`;
        }
    }

    return walk(ast, '');
}