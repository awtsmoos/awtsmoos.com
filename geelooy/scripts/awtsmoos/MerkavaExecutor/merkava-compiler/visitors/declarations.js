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
                    this.buffer.write8(this.OPCODES.POP); // Destructuring TODO
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
            // 1. Compile Class Definition (similar to Class Expression)
            this._visitClassExpr(node);
            
            // 2. Store in Identifier
            if (node.id) {
                if (this.scope.depth > 0) this.scope.declare(node.id.name);
                this._visitIdentifier(node.id, 'STORE');
                this.buffer.write8(this.OPCODES.POP);
            } else {
                // Export default class ... (no id) -> leaves class on stack
            }
        },

        _visitExportNamed(node) {
            if (node.declaration) {
                this._visit(node.declaration);
            }
            // Specifiers are metadata, no opcode needed for runtime
        },

        _visitExportDefault(node) {
            this._visit(node.declaration);
            // In a module system, this would assign to 'default' export
            this.buffer.write8(this.OPCODES.POP);
        },
        
        _visitExportAll(node) {
            // export * from ...
            // Handled by linker, no runtime opcodes usually
        },

        _visitImport(node) {
            // Imports are hoisted and handled by linker/loader
        }
    };
})(typeof self !== 'undefined' ? self : this);