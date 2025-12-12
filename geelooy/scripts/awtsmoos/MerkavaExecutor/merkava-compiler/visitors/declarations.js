

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
            if (node.declaration) {
                this._visit(node.declaration); // Defines the var/func locally
                
                // B"H - Export Logic: Register to 'exports' global
                const names = [];
                if (node.declaration.type === 'FunctionDeclaration') {
                    names.push(node.declaration.id.name);
                } else if (node.declaration.type === 'VariableDeclaration') {
                    node.declaration.declarations.forEach(d => names.push(d.id.name));
                } else if (node.declaration.type === 'ClassDeclaration' && node.declaration.id) {
                    names.push(node.declaration.id.name);
                }
                
                names.forEach(name => {
                    this._emitConstant('exports');
                    this.buffer.write8(this.OPCODES.LOAD_GLOBAL); // [exports]
                    this.buffer.write8(this.OPCODES.DUP);         // [exports, exports]
                    
                    this._emitConstant(name); // [exports, exports, "name"]
                    
                    // Load the value we just defined
                    this._visitIdentifier({ type: 'Identifier', name }, 'LOAD'); // [exports, exports, "name", val]
                    
                    this.buffer.write8(this.OPCODES.SET_PROP); // [exports, val]
                    this.buffer.write8(this.OPCODES.POP); // [exports]
                    this.buffer.write8(this.OPCODES.POP); // []
                });
            }
        },

        _visitExportDefault(node) {
            this._visit(node.declaration); // Push Value
            // Store to exports.default
            this._emitConstant('exports');
            this.buffer.write8(this.OPCODES.LOAD_GLOBAL); // [val, exports]
            this.buffer.write8(this.OPCODES.SWAP);        // [exports, val]
            this.buffer.write8(this.OPCODES.DUP);         // [exports, val, val] (Keep val for expression result?)
            // Actually export default declaration usually returns the value? 
            // In modules top level, return value is ignored.
            // Stack: [exports, val]
            this._emitConstant('default');                // [exports, val, "default"]
            this.buffer.write8(this.OPCODES.SWAP);        // [exports, "default", val]
            this.buffer.write8(this.OPCODES.SET_PROP);    // [exports, val]
            this.buffer.write8(this.OPCODES.POP);         // [exports]
            this.buffer.write8(this.OPCODES.POP);         // []
        },
        
        _visitImport(node) { 
            // B"H - Implement Import Logic
            this._visit(node.source); // Push filename string
            this.buffer.write8(this.OPCODES.IMPORT_MODULE); 
            // Stack now has [ModuleExportsObject]
            
            node.specifiers.forEach(spec => {
                if (spec.type === 'ImportNamespaceSpecifier') {
                    // import * as C from ...
                    this.buffer.write8(this.OPCODES.DUP); // Keep module object for potentially others
                    if (this.scope.depth > 0) this.scope.declare(spec.local.name);
                    this._visitIdentifier(spec.local, 'STORE'); 
                } else if (spec.type === 'ImportDefaultSpecifier') {
                    // import C from ...
                    this.buffer.write8(this.OPCODES.DUP); // [Mod, Mod]
                    this._emitConstant('default');
                    this.buffer.write8(this.OPCODES.GET_PROP); // [Mod, DefaultVal]
                    if (this.scope.depth > 0) this.scope.declare(spec.local.name);
                    this._visitIdentifier(spec.local, 'STORE'); // [Mod]
                } else if (spec.type === 'ImportSpecifier') {
                    // import { C } from ...
                    this.buffer.write8(this.OPCODES.DUP);
                    this._emitConstant(spec.imported.name);
                    this.buffer.write8(this.OPCODES.GET_PROP);
                    if (this.scope.depth > 0) this.scope.declare(spec.local.name);
                    this._visitIdentifier(spec.local, 'STORE');
                }
            });
            this.buffer.write8(this.OPCODES.POP); // Pop Module Object
        }
    };
})(typeof self !== 'undefined' ? self : this);
