
// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};
    root.MerkavaCompiler.Visitors = root.MerkavaCompiler.Visitors || {};

    root.MerkavaCompiler.Visitors.Declarations = {
        _visitFuncDecl(node) {
            this._visitFuncExpr(node);
            if (node.id) {
                this._visitIdentifier(node.id, 'STORE');
            } else {
                this.buffer.write8(this.OPCODES.POP);
            }
        },

        _visitClassDecl(node) {
            this._visitClassExpr(node);
            if (node.id) {
                this._visitIdentifier(node.id, 'STORE');
            } else {
                this.buffer.write8(this.OPCODES.POP);
            }
        },

        _visitVarDecl(node) {
            node.declarations.forEach(decl => {
                if (decl.init) this._visit(decl.init);
                else this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                
                if (decl.id.type === 'Identifier') {
                    // B"H - Optimized Declaration Logic
                    // If we are in a local scope, ensure the variable is declared.
                    // Note: _compileBlock might have already declared it during hoisting, 
                    // but scope.declare is idempotent, so this is safe.
                    if (this.scope.depth > 0) {
                        const idx = this.scope.declare(decl.id.name);
                        console.log(`[Compiler] Declaring Local '${decl.id.name}' at index ${idx} (Depth: ${this.scope.depth})`);
                    } else {
                        console.log(`[Compiler] Declaring Global '${decl.id.name}'`);
                    }
                    this._visitIdentifier(decl.id, 'STORE');
                } else if (decl.id.type === 'ObjectPattern') {
                    this._compileObjectDestructuring(decl.id);
                    this.buffer.write8(this.OPCODES.POP); 
                } else {
                    console.warn("[Compiler] Unsupported declaration pattern:", decl.id.type);
                    this.buffer.write8(this.OPCODES.POP); 
                }
            });
        },
        
        _compileObjectDestructuring(pattern) {
            const excludedKeys = [];
            pattern.properties.forEach(prop => {
                if (prop.type === 'RestElement') {
                    this.buffer.write8(this.OPCODES.DUP); 
                    this.buffer.write8(this.OPCODES.ALLOC_ARRAY); 
                    excludedKeys.forEach(key => {
                        this._emitConstant(key);
                        this.buffer.write8(this.OPCODES.ARRAY_PUSH);
                    });
                    this.buffer.write8(this.OPCODES.OBJECT_REST);
                    
                    if (prop.argument.type === 'Identifier') {
                        if (this.scope.depth > 0) this.scope.declare(prop.argument.name);
                        this._visitIdentifier(prop.argument, 'STORE');
                    } else {
                        this.buffer.write8(this.OPCODES.POP);
                    }
                    return;
                }

                this.buffer.write8(this.OPCODES.DUP); 
                if (prop.key.type === 'Identifier' && !prop.computed) {
                    this._emitConstant(prop.key.name);
                    excludedKeys.push(prop.key.name);
                } else {
                    this._visit(prop.key);
                }
                
                this.buffer.write8(this.OPCODES.GET_PROP); 
                const target = prop.value;
                if (target.type === 'Identifier') {
                    if (this.scope.depth > 0) this.scope.declare(target.name);
                    this._visitIdentifier(target, 'STORE'); 
                } else if (target.type === 'ObjectPattern') {
                    this._compileObjectDestructuring(target);
                    this.buffer.write8(this.OPCODES.POP); 
                } else {
                    this.buffer.write8(this.OPCODES.POP);
                }
            });
        },

        _visitExportNamed(node) {
            // 1. Process Declaration
            if (node.declaration) {
                this._visit(node.declaration);
                
                // 2. Register Exports
                if (node.declaration.type === 'VariableDeclaration') {
                    node.declaration.declarations.forEach(decl => {
                        if (decl.id.type === 'Identifier') {
                            this._emitExport(decl.id.name, decl.id.name);
                        }
                    });
                } else if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
                    this._emitExport(node.declaration.id.name, node.declaration.id.name);
                } else if (node.declaration.type === 'ClassDeclaration' && node.declaration.id) {
                    this._emitExport(node.declaration.id.name, node.declaration.id.name);
                }
            }
            
            // 3. Process Specifiers (export { a as b })
            if (node.specifiers && node.specifiers.length > 0) {
                node.specifiers.forEach(spec => {
                    this._emitExport(spec.local.name, spec.exported.name);
                });
            }
        },
        
        _emitExport(localName, exportName) {
            // Load 'exports' object
            this.buffer.write8(this.OPCODES.LOAD_GLOBAL);
            this.buffer.write16(this._addConstant('exports'));
            
            // Push Key
            this._emitConstant(exportName);
            
            // Load Value
            this.scope.resolve(localName); // Ensure resolved
            this._visitIdentifier({ type: 'Identifier', name: localName }, 'LOAD');
            
            // Set Property
            this.buffer.write8(this.OPCODES.SET_PROP);
            this.buffer.write8(this.OPCODES.POP); // Pop result
        },
        
        _visitExportDefault(node) {
            // Handle Expression
            if (node.declaration.type === 'FunctionDeclaration' || node.declaration.type === 'ClassDeclaration') {
                 this._visit(node.declaration); // This leaves nothing on stack if it's a statement, but here it's decl.
                 // Actually Declarations consume their stack.
                 // We need to load the ID.
                 if (node.declaration.id) {
                     this._emitExport(node.declaration.id.name, 'default');
                 }
            } else {
                // Expression
                this._visit(node.declaration);
                
                // Load 'exports'
                this.buffer.write8(this.OPCODES.LOAD_GLOBAL);
                this.buffer.write16(this._addConstant('exports'));
                
                this.buffer.write8(this.OPCODES.SWAP); // [exports, value]
                this._emitConstant('default'); 
                this.buffer.write8(this.OPCODES.SWAP); // [exports, 'default', value]
                
                this.buffer.write8(this.OPCODES.SET_PROP);
                this.buffer.write8(this.OPCODES.POP);
            }
        },
        
        _visitImport(node) {
            // B"H - Dynamic Import Execution
            this._emitConstant(node.source.value);
            this.buffer.write8(this.OPCODES.IMPORT_MODULE);
            this.buffer.write8(this.OPCODES.AWAIT);
            
            // Stack: [ExportsObject]
            
            node.specifiers.forEach(spec => {
                this.buffer.write8(this.OPCODES.DUP); // Keep Exports
                
                if (spec.type === 'ImportDefaultSpecifier') {
                    this._emitConstant('default');
                    this.buffer.write8(this.OPCODES.GET_PROP);
                } else if (spec.type === 'ImportNamespaceSpecifier') {
                    // Use the object itself
                } else { 
                    this._emitConstant(spec.imported.name);
                    this.buffer.write8(this.OPCODES.GET_PROP);
                }
                
                // Store Local
                if (this.scope.depth > 0) this.scope.declare(spec.local.name);
                this._visitIdentifier(spec.local, 'STORE');
                
                // B"H - FIX: Do not emit POP here. 
                // STORE consumes the value. DUP kept the Exports object.
                // If we POP here, we lose the Exports object for the next specifier.
            });
            
            this.buffer.write8(this.OPCODES.POP); // Drop Exports (Cleanup)
        }
    };
})(typeof self !== 'undefined' ? self : this);
