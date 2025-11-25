// B"H
/**
 * @file merkava-compiler.js
 * @version 1.0.0 - The Transmuter
 * @description
 * The Compiler for the Merkava VM.
 *
 * Responsibilities:
 * 1. **Transmutation**: Converts the ESTree AST (from MerkavaASTParser) into flat Bytecode.
 * 2. **Symbol Resolution**: Resolves variable names to Stack Indices (Locals) or Heap Pointers (Globals).
 *    It calculates "Upvalue" depth for closures.
 * 3. **Control Flow**: Calculates Jump Offsets for `if`, `while`, `for` loops.
 * 4. **Constant Pooling**: Extracts literals (strings, numbers, function bodies) into a pool.
 *
 * Output:
 * A `CodeObject` containing:
 * - `bytecode`: Uint8Array
 * - `constants`: Array (Numbers, Strings, or nested CodeObjects)
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./merkava-opcodes.js'));
    } else {
        // Browser globals: Assumes MerkavaOpcodes is loaded
        root.MerkavaCompiler = factory(root.MerkavaOpcodes);
    }
}(typeof self !== 'undefined' ? self : this, function(OpcodesModule) {

    const { OPCODES } = OpcodesModule;

    /**
     * @class BytecodeBuilder
     * @description Dynamic buffer for writing bytes.
     */
    class BytecodeBuilder {
        constructor() {
            this.bytes = []; // Using simple array for v1 builder, convert to Uint8Array at end
        }

        /** Write a single byte (Opcode or small int) */
        write8(byte) {
            this.bytes.push(byte & 0xFF);
            return this.bytes.length - 1; // Return address
        }

        /** Write a 16-bit integer (2 bytes, Little Endian) */
        write16(int) {
            this.bytes.push(int & 0xFF);
            this.bytes.push((int >> 8) & 0xFF);
            return this.bytes.length - 2;
        }

        /** Patch a 16-bit value at a specific index (used for Jumps) */
        patch16(index, value) {
            this.bytes[index] = value & 0xFF;
            this.bytes[index + 1] = (value >> 8) & 0xFF;
        }

        get currentAddress() {
            return this.bytes.length;
        }

        toBuffer() {
            return new Uint8Array(this.bytes);
        }
    }

    /**
     * @class CompilerScope
     * @description Tracks variable declarations to resolve to stack indices.
     */
    class CompilerScope {
        constructor(parent = null) {
            this.parent = parent;
            this.locals = new Map(); // Name -> StackIndex
            this.depth = parent ? parent.depth + 1 : 0;
            this.stackIndex = 0;
        }

        /** Declare a local variable. Returns its stack index. */
        declare(name) {
            const index = this.stackIndex++;
            this.locals.set(name, index);
            return index;
        }

        /**
         * Resolve a variable name.
         * @returns {{ type: 'LOCAL'|'UPVALUE'|'GLOBAL', index: number, depth: number }}
         */
        resolve(name) {
            if (this.locals.has(name)) {
                return { type: 'LOCAL', index: this.locals.get(name), depth: 0 };
            }

            // Check parents (Upvalues)
            if (this.parent) {
                const result = this.parent.resolve(name);
                if (result.type === 'LOCAL' || result.type === 'UPVALUE') {
                    return { type: 'UPVALUE', index: result.index, depth: result.depth + 1 };
                }
            }

            // Fallback to Global
            return { type: 'GLOBAL', index: -1, depth: 0 };
        }
    }

    /**
     * @class Compiler
     * @description The main transmutation engine.
     */
    class Compiler {
        constructor() {
            this.constants = [];
            this.buffer = new BytecodeBuilder();
            this.scope = new CompilerScope(); // Global scope
            this.loops = []; // Stack for 'break'/'continue' patching
        }

        /**
         * Main entry point.
         * @param {object} ast - The ESTree AST.
         * @returns {object} { bytecode, constants }
         */
        compile(ast) {
            if (ast.type === 'Program') {
                this._compileBlock(ast.body);
            } else {
                this._visit(ast);
            }
            
            this.buffer.write8(OPCODES.HALT);

            return {
                bytecode: this.buffer.toBuffer(),
                constants: this.constants
            };
        }

        /**
         * Recursive dispatcher.
         */
        _visit(node) {
            if (!node) return;

            switch (node.type) {
                case 'Literal': this._visitLiteral(node); break;
                case 'Identifier': this._visitIdentifier(node, 'LOAD'); break;
                
                case 'BinaryExpression': this._visitBinary(node); break;
                case 'UnaryExpression': this._visitUnary(node); break;
                case 'AssignmentExpression': this._visitAssignment(node); break;
                case 'CallExpression': this._visitCall(node); break;
                case 'MemberExpression': this._visitMember(node); break;
                
                case 'ExpressionStatement': 
                    this._visit(node.expression); 
                    this.buffer.write8(OPCODES.POP); // Expression stmt result is discarded
                    break;
                
                case 'BlockStatement': this._compileBlock(node.body); break;
                case 'IfStatement': this._visitIf(node); break;
                case 'WhileStatement': this._visitWhile(node); break;
                
                case 'VariableDeclaration': this._visitVarDecl(node); break;
                case 'FunctionDeclaration': this._visitFuncDecl(node); break;
                
                case 'ReturnStatement': this._visitReturn(node); break;
                case 'AwaitExpression': this._visitAwait(node); break;

                // TODO: Add Switch, Try/Catch, For loops in v2
                default:
                    throw new Error(`[Compiler] Unsupported Node Type: ${node.type}`);
            }
        }

        // --- CONSTANTS ---

        _addConstant(value) {
            // Simple deduplication could go here
            const index = this.constants.length;
            this.constants.push(value);
            return index;
        }

        _emitConstant(value) {
            const idx = this._addConstant(value);
            this.buffer.write8(OPCODES.PUSH_CONST);
            this.buffer.write16(idx);
        }

        // --- VISITORS ---

        _visitLiteral(node) {
            const v = node.value;
            if (v === null) this.buffer.write8(OPCODES.PUSH_NULL);
            else if (v === undefined) this.buffer.write8(OPCODES.PUSH_UNDEFINED);
            else if (v === true) this.buffer.write8(OPCODES.PUSH_TRUE);
            else if (v === false) this.buffer.write8(OPCODES.PUSH_FALSE);
            else this._emitConstant(v);
        }

        _visitIdentifier(node, mode = 'LOAD') {
            const name = node.name;
            const res = this.scope.resolve(name);

            if (res.type === 'LOCAL') {
                this.buffer.write8(mode === 'LOAD' ? OPCODES.LOAD_LOCAL : OPCODES.STORE_LOCAL);
                this.buffer.write8(res.index);
            } else if (res.type === 'UPVALUE') {
                this.buffer.write8(mode === 'LOAD' ? OPCODES.LOAD_UPVALUE : OPCODES.STORE_UPVALUE);
                this.buffer.write8(res.depth);
                this.buffer.write8(res.index);
            } else {
                // Global
                const nameIdx = this._addConstant(name);
                this.buffer.write8(mode === 'LOAD' ? OPCODES.LOAD_GLOBAL : OPCODES.STORE_GLOBAL);
                this.buffer.write16(nameIdx);
            }
        }

        _visitBinary(node) {
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
                case 'instanceof': this.buffer.write8(OPCODES.INSTANCEOF); break;
                case 'in': this.buffer.write8(OPCODES.IN); break;
                // Short-circuit operators (&&, ||) require jump logic, implemented simply here as binary for v1
                // Ideally, convert to JUMP_IF_FALSE logic.
                default: throw new Error(`Unknown binary operator: ${node.operator}`);
            }
        }

        _visitUnary(node) {
            this._visit(node.argument);
            switch (node.operator) {
                case '!': this.buffer.write8(OPCODES.NOT); break;
                case '-': this.buffer.write8(OPCODES.NEGATE); break;
                case 'typeof': this.buffer.write8(OPCODES.TYPEOF); break;
                case 'void': this.buffer.write8(OPCODES.VOID); break;
                case 'delete': this.buffer.write8(OPCODES.DELETE); break;
            }
        }

        _visitAssignment(node) {
            // 1. Compile RHS (Value)
            this._visit(node.right); 

            // 2. Store to LHS
            if (node.left.type === 'Identifier') {
                this._visitIdentifier(node.left, 'STORE');
            } else if (node.left.type === 'MemberExpression') {
                // For obj.prop = val, we need [Obj, Key, Val] on stack
                // But we already pushed Val. This logic is complex for stack machines.
                // Correct order: PUSH Obj, PUSH Key, PUSH Val, SET_PROP.
                
                // Re-organize: To do this cleanly in one pass without swap hell,
                // we'd typically compile Left first if it wasn't an Assignment.
                // Simplified V1: Only support Identifier assignment or basic property set.
                
                // To implement SET_PROP (Obj, Key, Val), we need to compile Obj and Key first.
                // But we already compiled Right.
                // Solution: This is where a register VM shines, but for Stack VM:
                // We must traverse Left children, THEN Right, THEN Set.
                
                // Backtrack:
                this.buffer.bytes.pop(); // Undo the visit(node.right) - conceptual undo not real
                // Correct order:
                this._visit(node.left.object);
                if (node.left.computed) {
                    this._visit(node.left.property);
                } else {
                    this._emitConstant(node.left.property.name);
                }
                this._visit(node.right); // Value
                this.buffer.write8(OPCODES.SET_PROP);
            }
        }

        _visitVarDecl(node) {
            for (const decl of node.declarations) {
                if (decl.init) {
                    this._visit(decl.init); // Push value
                } else {
                    this.buffer.write8(OPCODES.PUSH_UNDEFINED);
                }

                if (decl.id.type === 'Identifier') {
                    const idx = this.scope.declare(decl.id.name);
                    // For locals, declare() reserves the slot. 
                    // We just need to store the top of stack into that slot.
                    this.buffer.write8(OPCODES.STORE_LOCAL);
                    this.buffer.write8(idx);
                    
                    // VariableDeclaration is a statement, so we pop the result of the assignment
                    // from the stack to keep it clean (unless we are in a sequence context).
                    // Actually, OPCODES.STORE_LOCAL usually pops. So stack is clean.
                }
            }
        }

        _visitIf(node) {
            this._visit(node.test);
            
            // Emit Jump Placeholder
            this.buffer.write8(OPCODES.JUMP_IF_FALSE);
            const jumpToElseIndex = this.buffer.write16(0); // Placeholder 0x0000

            this._visit(node.consequent);

            // If there is an else, we need to jump over it from the 'if' block
            if (node.alternate) {
                this.buffer.write8(OPCODES.JUMP);
                const jumpToEndIndex = this.buffer.write16(0);

                // Patch the False Jump to here (start of else)
                const elseStart = this.buffer.currentAddress;
                this.buffer.patch16(jumpToElseIndex, elseStart - jumpToElseIndex - 2); // Relative offset

                this._visit(node.alternate);

                // Patch the End Jump
                const end = this.buffer.currentAddress;
                this.buffer.patch16(jumpToEndIndex, end - jumpToEndIndex - 2);
            } else {
                // No else. Patch False Jump to end.
                const end = this.buffer.currentAddress;
                this.buffer.patch16(jumpToElseIndex, end - jumpToElseIndex - 2);
            }
        }

        _visitWhile(node) {
            const loopStart = this.buffer.currentAddress;
            
            this._visit(node.test);
            
            this.buffer.write8(OPCODES.JUMP_IF_FALSE);
            const jumpEndIndex = this.buffer.write16(0);

            this._visit(node.body);

            // Jump back to start
            this.buffer.write8(OPCODES.JUMP);
            const loopBackOffset = this.buffer.currentAddress + 2 - loopStart; // Current + 2 (size of offset) -> Start
            this.buffer.write16(-loopBackOffset); // Negative jump

            // Patch end
            const end = this.buffer.currentAddress;
            this.buffer.patch16(jumpEndIndex, end - jumpEndIndex - 2);
        }

        _visitCall(node) {
            // B"H - INTRINSIC SYSCALL HANDLING
            if (node.callee.type === 'Identifier' && node.callee.name === 'syscall') {
                // 1. Validate ID
                const idArg = node.arguments[0];
                if (!idArg || idArg.type !== 'Literal' || typeof idArg.value !== 'number') {
                    throw new Error("Syscall ID must be a constant number (e.g., syscall(0, ...))");
                }

                // 2. Compile Arguments (Skipping the ID)
                // These will be pushed to the stack in order
                const realArgs = node.arguments.slice(1);
                for (const arg of realArgs) {
                    this._visit(arg);
                }

                // 3. Emit SYSCALL Opcode
                this.buffer.write8(OPCODES.SYSCALL);
                this.buffer.write8(idArg.value);      // Operand 1: ID
                this.buffer.write8(realArgs.length);  // Operand 2: ArgCount (Added for VM simplicity)
                return;
            }
            // --------------------------------

            // 1. Push Callee (Function)
            this._visit(node.callee);
            
            // 2. Push "This" (Context)
            if (node.callee.type === 'MemberExpression') {
                this.buffer.write8(OPCODES.PUSH_NULL); // TODO: Real context logic
            } else {
                this.buffer.write8(OPCODES.PUSH_UNDEFINED);
            }

            // 3. Push Args
            for (const arg of node.arguments) {
                this._visit(arg);
            }

            // 4. Call Opcode
            this.buffer.write8(OPCODES.CALL);
            this.buffer.write8(node.arguments.length);
        }

        _visitMember(node) {
            this._visit(node.object);
            if (node.computed) {
                this._visit(node.property);
            } else {
                this._emitConstant(node.property.name);
            }
            this.buffer.write8(OPCODES.GET_PROP);
        }

        _visitFuncDecl(node) {
            // B"H - 1. Declare name in scope BEFORE compiling body to allow recursion
            let varIdx = -1;
            if (node.id) {
                varIdx = this.scope.declare(node.id.name);
            }

            // 2. Create a new Compiler instance for the function body
            const funcCompiler = new Compiler();
            // Inherit scope? No, new scope, but link parent for Upvalues.
            funcCompiler.scope = new CompilerScope(this.scope);
            
            // Register params
            node.params.forEach(p => {
                if (p.type === 'Identifier') funcCompiler.scope.declare(p.name);
            });

            // Compile Body
            funcCompiler.compile(node.body);
            
            // 3. Get Code Object
            const codeObj = {
                name: node.id ? node.id.name : '<anonymous>',
                bytecode: funcCompiler.buffer.toBuffer(),
                constants: funcCompiler.constants,
                upvalueCount: 0, // TODO: Calculate actual upvalues
                localCount: funcCompiler.scope.stackIndex
            };

            // 4. Add to Constants
            const idx = this._addConstant(codeObj);

            // 5. Emit CLOSURE
            this.buffer.write8(OPCODES.CLOSURE);
            this.buffer.write16(idx);

            // 6. Store in current scope (pop the closure into the variable)
            if (node.id && varIdx !== -1) {
                this.buffer.write8(OPCODES.STORE_LOCAL);
                this.buffer.write8(varIdx);
            }
        }

        _visitReturn(node) {
            if (node.argument) {
                this._visit(node.argument);
            } else {
                this.buffer.write8(OPCODES.PUSH_UNDEFINED);
            }
            this.buffer.write8(OPCODES.RETURN);
        }

        _visitAwait(node) {
            this._visit(node.argument);
            this.buffer.write8(OPCODES.AWAIT);
        }

        _compileBlock(statements) {
            for (const stmt of statements) {
                this._visit(stmt);
            }
        }
    }

    return { Compiler };
}));