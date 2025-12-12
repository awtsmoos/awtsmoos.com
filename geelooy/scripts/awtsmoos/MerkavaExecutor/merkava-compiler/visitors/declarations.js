
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
                    // Scope declaration happens in Pass 0 of _compileBlock, 
                    // but we check depth > 0 for block-scoped safety in nested constructs
                    if (this.scope.depth > 0) this.scope.declare(decl.id.name);
                    this._visitIdentifier(decl.id, 'STORE');
                } else {
                    this.buffer.write8(this.OPCODES.POP); 
                }
            });
        },

        _visitFuncDecl(node) {
            const func = { ...node, type: 'FunctionExpression' };
            // Pass 0 handles declaration for hoisting
            if (this.scope.depth > 0) this.scope.declare(node.id.name);
            
            this._visitFuncExpr(func); 
            // Store the closure into the variable
            this._visitIdentifier(node.id, 'STORE');
        },

        _visitClassDecl(node) {
            this._visitClassExpr(node);
            if (node.id) {
                if (this.scope.depth > 0) this.scope.declare(node.id.name);
                this._visitIdentifier(node.id, 'STORE');
            } else {
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
