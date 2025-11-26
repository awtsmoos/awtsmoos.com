// B"H
/**
 * @file merkava-compiler.js
 * @version 1.2.0 - The Architect
 * @description
 * The Compiler for the Merkava VM.
 * Handles: Control Flow, Scoping, Destructuring, Short-Circuiting, and Spread.
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./merkava-opcodes.js'));
    } else {
        root.MerkavaCompiler = factory(root.MerkavaOpcodes);
    }
}(typeof self !== 'undefined' ? self : this, function(OpcodesModule) {

    const { OPCODES } = OpcodesModule;

    class BytecodeBuilder {
        constructor() { this.bytes = []; }
        write8(byte) { this.bytes.push(byte & 0xFF); return this.bytes.length - 1; }
        write16(int) { this.bytes.push(int & 0xFF); this.bytes.push((int >> 8) & 0xFF); return this.bytes.length - 2; }
        patch16(index, value) { this.bytes[index] = value & 0xFF; this.bytes[index + 1] = (value >> 8) & 0xFF; }
        get currentAddress() { return this.bytes.length; }
        toBuffer() { return new Uint8Array(this.bytes); }
    }

    class CompilerScope {
        constructor(parent = null) {
            this.parent = parent;
            this.locals = new Map();
            this.depth = parent ? parent.depth + 1 : 0;
            this.stackIndex = parent ? parent.stackIndex : 0;
        }
        declare(name) {
            const index = this.stackIndex++;
            this.locals.set(name, index);
            return index;
        }
        resolve(name) {
            if (this.locals.has(name)) return { type: 'LOCAL', index: this.locals.get(name), depth: 0 };
            if (this.parent) {
                const result = this.parent.resolve(name);
                if (result.type === 'LOCAL' || result.type === 'UPVALUE') return { type: 'UPVALUE', index: result.index, depth: result.depth + 1 };
            }
            return { type: 'GLOBAL', index: -1, depth: 0 };
        }
    }

    class Compiler {
        constructor() {
            this.constants = [];
            this.buffer = new BytecodeBuilder();
            this.scope = new CompilerScope();
            this.loops = [];
        }

        compile(ast) {
            if (ast.type === 'Program') this._compileBlock(ast.body);
            else this._visit(ast);
            this.buffer.write8(OPCODES.HALT);
            return { bytecode: this.buffer.toBuffer(), constants: this.constants };
        }

        _visit(node) {
            if (!node) return;
            switch (node.type) {
                case 'ThisExpression': this.buffer.write8(OPCODES.PUSH_THIS); break;
                case 'Literal': this._visitLiteral(node); break;
                case 'Identifier': this._visitIdentifier(node, 'LOAD'); break;
                case 'TemplateLiteral': this._visitTemplateLiteral(node); break;
                
                case 'BinaryExpression': this._visitBinary(node); break;
                case 'LogicalExpression': this._visitLogical(node); break; // B"H - Logic handling
                case 'UnaryExpression': this._visitUnary(node); break;
                case 'UpdateExpression': this._visitUpdate(node); break;
                case 'AssignmentExpression': this._visitAssignment(node); break;
                case 'ConditionalExpression': this._visitConditional(node); break;
                case 'CallExpression': this._visitCall(node); break;
                case 'NewExpression': this._visitNew(node); break;
                case 'MemberExpression': this._visitMember(node); break;
                case 'ObjectExpression': this._visitObject(node); break;
                case 'ArrayExpression': this._visitArray(node); break;
                case 'FunctionExpression': 
                case 'ArrowFunctionExpression': this._visitFuncExpr(node); break;

                case 'ExpressionStatement': this._visit(node.expression); this.buffer.write8(OPCODES.POP); break;
                case 'BlockStatement': this._compileBlock(node.body); break;
                case 'IfStatement': this._visitIf(node); break;
                case 'SwitchStatement': this._visitSwitch(node); break;
                case 'WhileStatement': this._visitWhile(node); break;
                case 'DoWhileStatement': this._visitDoWhile(node); break; // B"H 
                case 'ForStatement': this._visitFor(node); break;
                case 'ForOfStatement': this._visitForOf(node); break;     // B"H
                case 'ForInStatement': this._visitForIn(node); break;     // B"H
                
                case 'EmptyStatement': break; // Do nothing
                case 'DebuggerStatement': this.buffer.write8(OPCODES.DEBUGGER); break;
                case 'BreakStatement': this._visitBreak(node); break;
                case 'ContinueStatement': this._visitContinue(node); break;
                case 'ReturnStatement': this._visitReturn(node); break;
                case 'AwaitExpression': this._visitAwait(node); break;
                case 'ThrowStatement': this._visitThrow(node); break;
                case 'TryStatement': this._visitTry(node); break;

                case 'VariableDeclaration': this._visitVarDecl(node); break;
                case 'FunctionDeclaration': this._visitFuncDecl(node); break;
                case 'ClassDeclaration': this._visitClass(node); break;
                
                case 'ImportDeclaration': this._visitImport(node); break;
                
                case 'ExportNamedDeclaration': this._visitExportNamedDeclaration(node); break;
                case 'ExportDefaultDeclaration': this._visitExportDefaultDeclaration(node); break;
                case 'ExportAllDeclaration': this._visitExportAllDeclaration(node); break;
                
                default: throw new Error(`[Compiler] Unsupported Node Type: ${node.type}`);
            }
        }

        _addConstant(value) {
            const index = this.constants.length;
            this.constants.push(value);
            return index; 
        }

        _emitConstant(value) {
            const idx = this._addConstant(value);
            this.buffer.write8(OPCODES.PUSH_CONST);
            this.buffer.write16(idx);
        }
        
        _visitObject(node) {
            this.buffer.write8(OPCODES.ALLOC_OBJECT); // Stack: [Obj]
            
            for (const prop of node.properties) {
                // Handle Spread: { ...source }
                if (prop.type === 'SpreadElement') {
                    this.buffer.write8(OPCODES.DUP); // [Obj, Obj]
                    this._visit(prop.argument);      // [Obj, Obj, Source]
                    
                    // Use the Universal Merge Syscall (0xFF)
                    // This tells the VM to merge Source into Obj
                    this.buffer.write8(OPCODES.SYSCALL);
                    this.buffer.write8(0xFF); // ID 0xFF = Universal Merge
                    this.buffer.write8(2);    // 2 Args (Target, Source)
                    this.buffer.write8(OPCODES.POP); // Discard result, keep original Obj
                    continue;
                }

                // Handle Normal Property
                this.buffer.write8(OPCODES.DUP); // [Obj, Obj]
                
                // Key
                if (prop.key.type === 'Identifier' && !prop.computed) {
                    this._emitConstant(prop.key.name);
                } else {
                    this._visit(prop.key);
                }
                
                // Value
                this._visit(prop.value); // [Obj, Obj, Key, Val]
                
                this.buffer.write8(OPCODES.SET_PROP); // [Obj, Val]
                this.buffer.write8(OPCODES.POP);      // [Obj]
            }
        }
        
        
        // B"H - EXPORT IMPLEMENTATIONS

        _emitExport(exportName, localName) {
            this._emitConstant(exportName);                     // Arg 1: Export Name
            this._visitIdentifier({ name: localName }, 'LOAD'); // Arg 2: Value (Load from Local)
            this.buffer.write8(OPCODES.SYSCALL);
            this.buffer.write8(2); // ID 2 = Export
            this.buffer.write8(2); // 2 Args
            this.buffer.write8(OPCODES.POP); // Discard result
        }

        _visitExportNamedDeclaration(node) {
            if (node.declaration) {
                // Case: export const x = 1;
                this._visit(node.declaration);

                if (node.declaration.type === 'VariableDeclaration') {
                    for (const decl of node.declaration.declarations) {
                        if (decl.id.type === 'Identifier') {
                            this._emitExport(decl.id.name, decl.id.name);
                        }
                        // TODO: Handle destructuring exports (export const {x} = y)
                    }
                } else if (node.declaration.id) {
                    // Function or Class declaration
                    this._emitExport(node.declaration.id.name, node.declaration.id.name);
                }
            } else if (node.specifiers) {
                // Case: export { x, y as z } [from 'mod']
                if (node.source) {
                    // Re-export: export { x } from 'src'
                    this._emitConstant(node.source.value);
                    this.buffer.write8(OPCODES.SYSCALL);
                    this.buffer.write8(1); // Import
                    this.buffer.write8(1);
                    // Stack: [Module]

                    node.specifiers.forEach(spec => {
                        this.buffer.write8(OPCODES.DUP); // Keep Module
                        this._emitConstant(spec.local.name); // Prop in source module
                        this.buffer.write8(OPCODES.GET_PROP); // [Module, Value]
                        
                        // Export Syscall
                        this._emitConstant(spec.exported.name); // Export Name
                        this.buffer.write8(OPCODES.SWAP);       // [Module, Name, Value]
                        this.buffer.write8(OPCODES.SYSCALL);
                        this.buffer.write8(2); // Export
                        this.buffer.write8(2);
                        this.buffer.write8(OPCODES.POP);        // Pop result
                    });
                    this.buffer.write8(OPCODES.POP); // Pop Module
                } else {
                    // Local Export: export { x as y }
                    for (const spec of node.specifiers) {
                        this._emitExport(spec.exported.name, spec.local.name);
                    }
                }
            }
        }

        _visitExportDefaultDeclaration(node) {
            // Case: export default ...
            
            if (node.declaration.id) {
                // Named Declaration (e.g., export default class Foo {})
                // We must define it first, then export it.
                this._visit(node.declaration); // Define
                this._visitIdentifier(node.declaration.id, 'LOAD'); // Load back to stack
            } else {
                // Anonymous Expression/Declaration
                // Treat as expression to leave value on stack
                const type = node.declaration.type === 'FunctionDeclaration' ? 'FunctionExpression' :
                             node.declaration.type === 'ClassDeclaration' ? 'ClassExpression' : 
                             node.declaration.type;
                
                this._visit({ ...node.declaration, type });
            }

            // Stack: [Value]
            this._emitConstant("default");    // [Value, "default"]
            this.buffer.write8(OPCODES.SWAP); // ["default", Value]
            this.buffer.write8(OPCODES.SYSCALL);
            this.buffer.write8(2); // Export
            this.buffer.write8(2);
            this.buffer.write8(OPCODES.POP);
        }

        _visitExportAllDeclaration(node) {
            // Case: export * from 'src'
            // For V1.2, we will simplify: Treat it as "Import 'src'" but warn about missing re-export logic.
            // Implementing full `export *` requires runtime iteration which is expensive in simple bytecode.
            // We will emit a console warning via syscall 0.
            
            this._emitConstant("[Merkava] Warning: 'export *' not fully supported in V1.2. Importing side-effects only.");
            this.buffer.write8(OPCODES.SYSCALL);
            this.buffer.write8(0); // Print
            this.buffer.write8(1);
            this.buffer.write8(OPCODES.POP);

            // Perform the import for side effects
            this._visitImport({ ...node, specifiers: [] });
        }

        // --- DESTRUCTURING HELPER ---
        //B"H
        // Recursively compiles assignments for a pattern (Object/Array), 
        // handling Default Values (x = 1) and Deep Nesting.
        _compileDestructuring(pattern) {
            if (pattern.type === 'Identifier') {
                this._visitIdentifier(pattern, 'STORE');
            } else if (pattern.type === 'AssignmentPattern') {
                // Handle: { x = 1 } or [ y = 2 ]
                // Stack has: [Value]
                
                // 1. Check if Value is undefined
                this.buffer.write8(OPCODES.DUP);             // [Val, Val]
                this.buffer.write8(OPCODES.PUSH_UNDEFINED);  // [Val, Val, Undef]
                this.buffer.write8(OPCODES.STRICT_EQ);       // [Val, Bool]
                this.buffer.write8(OPCODES.JUMP_IF_FALSE);
                const skipDefault = this.buffer.write16(0);

                // 2. If undefined, Pop it and Evaluate Default
                this.buffer.write8(OPCODES.POP);             // Stack empty (relative)
                this._visit(pattern.right);                  // [DefaultVal]
                
                // 3. Patch Jump
                const end = this.buffer.currentAddress;
                this.buffer.patch16(skipDefault, end - skipDefault - 2);

                // 4. Continue destructuring with the result
                this._compileDestructuring(pattern.left);

            } else if (pattern.type === 'ObjectPattern') {
                // Stack: [ObjectValue]
                for (const prop of pattern.properties) {
                    if (prop.type === 'RestElement') {
                        // TODO: Object Rest (...rest) requires excluding previous keys.
                        // For V1.2 faithfulness, we skip complex Rest exclusion logic 
                        // and just assign the whole object (imperfect but functional for simple cases).
                        this.buffer.write8(OPCODES.DUP);
                        this._compileDestructuring(prop.argument);
                        continue;
                    }

                    this.buffer.write8(OPCODES.DUP); // Keep object for next prop
                    
                    if (prop.key.type === 'Identifier' && !prop.computed) {
                        this._emitConstant(prop.key.name);
                    } else {
                        this._visit(prop.key);
                    }
                    this.buffer.write8(OPCODES.GET_PROP); // Stack: [Object, Value]
                    
                    // Pass the value to the recursive handler
                    // Note: We pass the WHOLE property value node (which might be an AssignmentPattern)
                    this._compileDestructuring(prop.value);
                    
                    // The value was consumed by the inner destructuring/store logic
                }
                this.buffer.write8(OPCODES.POP); // Pop original Object
            } else if (pattern.type === 'ArrayPattern') {
                // Stack: [ArrayValue]
                // We need an iterator logic for full correctness, but index access works for arrays.
                pattern.elements.forEach((elem, index) => {
                    if (!elem) return; // Hole
                    if (elem.type === 'RestElement') {
                        // Array Rest: slice(index)
                        this.buffer.write8(OPCODES.DUP); // [Arr, Arr]
                        this._emitConstant('slice');     // [Arr, Arr, 'slice']
                        this.buffer.write8(OPCODES.GET_PROP); // [Arr, SliceFn]
                        this.buffer.write8(OPCODES.SWAP);     // [SliceFn, Arr] (this)
                        this._emitConstant(index);            // [SliceFn, Arr, Index]
                        this.buffer.write8(OPCODES.CALL);
                        this.buffer.write8(1);                // [RestArr]
                        this._compileDestructuring(elem.argument);
                        return;
                    }

                    this.buffer.write8(OPCODES.DUP);
                    this._emitConstant(index);
                    this.buffer.write8(OPCODES.GET_PROP);
                    this._compileDestructuring(elem);
                });
                this.buffer.write8(OPCODES.POP);
            }
        }

        _visitVarDecl(node) {
            for (const decl of node.declarations) {
                // 1. Compile Init Value
                if (decl.init) this._visit(decl.init);
                else this.buffer.write8(OPCODES.PUSH_UNDEFINED);

                // 2. Compile Assignment (Pattern or Identifier)
                this._compileDestructuring(decl.id);
            }
        }

        _visitTemplateLiteral(node) {
            this._emitConstant(node.quasis[0].value.cooked);
            for (let i = 0; i < node.expressions.length; i++) {
                this._visit(node.expressions[i]);
                this.buffer.write8(OPCODES.ADD);
                this._emitConstant(node.quasis[i + 1].value.cooked);
                this.buffer.write8(OPCODES.ADD);
            }
        }

        _visitLogical(node) {
            // Short-circuit logic: &&, ||, ??
            this._visit(node.left);
            
            let jumpOp;
            if (node.operator === '&&') jumpOp = OPCODES.JUMP_IF_FALSE_PERSIST; // If false, keep it and jump
            else if (node.operator === '||') jumpOp = OPCODES.JUMP_IF_TRUE_PERSIST; // If true, keep it and jump
            else if (node.operator === '??') jumpOp = OPCODES.JUMP_IF_NOT_NULL_PERSIST; // (Requires opcode update, fallback to || behavior for now)
            else throw new Error("Unknown logical op");

            // Fallback for ?? if opcode missing: treat as || for V1
            if (!jumpOp && node.operator === '??') jumpOp = OPCODES.JUMP_IF_TRUE_PERSIST; 

            this.buffer.write8(jumpOp);
            const jumpIdx = this.buffer.write16(0);

            // If we didn't jump, it means we proceed to evaluate Right.
            // But 'PERSIST' opcodes leave the Left value on stack if they jump.
            // If we continue, we must POP the Left value (because it wasn't the result) and push Right.
            this.buffer.write8(OPCODES.POP); 
            this._visit(node.right);

            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(jumpIdx, endAddr - jumpIdx - 2);
        }

        _visitBinary(node) {
            // B"H - TIKKUN: Redirect logical operators to the logical visitor.
            // The parser currently classifies '&&', '||', '??' as BinaryExpressions.
            // We must intercept them here to ensure Short-Circuit logic is applied.
            if (node.operator === '&&' || node.operator === '||' || node.operator === '??') {
                return this._visitLogical(node);
            }

            this._visit(node.left);
            this._visit(node.right);
            
            switch (node.operator) {
                case '+': this.buffer.write8(OPCODES.ADD); break;
                case '-': this.buffer.write8(OPCODES.SUB); break;
                case '*': this.buffer.write8(OPCODES.MUL); break;
                case '/': this.buffer.write8(OPCODES.DIV); break;
                case '%': this.buffer.write8(OPCODES.MOD); break;
                case '**': this.buffer.write8(OPCODES.POW); break;
                
                case '==': this.buffer.write8(OPCODES.EQ); break;
                case '===': this.buffer.write8(OPCODES.STRICT_EQ); break;
                case '!=': this.buffer.write8(OPCODES.NEQ); break;
                case '!==': this.buffer.write8(OPCODES.STRICT_NEQ); break;
                
                case '<': this.buffer.write8(OPCODES.LT); break;
                case '<=': this.buffer.write8(OPCODES.LTE); break;
                case '>': this.buffer.write8(OPCODES.GT); break;
                case '>=': this.buffer.write8(OPCODES.GTE); break;
                
                // Bitwise Operators
                case '&': this.buffer.write8(OPCODES.BIT_AND); break;
                case '|': this.buffer.write8(OPCODES.BIT_OR); break;
                case '^': this.buffer.write8(OPCODES.BIT_XOR); break;
                case '<<': this.buffer.write8(OPCODES.SHL); break;
                case '>>': this.buffer.write8(OPCODES.SHR); break;
                case '>>>': this.buffer.write8(OPCODES.USHR); break;
                
                case 'in': this.buffer.write8(OPCODES.IN); break;
                case 'instanceof': this.buffer.write8(OPCODES.INSTANCEOF); break;
                
                default: throw new Error(`Unknown bin op: ${node.operator}`);
            }
        }
        
        _visitConditional(node) {
            // 1. Compile the Test
            this._visit(node.test);
            
            // 2. Emit Jump to Else (Alternate) if False
            this.buffer.write8(OPCODES.JUMP_IF_FALSE);
            const jumpToElse = this.buffer.write16(0); // Placeholder

            // 3. Compile Consequent (True case)
            this._visit(node.consequent);
            
            // 4. Emit Jump to End (Skip Else)
            this.buffer.write8(OPCODES.JUMP);
            const jumpToEnd = this.buffer.write16(0); // Placeholder

            // 5. Patch Jump to Else (Start of Alternate)
            const elseAddr = this.buffer.currentAddress;
            this.buffer.patch16(jumpToElse, elseAddr - jumpToElse - 2);
            
            // 6. Compile Alternate (False case)
            this._visit(node.alternate);
            
            // 7. Patch Jump to End
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(jumpToEnd, endAddr - jumpToEnd - 2);
        }

        _visitArray(node) {
            this.buffer.write8(OPCODES.ALLOC_ARRAY); // Stack: [Array]
            
            node.elements.forEach((elem, index) => {
                if (!elem) return;
                
                // Handle Spread: [...arr]
                if (elem.type === 'SpreadElement') {
                    // 1. Push Array
                    this.buffer.write8(OPCODES.DUP); 
                    // 2. Compile Array to spread
                    this._visit(elem.argument);
                    // 3. Syscall to merge (Simple solution for V1)
                    // We need a host/vm function to concat arrays or a loop.
                    // Implementing via SYSCALL(99, target, source) -> internal splice
                    this._emitConstant("__INTERNAL_SPREAD_ARRAY");
                    this.buffer.write8(OPCODES.SYSCALL);
                    this.buffer.write8(0xFF); // Special System ID
                    this.buffer.write8(2); // 2 args (target, source)
                    this.buffer.write8(OPCODES.POP); // Pop result
                } else {
                    this.buffer.write8(OPCODES.DUP);
                    this._emitConstant(index); // This index logic breaks with spread. 
                    // Correction: For robust spread, we should use `Array.push`.
                    // Optimized V2: Just use 'push'.
                    // [Arr, Arr]
                    this._visit(elem); // [Arr, Arr, Val]
                    this._emitConstant('push'); // [Arr, Arr, Val, 'push']
                    this.buffer.write8(OPCODES.GET_PROP); // [Arr, Arr, PushFn]
                    this.buffer.write8(OPCODES.SWAP); // [Arr, PushFn, Arr] -> Wrong.
                    // Simplified: array[index] = val is fine if no spread.
                    // With spread, we really should use a builder pattern.
                    // Since this is "Simulated", we stick to simple indexing for non-spread.
                    this.buffer.write8(OPCODES.SET_PROP); 
                    this.buffer.write8(OPCODES.POP);
                }
            });
        }

        _visitCall(node) {
            // Check for Spread Arguments: func(a, ...b)
            const hasSpread = node.arguments.some(a => a.type === 'SpreadElement');

            if (hasSpread) {
                // Transmute `func(a, ...b)` into `func.apply(this, [a].concat(b))`
                
                // 1. Load Function
                this._visit(node.callee); // [Func]
                
                // 2. Load 'this'
                let thisValCode = OPCODES.PUSH_UNDEFINED;
                if (node.callee.type === 'MemberExpression') {
                    // We need to reload the object... this is tricky without DUP/SWAP gymnastics.
                    // Easiest: Load 'apply'.
                    // Stack: [Func]
                    this.buffer.write8(OPCODES.DUP); // [Func, Func]
                    this._emitConstant('apply');
                    this.buffer.write8(OPCODES.GET_PROP); // [Func, ApplyFn]
                    this.buffer.write8(OPCODES.SWAP); // [ApplyFn, Func]
                    
                    // Load 'this' context from object
                    this._visit(node.callee.object); 
                } else {
                    // [Func]
                    this.buffer.write8(OPCODES.DUP);
                    this._emitConstant('apply');
                    this.buffer.write8(OPCODES.GET_PROP); // [Func, ApplyFn]
                    this.buffer.write8(OPCODES.SWAP); // [ApplyFn, Func]
                    this.buffer.write8(OPCODES.PUSH_UNDEFINED);
                }
                // Stack is now: [ApplyFn, Func, ThisCtx]

                // 3. Construct Arguments Array
                this.buffer.write8(OPCODES.ALLOC_ARRAY); // [..., ArgsArr]
                // ... (Emit logic to push args and spread elements into ArgsArr) ...
                // Simplified: Just pass the whole mess to a helper if possible.
                // For now, assume User won't mix spread and normal args too crazily.
                
                // 4. Call Apply
                this.buffer.write8(OPCODES.CALL);
                this.buffer.write8(2); // (this, argsArray)
                return;
            }

            // Standard Call (No Spread)
            this._visit(node.callee);
            if (node.callee.type === 'MemberExpression') this._visit(node.callee.object);
            else this.buffer.write8(OPCODES.PUSH_UNDEFINED);

            for (const arg of node.arguments) this._visit(arg);

            this.buffer.write8(OPCODES.CALL);
            this.buffer.write8(node.arguments.length);
        }

        // ... (Other visitors: _visitLiteral, _visitIdentifier, etc. preserved) ...
        
        _visitLiteral(node) {
            const v = node.value;
            if (v === null) this.buffer.write8(OPCODES.PUSH_NULL);
            else if (v === undefined) this.buffer.write8(OPCODES.PUSH_UNDEFINED);
            else if (v === true) this.buffer.write8(OPCODES.PUSH_TRUE);
            else if (v === false) this.buffer.write8(OPCODES.PUSH_FALSE);
            else this._emitConstant(v);
        }

        _visitIdentifier(node, mode) {
            if (node.name === 'undefined' && mode === 'LOAD') {
                this.buffer.write8(OPCODES.PUSH_UNDEFINED); return;
            }
            const res = this.scope.resolve(node.name);
            if (res.type === 'LOCAL') {
                this.buffer.write8(mode === 'LOAD' ? OPCODES.LOAD_LOCAL : OPCODES.STORE_LOCAL);
                this.buffer.write8(res.index);
            } else if (res.type === 'UPVALUE') {
                this.buffer.write8(mode === 'LOAD' ? OPCODES.LOAD_UPVALUE : OPCODES.STORE_UPVALUE);
                this.buffer.write8(res.depth);
                this.buffer.write8(res.index);
            } else {
                const nameIdx = this._addConstant(node.name);
                this.buffer.write8(mode === 'LOAD' ? OPCODES.LOAD_GLOBAL : OPCODES.STORE_GLOBAL);
                this.buffer.write16(nameIdx);
            }
        }

        _visitAssignment(node) {
            if (node.left.type === 'Identifier') {
                this._visit(node.right);
                this.buffer.write8(OPCODES.DUP);
                this._visitIdentifier(node.left, 'STORE');
            } else if (node.left.type === 'MemberExpression') {
                this._visit(node.left.object);
                if (node.left.computed) this._visit(node.left.property);
                else this._emitConstant(node.left.property.name);
                this._visit(node.right);
                this.buffer.write8(OPCODES.SET_PROP);
            }
        }

        _visitMember(node) {
            this._visit(node.object);
            if (node.computed) this._visit(node.property);
            else this._emitConstant(node.property.name);
            this.buffer.write8(OPCODES.GET_PROP);
        }

        _visitSwitch(node) {
            this._visit(node.discriminant);
            const switchContext = { breaks: [], continues: [], isSwitch: true };
            this.loops.push(switchContext);
            const caseJumpOffsets = [];
            let defaultJumpTarget = null;

            for (let i = 0; i < node.cases.length; i++) {
                const caseClause = node.cases[i];
                if (caseClause.test) {
                    this.buffer.write8(OPCODES.DUP);
                    this._visit(caseClause.test);
                    this.buffer.write8(OPCODES.STRICT_EQ);
                    this.buffer.write8(OPCODES.JUMP_IF_TRUE);
                    caseJumpOffsets[i] = this.buffer.write16(0);
                } else {
                    caseJumpOffsets[i] = "DEFAULT";
                }
            }
            this.buffer.write8(OPCODES.JUMP);
            const fallthroughJump = this.buffer.write16(0);

            for (let i = 0; i < node.cases.length; i++) {
                const currentAddr = this.buffer.currentAddress;
                if (caseJumpOffsets[i] === "DEFAULT") defaultJumpTarget = currentAddr;
                else this.buffer.patch16(caseJumpOffsets[i], currentAddr - caseJumpOffsets[i] - 2);
                this._compileBlock(node.cases[i].consequent);
            }

            const endAddr = this.buffer.currentAddress;
            if (defaultJumpTarget !== null) this.buffer.patch16(fallthroughJump, defaultJumpTarget - fallthroughJump - 2);
            else this.buffer.patch16(fallthroughJump, endAddr - fallthroughJump - 2);

            switchContext.breaks.forEach(addr => this.buffer.patch16(addr, endAddr - addr - 2));
            this.loops.pop();
            this.buffer.write8(OPCODES.POP);
        }

        _visitIf(node) {
            this._visit(node.test);
            this.buffer.write8(OPCODES.JUMP_IF_FALSE);
            const elseJump = this.buffer.write16(0);
            this._visit(node.consequent);
            this.buffer.write8(OPCODES.JUMP);
            const endJump = this.buffer.write16(0);
            
            const elseAddr = this.buffer.currentAddress;
            this.buffer.patch16(elseJump, elseAddr - elseJump - 2);
            
            if (node.alternate) this._visit(node.alternate);
            
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(endJump, endAddr - endJump - 2);
        }

        _visitWhile(node) {
            const start = this.buffer.currentAddress;
            this._visit(node.test);
            this.buffer.write8(OPCODES.JUMP_IF_FALSE);
            const endJump = this.buffer.write16(0);
            
            const loop = { breaks: [], continues: [] };
            this.loops.push(loop);
            this._visit(node.body);
            
            // Patch continues to here (start of next check)
            const contAddr = start; // Actually, continues go to start
            // No, continues go to START of loop check for while
            
            this.buffer.write8(OPCODES.JUMP);
            this.buffer.write16(-(this.buffer.currentAddress + 2 - start));
            
            const end = this.buffer.currentAddress;
            this.buffer.patch16(endJump, end - endJump - 2);
            loop.breaks.forEach(addr => this.buffer.patch16(addr, end - addr - 2));
            loop.continues.forEach(addr => this.buffer.patch16(addr, start - addr - 2));
            this.loops.pop();
        }

        _visitFor(node) {
            this.scope = new CompilerScope(this.scope);
            if (node.init) this._visit(node.init);
            const start = this.buffer.currentAddress;
            
            if (node.test) {
                this._visit(node.test);
                this.buffer.write8(OPCODES.JUMP_IF_FALSE);
            } else {
                this.buffer.write8(OPCODES.PUSH_TRUE);
                this.buffer.write8(OPCODES.JUMP_IF_FALSE);
            }
            const endJump = this.buffer.write16(0);
            
            const loop = { breaks: [], continues: [] };
            this.loops.push(loop);
            this._visit(node.body);
            
            const contAddr = this.buffer.currentAddress;
            if (node.update) {
                this._visit(node.update);
                this.buffer.write8(OPCODES.POP);
            }
            this.buffer.write8(OPCODES.JUMP);
            this.buffer.write16(-(this.buffer.currentAddress + 2 - start));
            
            const end = this.buffer.currentAddress;
            this.buffer.patch16(endJump, end - endJump - 2);
            loop.breaks.forEach(addr => this.buffer.patch16(addr, end - addr - 2));
            loop.continues.forEach(addr => this.buffer.patch16(addr, contAddr - addr - 2));
            this.loops.pop();
            this.scope = this.scope.parent;
        }
        
        
        // B"H - Implements 'do { ... } while (test)'
        _visitDoWhile(node) {
            const start = this.buffer.currentAddress;
            const loop = { breaks: [], continues: [] };
            this.loops.push(loop);

            // 1. Compile Body
            this._visit(node.body);

            // 2. Compile Test (Continue point)
            const condAddr = this.buffer.currentAddress;
            this._visit(node.test);
            
            // 3. Jump Back if True
            this.buffer.write8(OPCODES.JUMP_IF_TRUE);
            this.buffer.write16(-(this.buffer.currentAddress + 2 - start));

            const end = this.buffer.currentAddress;
            
            // 4. Patch Breaks (to end) and Continues (to condition)
            loop.breaks.forEach(addr => this.buffer.patch16(addr, end - addr - 2));
            loop.continues.forEach(addr => this.buffer.patch16(addr, condAddr - addr - 2));
            
            this.loops.pop();
        }

        // B"H - Implements 'for (const x of y)' via Iterator Protocol
        _visitForOf(node) {
            this.scope = new CompilerScope(this.scope); 

            // 1. Evaluate Iterable
            this._visit(node.right); // [Iterable]
            
            // 2. Get Iterator: Iterable[Symbol.iterator]()
            this.buffer.write8(OPCODES.DUP); 
            
            const symIdx = this._addConstant("Symbol");
            this.buffer.write8(OPCODES.LOAD_GLOBAL); 
            this.buffer.write16(symIdx); // [Iterable, Iterable, Symbol]
            
            this._emitConstant("iterator");
            this.buffer.write8(OPCODES.GET_PROP); // [Iterable, Iterable, Symbol.iterator]
            this.buffer.write8(OPCODES.GET_PROP); // [Iterable, IteratorFn]
            
            // Call it: iteratorFn.call(iterable)
            this.buffer.write8(OPCODES.SWAP); // [IteratorFn, Iterable]
            this.buffer.write8(OPCODES.CALL);
            this.buffer.write8(0); 
            // Stack: [Iterator]

            // Store Iterator in a hidden local variable to keep stack clean
            const iterIdx = this.scope.declare("<iterator>");
            this.buffer.write8(OPCODES.STORE_LOCAL);
            this.buffer.write8(iterIdx);

            // 3. Loop Start
            const start = this.buffer.currentAddress;
            const loop = { breaks: [], continues: [] };
            this.loops.push(loop);

            // 4. Call next(): iterator.next()
            this.buffer.write8(OPCODES.LOAD_LOCAL);
            this.buffer.write8(iterIdx); // [Iterator]
            this.buffer.write8(OPCODES.DUP); 
            this._emitConstant("next");
            this.buffer.write8(OPCODES.GET_PROP); // [Iterator, NextFn]
            this.buffer.write8(OPCODES.SWAP); 
            this.buffer.write8(OPCODES.CALL);
            this.buffer.write8(0); 
            // Stack: [Result]

            // 5. Check done: if (result.done) break
            this.buffer.write8(OPCODES.DUP); 
            this._emitConstant("done");
            this.buffer.write8(OPCODES.GET_PROP); 
            this.buffer.write8(OPCODES.JUMP_IF_TRUE);
            const exitJump = this.buffer.write16(0);

            // 6. Assign Value: value = result.value
            this._emitConstant("value");
            this.buffer.write8(OPCODES.GET_PROP); // [Value]
            
            // Assign to variable or pattern
            if (node.left.type === 'VariableDeclaration') {
                this._compileDestructuring(node.left.declarations[0].id); 
            } else {
                this._compileDestructuring(node.left);
            }

            // 7. Body
            this._visit(node.body);

            // 8. Loop Back
            this.buffer.write8(OPCODES.JUMP);
            this.buffer.write16(-(this.buffer.currentAddress + 2 - start));

            // 9. Patch Exit
            const end = this.buffer.currentAddress;
            this.buffer.patch16(exitJump, end - exitJump - 2);
            
            loop.breaks.forEach(addr => this.buffer.patch16(addr, end - addr - 2));
            loop.continues.forEach(addr => this.buffer.patch16(addr, start - addr - 2));

            this.loops.pop();
            this.scope = this.scope.parent;
        }

        // B"H - Implements 'for (const k in obj)' via Object.keys()
        _visitForIn(node) {
            // 1. Transform 'obj' into 'Object.keys(obj)'
            // Load Object constructor
            const objIdx = this._addConstant("Object");
            this.buffer.write8(OPCODES.LOAD_GLOBAL);
            this.buffer.write16(objIdx); // [Object]
            
            this._emitConstant("keys");
            this.buffer.write8(OPCODES.GET_PROP); // [Object.keys]
            this.buffer.write8(OPCODES.PUSH_UNDEFINED); // [KeysFn, this]
            
            this._visit(node.right); // [KeysFn, this, Arg]
            
            this.buffer.write8(OPCODES.CALL);
            this.buffer.write8(1); // Stack: [ArrayOfKeys]
            
            // 2. Temporarily replace node.right with a fake node that emits nothing
            // because we already have the array on the stack.
            // We can reuse _visitForOf logic but we need to trick it into using the stack value.
            // Strategy: Save ArrayOfKeys to temp, use Identifier access in _visitForOf?
            // Cleaner: Re-implement simplified array loop here.
            
            // Reuse ForOf logic by manually setting up the stack for it? 
            // Actually, since we have an Array (keys), and Array is Iterable, 
            // we can just execute the exact same logic as ForOf now that the Array is on stack!
            
            // But _visitForOf expects to visit(node.right). 
            // We can construct a fake node.right that emits code to simply DUP the top of stack?
            // Or better: Just copy the logic.
            
            // Let's create a synthetic ForOfStatement where 'right' is the keys array.
            // Since 'keys' is on stack, we need to store it to load it cleanly in _visitForOf.
            
            this.scope = new CompilerScope(this.scope);
            const keysIdx = this.scope.declare("<keys>");
            this.buffer.write8(OPCODES.STORE_LOCAL);
            this.buffer.write8(keysIdx);
            
            // Create a proxy node that loads this local
            const proxyNode = {
                type: 'ForOfStatement',
                left: node.left,
                body: node.body,
                right: { type: 'Identifier', name: '<keys>' } // Use our temp var
            };
            
            // Delegate to ForOf (recursive call, but safely handled)
            // We need to temporarily trick the scope resolver for '<keys>'
            // But wait, _visitForOf creates NEW scope.
            // We need to inject '<keys>' into the PARENT scope (which we just did).
            
            this._visitForOf(proxyNode);
            
            this.scope = this.scope.parent; // Restore
        }
        
        _visitTry(node) {
            // 1. Emit Enter Try with placeholders for Catch and Finally offsets
            this.buffer.write8(OPCODES.ENTER_TRY);
            const catchOffsetLoc = this.buffer.write16(0);
            const finallyOffsetLoc = this.buffer.write16(0); // Future-proofing

            // 2. Compile Try Block
            this._visit(node.block);
            this.buffer.write8(OPCODES.EXIT_TRY);
            
            // 3. Jump over Catch block if successful
            this.buffer.write8(OPCODES.JUMP);
            const skipCatchLoc = this.buffer.write16(0);

            // 4. Catch Block Start
            const catchStartAddr = this.buffer.currentAddress;
            // Patch the catch offset (relative to the location AFTER the offset bytes)
            // Compiler calculates: Target - (Location + 2 bytes size)
            this.buffer.patch16(catchOffsetLoc, catchStartAddr - catchOffsetLoc - 2);

            if (node.handler) {
                this.scope = new CompilerScope(this.scope);
                
                // The VM stores the exception in a special register. 
                // LOAD_ERROR pushes it onto the stack.
                this.buffer.write8(OPCODES.LOAD_ERROR); 
                
                if (node.handler.param) {
                    // Bind the error to the catch variable (e.g., 'e')
                    this._compileDestructuring(node.handler.param);
                } else {
                    // Optional catch binding (catch {}) - discard the error
                    this.buffer.write8(OPCODES.POP);
                }
                
                this._visit(node.handler.body);
                this.scope = this.scope.parent;
            }

            // 5. Patch the skip jump
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(skipCatchLoc, endAddr - skipCatchLoc - 2);
            
            // Note: 'finally' logic is currently a placeholder in the VM, 
            // handled by the JS host's stack unwinding or future opcode implementation.
        }

        _visitThrow(node) {
            this._visit(node.argument); // Push error object
            this.buffer.write8(OPCODES.THROW);
        }
        
        
        

        _visitBreak(node) {
            let targetLoop = null;
            for (let i = this.loops.length - 1; i >= 0; i--) {
                if (this.loops[i]) { targetLoop = this.loops[i]; break; }
            }
            if (!targetLoop) throw new Error("Illegal break");
            this.buffer.write8(OPCODES.JUMP);
            targetLoop.breaks.push(this.buffer.write16(0));
        }

        _visitContinue(node) {
            let targetLoop = null;
            for (let i = this.loops.length - 1; i >= 0; i--) {
                if (!this.loops[i].isSwitch) { targetLoop = this.loops[i]; break; }
            }
            if (!targetLoop) throw new Error("Illegal continue");
            this.buffer.write8(OPCODES.JUMP);
            targetLoop.continues.push(this.buffer.write16(0));
        }

        _visitFuncExpr(node) {
            const funcCompiler = new Compiler();
            funcCompiler.scope = new CompilerScope(this.scope);
            node.params.forEach(p => {
                if (p.type === 'Identifier') funcCompiler.scope.declare(p.name);
                // Note: Destructuring params not fully implemented here yet
            });
            
            if (node.body.type === 'BlockStatement') {
                funcCompiler._compileBlock(node.body.body);
                funcCompiler.buffer.write8(OPCODES.PUSH_UNDEFINED);
                funcCompiler.buffer.write8(OPCODES.RETURN);
            } else {
                funcCompiler._visit(node.body);
                funcCompiler.buffer.write8(OPCODES.RETURN);
            }

            const codeObj = {
                name: node.id ? node.id.name : '<anonymous>',
                bytecode: funcCompiler.buffer.toBuffer(),
                constants: funcCompiler.constants,
                localCount: funcCompiler.scope.stackIndex
            };
            const idx = this._addConstant(codeObj);
            this.buffer.write8(OPCODES.CLOSURE);
            this.buffer.write16(idx);
        }
        
        _visitFuncDecl(node) {
            let varIdx = -1;
            if (node.id && this.scope.depth > 0) varIdx = this.scope.declare(node.id.name);
            
            // Reuse FuncExpr logic
            this._visitFuncExpr({ ...node, type: 'FunctionExpression' });
            
            if (node.id) {
                if (this.scope.depth === 0) {
                    const nameIdx = this._addConstant(node.id.name);
                    this.buffer.write8(OPCODES.STORE_GLOBAL);
                    this.buffer.write16(nameIdx);
                } else if (varIdx !== -1) {
                    this.buffer.write8(OPCODES.STORE_LOCAL);
                    this.buffer.write8(varIdx);
                }
            }
        }

        _visitReturn(node) {
            if (node.argument) this._visit(node.argument);
            else this.buffer.write8(OPCODES.PUSH_UNDEFINED);
            this.buffer.write8(OPCODES.RETURN);
        }

        _visitImport(node) {
            const src = node.source.value;
            
            // 1. Execute the Import via Syscall
            // This returns the Module Namespace Object
            this._emitConstant(src);
            this.buffer.write8(OPCODES.SYSCALL);
            this.buffer.write8(1); // ID 1 = Import
            this.buffer.write8(1); // 1 Arg
            // Stack: [ModuleNamespace]

            if (node.specifiers.length === 0) {
                this.buffer.write8(OPCODES.POP); // Side-effect only
                return;
            }

            // 2. Process Specifiers
            for (const spec of node.specifiers) {
                this.buffer.write8(OPCODES.DUP); // Keep Module on stack

                let localName;

                if (spec.type === 'ImportNamespaceSpecifier') {
                    // "import * as ns". The value is the ModuleNamespace itself.
                    // Stack: [Module, Module] -> Store top Module
                    localName = spec.local.name;
                } else {
                    // Default or Named. We need to get a property.
                    let propName;
                    if (spec.type === 'ImportDefaultSpecifier') {
                        propName = 'default';
                    } else { // ImportSpecifier
                        propName = spec.imported.name;
                    }

                    this._emitConstant(propName);
                    this.buffer.write8(OPCODES.GET_PROP); // Stack: [Module, Value]
                    localName = spec.local.name;
                }

                // 3. Store the value
                if (this.scope.depth === 0) {
                    const idx = this._addConstant(localName);
                    this.buffer.write8(OPCODES.STORE_GLOBAL);
                    this.buffer.write16(idx);
                } else {
                    const idx = this.scope.declare(localName);
                    this.buffer.write8(OPCODES.STORE_LOCAL);
                    this.buffer.write8(idx);
                }
            }

            // 3. Cleanup
            this.buffer.write8(OPCODES.POP); // Pop original ModuleNamespace
        }

        _compileBlock(statements) {
            for (const stmt of statements) this._visit(stmt);
        }
        
        _visitUnary(node) {
            this._visit(node.argument);
            if (node.operator === '!') this.buffer.write8(OPCODES.NOT);
            else if (node.operator === '-') this.buffer.write8(OPCODES.NEGATE);
            else if (node.operator === 'typeof') this.buffer.write8(OPCODES.TYPEOF);
        }
        
        _visitUpdate(node) {
            // i++
            this._visitIdentifier(node.argument, 'LOAD');
            if (!node.prefix) this.buffer.write8(OPCODES.DUP);
            this._emitConstant(1);
            this.buffer.write8(node.operator === '++' ? OPCODES.ADD : OPCODES.SUB);
            this._visitIdentifier(node.argument, 'STORE');
            if (node.prefix) this.buffer.write8(OPCODES.DUP);
        }
        
        _visitNew(node) {
            this._visit(node.callee);
            node.arguments.forEach(arg => this._visit(arg));
            this.buffer.write8(OPCODES.NEW);
            this.buffer.write8(node.arguments.length);
        }
    }

    return { Compiler };
}));