// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};

    root.MerkavaCompiler.Visitors = {
        _visit(node) {
            if (!node) return;
            switch (node.type) {
                case 'Literal': this._visitLiteral(node); break;
                case 'Identifier': this._visitIdentifier(node, 'LOAD'); break;
                case 'BinaryExpression': this._visitBinary(node); break;
                case 'LogicalExpression': this._visitLogical(node); break;
                case 'UnaryExpression': this._visitUnary(node); break;
                case 'UpdateExpression': this._visitUpdate(node); break;
                case 'CallExpression': this._visitCall(node); break;
                case 'MemberExpression': this._visitMember(node); break;
                case 'ExpressionStatement': this._visit(node.expression); this.buffer.write8(this.OPCODES.POP); break;
                case 'BlockStatement': this._compileBlock(node.body); break;
                case 'ReturnStatement': this._visitReturn(node); break;
                case 'FunctionDeclaration': this._visitFuncDecl(node); break;
                case 'VariableDeclaration': this._visitVarDecl(node); break;
                case 'AssignmentExpression': this._visitAssignment(node); break;
                case 'IfStatement': this._visitIf(node); break;
                case 'WhileStatement': this._visitWhile(node); break;
                case 'ObjectExpression': this._visitObject(node); break;
                case 'ArrayExpression': this._visitArray(node); break;
                case 'ThisExpression': this.buffer.write8(this.OPCODES.PUSH_THIS); break;
                case 'NewExpression': this._visitNew(node); break;
                case 'BreakStatement': this._visitBreak(node); break;
                case 'ContinueStatement': this._visitContinue(node); break;
                case 'EmptyStatement': break;
                default: throw new Error(`[Compiler] Unsupported Node Type: ${node.type}`);
            }
        },

        _visitBinary(node) {
            if (['&&', '||', '??'].includes(node.operator)) return this._visitLogical(node);
            
            this._visit(node.left);
            this._visit(node.right);
            
            const map = {
                '+': this.OPCODES.ADD, '-': this.OPCODES.SUB, '*': this.OPCODES.MUL,
                '/': this.OPCODES.DIV, '%': this.OPCODES.MOD,
                '==': this.OPCODES.EQ, '===': this.OPCODES.STRICT_EQ,
                '!=': this.OPCODES.NEQ, '!==': this.OPCODES.STRICT_NEQ,
                '<': this.OPCODES.LT, '<=': this.OPCODES.LTE,
                '>': this.OPCODES.GT, '>=': this.OPCODES.GTE,
                'in': this.OPCODES.IN, 'instanceof': this.OPCODES.INSTANCEOF
            };
            
            if (map[node.operator]) this.buffer.write8(map[node.operator]);
            else throw new Error(`Unknown binary operator: ${node.operator}`);
        },

        _visitLogical(node) {
            this._visit(node.left);
            // Duplicate left value for the check (consumed by jump instruction)
            this.buffer.write8(this.OPCODES.DUP);
            
            let jumpCode = (node.operator === '&&') ? this.OPCODES.JUMP_IF_FALSE : this.OPCODES.JUMP_IF_TRUE;
            
            this.buffer.write8(jumpCode);
            const jumpIdx = this.buffer.write16(0);
            
            // If we didn't jump, pop the left value and evaluate right
            this.buffer.write8(this.OPCODES.POP);
            this._visit(node.right);
            
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(jumpIdx, endAddr - jumpIdx - 2);
        },

        _visitLiteral(node) {
            const v = node.value;
            if (v === null) this.buffer.write8(this.OPCODES.PUSH_NULL);
            else if (v === undefined) this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
            else if (v === true) this.buffer.write8(this.OPCODES.PUSH_TRUE);
            else if (v === false) this.buffer.write8(this.OPCODES.PUSH_FALSE);
            else this._emitConstant(v);
        },

        _visitIdentifier(node, mode) {
            if (node.name === 'undefined' && mode === 'LOAD') {
                this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                return;
            }
            const res = this.scope.resolve(node.name);
            if (res && res.type === 'LOCAL') {
                this.buffer.write8(mode === 'LOAD' ? this.OPCODES.LOAD_LOCAL : this.OPCODES.STORE_LOCAL);
                this.buffer.write8(res.index);
            } else if (res && res.type === 'UPVALUE') {
                const nameIdx = this._addConstant(node.name);
                this.buffer.write8(mode === 'LOAD' ? this.OPCODES.LOAD_GLOBAL : this.OPCODES.STORE_GLOBAL);
                this.buffer.write16(nameIdx);
            } else {
                const nameIdx = this._addConstant(node.name);
                this.buffer.write8(mode === 'LOAD' ? this.OPCODES.LOAD_GLOBAL : this.OPCODES.STORE_GLOBAL);
                this.buffer.write16(nameIdx);
            }
        },

        _visitCall(node) {
            // Syscall Optimization
            if (node.callee.type === 'Identifier' && node.callee.name === 'syscall') {
                const idArg = node.arguments[0];
                if (!idArg || idArg.type !== 'Literal') throw new Error("Syscall ID must be literal");
                for (let i = 1; i < node.arguments.length; i++) this._visit(node.arguments[i]);
                this.buffer.write8(this.OPCODES.SYSCALL);
                this.buffer.write8(idArg.value);
                this.buffer.write8(node.arguments.length - 1);
                return;
            }

            // Handle 'this' context for MemberExpressions
            // Stack Goal: [Callee, Context] (Top is Context)
            if (node.callee.type === 'MemberExpression') {
                 // 1. Visit Object -> [Obj]
                 this._visit(node.callee.object);
                 
                 // 2. DUP Object (one for 'this', one for getting property) -> [Obj, Obj]
                 this.buffer.write8(this.OPCODES.DUP);
                 
                 // 3. Get Key -> [Obj, Obj, Key]
                 if (node.callee.computed) this._visit(node.callee.property);
                 else this._emitConstant(node.callee.property.name);
                 
                 // 4. GET_PROP -> Pops Key, Pops Obj, Pushes Func -> [Obj, Func]
                 this.buffer.write8(this.OPCODES.GET_PROP);
                 
                 // 5. SWAP -> [Func, Obj]
                 // VM pops Ctx (Obj), then Callee (Func). Correct.
                 this.buffer.write8(this.OPCODES.SWAP);
            } else {
                 // Normal Call (Identifier, etc)
                 // 1. Visit Callee -> [Func]
                 this._visit(node.callee); 
                 
                 // 2. Push Undefined Context -> [Func, Undefined]
                 this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                 
                 // NO SWAP. 
                 // VM pops Ctx (Undefined), then Callee (Func). Correct.
            }
            
            node.arguments.forEach(arg => this._visit(arg));
            this.buffer.write8(this.OPCODES.CALL);
            this.buffer.write8(node.arguments.length);
        },

        _visitMember(node) {
            this._visit(node.object);
            if (node.computed) this._visit(node.property);
            else this._emitConstant(node.property.name);
            this.buffer.write8(this.OPCODES.GET_PROP);
        },

        _visitObject(node) {
            this.buffer.write8(this.OPCODES.ALLOC_OBJECT);
            node.properties.forEach(prop => {
                this.buffer.write8(this.OPCODES.DUP); // Keep object for next set
                if (prop.key.type === 'Identifier' && !prop.computed) this._emitConstant(prop.key.name);
                else this._visit(prop.key);
                this._visit(prop.value);
                this.buffer.write8(this.OPCODES.SET_PROP);
                this.buffer.write8(this.OPCODES.POP); // Pop value left by SET_PROP
            });
        },

        _visitArray(node) {
            this.buffer.write8(this.OPCODES.ALLOC_ARRAY);
            node.elements.forEach((elem, idx) => {
                if (!elem) return; // Hole
                this.buffer.write8(this.OPCODES.DUP);
                this._emitConstant(idx);
                this._visit(elem);
                this.buffer.write8(this.OPCODES.SET_PROP);
                this.buffer.write8(this.OPCODES.POP);
            });
        },

        _visitIf(node) {
            this._visit(node.test);
            this.buffer.write8(this.OPCODES.JUMP_IF_FALSE);
            const elseJump = this.buffer.write16(0);
            
            this._visit(node.consequent);
            
            if (node.alternate) {
                this.buffer.write8(this.OPCODES.JUMP);
                const endJump = this.buffer.write16(0);
                
                const elseAddr = this.buffer.currentAddress;
                this.buffer.patch16(elseJump, elseAddr - elseJump - 2);
                
                this._visit(node.alternate);
                
                const endAddr = this.buffer.currentAddress;
                this.buffer.patch16(endJump, endAddr - endJump - 2);
            } else {
                const endAddr = this.buffer.currentAddress;
                this.buffer.patch16(elseJump, endAddr - elseJump - 2);
            }
        },

        _visitWhile(node) {
            const startAddr = this.buffer.currentAddress;
            this._visit(node.test);
            
            this.buffer.write8(this.OPCODES.JUMP_IF_FALSE);
            const endJump = this.buffer.write16(0);
            
            const loop = { breaks: [], continues: [] };
            this.loops.push(loop);
            
            this._visit(node.body);
            
            // Loop back
            this.buffer.write8(this.OPCODES.JUMP);
            const backOffset = startAddr - (this.buffer.currentAddress + 2);
            this.buffer.write16(backOffset); 
            
            // Patch loop exits
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(endJump, endAddr - endJump - 2);
            
            loop.breaks.forEach(b => this.buffer.patch16(b, endAddr - b - 2));
            loop.continues.forEach(c => this.buffer.patch16(c, startAddr - c - 2));
            this.loops.pop();
        },

        _visitVarDecl(node) {
            node.declarations.forEach(decl => {
                if (decl.init) this._visit(decl.init);
                else this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                
                if (decl.id.type === 'Identifier') {
                    this._visitIdentifier(decl.id, 'STORE');
                } else {
                    this.buffer.write8(this.OPCODES.POP); 
                }
            });
        },

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
        },
        
        _visitUnary(node) {
            this._visit(node.argument);
            if (node.operator === '!') this.buffer.write8(this.OPCODES.NOT);
            else if (node.operator === '-') this.buffer.write8(this.OPCODES.NEGATE);
            else if (node.operator === 'typeof') this.buffer.write8(this.OPCODES.TYPEOF);
            else if (node.operator === 'void') this.buffer.write8(this.OPCODES.VOID);
        },

        _visitUpdate(node) {
            if (node.argument.type === 'Identifier') {
                this._visitIdentifier(node.argument, 'LOAD');
                if (!node.prefix) this.buffer.write8(this.OPCODES.DUP); 
                
                this.buffer.write8(this.OPCODES.PUSH_CONST);
                this.buffer.write16(this._addConstant(1));
                
                this.buffer.write8(node.operator === '++' ? this.OPCODES.ADD : this.OPCODES.SUB);
                
                if (node.prefix) this.buffer.write8(this.OPCODES.DUP);
                
                this._visitIdentifier(node.argument, 'STORE');
            }
        },

        _visitReturn(node) {
            if (node.argument) this._visit(node.argument);
            else this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
            this.buffer.write8(this.OPCODES.RETURN);
        },
        
        _visitFuncDecl(node) {
            const func = { ...node, type: 'FunctionExpression' };
            if (this.scope.depth > 0) this.scope.declare(node.id.name);
            this._visitFuncExpr(func); 
            this._visitIdentifier(node.id, 'STORE');
            this.buffer.write8(this.OPCODES.POP); 
        },
        
        _visitNew(node) {
            this._visit(node.callee);
            this.buffer.write8(this.OPCODES.PUSH_UNDEFINED); // 'this' placeholder
            // NO SWAP. [Func, Undefined]. VM pops Ctx(Undef), Callee(Func).
            
            node.arguments.forEach(arg => this._visit(arg));
            this.buffer.write8(this.OPCODES.CALL);
            this.buffer.write8(node.arguments.length);
        },
        
        _visitBreak(node) {
            if (this.loops.length === 0) throw new Error("Illegal break");
            const loop = this.loops[this.loops.length - 1];
            this.buffer.write8(this.OPCODES.JUMP);
            loop.breaks.push(this.buffer.write16(0));
        },
        
        _visitContinue(node) {
            if (this.loops.length === 0) throw new Error("Illegal continue");
            const loop = this.loops[this.loops.length - 1];
            this.buffer.write8(this.OPCODES.JUMP);
            loop.continues.push(this.buffer.write16(0));
        }
    };
})(typeof self !== 'undefined' ? self : this);