
// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};
    root.MerkavaCompiler.Visitors = root.MerkavaCompiler.Visitors || {};

    root.MerkavaCompiler.Visitors.Expressions = {
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
                'in': this.OPCODES.IN, 'instanceof': this.OPCODES.INSTANCEOF,
                '**': this.OPCODES.POW,
                '&': this.OPCODES.BIT_AND, '|': this.OPCODES.BIT_OR, '^': this.OPCODES.BIT_XOR,
                '<<': this.OPCODES.SHL, '>>': this.OPCODES.SHR, '>>>': this.OPCODES.USHR
            };
            
            const op = map[node.operator];
            if (op === undefined) {
                throw new Error(`[Compiler] Unknown/Unmapped Binary Operator: ${node.operator}`);
            }
            this.buffer.write8(op);
        },

        _visitLogical(node) {
            this._visit(node.left);
            this.buffer.write8(this.OPCODES.DUP);
            let jumpCode = (node.operator === '&&') ? this.OPCODES.JUMP_IF_FALSE : this.OPCODES.JUMP_IF_TRUE;
            this.buffer.write8(jumpCode);
            const jumpIdx = this.buffer.write16(0);
            this.buffer.write8(this.OPCODES.POP);
            this._visit(node.right);
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(jumpIdx, endAddr - jumpIdx - 2);
        },

        _visitIdentifier(node, mode) {
            if (node.name === 'undefined' && mode === 'LOAD') {
                this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                return;
            }

            // B"H - CRITICAL GLOBAL GUARD
            // Prevents local variables from shadowing these core primitives, 
            // ensuring opcode LOAD_GLOBAL is always used.
            const criticalGlobals = ['Object', 'Array', 'String', 'Number', 'console', 'window', 'document', 'Math', 'JSON', 'Symbol', 'Error', 'Promise'];
            if (criticalGlobals.includes(node.name)) {
                const nameIdx = this._addConstant(node.name);
                this.buffer.write8(mode === 'LOAD' ? this.OPCODES.LOAD_GLOBAL : this.OPCODES.STORE_GLOBAL);
                this.buffer.write16(nameIdx);
                return;
            }

            const res = this.scope.resolve(node.name);
            if (res && res.type === 'LOCAL') {
                this.buffer.write8(mode === 'LOAD' ? this.OPCODES.LOAD_LOCAL : this.OPCODES.STORE_LOCAL);
                this.buffer.write8(res.index);
            } else if (res && res.type === 'UPVALUE') {
                this.buffer.write8(mode === 'LOAD' ? this.OPCODES.LOAD_UPVALUE : this.OPCODES.STORE_UPVALUE);
                this.buffer.write8(res.index); 
                this.buffer.write8(res.depth); 
            } else {
                const nameIdx = this._addConstant(node.name);
                this.buffer.write8(mode === 'LOAD' ? this.OPCODES.LOAD_GLOBAL : this.OPCODES.STORE_GLOBAL);
                this.buffer.write16(nameIdx);
            }
        },

        _visitCall(node) {
            if (node.callee.type === 'Identifier' && node.callee.name === 'syscall') {
                const idArg = node.arguments[0];
                if (!idArg || idArg.type !== 'Literal') {
                    throw new Error("Syscall ID must be a literal number (e.g., syscall(0, ...))");
                }
                for (let i = 1; i < node.arguments.length; i++) {
                    this._visit(node.arguments[i]);
                }
                this.buffer.write8(this.OPCODES.SYSCALL);
                this.buffer.write8(idArg.value);
                this.buffer.write8(node.arguments.length - 1); 
                return;
            }

            if (node.callee.type === 'MemberExpression') {
                 this._visit(node.callee.object);
                 this.buffer.write8(this.OPCODES.DUP);
                 if (node.callee.computed) this._visit(node.callee.property);
                 else this._emitConstant(node.callee.property.name);
                 this.buffer.write8(this.OPCODES.GET_PROP);
            } else {
                 this._visit(node.callee);
                 this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                 this.buffer.write8(this.OPCODES.SWAP);
            }
            node.arguments.forEach(arg => this._visit(arg));
            
            let callOp = this.OPCODES.CALL;
            if (callOp === undefined) callOp = 0x71; 
            
            this.buffer.write8(callOp);
            this.buffer.write8(node.arguments.length);

            if (node.callee.type === 'Identifier' && node.callee.name === 'importScripts') {
                this.buffer.write8(this.OPCODES.AWAIT); 
            }
        },

        _visitMember(node) {
            this._visit(node.object);
            if (node.computed) this._visit(node.property);
            else this._emitConstant(node.property.name);
            this.buffer.write8(this.OPCODES.GET_PROP);
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
            if (node.operator === 'delete') {
                if (node.argument.type === 'MemberExpression') {
                    this._visit(node.argument.object);
                    if (node.argument.computed) this._visit(node.argument.property);
                    else this._emitConstant(node.argument.property.name);
                    this.buffer.write8(this.OPCODES.DELETE_PROP);
                } else {
                    this.buffer.write8(this.OPCODES.PUSH_TRUE); 
                }
                return;
            }
            this._visit(node.argument);
            if (node.operator === '!') this.buffer.write8(this.OPCODES.NOT);
            else if (node.operator === '-') this.buffer.write8(this.OPCODES.NEGATE);
            else if (node.operator === 'typeof') this.buffer.write8(this.OPCODES.TYPEOF);
            else if (node.operator === 'void') this.buffer.write8(this.OPCODES.VOID);
            else if (node.operator === '~') this.buffer.write8(this.OPCODES.BIT_NOT);
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

        _visitNew(node) {
            this._visit(node.callee);
            node.arguments.forEach(arg => this._visit(arg));
            this.buffer.write8(this.OPCODES.NEW);
            this.buffer.write8(node.arguments.length);
        },

        _visitArrowFunctionExpression(node) {
            this._visitFuncExpr(node, true);
        },

        _visitSequence(node) {
            node.expressions.forEach((expr, index) => {
                this._visit(expr);
                if (index < node.expressions.length - 1) this.buffer.write8(this.OPCODES.POP);
            });
        },

        _visitConditional(node) {
            this._visit(node.test);
            this.buffer.write8(this.OPCODES.JUMP_IF_FALSE);
            const elseJump = this.buffer.write16(0);
            this._visit(node.consequent);
            this.buffer.write8(this.OPCODES.JUMP);
            const endJump = this.buffer.write16(0);
            const elseAddr = this.buffer.currentAddress;
            this.buffer.patch16(elseJump, elseAddr - elseJump - 2);
            this._visit(node.alternate);
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(endJump, endAddr - endJump - 2);
        },

        _visitAwait(node) {
            this._visit(node.argument);
            this.buffer.write8(this.OPCODES.AWAIT);
        },

        _visitYield(node) {
            if (node.argument) this._visit(node.argument);
            else this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
            this.buffer.write8(node.delegate ? this.OPCODES.YIELD_STAR : this.OPCODES.YIELD);
        },

        _visitTaggedTemplate(node) {
            this._visit(node.tag);
            this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
            this.buffer.write8(this.OPCODES.ALLOC_ARRAY); 
            node.quasi.expressions.forEach(e => this._visit(e));
            this.buffer.write8(this.OPCODES.CALL);
            this.buffer.write8(1 + node.quasi.expressions.length);
        },

        _visitClassExpr(node) {
            // 1. SuperClass (or null)
            if (node.superClass) this._visit(node.superClass);
            else this.buffer.write8(this.OPCODES.PUSH_NULL);

            // 2. Compile Constructor
            const ctor = node.body.body.find(m => m.kind === 'constructor');
            if (ctor) {
                this._visitFuncExpr(ctor.value); 
            } else {
                this.buffer.write8(this.OPCODES.PUSH_NULL);
            }

            // 3. Make Class (Links prototype chain)
            // Stack: [Super, ConstructorClosure] -> [ClassClosure]
            this.buffer.write8(this.OPCODES.MAKE_CLASS);
            this.buffer.write16(0); 

            // 4. Define Methods
            node.body.body.forEach(method => {
                if (method.kind === 'constructor') return;

                this.buffer.write8(this.OPCODES.DUP); // Keep Class on Stack (Stack: [Class, Class])
                
                // Target: Class (static) or Class.prototype (instance)
                if (!method.static) {
                    this._emitConstant('prototype');
                    this.buffer.write8(this.OPCODES.GET_PROP); 
                    // Stack: [Class, Prototype]
                }

                // Key
                if (method.computed) this._visit(method.key);
                else this._emitConstant(method.key.name);

                // Value (Closure)
                this._visitFuncExpr(method.value);
                // Stack: [Class, Target, Key, Value]

                // Assign: target[key] = value
                this.buffer.write8(this.OPCODES.SET_PROP); 
                // SET_PROP consumes [Target, Key, Value] and pushes [Value]
                // Stack: [Class, Value]
                
                this.buffer.write8(this.OPCODES.POP); // Pop the value result of SET_PROP
                // Stack: [Class]
                
                // B"H - BUG FIX (Fix 34): 
                // Removed extra POP. SET_PROP already consumed the target (Prototype/Class copy).
                // If we pop again, we lose the Class for the next iteration!
            });
        },
        
        _visitMetaProperty(node) {
            if (node.meta.name === 'new' && node.property.name === 'target') {
                this.buffer.write8(this.OPCODES.PUSH_META);
                this.buffer.write8(0);
            } else if (node.meta.name === 'import' && node.property.name === 'meta') {
                this.buffer.write8(this.OPCODES.PUSH_META);
                this.buffer.write8(1);
            }
        },
        
        _visitImportExpression(node) {
            this._visit(node.source);
            this.buffer.write8(this.OPCODES.IMPORT);
        },
        
        _visitChain(node) {
            this._visit(node.expression); 
        }
    };
})(typeof self !== 'undefined' ? self : this);