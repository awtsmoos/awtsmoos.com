// B"H
/**
 * @file merkava-compiler.js
 * @version 1.2.4 - The Architect (Rectified)
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
        constructor(parent = null, isFunctionBoundary = false) {
            this.parent = parent;
            this.locals = new Map();
            this.isFunctionBoundary = isFunctionBoundary;

            if (isFunctionBoundary) {
                this.stackIndex = 0;
                this.depth = parent ? parent.depth + 1 : 0;
            } else {
                this.stackIndex = parent ? parent.stackIndex : 0;
                this.depth = parent ? parent.depth : 0;
            }
        }
        
        declare(name) {
            const index = this.stackIndex++;
            this.locals.set(name, index);
            return index;
        }
        
        resolve(name) {
            if (this.locals.has(name)) {
                return { type: 'LOCAL', index: this.locals.get(name), depth: 0 };
            }

            if (this.parent) {
                const res = this.parent.resolve(name);
                if (res.type === 'GLOBAL') return res;

                if (!this.isFunctionBoundary) {
                    return res; 
                } else {
                    return { 
                        type: 'UPVALUE', 
                        index: res.index, 
                        depth: res.depth + 1 
                    };
                }
            }
            
            return { type: 'GLOBAL' };
        }
    }

    class Compiler {
        constructor() {
            this.constants = [];
            this.buffer = new BytecodeBuilder();
            this.scope = new CompilerScope(null, true);
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
                case 'ExpressionStatement': this._visit(node.expression); this.buffer.write8(OPCODES.POP); break;
                case 'BlockStatement': this._compileBlock(node.body); break;
                case 'IfStatement': this._visitIf(node); break;
                case 'SwitchStatement': this._visitSwitch(node); break;
                case 'WhileStatement': this._visitWhile(node); break;
                case 'DoWhileStatement': this._visitDoWhile(node); break;
                case 'ForStatement': this._visitFor(node); break;
                case 'ForOfStatement': this._visitForOf(node); break;
                case 'ForInStatement': this._visitForIn(node); break;
                case 'EmptyStatement': break;
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
            this.buffer.write8(OPCODES.ALLOC_OBJECT); 
            for (const prop of node.properties) {
                if (prop.type === 'SpreadElement') {
                    this.buffer.write8(OPCODES.DUP);
                    this._visit(prop.argument);
                    this.buffer.write8(OPCODES.SYSCALL);
                    this.buffer.write8(0xFF); 
                    this.buffer.write8(2);    
                    this.buffer.write8(OPCODES.POP); 
                    continue;
                }
                this.buffer.write8(OPCODES.DUP); 
                if (prop.key.type === 'Identifier' && !prop.computed) {
                    this._emitConstant(prop.key.name);
                } else {
                    this._visit(prop.key);
                }
                this._visit(prop.value); 
                this.buffer.write8(OPCODES.SET_PROP);
                this.buffer.write8(OPCODES.POP);
            }
        }
        
        _emitExport(exportName, localName) {
            this._emitConstant(exportName);
            this._visitIdentifier({ name: localName }, 'LOAD');
            this.buffer.write8(OPCODES.SYSCALL);
            this.buffer.write8(2); 
            this.buffer.write8(2);
            this.buffer.write8(OPCODES.POP);
        }

        _visitExportNamedDeclaration(node) {
            if (node.declaration) {
                this._visit(node.declaration);
                if (node.declaration.type === 'VariableDeclaration') {
                    for (const decl of node.declaration.declarations) {
                        if (decl.id.type === 'Identifier') {
                            this._emitExport(decl.id.name, decl.id.name);
                        }
                    }
                } else if (node.declaration.id) {
                    this._emitExport(node.declaration.id.name, node.declaration.id.name);
                }
            } else if (node.specifiers) {
                if (node.source) {
                    this._emitConstant(node.source.value);
                    this.buffer.write8(OPCODES.SYSCALL);
                    this.buffer.write8(1); 
                    this.buffer.write8(1);
                    node.specifiers.forEach(spec => {
                        this.buffer.write8(OPCODES.DUP);
                        this._emitConstant(spec.local.name);
                        this.buffer.write8(OPCODES.GET_PROP); 
                        this._emitConstant(spec.exported.name);
                        this.buffer.write8(OPCODES.SWAP);
                        this.buffer.write8(OPCODES.SYSCALL);
                        this.buffer.write8(2);
                        this.buffer.write8(2);
                        this.buffer.write8(OPCODES.POP);
                    });
                    this.buffer.write8(OPCODES.POP);
                } else {
                    for (const spec of node.specifiers) {
                        this._emitExport(spec.exported.name, spec.local.name);
                    }
                }
            }
        }

        _visitExportDefaultDeclaration(node) {
            if (node.declaration.id) {
                this._visit(node.declaration);
                this._visitIdentifier(node.declaration.id, 'LOAD');
            } else {
                const type = node.declaration.type === 'FunctionDeclaration' ? 'FunctionExpression' :
                             node.declaration.type === 'ClassDeclaration' ? 'ClassExpression' : 
                             node.declaration.type;
                this._visit({ ...node.declaration, type });
            }
            this._emitConstant("default");
            this.buffer.write8(OPCODES.SWAP);
            this.buffer.write8(OPCODES.SYSCALL);
            this.buffer.write8(2);
            this.buffer.write8(2);
            this.buffer.write8(OPCODES.POP);
        }

        _visitExportAllDeclaration(node) {
            this._emitConstant("[Merkava] Warning: 'export *' not fully supported.");
            this.buffer.write8(OPCODES.SYSCALL);
            this.buffer.write8(0);
            this.buffer.write8(1);
            this.buffer.write8(OPCODES.POP);
            this._visitImport({ ...node, specifiers: [] });
        }

        _compileDestructuring(pattern) {
            if (pattern.type === 'Identifier') {
                this._visitIdentifier(pattern, 'STORE');
            } else if (pattern.type === 'AssignmentPattern') {
                this.buffer.write8(OPCODES.DUP);
                this.buffer.write8(OPCODES.PUSH_UNDEFINED);
                this.buffer.write8(OPCODES.STRICT_EQ);
                this.buffer.write8(OPCODES.JUMP_IF_FALSE);
                const skipDefault = this.buffer.write16(0);
                this.buffer.write8(OPCODES.POP);
                this._visit(pattern.right);
                const end = this.buffer.currentAddress;
                this.buffer.patch16(skipDefault, end - skipDefault - 2);
                this._compileDestructuring(pattern.left);
            } else if (pattern.type === 'ObjectPattern') {
                for (const prop of pattern.properties) {
                    if (prop.type === 'RestElement') {
                        this.buffer.write8(OPCODES.DUP);
                        this._compileDestructuring(prop.argument);
                        continue;
                    }
                    this.buffer.write8(OPCODES.DUP);
                    if (prop.key.type === 'Identifier' && !prop.computed) {
                        this._emitConstant(prop.key.name);
                    } else {
                        this._visit(prop.key);
                    }
                    this.buffer.write8(OPCODES.GET_PROP);
                    this._compileDestructuring(prop.value);
                }
                this.buffer.write8(OPCODES.POP);
            } else if (pattern.type === 'ArrayPattern') {
                pattern.elements.forEach((elem, index) => {
                    if (!elem) return;
                    if (elem.type === 'RestElement') {
                        this.buffer.write8(OPCODES.DUP);
                        this._emitConstant('slice');
                        this.buffer.write8(OPCODES.GET_PROP);
                        this.buffer.write8(OPCODES.SWAP);
                        this._emitConstant(index);
                        this.buffer.write8(OPCODES.CALL);
                        this.buffer.write8(1);
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
                if (decl.init) this._visit(decl.init);
                else this.buffer.write8(OPCODES.PUSH_UNDEFINED);

                if (this.scope.depth === 0) {
                    if (decl.id.type === 'Identifier') {
                        const nameIdx = this._addConstant(decl.id.name);
                        this.buffer.write8(OPCODES.STORE_GLOBAL);
                        this.buffer.write16(nameIdx);
                    } else {
                        this._compileDestructuring(decl.id);
                    }
                } else {
                    this._compileDestructuring(decl.id);
                }
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
            this._visit(node.left);
            let jumpOp;
            if (node.operator === '&&') jumpOp = OPCODES.JUMP_IF_FALSE_PERSIST;
            else if (node.operator === '||') jumpOp = OPCODES.JUMP_IF_TRUE_PERSIST;
            else if (node.operator === '??') jumpOp = OPCODES.JUMP_IF_TRUE_PERSIST; 

            this.buffer.write8(jumpOp);
            const jumpIdx = this.buffer.write16(0);
            this.buffer.write8(OPCODES.POP); 
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
            this._visit(node.test);
            this.buffer.write8(OPCODES.JUMP_IF_FALSE);
            const jumpToElse = this.buffer.write16(0);
            this._visit(node.consequent);
            this.buffer.write8(OPCODES.JUMP);
            const jumpToEnd = this.buffer.write16(0);
            const elseAddr = this.buffer.currentAddress;
            this.buffer.patch16(jumpToElse, elseAddr - jumpToElse - 2);
            this._visit(node.alternate);
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(jumpToEnd, endAddr - jumpToEnd - 2);
        }

        _visitArray(node) {
            this.buffer.write8(OPCODES.ALLOC_ARRAY);
            node.elements.forEach((elem, index) => {
                if (!elem) return;
                if (elem.type === 'SpreadElement') {
                    this.buffer.write8(OPCODES.DUP); 
                    this._visit(elem.argument);
                    this._emitConstant("__INTERNAL_SPREAD_ARRAY");
                    this.buffer.write8(OPCODES.SYSCALL);
                    this.buffer.write8(0xFF);
                    this.buffer.write8(2); 
                    this.buffer.write8(OPCODES.POP);
                } else {
                    this.buffer.write8(OPCODES.DUP);
                    this._emitConstant(index); 
                    this._visit(elem); 
                    this.buffer.write8(OPCODES.SET_PROP); 
                    this.buffer.write8(OPCODES.POP);
                }
            });
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
                
                this.buffer.write8(OPCODES.SYSCALL);
                this.buffer.write8(idArg.value);
                this.buffer.write8(args.length - 1);
                return;
            }

            const hasSpread = node.arguments.some(a => a.type === 'SpreadElement');
            if (hasSpread) {
                this._visit(node.callee);
                if (node.callee.type === 'MemberExpression') {
                    this.buffer.write8(OPCODES.DUP); 
                    this._emitConstant('apply');
                    this.buffer.write8(OPCODES.GET_PROP); 
                    this.buffer.write8(OPCODES.SWAP);
                    this._visit(node.callee.object); 
                } else {
                    this.buffer.write8(OPCODES.DUP);
                    this._emitConstant('apply');
                    this.buffer.write8(OPCODES.GET_PROP);
                    this.buffer.write8(OPCODES.SWAP);
                    this.buffer.write8(OPCODES.PUSH_UNDEFINED);
                }
                this.buffer.write8(OPCODES.ALLOC_ARRAY);
                node.arguments.forEach((arg) => {
                     this.buffer.write8(OPCODES.DUP); // Array
                     if(arg.type === 'SpreadElement') {
                         this._visit(arg.argument);
                         this.buffer.write8(OPCODES.SYSCALL);
                         this.buffer.write8(0xFF); 
                         this.buffer.write8(2);    
                         this.buffer.write8(OPCODES.POP); 
                     } else {
                         this._emitConstant('push');
                         this.buffer.write8(OPCODES.GET_PROP);
                         this.buffer.write8(OPCODES.SWAP);
                         this._visit(arg);
                         this.buffer.write8(OPCODES.CALL);
                         this.buffer.write8(1);
                     }
                });
                this.buffer.write8(OPCODES.CALL);
                this.buffer.write8(2); 
                return;
            }

            this._visit(node.callee);
            if (node.callee.type === 'MemberExpression') this._visit(node.callee.object);
            else this.buffer.write8(OPCODES.PUSH_UNDEFINED);

            for (const arg of node.arguments) this._visit(arg);
            this.buffer.write8(OPCODES.CALL);
            this.buffer.write8(node.arguments.length);
        }

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
                this.buffer.write8(OPCODES.PUSH_UNDEFINED);
                return;
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
            this.buffer.write8(OPCODES.JUMP);
            this.buffer.write16(-(this.buffer.currentAddress + 2 - start));
            const end = this.buffer.currentAddress;
            this.buffer.patch16(endJump, end - endJump - 2);
            loop.breaks.forEach(addr => this.buffer.patch16(addr, end - addr - 2));
            loop.continues.forEach(addr => this.buffer.patch16(addr, start - addr - 2));
            this.loops.pop();
        }

        _visitFor(node) {
            this.scope = new CompilerScope(this.scope, false);
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

        _visitDoWhile(node) {
            const start = this.buffer.currentAddress;
            const loop = { breaks: [], continues: [] };
            this.loops.push(loop);
            this._visit(node.body);
            const condAddr = this.buffer.currentAddress;
            this._visit(node.test);
            this.buffer.write8(OPCODES.JUMP_IF_TRUE);
            this.buffer.write16(-(this.buffer.currentAddress + 2 - start));
            const end = this.buffer.currentAddress;
            loop.breaks.forEach(addr => this.buffer.patch16(addr, end - addr - 2));
            loop.continues.forEach(addr => this.buffer.patch16(addr, condAddr - addr - 2));
            this.loops.pop();
        }

        _visitForOf(node) {
            this.scope = new CompilerScope(this.scope, false);
            this._visit(node.right);
            this.buffer.write8(OPCODES.DUP); 
            const symIdx = this._addConstant("Symbol");
            this.buffer.write8(OPCODES.LOAD_GLOBAL); 
            this.buffer.write16(symIdx);
            this._emitConstant("iterator");
            this.buffer.write8(OPCODES.GET_PROP);
            this.buffer.write8(OPCODES.GET_PROP);
            this.buffer.write8(OPCODES.SWAP); 
            this.buffer.write8(OPCODES.CALL);
            this.buffer.write8(0); 
            const iterIdx = this.scope.declare("<iterator>");
            this.buffer.write8(OPCODES.STORE_LOCAL);
            this.buffer.write8(iterIdx);
            const start = this.buffer.currentAddress;
            const loop = { breaks: [], continues: [] };
            this.loops.push(loop);
            this.buffer.write8(OPCODES.LOAD_LOCAL);
            this.buffer.write8(iterIdx); 
            this.buffer.write8(OPCODES.DUP); 
            this._emitConstant("next");
            this.buffer.write8(OPCODES.GET_PROP);
            this.buffer.write8(OPCODES.SWAP); 
            this.buffer.write8(OPCODES.CALL);
            this.buffer.write8(0); 
            this.buffer.write8(OPCODES.DUP); 
            this._emitConstant("done");
            this.buffer.write8(OPCODES.GET_PROP); 
            this.buffer.write8(OPCODES.JUMP_IF_TRUE);
            const exitJump = this.buffer.write16(0);
            this._emitConstant("value");
            this.buffer.write8(OPCODES.GET_PROP);
            if (node.left.type === 'VariableDeclaration') {
                this._compileDestructuring(node.left.declarations[0].id); 
            } else {
                this._compileDestructuring(node.left);
            }
            this._visit(node.body);
            this.buffer.write8(OPCODES.JUMP);
            this.buffer.write16(-(this.buffer.currentAddress + 2 - start));
            const end = this.buffer.currentAddress;
            this.buffer.patch16(exitJump, end - exitJump - 2);
            loop.breaks.forEach(addr => this.buffer.patch16(addr, end - addr - 2));
            loop.continues.forEach(addr => this.buffer.patch16(addr, start - addr - 2));
            this.loops.pop();
            this.scope = this.scope.parent;
        }

        _visitForIn(node) {
            const objIdx = this._addConstant("Object");
            this.buffer.write8(OPCODES.LOAD_GLOBAL);
            this.buffer.write16(objIdx); 
            this._emitConstant("keys");
            this.buffer.write8(OPCODES.GET_PROP); 
            this.buffer.write8(OPCODES.PUSH_UNDEFINED); 
            this._visit(node.right); 
            this.buffer.write8(OPCODES.CALL);
            this.buffer.write8(1); 
            this.scope = new CompilerScope(this.scope, false); 
            const keysIdx = this.scope.declare("<keys>");
            this.buffer.write8(OPCODES.STORE_LOCAL);
            this.buffer.write8(keysIdx);
            const proxyNode = {
                type: 'ForOfStatement',
                left: node.left,
                body: node.body,
                right: { type: 'Identifier', name: '<keys>' } 
            };
            this._visitForOf(proxyNode);
            this.scope = this.scope.parent; 
        }

        _visitTry(node) {
            this.buffer.write8(OPCODES.ENTER_TRY);
            const catchOffsetLoc = this.buffer.write16(0);
            const finallyOffsetLoc = this.buffer.write16(0);
            this._visit(node.block);
            this.buffer.write8(OPCODES.EXIT_TRY);
            this.buffer.write8(OPCODES.JUMP);
            const skipCatchLoc = this.buffer.write16(0);
            const catchStartAddr = this.buffer.currentAddress;
            this.buffer.patch16(catchOffsetLoc, catchStartAddr - catchOffsetLoc - 2);
            if (node.handler) {
                this.scope = new CompilerScope(this.scope, false);
                this.buffer.write8(OPCODES.LOAD_ERROR); 
                if (node.handler.param) {
                    this._compileDestructuring(node.handler.param);
                } else {
                    this.buffer.write8(OPCODES.POP);
                }
                this._visit(node.handler.body);
                this.scope = this.scope.parent;
            }
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(skipCatchLoc, endAddr - skipCatchLoc - 2);
        }

        _visitThrow(node) {
            this._visit(node.argument);
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
                if (this.loops[i]) { targetLoop = this.loops[i]; break; }
            }
            if (!targetLoop) throw new Error("Illegal continue");
            this.buffer.write8(OPCODES.JUMP);
            targetLoop.continues.push(this.buffer.write16(0));
        }

        _visitFuncExpr(node) {
            const funcCompiler = new Compiler();
            funcCompiler.scope = new CompilerScope(this.scope, true);
            node.params.forEach(p => {
                if (p.type === 'Identifier') funcCompiler.scope.declare(p.name);
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
            this._emitConstant(src);
            this.buffer.write8(OPCODES.SYSCALL);
            this.buffer.write8(1); 
            this.buffer.write8(1); 
            if (node.specifiers.length === 0) {
                this.buffer.write8(OPCODES.POP);
                return;
            }
            for (const spec of node.specifiers) {
                this.buffer.write8(OPCODES.DUP); 
                let localName;
                if (spec.type === 'ImportNamespaceSpecifier') {
                    localName = spec.local.name;
                } else {
                    let propName;
                    if (spec.type === 'ImportDefaultSpecifier') {
                        propName = 'default';
                    } else { 
                        propName = spec.imported.name;
                    }
                    this._emitConstant(propName);
                    this.buffer.write8(OPCODES.GET_PROP); 
                    localName = spec.local.name;
                }
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
            this.buffer.write8(OPCODES.POP); 
        }

        _compileBlock(statements) {
            for (const stmt of statements) this._visit(stmt);
        }
        
        _visitUnary(node) {
            this._visit(node.argument);
            if (node.operator === '!') this.buffer.write8(OPCODES.NOT);
            else if (node.operator === '-') this.buffer.write8(OPCODES.NEGATE);
            else if (node.operator === 'typeof') this.buffer.write8(OPCODES.TYPEOF);
            else if (node.operator === 'void') this.buffer.write8(OPCODES.VOID);
            else if (node.operator === 'delete') {
                if(node.argument.type === 'MemberExpression') {
                    this._visit(node.argument.object);
                    if(node.argument.computed) this._visit(node.argument.property);
                    else this._emitConstant(node.argument.property.name);
                    this.buffer.write8(OPCODES.DELETE);
                } else {
                    this.buffer.write8(OPCODES.POP);
                    this.buffer.write8(OPCODES.PUSH_TRUE);
                }
            }
        }
        
        _visitUpdate(node) {
            this._visitIdentifier(node.argument, 'LOAD');
            if (!node.prefix) this.buffer.write8(OPCODES.DUP);
            this._emitConstant(1);
            this.buffer.write8(node.operator === '++' ? OPCODES.ADD : OPCODES.SUB);
            this._visitIdentifier(node.argument, 'STORE');
            if (node.prefix) this.buffer.write8(OPCODES.DUP);
        }
        
        _visitAwait(node) {
             this._visit(node.argument);
             this.buffer.write8(OPCODES.AWAIT);
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