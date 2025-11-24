// B"H
/**
 * A self-contained, memoized promise that resolves with the MerkavahParser class.
 * It handles loading the non-module parser script from within this JS module
 * using the reliable callback pattern.
 */
const merkavaLoaderPromise = new Promise((resolve, reject) => {
    if (window.MerkavahParserPromise) {
        console.log("Found existing MerkavahParserPromise, resolving immediately.");
        return window.MerkavahParserPromise.then(resolve).catch(reject);
    }

    const callbackName = 'merkavaOnload_' + Date.now();
    window.merkavaCallback = callbackName;

    window[callbackName] = (loadedParser) => {
        console.log("B'H - Merkava callback has been executed. The promise is being resolved.");
        delete window[callbackName];
        resolve(loadedParser);
    };

    const script = document.createElement('script');
    script.src = `/scripts/awtsmoos/MerkavaASTParser/parser-core.js`;

    script.onerror = () => {
        console.error("Critical Error: The <script> tag for parser-core.js failed to load.");
        delete window[callbackName];
        reject(new Error("Could not load the MerkavahParser script from the server."));
    };

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
    // 1. Wait for the Parser to load
    const MerkavaParser = await merkavaLoaderPromise;

    // 2. Instantiate and Configure Parser
    const parser = new MerkavaParser(code);
    parser.registerExpressionParsers();
    parser.registerStatementParsers();
    parser.registerDeclarationParsers();

    // 3. Generate the AST (Emanation)
    const ast = parser.parse();

    if (parser.errors.length > 0) {
        throw new Error("Parsing failed:\n" + parser.errors.join('\n'));
    }

    // 4. Formatting Options
    const opts = {
        indentChar: '\t',           // Use tab by default
        braceOnSameLine: true,      // "K&R" style: function() {
        expandArrays: true,         // [ \n ... \n ]
        expandObjects: true,        // { \n ... \n }
        expandArgs: true,           // func( \n ... \n )
        ...options
    };

    // 5. Precedence Table for Parenthesis Restoration
    // Higher number = tighter binding (executed first)
    const PRECEDENCE = {
        'Sequence': 0,
        'Yield': 1, 'Assignment': 1,
        'Conditional': 2, 'ArrowFunction': 2, 'Coalesce': 3,
        'LogicalOR': 4, 'LogicalAND': 5,
        'BitwiseOR': 6, 'BitwiseXOR': 7, 'BitwiseAND': 8,
        'Equality': 9, 'Relational': 10,
        'BitwiseShift': 11,
        'Additive': 12, 'Multiplicative': 13, 'Exponentiation': 14,
        'Unary': 15, 'Update': 15, 'Await': 15,
        'Call': 17, 'Member': 18, 'Primary': 19
    };

    function getPrecedence(node) {
        switch (node.type) {
            case 'SequenceExpression': return PRECEDENCE.Sequence;
            case 'YieldExpression': return PRECEDENCE.Yield;
            case 'AssignmentExpression': return PRECEDENCE.Assignment;
            case 'ConditionalExpression': return PRECEDENCE.Conditional;
            case 'ArrowFunctionExpression': return PRECEDENCE.ArrowFunction;
            case 'LogicalExpression':
                if (node.operator === '??') return PRECEDENCE.Coalesce;
                if (node.operator === '||') return PRECEDENCE.LogicalOR;
                return PRECEDENCE.LogicalAND;
            case 'BinaryExpression':
                switch (node.operator) {
                    case '|': return PRECEDENCE.BitwiseOR;
                    case '^': return PRECEDENCE.BitwiseXOR;
                    case '&': return PRECEDENCE.BitwiseAND;
                    case '==': case '!=': case '===': case '!==': return PRECEDENCE.Equality;
                    case '<': case '>': case '<=': case '>=': case 'in': case 'instanceof': return PRECEDENCE.Relational;
                    case '<<': case '>>': case '>>>': return PRECEDENCE.BitwiseShift;
                    case '+': case '-': return PRECEDENCE.Additive;
                    case '*': case '/': case '%': return PRECEDENCE.Multiplicative;
                    case '**': return PRECEDENCE.Exponentiation;
                    default: return 0;
                }
            case 'UnaryExpression': return PRECEDENCE.Unary;
            case 'UpdateExpression': return PRECEDENCE.Update;
            case 'AwaitExpression': return PRECEDENCE.Await;
            case 'CallExpression':
            case 'ChainExpression': // Optional chaining wraps call/member
            case 'ImportExpression':
                return PRECEDENCE.Call;
            case 'MemberExpression':
            case 'MetaProperty':
                return PRECEDENCE.Member;
            default: return PRECEDENCE.Primary;
        }
    }

    // 6. Comment Management
    // The parser returns a flat array of comments in ast.comments.
    // We maintain a cursor to print them as we reach their corresponding nodes.
    const allComments = ast.comments || [];
    let commentCursor = 0;

    /**
     * Prints comments that appear logically "before" the current node start index.
     * @param {number} nodeStart The start index of the current node.
     * @param {string} indent Current indentation string.
     */
    function printLeadingComments(nodeStart, indent) {
        if (nodeStart === undefined || nodeStart === null) return '';
        
        let out = '';
        while (commentCursor < allComments.length) {
            const c = allComments[commentCursor];
            // If comment ends before the node starts (or close enough), it belongs here.
            // Note: node_helpers often use .start or .startIndex. We check both.
            if (c.end <= nodeStart) {
                // We trim the value to ensure clean formatting
                const val = c.value;
                if (c.type === 'Block') {
                    out += `${indent}/*${val}*/\n`;
                } else {
                    // Line comment
                    out += `${indent}//${val.trim()}\n`;
                }
                commentCursor++;
            } else {
                break; // Comment belongs to a later node
            }
        }
        return out;
    }

    /**
     * The recursive Walker.
     * @param {Node} node The AST Node to process.
     * @param {string} indent Current string indentation.
     * @param {object} ctx Context { parentPrecedence, isLoop, isPattern }.
     */
    function walk(node, indent = '', ctx = {}) {
        if (!node) return '';

        // --- A. Comment Injection ---
        // Determine start position safely
        const startPos = (typeof node.start === 'number') ? node.start : node.startIndex;
        const comments = printLeadingComments(startPos, indent);

        // --- B. Helper Variables ---
        const nextIndent = indent + opts.indentChar;
        const currentPrecedence = getPrecedence(node);
        
        // --- C. Parentheses Logic ---
        // If current node has lower precedence than parent, wrap in parens.
        // Exception: If current is 0 (not an expression usually), ignore.
        const needsParens = ctx.parentPrecedence && 
                            currentPrecedence > 0 && 
                            currentPrecedence < ctx.parentPrecedence;

        // Contexts to pass down
        const childCtx = { parentPrecedence: currentPrecedence };
        const ignoreCtx = { parentPrecedence: 0 }; // For blocks/lists where precedence resets
        const loopCtx = { isLoop: true, parentPrecedence: 0 }; // For loop headers (no semicolon)

        let result = '';

        // --- D. The Switch of All Nodes ---
        switch (node.type) {

            // === 1. Top Level & Blocks ===
            case 'Program':
                // Join top-level statements with double newlines
                if (node.body.length === 0) result = '';
                else {
                    result = node.body.map(n => walk(n, indent, ignoreCtx)).join('\n\n');
                }
                // Flush remaining comments at end of file
                result += printLeadingComments(Infinity, indent);
                return result; // Program doesn't get wrapped in comments/parens recursively usually

            case 'BlockStatement':
                if (node.body.length === 0) {
                    result = '{}';
                } else {
                    const blockContent = node.body.map(n => walk(n, nextIndent, ignoreCtx)).join('\n');
                    result = `{\n${blockContent}\n${indent}}`;
                }
                break;

            case 'EmptyStatement':
                result = ';';
                break;

            // === 2. Identifiers & Literals ===
            case 'Identifier':
                result = node.name;
                break;

            case 'PrivateIdentifier':
                result = `#${node.name}`;
                break;

            case 'Literal':
                if (typeof node.value === 'string') {
                    // Fix Quotes: Use JSON.stringify to safely quote and escape strings
                    result = JSON.stringify(node.value);
                } else if (node.bigint) {
                    result = `${node.bigint}n`;
                } else if (node.regex) {
                    // If we have raw, use it to preserve flags/format. Else reconstruct.
                    result = node.raw || `/${node.regex.pattern}/${node.regex.flags}`;
                } else if (node.value === null) {
                    result = 'null';
                } else {
                    result = String(node.value);
                }
                break;

            case 'TemplateLiteral':
                // `string ${expr}` - handle expansion carefully
                let tmpl = '`';
                for (let i = 0; i < node.quasis.length; i++) {
                    tmpl += node.quasis[i].value.raw;
                    if (i < node.expressions.length) {
                        // Expand template expressions to new lines as requested
                        tmpl += '${' + '\n';
                        tmpl += nextIndent + walk(node.expressions[i], nextIndent, ignoreCtx);
                        tmpl += '\n' + indent + '}';
                    }
                }
                tmpl += '`';
                result = tmpl;
                break;

            // === 3. Declarations ===
            case 'VariableDeclaration':
                // const a = 1, b = 2;
                const kind = node.kind;
                const decls = node.declarations
                    .map(d => walk(d, indent, ignoreCtx))
                    .join(', ');
                // No semicolon if inside a loop header (handled by ctx.isLoop)
                result = `${indent}${kind} ${decls}${ctx.isLoop ? '' : ';'}`;
                break;

            case 'VariableDeclarator':
                const vId = walk(node.id, indent, ignoreCtx);
                if (node.init) {
                    // Right side is an assignment expression context
                    result = `${vId} = ${walk(node.init, indent, { parentPrecedence: PRECEDENCE.Assignment })}`;
                } else {
                    result = vId;
                }
                break;

            // === 4. Functions & Classes ===
            case 'FunctionDeclaration':
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
                const isAsync = node.async ? 'async ' : '';
                const isGen = node.generator ? '*' : '';
                const fParams = node.params.map(p => walk(p, indent, ignoreCtx)).join(', ');
                
                // Construct parameters string
                let paramStr = `(${fParams})`;
                
                // Logic for Arrow Functions
                if (node.type === 'ArrowFunctionExpression') {
                    // For single arg arrows without parens? sticking to parens is safer and cleaner
                    const arrowBody = walk(node.body, indent, ignoreCtx);
                    // Check if body needs braces (BlockStatement does it automatically)
                    // If Expression body, it just returns expression.
                    result = `${isAsync}${paramStr} => ${arrowBody.trim()}`;
                } else {
                    // Function Decl/Expr
                    const fName = node.id ? ' ' + walk(node.id, '', ignoreCtx) : '';
                    result = `${isAsync}function${isGen}${fName}${paramStr} ${walk(node.body, indent, ignoreCtx).trim()}`;
                    
                    // FunctionDeclaration needs indentation, Expression does not (handled by parent indent logic mostly)
                    if (node.type === 'FunctionDeclaration') {
                        result = indent + result;
                    }
                }
                break;

            case 'ClassDeclaration':
            case 'ClassExpression':
                const cName = node.id ? ' ' + walk(node.id, '', ignoreCtx) : '';
                const cExtends = node.superClass ? ` extends ${walk(node.superClass, '', ignoreCtx)}` : '';
                const cBody = walk(node.body, indent, ignoreCtx); // ClassBody handles the braces
                
                result = `class${cName}${cExtends} ${cBody.trim()}`;
                if (node.type === 'ClassDeclaration') {
                    result = indent + result;
                }
                break;

            case 'ClassBody':
                if (node.body.length === 0) {
                    result = '{}';
                } else {
                    // Classes do NOT use commas between members.
                    const members = node.body.map(m => walk(m, nextIndent, ignoreCtx)).join('\n');
                    result = `{\n${members}\n${indent}}`;
                }
                break;

            case 'MethodDefinition':
                const mStatic = node.static ? 'static ' : '';
                const mKind = (node.kind === 'constructor' || node.kind === 'method') ? '' : `${node.kind} `;
                let mKey = walk(node.key, indent, ignoreCtx);
                if (node.computed) mKey = `[${mKey}]`;
                
                const mFn = node.value; // FunctionExpression
                const mParams = mFn.params.map(p => walk(p, indent, ignoreCtx)).join(', ');
                const mAsyncStr = mFn.async ? 'async ' : '';
                const mGenStr = mFn.generator ? '*' : '';
                
                result = `${indent}${mStatic}${mKind}${mAsyncStr}${mGenStr}${mKey}(${mParams}) ${walk(mFn.body, indent, ignoreCtx).trim()}`;
                break;

            case 'PropertyDefinition': // Class Field: static x = 1;
                const pStatic = node.static ? 'static ' : '';
                let pKey = walk(node.key, indent, ignoreCtx);
                if (node.computed) pKey = `[${pKey}]`;
                
                const pVal = node.value ? ` = ${walk(node.value, indent, ignoreCtx)}` : '';
                result = `${indent}${pStatic}${pKey}${pVal};`;
                break;

            case 'StaticBlock':
                // static { ... }
                const sBody = node.body.map(n => walk(n, nextIndent, ignoreCtx)).join('\n');
                result = `${indent}static {\n${sBody}\n${indent}}`;
                break;

            // === 5. Statements ===
            case 'ExpressionStatement':
                result = indent + walk(node.expression, indent, ignoreCtx) + ';';
                break;

            case 'IfStatement':
                result = `${indent}if (${walk(node.test, indent, ignoreCtx)}) ${walk(node.consequent, indent, ignoreCtx).trim()}`;
                if (node.alternate) {
                    const alt = walk(node.alternate, indent, ignoreCtx).trim();
                    if (node.alternate.type === 'IfStatement') {
                        result += ` else ${alt}`; // "else if..."
                    } else {
                        result += ` else ${alt}`; // "else { ... }"
                    }
                }
                break;

            case 'SwitchStatement':
                const discrim = walk(node.discriminant, '', ignoreCtx);
                const cases = node.cases.map(c => walk(c, nextIndent, ignoreCtx)).join('\n');
                result = `${indent}switch (${discrim}) {\n${cases}\n${indent}}`;
                break;

            case 'SwitchCase':
                const caseLabel = node.test 
                    ? `case ${walk(node.test, '', ignoreCtx)}` 
                    : 'default';
                const caseBody = node.consequent.map(c => walk(c, nextIndent, ignoreCtx)).join('\n');
                result = `${indent}${caseLabel}:\n${caseBody}`;
                break;

            case 'ForStatement':
                // Note: init uses loopCtx to avoid the semicolon from VariableDeclaration
                const fInit = node.init ? walk(node.init, '', loopCtx).trim() : '';
                const fTest = node.test ? walk(node.test, '', ignoreCtx) : '';
                const fUpdate = node.update ? walk(node.update, '', ignoreCtx) : '';
                result = `${indent}for (${fInit}; ${fTest}; ${fUpdate}) ${walk(node.body, indent, ignoreCtx).trim()}`;
                break;

            case 'ForInStatement':
            case 'ForOfStatement':
                const fType = node.type === 'ForOfStatement' ? 'of' : 'in';
                const fAwait = node.await ? 'await ' : '';
                const fLeft = walk(node.left, '', loopCtx).trim();
                const fRight = walk(node.right, '', ignoreCtx);
                result = `${indent}for (${fAwait}${fLeft} ${fType} ${fRight}) ${walk(node.body, indent, ignoreCtx).trim()}`;
                break;

            case 'WhileStatement':
                result = `${indent}while (${walk(node.test, '', ignoreCtx)}) ${walk(node.body, indent, ignoreCtx).trim()}`;
                break;

            case 'DoWhileStatement':
                result = `${indent}do ${walk(node.body, indent, ignoreCtx).trim()} while (${walk(node.test, '', ignoreCtx)});`;
                break;

            case 'TryStatement':
                result = `${indent}try ${walk(node.block, indent, ignoreCtx).trim()}`;
                if (node.handler) {
                    result += ` ${walk(node.handler, indent, ignoreCtx).trim()}`;
                }
                if (node.finalizer) {
                    result += ` finally ${walk(node.finalizer, indent, ignoreCtx).trim()}`;
                }
                break;

            case 'CatchClause':
                const catchParam = node.param ? `(${walk(node.param, indent, ignoreCtx)})` : '';
                result = `catch ${catchParam} ${walk(node.body, indent, ignoreCtx).trim()}`;
                break;

            case 'ReturnStatement':
                result = `${indent}return${node.argument ? ' ' + walk(node.argument, indent, ignoreCtx) : ''};`;
                break;

            case 'ThrowStatement':
                result = `${indent}throw ${walk(node.argument, indent, ignoreCtx)};`;
                break;

            case 'BreakStatement':
                result = `${indent}break${node.label ? ' ' + node.label.name : ''};`;
                break;
            
            case 'ContinueStatement':
                result = `${indent}continue${node.label ? ' ' + node.label.name : ''};`;
                break;

            case 'LabeledStatement':
                result = `${indent}${node.label.name}: ${walk(node.body, indent, ignoreCtx).trim()}`;
                break;
            
            case 'DebuggerStatement':
                result = `${indent}debugger;`;
                break;

            case 'WithStatement':
                result = `${indent}with (${walk(node.object, '', ignoreCtx)}) ${walk(node.body, indent, ignoreCtx).trim()}`;
                break;

            // === 6. Expressions ===
            case 'BinaryExpression':
            case 'LogicalExpression':
            case 'AssignmentExpression':
                // Apply Precedence Logic
                const leftNode = walk(node.left, indent, childCtx);
                const rightNode = walk(node.right, indent, childCtx);
                result = `${leftNode} ${node.operator} ${rightNode}`;
                break;

            case 'UnaryExpression':
                // prefix: !a, typeof a. postfix (rare in unary, usually Update): 
                const uArg = walk(node.argument, indent, childCtx);
                if (node.prefix) {
                    // Space for word operators (typeof, void, delete)
                    const space = ['typeof', 'void', 'delete'].includes(node.operator) ? ' ' : '';
                    result = `${node.operator}${space}${uArg}`;
                } else {
                    result = `${uArg}${node.operator}`;
                }
                break;

            case 'UpdateExpression':
                const upArg = walk(node.argument, indent, childCtx);
                result = node.prefix 
                    ? `${node.operator}${upArg}`
                    : `${upArg}${node.operator}`;
                break;

            case 'ConditionalExpression':
                const condTest = walk(node.test, indent, childCtx);
                const condCon = walk(node.consequent, indent, ignoreCtx);
                const condAlt = walk(node.alternate, indent, ignoreCtx);
                result = `${condTest} ? ${condCon} : ${condAlt}`;
                break;

            case 'SequenceExpression':
                // (a, b, c)
                result = node.expressions.map(e => walk(e, indent, ignoreCtx)).join(', ');
                break;

            case 'MemberExpression':
                const obj = walk(node.object, indent, childCtx);
                const memKey = walk(node.property, indent, ignoreCtx);
                const optionalC = node.optional ? '?.' : (node.computed ? '' : '.');
                
                if (node.computed) {
                    // obj?.[expr] or obj[expr]
                    // Note: if node.optional is true, usually `obj?.[expr]`
                    result = `${obj}${node.optional ? '?.' : ''}[${memKey}]`;
                } else {
                    // obj?.prop or obj.prop
                    result = `${obj}${optionalC}${memKey}`;
                }
                break;

            case 'ChainExpression':
                // Wrapper for Optional Chaining roots. Unwrap and print.
                result = walk(node.expression, indent, ignoreCtx);
                break;

            case 'CallExpression':
            case 'NewExpression':
                const cBase = node.type === 'NewExpression' ? 'new ' : '';
                const cCallee = walk(node.callee, indent, childCtx);
                const cOpt = node.optional ? '?.' : '';
                
                if (node.arguments.length === 0) {
                    result = `${cBase}${cCallee}${cOpt}()`;
                } else if (!opts.expandArgs) {
                    // Single line args
                    result = `${cBase}${cCallee}${cOpt}(${node.arguments.map(a => walk(a, indent, ignoreCtx)).join(', ')})`;
                } else {
                    // Expanded args: ( \n arg, \n arg \n )
                    const argsExp = node.arguments
                        .map(a => nextIndent + walk(a, nextIndent, ignoreCtx))
                        .join(',\n');
                    result = `${cBase}${cCallee}${cOpt}(\n${argsExp}\n${indent})`;
                }
                break;

            case 'YieldExpression':
                const yArg = node.argument ? ' ' + walk(node.argument, indent, ignoreCtx) : '';
                result = `yield${node.delegate ? '*' : ''}${yArg}`;
                break;
            
            case 'AwaitExpression':
                result = `await ${walk(node.argument, indent, childCtx)}`;
                break;

            case 'ImportExpression':
                result = `import(${walk(node.source, indent, ignoreCtx)})`;
                break;
            
            case 'MetaProperty':
                result = `${node.meta.name}.${node.property.name}`;
                break;

            case 'ThisExpression': result = 'this'; break;
            case 'Super': result = 'super'; break;

            // === 7. Patterns & Structures ===
            case 'ArrayExpression':
            case 'ArrayPattern':
                if (node.elements.length === 0) {
                    result = '[]';
                } else if (opts.expandArrays) {
                    // Expand arrays with holes handling
                    const els = node.elements.map(e => {
                        if (e === null) return nextIndent; // Hole
                        return nextIndent + walk(e, nextIndent, ignoreCtx);
                    }).join(',\n');
                    result = `[\n${els}\n${indent}]`;
                } else {
                    result = `[${node.elements.map(e => e ? walk(e, indent, ignoreCtx) : '').join(', ')}]`;
                }
                break;

            case 'ObjectExpression':
            case 'ObjectPattern':
                if (node.properties.length === 0) {
                    result = '{}';
                } else if (opts.expandObjects) {
                    const props = node.properties
                        .map(p => nextIndent + walk(p, nextIndent, ignoreCtx))
                        .join(',\n');
                    result = `{\n${props}\n${indent}}`;
                } else {
                    result = `{ ${node.properties.map(p => walk(p, indent, ignoreCtx)).join(', ')} }`;
                }
                break;

            case 'Property':
                let prKey = walk(node.key, indent, ignoreCtx);
                if (node.computed) prKey = `[${prKey}]`;

                if (node.shorthand && !node.computed) {
                    // { a } or { a = 1 } (assignment pattern)
                    if (node.value.type === 'AssignmentPattern') {
                        result = walk(node.value, indent, ignoreCtx);
                    } else {
                        result = prKey;
                    }
                } else if (node.method) {
                    // { method() {} }
                    const prFn = node.value;
                    const prParams = prFn.params.map(p => walk(p, indent, ignoreCtx)).join(', ');
                    const prAsync = prFn.async ? 'async ' : '';
                    const prGen = prFn.generator ? '*' : '';
                    result = `${prAsync}${prGen}${prKey}(${prParams}) ${walk(prFn.body, indent, ignoreCtx).trim()}`;
                } else {
                    result = `${prKey}: ${walk(node.value, indent, ignoreCtx)}`;
                }
                break;

            case 'AssignmentPattern':
                // x = 1 (inside params or destructuring)
                result = `${walk(node.left, indent, ignoreCtx)} = ${walk(node.right, indent, ignoreCtx)}`;
                break;

            case 'RestElement':
            case 'SpreadElement':
                result = `...${walk(node.argument, indent, ignoreCtx)}`;
                break;
            
            case 'TaggedTemplateExpression':
                // tag`str`
                result = `${walk(node.tag, indent, childCtx)}${walk(node.quasi, indent, ignoreCtx)}`;
                break;

            // === 8. Import / Export ===
            case 'ImportDeclaration':
                const iSrc = walk(node.source, indent, ignoreCtx);
                const iSpecifiers = [];
                // Separate types of specifiers
                const defSpec = node.specifiers.find(s => s.type === 'ImportDefaultSpecifier');
                const nsSpec = node.specifiers.find(s => s.type === 'ImportNamespaceSpecifier');
                const namedSpecs = node.specifiers.filter(s => s.type === 'ImportSpecifier');

                if (defSpec) iSpecifiers.push(walk(defSpec, indent, ignoreCtx));
                if (nsSpec) iSpecifiers.push(walk(nsSpec, indent, ignoreCtx));
                if (namedSpecs.length > 0) {
                    const names = namedSpecs.map(s => walk(s, indent, ignoreCtx)).join(', ');
                    iSpecifiers.push(`{ ${names} }`);
                }
                
                if (iSpecifiers.length === 0) {
                    result = `${indent}import ${iSrc};`;
                } else {
                    result = `${indent}import ${iSpecifiers.join(', ')} from ${iSrc};`;
                }
                break;

            case 'ImportDefaultSpecifier':
                result = node.local.name;
                break;
            
            case 'ImportNamespaceSpecifier':
                result = `* as ${node.local.name}`;
                break;
            
            case 'ImportSpecifier':
                result = (node.imported.name === node.local.name) 
                    ? node.imported.name 
                    : `${node.imported.name} as ${node.local.name}`;
                break;

            case 'ExportDefaultDeclaration':
                // export default ...
                let edDecl = walk(node.declaration, indent, ignoreCtx).trim();
                // Determine if semicolon needed (expression vs statement)
                const edNeedsSemi = /(FunctionDeclaration|ClassDeclaration)/.test(node.declaration.type) ? '' : ';';
                result = `${indent}export default ${edDecl}${edNeedsSemi}`;
                break;

            case 'ExportAllDeclaration':
                result = `${indent}export * from ${walk(node.source, indent, ignoreCtx)};`;
                break;

            case 'ExportNamedDeclaration':
                if (node.declaration) {
                    result = `${indent}export ${walk(node.declaration, indent, ignoreCtx).trim()}`;
                } else {
                    const eSpecs = node.specifiers.map(s => walk(s, indent, ignoreCtx)).join(', ');
                    const eSrc = node.source ? ` from ${walk(node.source, indent, ignoreCtx)}` : '';
                    result = `${indent}export { ${eSpecs} }${eSrc};`;
                }
                break;
            
            case 'ExportSpecifier':
                result = (node.local.name === node.exported.name)
                    ? node.local.name
                    : `${node.local.name} as ${node.exported.name}`;
                break;

            // === 9. Catch-All for Safety ===
            default:
                console.warn(`[Beautifier] Unhandled Node Type: ${node.type}`, node);
                result = `/* Unhandled: ${node.type} */`;
        }

        // --- E. Final Wrap ---
        
        // Apply parentheses if precedence dictates
        if (needsParens) {
            result = `(${result})`;
        }

        // Prepend accumulated comments (and indent the node, unless it already handled its indent like Declarations)
        return comments + result;
    }

    // 7. Start the Ascent
    return walk(ast, '');
}