

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
            // B"H - Handling 'export const foo = ...'
            if (node.declaration) {
                this._visit(node.declaration); // Defines the var/func locally
                
                const names = [];
                if (node.declaration.type === 'FunctionDeclaration') {
                    names.push(node.declaration.id.name);
                } else if (node.declaration.type === 'VariableDeclaration') {
                    node.declaration.declarations.forEach(d => {
                        // Handle Identifier (const x = 1)
                        if (d.id.type === 'Identifier') names.push(d.id.name);
                        // Handle ObjectPattern (const { x } = y) - Simplified
                        // Note: Destructuring support is limited in this lightweight compiler.
                    });
                } else if (node.declaration.type === 'ClassDeclaration' && node.declaration.id) {
                    names.push(node.declaration.id.name);
                }
                
                // console.log("Compiling Exports:", names);

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
            
            // B"H - Handling 'export { foo, bar as baz }'
            if (node.specifiers && node.specifiers.length > 0) {
                node.specifiers.forEach(spec => {
                    const localName = spec.local.name;
                    const exportName = spec.exported.name;
                    
                    this._emitConstant('exports');
                    this.buffer.write8(this.OPCODES.LOAD_GLOBAL); // [exports]
                    this.buffer.write8(this.OPCODES.DUP);         // [exports, exports]
                    
                    this._emitConstant(exportName); // [exports, exports, "exportName"]
                    
                    // Load the local value
                    this._visitIdentifier({ type: 'Identifier', name: localName }, 'LOAD'); 
                    
                    this.buffer.write8(this.OPCODES.SET_PROP);
                    this.buffer.write8(this.OPCODES.POP);
                    this.buffer.write8(this.OPCODES.POP);
                });
            }
        },

        _visitExportDefault(node) {
            if (node.declaration.type === 'FunctionDeclaration' || node.declaration.type === 'ClassDeclaration') {
                // If named, define locally first
                if (node.declaration.id) {
                    this._visit(node.declaration);
                    // Push Identifier to store in default
                    this._visitIdentifier(node.declaration.id, 'LOAD');
                } else {
                    // Anonymous function/class expression
                    if (node.declaration.type === 'FunctionDeclaration') {
                        // Treat as expression
                        this._visitFuncExpr({...node.declaration, type: 'FunctionExpression'});
                    } else {
                        this._visitClassExpr({...node.declaration, type: 'ClassExpression'});
                    }
                }
            } else {
                this._visit(node.declaration); // Push Value (Expression)
            }
            
            // Store to exports.default
            // Stack: [Val]
            this._emitConstant('exports');
            this.buffer.write8(this.OPCODES.LOAD_GLOBAL); // [Val, exports]
            this.buffer.write8(this.OPCODES.SWAP);        // [exports, Val]
            this.buffer.write8(this.OPCODES.DUP);         // [exports, Val, Val]
            
            this._emitConstant('default');                // [exports, Val, Val, "default"]
            this.buffer.write8(this.OPCODES.SWAP);        // [exports, Val, "default", Val]
            this.buffer.write8(this.OPCODES.SET_PROP);    // [exports, Val] -> exports['default'] = Val
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