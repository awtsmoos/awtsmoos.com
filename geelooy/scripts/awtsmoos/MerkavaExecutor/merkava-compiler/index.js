

// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};
    const getOpcodes = () => (root.MerkavaOpcodes && root.MerkavaOpcodes.OPCODES) || {};

    // B"H - Re-aggregate Visitors on every execution to ensure freshness
    const getVisitors = () => Object.assign({}, 
        root.MerkavaCompiler.Visitors.Declarations,
        root.MerkavaCompiler.Visitors.Expressions,
        root.MerkavaCompiler.Visitors.Statements,
        root.MerkavaCompiler.Visitors.Literals,
        {
            _visit(node) {
                if (!node) return;
                switch (node.type) {
                    case 'Literal': this._visitLiteral(node); break;
                    case 'TemplateLiteral': this._visitTemplateLiteral(node); break;
                    case 'Identifier': this._visitIdentifier(node, 'LOAD'); break;
                    case 'ThisExpression': this.buffer.write8(this.OPCODES.PUSH_THIS); break;
                    case 'Super': this.buffer.write8(this.OPCODES.PUSH_THIS); break;
                    
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

                    case 'ExpressionStatement': this._visit(node.expression); this.buffer.write8(this.OPCODES.POP); break;
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
                        this.buffer.write8(this.OPCODES.PUSH_NULL);
                }
            }
        }
    );

    class Compiler {
        constructor() {
            this.OPCODES = getOpcodes();
            this.constants = [];
            this.buffer = new root.MerkavaCompiler.BytecodeBuilder();
            this.scope = new root.MerkavaCompiler.Scope(null, true);
            this.loops = [];
            
            // B"H - Bind Visitors to instance to ensure latest logic is used
            Object.assign(this, getVisitors());
        }

        compile(ast) {
            if (ast.type === 'Program') this._compileBlock(ast.body);
            else this._visit(ast);
            this.buffer.write8(this.OPCODES.HALT);
            return { bytecode: this.buffer.toBuffer(), constants: this.constants };
        }

        _addConstant(value) {
            this.constants.push(value);
            return this.constants.length - 1; 
        }

        _emitConstant(value) {
            const idx = this._addConstant(value);
            this.buffer.write8(this.OPCODES.PUSH_CONST);
            this.buffer.write16(idx);
        }

        _compileBlock(statements) {
            if (Array.isArray(statements)) {
                // Pass 0: Pre-declare Identifiers (Scope Population)
                // B"H - TIKKUN: Only declare locals if we are NOT at root (depth > 0).
                // At root (depth 0), variables are implicitly GLOBALS to ensure persistence.
                if (this.scope.depth > 0) {
                    statements.forEach(s => {
                        if (s.type === 'FunctionDeclaration' && s.id) {
                            this.scope.declare(s.id.name);
                        } else if (s.type === 'VariableDeclaration') {
                            s.declarations.forEach(d => {
                                if (d.id.type === 'Identifier') this.scope.declare(d.id.name);
                            });
                        }
                    });
                }

                // Pass 1: Compile Function Declarations (Hoisting support)
                statements.forEach(s => {
                    if (s.type === 'FunctionDeclaration') {
                        this._visit(s);
                    }
                });

                // Pass 2: Compile Everything Else
                statements.forEach(s => {
                    if (s.type !== 'FunctionDeclaration') {
                        this._visit(s);
                    }
                });
            }
        }

        _visitFuncExpr(node, isArrow = false) {
            const sub = new Compiler();
            sub.scope = new root.MerkavaCompiler.Scope(this.scope, true);
            
            node.params.forEach(p => {
                if (p.type === 'Identifier') sub.scope.declare(p.name);
            });
            
            if (node.body.type === 'BlockStatement') {
                sub._compileBlock(node.body.body);
                sub.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                sub.buffer.write8(this.OPCODES.RETURN);
            } else {
                sub._visit(node.body);
                sub.buffer.write8(this.OPCODES.RETURN);
            }
            
            const code = { bytecode: sub.buffer.toBuffer(), constants: sub.constants };
            this.buffer.write8(this.OPCODES.CLOSURE);
            this.buffer.write16(this._addConstant(code));
            
            let flags = 0;
            if (node.async) flags |= 1;
            if (node.generator) flags |= 2;
            if (isArrow) flags |= 4;
            this.buffer.write8(flags);
        }
    }

    root.MerkavaCompiler.Compiler = Compiler;
})(typeof self !== 'undefined' ? self : this);