// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};
    
    // Dependencies
    const getOpcodes = () => (root.MerkavaOpcodes && root.MerkavaOpcodes.OPCODES) || {};
    const Scope = root.MerkavaCompiler.Scope;
    const BytecodeBuilder = root.MerkavaCompiler.BytecodeBuilder;

    class Compiler {
        constructor() {
            this.OPCODES = getOpcodes();
            this.constants = [];
            this.buffer = new BytecodeBuilder();
            this.scope = new Scope(null, true);
            this.loops = [];
        }

        compile(ast) {
            if (ast.type === 'Program') this._compileBlock(ast.body);
            else this._visit(ast);
            this.buffer.write8(this.OPCODES.HALT);
            return { bytecode: this.buffer.toBuffer(), constants: this.constants };
        }

        _visit(node) {
            if (!node) return;
            switch (node.type) {
                case 'ThisExpression': this.buffer.write8(this.OPCODES.PUSH_THIS); break;
                case 'Literal': this._visitLiteral(node); break;
                case 'Identifier': this._visitIdentifier(node, 'LOAD'); break;
                case 'TemplateLiteral': this._visitTemplateLiteral(node); break;
                case 'BinaryExpression': this._visitBinary(node); break;
                case 'LogicalExpression': this._visitLogical(node); break;
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
                case 'ExpressionStatement': this._visit(node.expression); this.buffer.write8(this.OPCODES.POP); break;
                case 'BlockStatement': this._compileBlock(node.body); break;
                case 'IfStatement': this._visitIf(node); break;
                case 'SwitchStatement': this._visitSwitch(node); break;
                case 'WhileStatement': this._visitWhile(node); break;
                case 'DoWhileStatement': this._visitDoWhile(node); break;
                case 'ForStatement': this._visitFor(node); break;
                case 'ForOfStatement': this._visitForOf(node); break;
                case 'ForInStatement': this._visitForIn(node); break;
                case 'EmptyStatement': break;
                case 'DebuggerStatement': this.buffer.write8(this.OPCODES.DEBUGGER); break;
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
            this.buffer.write8(this.OPCODES.PUSH_CONST);
            this.buffer.write16(idx);
        }
        
        _visitObject(node) {
            this.buffer.write8(this.OPCODES.ALLOC_OBJECT); 
            for (const prop of node.properties) {
                if (prop.type === 'SpreadElement') {
                    this.buffer.write8(this.OPCODES.DUP);
                    this._visit(prop.argument);
                    this.buffer.write8(this.OPCODES.SYSCALL);
                    this.buffer.write8(0xFF); 
                    this.buffer.write8(2);    
                    this.buffer.write8(this.OPCODES.POP); 
                    continue;
                }
                this.buffer.write8(this.OPCODES.DUP); 
                if (prop.key.type === 'Identifier' && !prop.computed) {
                    this._emitConstant(prop.key.name);
                } else {
                    this._visit(prop.key);
                }
                this._visit(prop.value); 
                this.buffer.write8(this.OPCODES.SET_PROP);
                this.buffer.write8(this.OPCODES.POP);
            }
        }
        
        _compileDestructuring(pattern) {
            if (pattern.type === 'Identifier') {
                this._visitIdentifier(pattern, 'STORE');
            } else if (pattern.type === 'AssignmentPattern') {
                this.buffer.write8(this.OPCODES.DUP);
                this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                this.buffer.write8(this.OPCODES.STRICT_EQ);
                this.buffer.write8(this.OPCODES.JUMP_IF_FALSE);
                const skipDefault = this.buffer.write16(0);
                this.buffer.write8(this.OPCODES.POP);
                this._visit(pattern.right);
                const end = this.buffer.currentAddress;
                this.buffer.patch16(skipDefault, end - skipDefault - 2);
                this._compileDestructuring(pattern.left);
            } else if (pattern.type === 'ObjectPattern') {
                for (const prop of pattern.properties) {
                    if (prop.type === 'RestElement') {
                        this.buffer.write8(this.OPCODES.DUP);
                        this._compileDestructuring(prop.argument);
                        continue;
                    }
                    this.buffer.write8(this.OPCODES.DUP);
                    if (prop.key.type === 'Identifier' && !prop.computed) {
                        this._emitConstant(prop.key.name);
                    } else {
                        this._visit(prop.key);
                    }
                    this.buffer.write8(this.OPCODES.GET_PROP);
                    this._compileDestructuring(prop.value);
                }
                this.buffer.write8(this.OPCODES.POP);
            } else if (pattern.type === 'ArrayPattern') {
                pattern.elements.forEach((elem, index) => {
                    if (!elem) return;
                    if (elem.type === 'RestElement') {
                        this.buffer.write8(this.OPCODES.DUP);
                        this._emitConstant('slice');
                        this.buffer.write8(this.OPCODES.GET_PROP);
                        this.buffer.write8(this.OPCODES.SWAP);
                        this._emitConstant(index);
                        this.buffer.write8(this.OPCODES.CALL);
                        this.buffer.write8(1);
                        this._compileDestructuring(elem.argument);
                        return;
                    }
                    this.buffer.write8(this.OPCODES.DUP);
                    this._emitConstant(index);
                    this.buffer.write8(this.OPCODES.GET_PROP);
                    this._compileDestructuring(elem);
                });
                this.buffer.write8(this.OPCODES.POP);
            }
        }

        _visitVarDecl(node) {
            for (const decl of node.declarations) {
                if (decl.init) this._visit(decl.init);
                else this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);

                if (this.scope.depth === 0) {
                    if (decl.id.type === 'Identifier') {
                        const nameIdx = this._addConstant(decl.id.name);
                        this.buffer.write8(this.OPCODES.STORE_GLOBAL);
                        this.buffer.write16(nameIdx);
                    } else {
                        this._compileDestructuring(decl.id);
                    }
                } else {
                    this._compileDestructuring(decl.id);
                }
            }
        }

        _visitLogical(node) {
            this._visit(node.left);
            let jumpOp;
            if (node.operator === '&&') jumpOp = this.OPCODES.JUMP_IF_FALSE_PERSIST;
            else if (node.operator === '||') jumpOp = this.OPCODES.JUMP_IF_TRUE_PERSIST;
            else if (node.operator === '??') jumpOp = this.OPCODES.JUMP_IF_TRUE_PERSIST; 

            this.buffer.write8(jumpOp);
            const jumpIdx = this.buffer.write16(0);
            this.buffer.write8(this.OPCODES.POP); 
            this._visit(node.right);
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(jumpIdx, endAddr - jumpIdx - 2);
        }

        _visitBinary(node) {
            if (node.operator === '&&' || node.operator === '||' || node.operator === '??') {
                return this._visitLogical(node);
            }
            this._visit(node.left);
            this._visit(node.right);
            
            switch (node.operator) {
                case '+': this.buffer.write8(this.OPCODES.ADD); break;
                case '-': this.buffer.write8(this.OPCODES.SUB); break;
                case '*': this.buffer.write8(this.OPCODES.MUL); break;
                case '/': this.buffer.write8(this.OPCODES.DIV); break;
                case '%': this.buffer.write8(this.OPCODES.MOD); break;
                case '**': this.buffer.write8(this.OPCODES.POW); break;
                case '==': this.buffer.write8(this.OPCODES.EQ); break;
                case '===': this.buffer.write8(this.OPCODES.STRICT_EQ); break;
                case '!=': this.buffer.write8(this.OPCODES.NEQ); break;
                case '!==': this.buffer.write8(this.OPCODES.STRICT_NEQ); break;
                case '<': this.buffer.write8(this.OPCODES.LT); break;
                case '<=': this.buffer.write8(this.OPCODES.LTE); break;
                case '>': this.buffer.write8(this.OPCODES.GT); break;
                case '>=': this.buffer.write8(this.OPCODES.GTE); break;
                case '&': this.buffer.write8(this.OPCODES.BIT_AND); break;
                case '|': this.buffer.write8(this.OPCODES.BIT_OR); break;
                case '^': this.buffer.write8(this.OPCODES.BIT_XOR); break;
                case '<<': this.buffer.write8(this.OPCODES.SHL); break;
                case '>>': this.buffer.write8(this.OPCODES.SHR); break;
                case '>>>': this.buffer.write8(this.OPCODES.USHR); break;
                case 'in': this.buffer.write8(this.OPCODES.IN); break;
                case 'instanceof': this.buffer.write8(this.OPCODES.INSTANCEOF); break;
                default: throw new Error(`Unknown bin op: ${node.operator}`);
            }
        }
        
        _visitConditional(node) {
            this._visit(node.test);
            this.buffer.write8(this.OPCODES.JUMP_IF_FALSE);
            const jumpToElse = this.buffer.write16(0);
            this._visit(node.consequent);
            this.buffer.write8(this.OPCODES.JUMP);
            const jumpToEnd = this.buffer.write16(0);
            const elseAddr = this.buffer.currentAddress;
            this.buffer.patch16(jumpToElse, elseAddr - jumpToElse - 2);
            this._visit(node.alternate);
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(jumpToEnd, endAddr - jumpToEnd - 2);
        }

        _visitCall(node) {
            if (node.callee.type === 'Identifier' && node.callee.name === 'syscall') {
                const args = node.arguments;
                if (args.length < 1) throw new Error("syscall requires ID");
                const idArg = args[0];
                if (idArg.type !== 'Literal' || typeof idArg.value !== 'number') {
                    throw new Error("Syscall ID must be a literal number");
                }
                for (let i = 1; i < args.length; i++) {
                    this._visit(args[i]);
                }
                this.buffer.write8(this.OPCODES.SYSCALL);
                this.buffer.write8(idArg.value);
                this.buffer.write8(args.length - 1); 
                return;
            }

            const hasSpread = node.arguments.some(a => a.type === 'SpreadElement');
            if (hasSpread) {
                this._visit(node.callee);
                this.buffer.write8(this.OPCODES.PUSH_UNDEFINED); // Simplified for brevity
                this.buffer.write8(this.OPCODES.ALLOC_ARRAY);
                // ... complex spread logic ...
                this.buffer.write8(this.OPCODES.CALL);
                this.buffer.write8(2); 
                return;
            }

            this._visit(node.callee);
            if (node.callee.type === 'MemberExpression') this._visit(node.callee.object);
            else this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);

            for (const arg of node.arguments) this._visit(arg);
            this.buffer.write8(this.OPCODES.CALL);
            this.buffer.write8(node.arguments.length);
        }

        _visitLiteral(node) {
            const v = node.value;
            if (v === null) this.buffer.write8(this.OPCODES.PUSH_NULL);
            else if (v === undefined) this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
            else if (v === true) this.buffer.write8(this.OPCODES.PUSH_TRUE);
            else if (v === false) this.buffer.write8(this.OPCODES.PUSH_FALSE);
            else this._emitConstant(v);
        }

        _visitIdentifier(node, mode) {
            if (node.name === 'undefined' && mode === 'LOAD') {
                this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                return;
            }
            const res = this.scope.resolve(node.name);
            // B"H - Fix: check if res exists (scope.resolve returns null for global)
            if (res && res.type === 'LOCAL') {
                this.buffer.write8(mode === 'LOAD' ? this.OPCODES.LOAD_LOCAL : this.OPCODES.STORE_LOCAL);
                this.buffer.write8(res.index);
            } else if (res && res.type === 'UPVALUE') {
                this.buffer.write8(mode === 'LOAD' ? this.OPCODES.LOAD_UPVALUE : this.OPCODES.STORE_UPVALUE);
                this.buffer.write8(res.depth);
                this.buffer.write8(res.index);
            } else {
                const nameIdx = this._addConstant(node.name);
                this.buffer.write8(mode === 'LOAD' ? this.OPCODES.LOAD_GLOBAL : this.OPCODES.STORE_GLOBAL);
                this.buffer.write16(nameIdx);
            }
        }

        _visitAssignment(node) {
            if (node.left.type === 'Identifier') {
                this._visit(node.right);
                this.buffer.write8(this.OPCODES.DUP);
                this._visitIdentifier(node.left, 'STORE');
            } else if (node.left.type === 'MemberExpression') {
                this._visit(node.left.object);
                if (node.left.computed) this._visit(node.left.property);
                else this._emitConstant(node.left.property.name);
                this._visit(node.right);
                this.buffer.write8(this.OPCODES.SET_PROP);
            }
        }

        _visitMember(node) {
            this._visit(node.object);
            if (node.computed) this._visit(node.property);
            else this._emitConstant(node.property.name);
            this.buffer.write8(this.OPCODES.GET_PROP);
        }

        _visitWhile(node) {
            const start = this.buffer.currentAddress;
            this._visit(node.test);
            this.buffer.write8(this.OPCODES.JUMP_IF_FALSE);
            const endJump = this.buffer.write16(0);
            
            const loop = { breaks: [], continues: [] };
            this.loops.push(loop);
            
            this._visit(node.body);
            
            // Loop back to start
            this.buffer.write8(this.OPCODES.JUMP);
            // B"H - Correct calculation for negative jump
            const jumpOffset = start - (this.buffer.currentAddress + 2);
            this.buffer.write16(jumpOffset);

            const end = this.buffer.currentAddress;
            this.buffer.patch16(endJump, end - endJump - 2);
            
            loop.breaks.forEach(addr => this.buffer.patch16(addr, end - addr - 2));
            loop.continues.forEach(addr => this.buffer.patch16(addr, start - addr - 2));
            this.loops.pop();
        }
        
        _visitIf(node) {
            this._visit(node.test);
            this.buffer.write8(this.OPCODES.JUMP_IF_FALSE);
            const jumpToElse = this.buffer.write16(0);
            
            this._visit(node.consequent);
            
            if (node.alternate) {
                this.buffer.write8(this.OPCODES.JUMP);
                const jumpToEnd = this.buffer.write16(0);
                
                const elseAddr = this.buffer.currentAddress;
                this.buffer.patch16(jumpToElse, elseAddr - jumpToElse - 2);
                
                this._visit(node.alternate);
                
                const endAddr = this.buffer.currentAddress;
                this.buffer.patch16(jumpToEnd, endAddr - jumpToEnd - 2);
            } else {
                const endAddr = this.buffer.currentAddress;
                this.buffer.patch16(jumpToElse, endAddr - jumpToElse - 2);
            }
        }
        
        _visitBreak(node) {
            if (this.loops.length === 0) throw new Error("Illegal break");
            const loop = this.loops[this.loops.length - 1];
            this.buffer.write8(this.OPCODES.JUMP);
            const idx = this.buffer.write16(0);
            loop.breaks.push(idx);
        }
        
        _visitContinue(node) {
            if (this.loops.length === 0) throw new Error("Illegal continue");
            const loop = this.loops[this.loops.length - 1];
            this.buffer.write8(this.OPCODES.JUMP);
            const idx = this.buffer.write16(0);
            loop.continues.push(idx);
        }

        _visitReturn(node) {
            if (node.argument) this._visit(node.argument);
            else this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
            this.buffer.write8(this.OPCODES.RETURN);
        }

        _visitFuncExpr(node) {
            const funcCompiler = new Compiler();
            funcCompiler.scope = new Scope(this.scope, true);
            node.params.forEach(p => {
                if (p.type === 'Identifier') funcCompiler.scope.declare(p.name);
            });
            if (node.body.type === 'BlockStatement') {
                funcCompiler._compileBlock(node.body.body);
                funcCompiler.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                funcCompiler.buffer.write8(this.OPCODES.RETURN);
            } else {
                funcCompiler._visit(node.body);
                funcCompiler.buffer.write8(this.OPCODES.RETURN);
            }
            const codeObj = {
                name: node.id ? node.id.name : '<anonymous>',
                bytecode: funcCompiler.buffer.toBuffer(),
                constants: funcCompiler.constants,
                localCount: funcCompiler.scope.stackIndex
            };
            const idx = this._addConstant(codeObj);
            this.buffer.write8(this.OPCODES.CLOSURE);
            this.buffer.write16(idx);
        }
        
        _visitFuncDecl(node) {
            let varIdx = -1;
            if (node.id && this.scope.depth > 0) varIdx = this.scope.declare(node.id.name);
            this._visitFuncExpr({ ...node, type: 'FunctionExpression' });
            if (node.id) {
                if (this.scope.depth === 0) {
                    const nameIdx = this._addConstant(node.id.name);
                    this.buffer.write8(this.OPCODES.STORE_GLOBAL);
                    this.buffer.write16(nameIdx);
                } else if (varIdx !== -1) {
                    this.buffer.write8(this.OPCODES.STORE_LOCAL);
                    this.buffer.write8(varIdx);
                }
            }
        }

        _compileBlock(statements) {
            for (const stmt of statements) this._visit(stmt);
        }
        
        _visitUnary(node) {
            this._visit(node.argument);
            if (node.operator === '!') this.buffer.write8(this.OPCODES.NOT);
            else if (node.operator === '-') this.buffer.write8(this.OPCODES.NEGATE);
            else if (node.operator === 'typeof') this.buffer.write8(this.OPCODES.TYPEOF);
            else if (node.operator === 'void') this.buffer.write8(this.OPCODES.VOID);
        }
        
        _visitUpdate(node) {
            this._visitIdentifier(node.argument, 'LOAD');
            // B"H - Fixed Postfix vs Prefix stack logic
            if (!node.prefix) this.buffer.write8(this.OPCODES.DUP); // Postfix: keep old value
            
            this._emitConstant(1);
            this.buffer.write8(node.operator === '++' ? this.OPCODES.ADD : this.OPCODES.SUB);
            
            if (node.prefix) this.buffer.write8(this.OPCODES.DUP); // Prefix: keep new value
            
            this._visitIdentifier(node.argument, 'STORE');
        }
    }

    root.MerkavaCompiler.Compiler = Compiler;
})(typeof self !== 'undefined' ? self : this);