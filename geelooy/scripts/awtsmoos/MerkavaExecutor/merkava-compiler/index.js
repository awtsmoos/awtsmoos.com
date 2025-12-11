// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};
    const getOpcodes = () => (root.MerkavaOpcodes && root.MerkavaOpcodes.OPCODES) || {};

    // Aggregated Visitors
    const Visitors = Object.assign({}, 
        root.MerkavaCompiler.Visitors.Declarations,
        root.MerkavaCompiler.Visitors.Expressions,
        root.MerkavaCompiler.Visitors.Statements,
        root.MerkavaCompiler.Visitors.Literals,
        {
            // Main Dispatcher
            _visit(node) {
                if (!node) return;
                switch (node.type) {
                    case 'Literal': this._visitLiteral(node); break;
                    case 'TemplateLiteral': this._visitTemplateLiteral(node); break; // B"H - Added TemplateLiteral
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
                    case 'FunctionExpression': this._visitFuncExpr(node); break; // B"H - Added FunctionExpression
                    case 'VariableDeclaration': this._visitVarDecl(node); break;
                    case 'AssignmentExpression': this._visitAssignment(node); break;
                    case 'IfStatement': this._visitIf(node); break;
                    case 'WhileStatement': this._visitWhile(node); break;
                    case 'ForStatement': this._visitFor(node); break; // B"H - Added For
                    case 'ForOfStatement': this._visitForOf(node); break; // B"H - Added ForOf
                    case 'ObjectExpression': this._visitObject(node); break;
                    case 'ArrayExpression': this._visitArray(node); break;
                    case 'ThisExpression': this.buffer.write8(this.OPCODES.PUSH_THIS); break;
                    case 'NewExpression': this._visitNew(node); break;
                    case 'BreakStatement': this._visitBreak(node); break;
                    case 'ContinueStatement': this._visitContinue(node); break;
                    
                    case 'TryStatement': this._visitTry(node); break;
                    case 'ThrowStatement': this._visitThrow(node); break;
                    case 'ExportNamedDeclaration': this._visitExportNamed(node); break;
                    case 'ExportDefaultDeclaration': this._visitExportDefault(node); break;
                    case 'ImportDeclaration': this._visitImport(node); break;
                    
                    case 'EmptyStatement': break;
                    default: throw new Error(`[Compiler] Unsupported Node Type: ${node.type}`);
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
            statements.forEach(s => this._visit(s));
        }

        _visitFuncExpr(node) {
            const sub = new Compiler();
            sub.scope = new root.MerkavaCompiler.Scope(this.scope, true);
            node.params.forEach(p => sub.scope.declare(p.name));
            
            if (node.body.type === 'BlockStatement') {
                sub._compileBlock(node.body.body);
                sub.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                sub.buffer.write8(this.OPCODES.RETURN);
            }
            
            const code = { bytecode: sub.buffer.toBuffer(), constants: sub.constants };
            this.buffer.write8(this.OPCODES.CLOSURE);
            this.buffer.write16(this._addConstant(code));
        }
    }

    Object.assign(Compiler.prototype, Visitors);
    root.MerkavaCompiler.Compiler = Compiler;
})(typeof self !== 'undefined' ? self : this);