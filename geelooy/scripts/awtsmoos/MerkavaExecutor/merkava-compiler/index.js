
// B"H
(function(root) {
    // B"H - Robust Global Resolution (The Truth)
    const getGlobal = () => {
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        if (typeof window !== 'undefined') return window;
        return root;
    };

    const G = getGlobal();
    G.MerkavaCompiler = G.MerkavaCompiler || {};
    
    // B"H - Robust Opcode Resolution
    const getOpcodes = () => {
        // Standard Global
        if (G.MerkavaOpcodes && G.MerkavaOpcodes.OPCODES) {
            return G.MerkavaOpcodes.OPCODES;
        }
        // Default Export (Bundler compatibility)
        if (G.MerkavaOpcodes && G.MerkavaOpcodes.default && G.MerkavaOpcodes.default.OPCODES) {
            return G.MerkavaOpcodes.default.OPCODES;
        }

        // Fallback Definitions to prevent Compiler crash
        console.warn("[MerkavaCompiler] MerkavaOpcodes not found. Using fallback map.");
        return {
            NOP: 0x00, HALT: 0x01, RETURN: 0x02, JUMP: 0x03, JUMP_IF_FALSE: 0x04, JUMP_IF_TRUE: 0x05,
            POP: 0x10, DUP: 0x11, SWAP: 0x12, PUSH_CONST: 0x13, PUSH_UNDEFINED: 0x14, PUSH_NULL: 0x15,
            PUSH_TRUE: 0x16, PUSH_FALSE: 0x17, PUSH_THIS: 0x18, PUSH_META: 0x19,
            LOAD_LOCAL: 0x20, STORE_LOCAL: 0x21, LOAD_GLOBAL: 0x22, STORE_GLOBAL: 0x23,
            LOAD_UPVALUE: 0x24, STORE_UPVALUE: 0x25,
            ALLOC_OBJECT: 0x30, ALLOC_ARRAY: 0x31, GET_PROP: 0x32, SET_PROP: 0x33, DELETE_PROP: 0x34,
            ADD: 0x40, SUB: 0x41, MUL: 0x42, DIV: 0x43, MOD: 0x44, POW: 0x45,
            CLOSURE: 0x70, CALL: 0x71, NEW: 0x72, MAKE_CLASS: 0x73,
            AWAIT: 0x80, SYSCALL: 0x90, THROW: 0x91, DEBUGGER: 0x94,
            ARRAY_PUSH: 0xB3, ARRAY_SPREAD: 0xB4, OBJECT_MERGE: 0xB5, OBJECT_REST: 0xB6
        };
    };

    // B"H - Re-aggregate Visitors from Global Namespace
    const getVisitors = () => {
        const V = G.MerkavaCompiler.Visitors || {};
        
        // B"H - Verify Visitors
        if (!V.Declarations) console.warn("[Compiler] Visitor.Declarations missing!");
        if (!V.Expressions) console.warn("[Compiler] Visitor.Expressions missing!");
        if (!V.Statements) console.warn("[Compiler] Visitor.Statements missing!");
        if (!V.Literals) console.warn("[Compiler] Visitor.Literals missing!");

        return Object.assign({}, 
            V.Declarations,
            V.Expressions,
            V.Statements,
            V.Literals,
            {
                _visit(node) {
                    if (!node) return;
                    switch (node.type) {
                        case 'Literal': this._visitLiteral(node); break;
                        case 'TemplateLiteral': this._visitTemplateLiteral(node); break;
                        case 'Identifier': this._visitIdentifier(node, 'LOAD'); break;
                        case 'ThisExpression': this.buffer.write8(this.OPCODES.PUSH_THIS || 0x18); break;
                        case 'Super': this.buffer.write8(this.OPCODES.PUSH_THIS || 0x18); break;
                        
                        case 'BinaryExpression': this._visitBinary(node); break;
                        case 'LogicalExpression': this._visitLogical(node); break;
                        case 'UnaryExpression': this._visitUnary(node); break;
                        case 'UpdateExpression': this._visitUpdate(node); break;
                        case 'CallExpression': this._visitCall(node); break;
                        case 'MemberExpression': this._visitMember(node); break;
                        case 'NewExpression': this._visitNew(node); break;
                        case 'AssignmentExpression': this._visitAssignment(node); break;
                        case 'SequenceExpression': this._visitSequence(node); break;
                        case 'ConditionalExpression': this._visitConditional(node); break;
                        case 'ArrowFunctionExpression': this._visitArrowFunctionExpression(node); break;
                        case 'FunctionExpression': this._visitFuncExpr(node); break;
                        case 'ClassExpression': this._visitClassExpr(node); break;
                        case 'ObjectExpression': this._visitObject(node); break;
                        case 'ArrayExpression': this._visitArray(node); break;
                        case 'ChainExpression': this._visitChain(node); break;
                        case 'AwaitExpression': this._visitAwait(node); break;
                        case 'YieldExpression': this._visitYield(node); break;
                        case 'TaggedTemplateExpression': this._visitTaggedTemplate(node); break;
                        case 'MetaProperty': this._visitMetaProperty(node); break;
                        case 'ImportExpression': this._visitImportExpression(node); break;

                        // B"H - Force POP (0x10) to ensure statement cleanliness
                        case 'ExpressionStatement': 
                            this._visit(node.expression); 
                            this.buffer.write8(0x10); 
                            break;
                            
                        case 'BlockStatement': this._compileBlock(node.body); break;
                        case 'ReturnStatement': this._visitReturn(node); break;
                        case 'IfStatement': this._visitIf(node); break;
                        case 'WhileStatement': this._visitWhile(node); break;
                        case 'DoWhileStatement': this._visitDoWhile(node); break;
                        case 'ForStatement': this._visitFor(node); break;
                        case 'ForOfStatement': this._visitForOf(node); break;
                        case 'ForInStatement': this._visitForIn(node); break;
                        case 'SwitchStatement': this._visitSwitch(node); break;
                        case 'BreakStatement': this._visitBreak(node); break;
                        case 'ContinueStatement': this._visitContinue(node); break;
                        case 'TryStatement': this._visitTry(node); break;
                        case 'ThrowStatement': this._visitThrow(node); break;
                        case 'DebuggerStatement': this._visitDebugger(node); break;
                        case 'LabeledStatement': this._visitLabeled(node); break;
                        case 'WithStatement': this._visitWith(node); break;
                        
                        case 'FunctionDeclaration': this._visitFuncDecl(node); break;
                        case 'VariableDeclaration': this._visitVarDecl(node); break;
                        case 'ClassDeclaration': this._visitClassDecl(node); break;
                        case 'ExportNamedDeclaration': this._visitExportNamed(node); break;
                        case 'ExportDefaultDeclaration': this._visitExportDefault(node); break;
                        case 'ImportDeclaration': this._visitImport(node); break;
                        
                        case 'EmptyStatement': break;
                        case 'SpreadElement': this._visit(node.argument); break;
                        
                        default: 
                            console.warn(`[Compiler] Emitting NULL for unsupported node: ${node.type}`);
                            this.buffer.write8(this.OPCODES.PUSH_NULL || 0x15);
                    }
                }
            }
        );
    };

    class Compiler {
        constructor() {
            this.OPCODES = getOpcodes();
            
            // B"H - Strict Opcode Validation
            if (this.OPCODES.PUSH_CONST === undefined || this.OPCODES.PUSH_CONST !== 0x13) {
                console.warn("[MerkavaCompiler] PUSH_CONST mismatch. Enforcing 0x13.");
                this.OPCODES.PUSH_CONST = 0x13;
            }
            if (this.OPCODES.POP === undefined || this.OPCODES.POP !== 0x10) {
                 console.warn("[MerkavaCompiler] POP mismatch! Enforcing 0x10");
                 this.OPCODES.POP = 0x10;
            }
            if (this.OPCODES.STORE_GLOBAL === undefined || this.OPCODES.STORE_GLOBAL !== 0x23) {
                 console.warn("[MerkavaCompiler] STORE_GLOBAL mismatch! Enforcing 0x23");
                 this.OPCODES.STORE_GLOBAL = 0x23;
            }
            
            // B"H - Check Dependencies on GLOBAL object
            const Builder = G.MerkavaCompiler.BytecodeBuilder;
            const Scope = G.MerkavaCompiler.Scope;

            if (typeof Builder !== 'function') {
                console.error("[MerkavaCompiler] Global Dump:", G.MerkavaCompiler);
                throw new Error(`Critical: MerkavaCompiler.BytecodeBuilder is missing/invalid. Got: ${typeof Builder}`);
            }
            if (typeof Scope !== 'function') {
                 console.error("[MerkavaCompiler] Global Dump:", G.MerkavaCompiler);
                 throw new Error(`Critical: MerkavaCompiler.Scope is missing/invalid. Got: ${typeof Scope}`);
            }

            this.constants = [];
            this.buffer = new Builder();
            this.scope = new Scope(null, true);
            this.loops = [];
            
            Object.assign(this, getVisitors());
        }

        compile(ast) {
            console.log("[Compiler] Starting compilation...");
            if (ast.type === 'Program') this._compileBlock(ast.body);
            else this._visit(ast);
            this.buffer.write8(this.OPCODES.HALT || 0x01);
            
            // B"H - Debug Bytecode Dump
            const buf = this.buffer.toBuffer();
            // console.log("[Compiler] Bytecode generated (" + buf.length + " bytes)");
            
            return { bytecode: buf, constants: this.constants };
        }

        _addConstant(value) {
            this.constants.push(value);
            return this.constants.length - 1; 
        }

        _emitConstant(value) {
            const idx = this._addConstant(value);
            
            // B"H - Paranoid Check for PUSH_CONST
            let opcode = this.OPCODES.PUSH_CONST;
            if (opcode === undefined || opcode === null || isNaN(opcode)) {
                opcode = 0x13; // Fallback to standard
            }
            
            this.buffer.write8(opcode);
            this.buffer.write16(idx);
        }

        _registerPattern(pattern) {
            if (pattern.type === 'Identifier') {
                this.scope.declare(pattern.name);
            } else if (pattern.type === 'ObjectPattern') {
                pattern.properties.forEach(prop => {
                    if (prop.type === 'RestElement') {
                        this._registerPattern(prop.argument);
                    } else {
                        this._registerPattern(prop.value);
                    }
                });
            } else if (pattern.type === 'ArrayPattern') {
                pattern.elements.forEach(elem => {
                    if (elem) this._registerPattern(elem);
                });
            } else if (pattern.type === 'RestElement') {
                this._registerPattern(pattern.argument);
            }
        }

        _compileBlock(statements) {
            if (Array.isArray(statements)) {
                if (this.scope.depth > 0) {
                    statements.forEach(s => {
                        if (s.type === 'FunctionDeclaration' && s.id) {
                            this.scope.declare(s.id.name);
                        } else if (s.type === 'VariableDeclaration') {
                            s.declarations.forEach(d => {
                                this._registerPattern(d.id);
                            });
                        }
                    });
                }
                statements.forEach(s => {
                    if (s.type === 'FunctionDeclaration') this._visit(s);
                });
                statements.forEach(s => {
                    if (s.type !== 'FunctionDeclaration') this._visit(s);
                });
            }
        }

        _visitFuncExpr(node, isArrow = false) {
            const Scope = G.MerkavaCompiler.Scope; // Use Global reference
            const sub = new Compiler();
            sub.scope = new Scope(this.scope, true);
            node.params.forEach(p => sub._registerPattern(p));
            
            if (node.body.type === 'BlockStatement') {
                sub._compileBlock(node.body.body);
                sub.buffer.write8(this.OPCODES.PUSH_UNDEFINED || 0x14);
                sub.buffer.write8(this.OPCODES.RETURN || 0x02);
            } else {
                sub._visit(node.body);
                sub.buffer.write8(this.OPCODES.RETURN || 0x02);
            }
            
            const code = { bytecode: sub.buffer.toBuffer(), constants: sub.constants };
            this.buffer.write8(this.OPCODES.CLOSURE || 0x70);
            this.buffer.write16(this._addConstant(code));
            
            let flags = 0;
            if (node.async) flags |= 1;
            if (node.generator) flags |= 2;
            if (isArrow) flags |= 4;
            this.buffer.write8(flags);
        }
    }

    G.MerkavaCompiler.Compiler = Compiler;
    console.log("[MerkavaCompiler] Compiler Core Loaded via Global Resolution.");

})(typeof self !== 'undefined' ? self : this);
