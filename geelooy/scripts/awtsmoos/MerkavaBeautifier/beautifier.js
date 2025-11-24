//B"H
/**
 * A self-contained, memoized promise that resolves with the MerkavahParser class.
 * It handles loading the non-module parser script from within this JS module.
 */
const merkavaLoaderPromise = new Promise(
	(resolve, reject) => {
		if (window.MerkavahParserPromise) {
			return (window.MerkavahParserPromise.then(resolve)).catch(reject);
		}
		const callbackName = "merkavaOnload_" + Date.now();
		window.merkavaCallback = callbackName;
		window[callbackName] = (loadedParser) => {
			delete window[callbackName];
			resolve(loadedParser);
		};
		const script = document.createElement("script");
		script.src = `/scripts/awtsmoos/MerkavaASTParser/parser-core.js`;
		script.onerror = () => {
			delete window[callbackName];
			reject(
				new Error("Critical Error: Could not load parser-core.js")
			);
		};
		document.head.appendChild(script);
	}
);

/**
 * The Beautifier.
 * @param {string} code The source code.
 * @param {object} options Configuration.
 */
export async function beautify(code, options = {}) {
	//1. Load Parser
	const MerkavaParser = await merkavaLoaderPromise;
	//2. Parse Code
	const parser = new MerkavaParser(code);
	parser.registerExpressionParsers();
	parser.registerStatementParsers();
	parser.registerDeclarationParsers();
	const ast = parser.parse();
	if (parser.errors.length > 0) {
		throw new Error(
			"Parsing failed:\n" + parser.errors.join("\n")
		);
	}
	//3. Configuration
	const opts = {
		indentChar: "\t",
		expandArrays: true,
		expandObjects: true,
		expandArgs: true,
				//Calls with args are always expanded
...options
	};
	//4. Operator Precedence (for restoring parentheses)
	const PRECEDENCE = {
		"Sequence": 0,
		"Yield": 1,
		"Assignment": 1,
		"Conditional": 2,
		"ArrowFunction": 2,
		"Coalesce": 3,
		"LogicalOR": 4,
		"LogicalAND": 5,
		"BitwiseOR": 6,
		"BitwiseXOR": 7,
		"BitwiseAND": 8,
		"Equality": 9,
		"Relational": 10,
		"BitwiseShift": 11,
		"Additive": 12,
		"Multiplicative": 13,
		"Exponentiation": 14,
		"Unary": 15,
		"Call": 17,
		"Member": 18
	};
	function getPrecedence(node) {
		switch (node.type) {
			case "SequenceExpression":
				return PRECEDENCE.Sequence;
			case "YieldExpression":
				return PRECEDENCE.Yield;
			case "AssignmentExpression":
				return PRECEDENCE.Assignment;
			case "ConditionalExpression":
				return PRECEDENCE.Conditional;
			case "ArrowFunctionExpression":
				return PRECEDENCE.ArrowFunction;
			case "LogicalExpression":
				return node.operator === "??" ? PRECEDENCE.Coalesce : node.operator === "||" ? PRECEDENCE.LogicalOR : PRECEDENCE.LogicalAND;
			case "BinaryExpression":
				if ([
					"+",
					"-"
				].includes(
					node.operator
				)) return PRECEDENCE.Additive;
				if ([
					"*",
					"/",
					"%"
				].includes(
					node.operator
				)) return PRECEDENCE.Multiplicative;
				if (node.operator === "**") return PRECEDENCE.Exponentiation;
				if ([
					"<",
					">",
					"<=",
					">=",
					"in",
					"instanceof"
				].includes(
					node.operator
				)) return PRECEDENCE.Relational;
				if ([
					"==",
					"!=",
					"===",
					"!=="
				].includes(
					node.operator
				)) return PRECEDENCE.Equality;
				return PRECEDENCE.BitwiseOR;
			//Simplified fallback
			case "CallExpression":

			case "NewExpression":

			case "ImportExpression":

			case "ChainExpression":
				return PRECEDENCE.Call;
			case "MemberExpression":

			case "MetaProperty":
				return PRECEDENCE.Member;
			case "UnaryExpression":

			case "AwaitExpression":

			case "UpdateExpression":
				return PRECEDENCE.Unary;
			default:
				return 19;
		}
	}
	//Primary/Literal
	//5. Comment Logic
	//We maintain a cursor to walk through the flat comment list from the parser
	const allComments = ast.comments || [];
	let commentCursor = 0;
	/**
     * Flushes comments that occur before the given node start index.
     * Uses `node.start` (inserted by your Parser fix).
     */
	function printLeadingComments(nodeStart, indent) {
		//If nodeStart is missing (parser fix not applied), fallback to 'infinity' behavior for safety
		const safeStart = typeof nodeStart === "number" ? nodeStart : Infinity;
		let out = "";
		while (commentCursor < allComments.length) {
			const c = allComments[commentCursor];
			//If comment ends before this node begins, print it now.
			if (c.end <= safeStart) {
				const text = c.type === "Block" ? `/*${
					c.value
				}*/` : `//${
					c.value.trim()
				}`;
				out += `${indent}${text}\n`;
				commentCursor++;
			} else {
				break;
			}
		}
		return out;
	}
	//6. The Walker
	function walk(node, indent = "", ctx = {}) {
		if (!node) return "";
		//--- Comments & Indentation Setup ---
		const startPos = typeof node.start === "number" ? node.start : node.startIndex || 0;
		const comments = printLeadingComments(
			startPos,
			indent
		);
		const nextIndent = indent + opts.indentChar;
		const currentPrecedence = getPrecedence(node);
		const needsParens = ctx.parentPrecedence && currentPrecedence > 0 && currentPrecedence < ctx.parentPrecedence;
		//Contexts
		const childCtx = {
			parentPrecedence: currentPrecedence
		};
		const ignoreCtx = {
			parentPrecedence: 0
		};
		const loopCtx = {
			isLoop: true,
			parentPrecedence: 0
		};
		//prevents ; in for loops
		let result = "";
		switch (node.type) {
			case "Program":
				if (node.body.length === 0) result = ""; else result = (node.body.map(
					(n) => walk(
						n,
						indent,
						ignoreCtx
					)
				)).join("\n\n");
				//Flush EOF comments
				result += printLeadingComments(
					Infinity,
					indent
				);
				return result;
			//--- Blocks ---
			case "BlockStatement":

			case "ClassBody":
				if (node.body.length === 0) result = "{}"; else {
					const bContent = (node.body.map(
						(n) => walk(
							n,
							nextIndent,
							ignoreCtx
						)
					)).join("\n");
					result = `{\n${bContent}\n${indent}}`;
				}
				break;
			case "EmptyStatement":
				result = ";";
				break;
			//--- Literals & Identifiers ---
			case "Identifier":
				result = node.name;
				break;
			case "PrivateIdentifier":
				result = "#" + node.name;
				break;
			case "ThisExpression":
				result = "this";
				break;
			case "Super":
				result = "super";
				break;
			case "Literal":
				if (typeof node.value === "string") {
					//Manual "From Scratch" string reconstruction.
					//Since node.value is raw (unescaped), we just need to wrap it.
					//We prioritize Double Quotes.
					let content = node.value;
					let quote = '"';
					//If the raw content contains double quotes but NOT single quotes,
					//switch to single quotes to keep it clean.
					if (content.includes('"') && !content.includes("'")) {
						quote = "'";
					}
					//Escape only the surrounding quote type found inside the content.
					//Do NOT escape backslashes or newlines (they are already raw).
					if (quote === '"') {
						content = content.replace(
							/"/g,
							'\\"'
						);
					} else {
						content = content.replace(
							/'/g,
							"\\'"
						);
					}
					result = quote + content + quote;
				} else if (node.bigint) {
					result = `${
						node.bigint
					}n`;
				} else if (node.regex) {
					result = node.raw || `/${
						node.regex.pattern
					}/${
						node.regex.flags
					}`;
				} else if (node.value === null) {
					result = "null";
				} else {
					result = String(
						node.value
					);
				}
				break;
			case "TemplateLiteral":
				let tmpl = "`";
				for (let i = 0; i < node.quasis.length; i++) {
					tmpl += node.quasis[i].value.raw;
					if (i < node.expressions.length) {
						const expr = node.expressions[i];
						//If simple variable/literal, keep inline: `${name}`
						//If complex expression, expand: `${ \n ... \n }`
						const isSimple = expr.type === "Identifier" || expr.type === "Literal" || expr.type === "ThisExpression";
						const exprStr = (walk(
							expr,
							nextIndent,
							ignoreCtx
						)).trim();
						if (isSimple) {
							tmpl += "${" + exprStr + "}";
						} else {
							tmpl += "${" + "\n" + nextIndent + exprStr + "\n" + indent + "}";
						}
					}
				}
				tmpl += "`";
				result = tmpl;
				break;
			case "CallExpression":

			case "NewExpression":
				const cNew = node.type === "NewExpression" ? "new " : "";
				const cCallee = walk(
					node.callee,
					indent,
					childCtx
				);
				const cOpt = node.optional ? "?." : "";
				//Heuristic: Keep it on one line if there are no args, or
				//just 1 simple arg (String, Number, Variable).
				const isSimpleCall = node.arguments.length === 0 || node.arguments.length === 1 && [
					"Literal",
					"Identifier",
					"ThisExpression"
				].includes(
					node.arguments[0].type
				);
				if (isSimpleCall || !opts.expandArgs) {
					const simpleArgs = (node.arguments.map(
						(a) => walk(
							a,
							indent,
							ignoreCtx
						)
					)).join(", ");
					result = `${cNew}${cCallee}${cOpt}(${simpleArgs})`;
				} else {
					//Complex/Multiple args -> Expand
					const expArgs = (node.arguments.map(
						(a) => nextIndent + walk(
							a,
							nextIndent,
							ignoreCtx
						)
					)).join(",\n");
					result = `${cNew}${cCallee}${cOpt}(\n${expArgs}\n${indent})`;
				}
				break;
			//--- Arrays & Objects ---
			case "ArrayExpression":

			case "ArrayPattern":
				if (node.elements.length === 0) result = "[]"; else if (opts.expandArrays) {
					const els = (node.elements.map(
						(e) => e ? nextIndent + walk(
							e,
							nextIndent,
							ignoreCtx
						) : nextIndent
					)).join(",\n");
					result = `[\n${els}\n${indent}]`;
				} else {
					result = `[${
						(node.elements.map(
							(e) => e ? walk(
								e,
								indent,
								ignoreCtx
							) : ""
						)).join(", ")
					}]`;
				}
				break;
			case "ObjectExpression":

			case "ObjectPattern":
				if (node.properties.length === 0) result = "{}"; else if (opts.expandObjects) {
					const props = (node.properties.map(
						(p) => nextIndent + walk(
							p,
							nextIndent,
							ignoreCtx
						)
					)).join(",\n");
					result = `{\n${props}\n${indent}}`;
				} else {
					result = `{ ${
						(node.properties.map(
							(p) => walk(
								p,
								indent,
								ignoreCtx
							)
						)).join(", ")
					} }`;
				}
				break;
			case "Property":
				let key = walk(
					node.key,
					indent,
					ignoreCtx
				);
				if (node.computed) key = `[${key}]`;
				if (node.shorthand && !node.computed) {
					result = node.value.type === "AssignmentPattern" ? walk(
						node.value,
						indent,
						ignoreCtx
					) : key;
				} else if (node.method) {
					const fn = node.value;
					const asyncStr = fn.async ? "async " : "";
					const genStr = fn.generator ? "*" : "";
					const params = (fn.params.map(
						(p) => walk(
							p,
							indent,
							ignoreCtx
						)
					)).join(", ");
					result = `${asyncStr}${genStr}${key}(${params}) ${
						(walk(
							fn.body,
							indent,
							ignoreCtx
						)).trim()
					}`;
				} else {
					result = `${key}: ${
						walk(
							node.value,
							indent,
							ignoreCtx
						)
					}`;
				}
				break;
			//--- Functions ---
			case "FunctionDeclaration":

			case "FunctionExpression":

			case "ArrowFunctionExpression":
				const fAsync = node.async ? "async " : "";
				const fGen = node.generator ? "*" : "";
				const fParams = (node.params.map(
					(p) => walk(
						p,
						indent,
						ignoreCtx
					)
				)).join(", ");
				const fBody = walk(
					node.body,
					indent,
					ignoreCtx
				);
				if (node.type === "ArrowFunctionExpression") {
					result = `${fAsync}(${fParams}) => ${
						fBody.trim()
					}`;
				} else {
					const fId = node.id ? " " + walk(
						node.id,
						"",
						ignoreCtx
					) : "";
					result = `${fAsync}function${fGen}${fId}(${fParams}) ${
						fBody.trim()
					}`;
					if (node.type === "FunctionDeclaration") result = indent + result;
				}
				break;
			//--- Members ---
			case "MemberExpression":
				const mObj = walk(
					node.object,
					indent,
					childCtx
				);
				const mProp = walk(
					node.property,
					indent,
					ignoreCtx
				);
				if (node.computed) result = `${mObj}${
					node.optional ? "?." : ""
				}[${mProp}]`; else result = `${mObj}${
					node.optional ? "?." : "."
				}${mProp}`;
				break;
			case "ChainExpression":
				result = walk(
					node.expression,
					indent,
					ignoreCtx
				);
				break;
			//--- Statements ---
			case "ExpressionStatement":
				result = indent + walk(
					node.expression,
					indent,
					ignoreCtx
				) + ";";
				break;
			case "VariableDeclaration":
				const vDecls = (node.declarations.map(
					(d) => walk(
						d,
						indent,
						ignoreCtx
					)
				)).join(", ");
				result = `${indent}${
					node.kind
				} ${vDecls}${
					ctx.isLoop ? "" : ";"
				}`;
				break;
			case "VariableDeclarator":
				const vId = walk(
					node.id,
					indent,
					ignoreCtx
				); 
				result = node.init ? `${vId} = ${
					walk(
						node.init,
						indent,
						{
							parentPrecedence: PRECEDENCE.Assignment
						}
					)
				}` : vId;
				break;
			case 'IfStatement':
	                // 1. Format the 'if (condition)' part
	                const ifPart = `if (${walk(node.test, indent, ignoreCtx)})`;
	                
	                // 2. Format the Consequent (True block)
	                let consequentStr;
	                if (node.consequent.type === 'BlockStatement') {
	                    // Block -> Keep brace on same line: "if (cond) {"
	                    // We trim the result of walk so it hugs the condition
	                    consequentStr = ' ' + walk(node.consequent, indent, ignoreCtx).trim();
	                } else {
	                    // Single Statement -> Force Newline + Indentation
	                    // We walk with 'nextIndent' so the statement comes back strictly indented one level deeper
	                    consequentStr = '\n' + walk(node.consequent, nextIndent, ignoreCtx);
	                }
	
	                result = `${indent}${ifPart}${consequentStr}`;
	
	                // 3. Format the Alternate (Else block)
	                if (node.alternate) {
	                    const altNode = node.alternate;
	                    
	                    // Logic to position the 'else' keyword:
	                    // If the consequent was a Block ('}'), 'else' goes on same line: "} else"
	                    // If the consequent was a Single Line, we are currently on that indented line. 
	                    // We must drop down and dedent for the 'else'.
	                    const elseSeparator = node.consequent.type === 'BlockStatement' ? ' ' : `\n${indent}`;
	                    
	                    if (altNode.type === 'BlockStatement') {
	                        // else { ... }
	                        result += `${elseSeparator}else ${walk(altNode, indent, ignoreCtx).trim()}`;
	                    } else if (altNode.type === 'IfStatement') {
	                        // else if (...) -> Flatten the chain. 
	                        // Recurse with current indentation, trim start to fit after 'else'
	                        result += `${elseSeparator}else ${walk(altNode, indent, ignoreCtx).trim()}`;
	                    } else {
	                        // else statement; -> Force Newline + Indent
	                        result += `${elseSeparator}else\n${walk(altNode, nextIndent, ignoreCtx)}`;
	                    }
	                }
	                break;
			case "ReturnStatement":
				result = `${indent}return${
					node.argument ? " " + walk(
						node.argument,
						indent,
						ignoreCtx
					) : ""
				};`;
				break;
			case "ForStatement":
				const forInit = node.init ? (walk(
					node.init,
					"",
					loopCtx
				)).trim() : "";
				result = `${indent}for (${forInit}; ${
					walk(
						node.test,
						"",
						ignoreCtx
					)
				}; ${
					walk(
						node.update,
						"",
						ignoreCtx
					)
				}) ${
					(walk(
						node.body,
						indent,
						ignoreCtx
					)).trim()
				}`;
				break;
			case "ForInStatement":

			case "ForOfStatement":
				const forType = node.type === "ForOfStatement" ? "of" : "in";
				const fAwait = node.await ? "await " : "";
				result = `${indent}for (${fAwait}${
					(walk(
						node.left,
						"",
						loopCtx
					)).trim()
				} ${forType} ${
					walk(
						node.right,
						"",
						ignoreCtx
					)
				}) ${
					(walk(
						node.body,
						indent,
						ignoreCtx
					)).trim()
				}`;
				break;
			case "SwitchStatement":
				result = `${indent}switch (${
					walk(
						node.discriminant,
						"",
						ignoreCtx
					)
				}) {\n${
					(node.cases.map(
						(c) => walk(
							c,
							nextIndent,
							ignoreCtx
						)
					)).join("\n")
				}\n${indent}}`;
				break;
			case "SwitchCase":
				const scTest = node.test ? `case ${
					walk(
						node.test,
						"",
						ignoreCtx
					)
				}` : "default";
				result = `${indent}${scTest}:\n${
					(node.consequent.map(
						(c) => walk(
							c,
							nextIndent,
							ignoreCtx
						)
					)).join("\n")
				}`;
				break;
			case "WhileStatement":
				result = `${indent}while (${
					walk(
						node.test,
						"",
						ignoreCtx
					)
				}) ${
					(walk(
						node.body,
						indent,
						ignoreCtx
					)).trim()
				}`;
				break;
			case "DoWhileStatement":
				result = `${indent}do ${
					(walk(
						node.body,
						indent,
						ignoreCtx
					)).trim()
				} while (${
					walk(
						node.test,
						"",
						ignoreCtx
					)
				});`;
				break;
			case "TryStatement":
				result = `${indent}try ${
					(walk(
						node.block,
						indent,
						ignoreCtx
					)).trim()
				}`;
				if (node.handler) result += ` ${
					(walk(
						node.handler,
						indent,
						ignoreCtx
					)).trim()
				}`;
				if (node.finalizer) result += ` finally ${
					(walk(
						node.finalizer,
						indent,
						ignoreCtx
					)).trim()
				}`;
				break;
			case "CatchClause":
				result = `catch ${
					node.param ? "(" + walk(
						node.param,
						indent,
						ignoreCtx
					) + ")" : ""
				} ${
					(walk(
						node.body,
						indent,
						ignoreCtx
					)).trim()
				}`;
				break;
			case "ThrowStatement":
				result = `${indent}throw ${
					walk(
						node.argument,
						indent,
						ignoreCtx
					)
				};`;
				break;
			case "BreakStatement":
				result = `${indent}break${
					node.label ? " " + node.label.name : ""
				};`;
				break;
			case "ContinueStatement":
				result = `${indent}continue${
					node.label ? " " + node.label.name : ""
				};`;
				break;
			case "WithStatement":
				result = `${indent}with (${
					walk(
						node.object,
						"",
						ignoreCtx
					)
				}) ${
					(walk(
						node.body,
						indent,
						ignoreCtx
					)).trim()
				}`;
				break;
			case "LabeledStatement":
				result = `${indent}${
					node.label.name
				}: ${
					(walk(
						node.body,
						indent,
						ignoreCtx
					)).trim()
				}`;
				break;
			//--- Classes ---
			case "MethodDefinition":
				const mdStat = node.static ? "static " : "";
				const mdKey = node.computed ? `[${
					walk(
						node.key,
						indent,
						ignoreCtx
					)
				}]` : walk(
					node.key,
					indent,
					ignoreCtx
				);
				const mdFn = node.value;
				const mdParams = (mdFn.params.map(
					(p) => walk(
						p,
						indent,
						ignoreCtx
					)
				)).join(", ");
				const mdAsync = mdFn.async ? "async " : "";
				const mdGen = mdFn.generator ? "*" : "";
				result = `${indent}${mdStat}${mdAsync}${mdGen}${mdKey}(${mdParams}) ${
					(walk(
						mdFn.body,
						indent,
						ignoreCtx
					)).trim()
				}`;
				break;
			case "PropertyDefinition":
				const pdStat = node.static ? "static " : "";
				const pdKey = node.computed ? `[${
					walk(
						node.key,
						indent,
						ignoreCtx
					)
				}]` : walk(
					node.key,
					indent,
					ignoreCtx
				);
				result = `${indent}${pdStat}${pdKey}${
					node.value ? " = " + walk(
						node.value,
						indent,
						ignoreCtx
					) : ""
				};`;
				break;
			case "StaticBlock":
				result = `${indent}static {\n${
					(node.body.map(
						(n) => walk(
							n,
							nextIndent,
							ignoreCtx
						)
					)).join("\n")
				}\n${indent}}`;
				break;
			//--- Ops ---
			case "BinaryExpression":

			case "LogicalExpression":

			case "AssignmentExpression":
				result = `${
					walk(
						node.left,
						indent,
						childCtx
					)
				} ${
					node.operator
				} ${
					walk(
						node.right,
						indent,
						childCtx
					)
				}`;
				break;
			case "UnaryExpression":
				const unSpace = [
					"typeof",
					"void",
					"delete"
				].includes(
					node.operator
				) ? " " : "";
				result = node.prefix ? `${
					node.operator
				}${unSpace}${
					walk(
						node.argument,
						indent,
						childCtx
					)
				}` : `${
					walk(
						node.argument,
						indent,
						childCtx
					)
				}${
					node.operator
				}`;
				break;
			case "UpdateExpression":
				result = node.prefix ? `${
					node.operator
				}${
					walk(
						node.argument,
						indent,
						childCtx
					)
				}` : `${
					walk(
						node.argument,
						indent,
						childCtx
					)
				}${
					node.operator
				}`;
				break;
			case "ConditionalExpression":
				result = `${
					walk(
						node.test,
						indent,
						childCtx
					)
				} ? ${
					walk(
						node.consequent,
						indent,
						ignoreCtx
					)
				} : ${
					walk(
						node.alternate,
						indent,
						ignoreCtx
					)
				}`;
				break;
			case "SequenceExpression":
				result = (node.expressions.map(
					(e) => walk(
						e,
						indent,
						ignoreCtx
					)
				)).join(", ");
				break;
			//--- Misc ---
			case "AssignmentPattern":
				result = `${
					walk(
						node.left,
						indent,
						ignoreCtx
					)
				} = ${
					walk(
						node.right,
						indent,
						ignoreCtx
					)
				}`;
				break;
			case "RestElement":

			case "SpreadElement":
				result = `...${
					walk(
						node.argument,
						indent,
						ignoreCtx
					)
				}`;
				break;
			case "YieldExpression":
				result = `yield${
					node.delegate ? "*" : ""
				}${
					node.argument ? " " + walk(
						node.argument,
						indent,
						ignoreCtx
					) : ""
				}`;
				break;
			case "AwaitExpression":
				result = `await ${
					walk(
						node.argument,
						indent,
						childCtx
					)
				}`;
				break;
			case "ImportExpression":
				result = `import(${
					walk(
						node.source,
						indent,
						ignoreCtx
					)
				})`;
				break;
			case "MetaProperty":
				result = `${
					node.meta.name
				}.${
					node.property.name
				}`;
				break;
			case "TaggedTemplateExpression":
				result = `${
					walk(
						node.tag,
						indent,
						childCtx
					)
				}${
					walk(
						node.quasi,
						indent,
						ignoreCtx
					)
				}`;
				break;
			//--- Import/Export ---
			case "ImportDeclaration":
				const src = walk(
					node.source,
					indent,
					ignoreCtx
				);
				const iSpecs = node.specifiers.map(
					(s) => {
						if (s.type === "ImportDefaultSpecifier") return walk(
							s,
							indent,
							ignoreCtx
						);
						if (s.type === "ImportNamespaceSpecifier") return `* as ${
							s.local.name
						}`;
						return s.imported.name === s.local.name ? s.local.name : `${
							s.imported.name
						} as ${
							s.local.name
						}`;
					}
				);
				//Naive reconstruction for mixed types (default + named) is tricky with map,
				//but usually handled by grouping: "Def, { Named }"
				//Since this switch case is simple, we do a quick check:
				const iDef = node.specifiers.find(
					(s) => s.type === "ImportDefaultSpecifier"
				);
				const iNs = node.specifiers.find(
					(s) => s.type === "ImportNamespaceSpecifier"
				);
				const iNamed = node.specifiers.filter(
					(s) => s.type === "ImportSpecifier"
				);
				let iStr = "import ";
				if (iDef) iStr += iDef.local.name;
				if (iNs) {
					if (iDef) iStr += ", ";
					iStr += `* as ${
						iNs.local.name
					}`;
				}
				if (iNamed.length > 0) {
					if (iDef || iNs) iStr += ", ";
					iStr += `{ ${
						(iNamed.map(
							(n) => n.imported.name === n.local.name ? n.local.name : `${
								n.imported.name
							} as ${
								n.local.name
							}`
						)).join(", ")
					} }`;
				}
				if (node.specifiers.length === 0) iStr += src; else //import "mod"
				iStr += ` from ${src}`;
				result = `${indent}${iStr};`;
				break;
			case "ExportNamedDeclaration":
				if (node.declaration) {
					result = `${indent}export ${
						(walk(
							node.declaration,
							indent,
							ignoreCtx
						)).trim()
					}`;
				} else {
					const eSpecs = (node.specifiers.map(
						(s) => s.local.name === s.exported.name ? s.local.name : `${
							s.local.name
						} as ${
							s.exported.name
						}`
					)).join(", ");
					result = `${indent}export { ${eSpecs} }${
						node.source ? " from " + walk(
							node.source,
							indent,
							ignoreCtx
						) : ""
					};`;
				}
				break;
			case "ExportAllDeclaration":
				result = `${indent}export * from ${
					walk(
						node.source,
						indent,
						ignoreCtx
					)
				};`;
				break;
			default:
				console.warn(
					"Unknown node type:",
					node.type
				);
				result = `/* Unknown: ${
					node.type
				} */`;
		}
		if (needsParens) result = `(${result})`;
		return comments + result;
	}
	return walk(
		ast,
		""
	);
}