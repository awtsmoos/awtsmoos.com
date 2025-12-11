// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};
    root.MerkavaCompiler.Visitors = root.MerkavaCompiler.Visitors || {};

    root.MerkavaCompiler.Visitors.Declarations = {
        _visitVarDecl(node) {
            node.declarations.forEach(decl => {
                if (decl.init) this._visit(decl.init);
                else this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                
                if (decl.id.type === 'Identifier') {
                    if (this.scope.depth > 0) this.scope.declare(decl.id.name);
                    this._visitIdentifier(decl.id, 'STORE');
                } else {
                    // Pattern destructuring handled at runtime via opcode or expansion
                    this.buffer.write8(this.OPCODES.POP); // Placeholder drop
                }
                this.buffer.write8(this.OPCODES.POP); // Consume expression result
            });
        },

        _visitFuncDecl(node) {
            const func = { ...node, type: 'FunctionExpression' };
            if (this.scope.depth > 0) this.scope.declare(node.id.name);
            this._visitFuncExpr(func); 
            this._visitIdentifier(node.id, 'STORE');
            this.buffer.write8(this.OPCODES.POP); 
        },

        _visitClassDecl(node) {
            this._visitClassExpr(node);
            if (node.id) {
                if (this.scope.depth > 0) this.scope.declare(node.id.name);
                this._visitIdentifier(node.id, 'STORE');
                this.buffer.write8(this.OPCODES.POP);
            }
        },

        _visitExportNamed(node) {
            if (node.declaration) this._visit(node.declaration);
        },

        _visitExportDefault(node) {
            this._visit(node.declaration);
            this.buffer.write8(this.OPCODES.POP);
        },
        
        _visitImport(node) { /* Handled by environment */ }
    };
})(typeof self !== 'undefined' ? self : this);