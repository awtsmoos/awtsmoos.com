
// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};
    root.MerkavaCompiler.Visitors = root.MerkavaCompiler.Visitors || {};

    root.MerkavaCompiler.Visitors.Declarations = {
        _visitFuncDecl(node) {
            // Function Declaration logic
            // 1. Compile the function expression part (pushes closure to stack)
            this._visitFuncExpr(node);
            
            // 2. Store it in the identifier
            if (node.id) {
                // Determine scope was already handled in Pass 0 of _compileBlock
                this._visitIdentifier(node.id, 'STORE');
            } else {
                // Anonymous function declaration (e.g. export default)
                this.buffer.write8(this.OPCODES.POP);
            }
        },

        _visitClassDecl(node) {
            // Class Declaration
            this._visitClassExpr(node); // Pushes constructor to stack
            
            if (node.id) {
                this._visitIdentifier(node.id, 'STORE');
            } else {
                this.buffer.write8(this.OPCODES.POP);
            }
        },

        _visitVarDecl(node) {
            node.declarations.forEach(decl => {
                // 1. Push Initializer (or undefined)
                if (decl.init) this._visit(decl.init);
                else this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                
                // 2. Handle Binding
                if (decl.id.type === 'Identifier') {
                    if (this.scope.depth > 0) this.scope.declare(decl.id.name);
                    this._visitIdentifier(decl.id, 'STORE');
                } else if (decl.id.type === 'ObjectPattern') {
                    // B"H - Destructuring Support
                    // Stack: [InitValue]
                    this._compileObjectDestructuring(decl.id);
                    // Pop the InitValue after destructuring is done
                    this.buffer.write8(this.OPCODES.POP); 
                } else {
                    // Fallback for unsupported patterns (ArrayPattern etc.)
                    console.warn("[Compiler] Unsupported declaration pattern:", decl.id.type);
                    this.buffer.write8(this.OPCODES.POP); 
                }
            });
        },
        
        _compileObjectDestructuring(pattern) {
            // Stack contains [SourceObj]
            const excludedKeys = [];
            
            pattern.properties.forEach(prop => {
                if (prop.type === 'RestElement') {
                    // B"H - Rest Element Logic
                    // Stack: [Source]
                    this.buffer.write8(this.OPCODES.DUP); // [Source, Source]
                    
                    // Create Excluded Keys Array
                    this.buffer.write8(this.OPCODES.ALLOC_ARRAY); // [Source, Source, []]
                    
                    // Push keys into the array
                    excludedKeys.forEach(key => {
                        this._emitConstant(key);
                        this.buffer.write8(this.OPCODES.ARRAY_PUSH);
                    });
                    
                    this.buffer.write8(this.OPCODES.OBJECT_REST); // [Source, RestObject]
                    
                    if (prop.argument.type === 'Identifier') {
                        if (this.scope.depth > 0) this.scope.declare(prop.argument.name);
                        this._visitIdentifier(prop.argument, 'STORE');
                    } else {
                        this.buffer.write8(this.OPCODES.POP);
                    }
                    return;
                }

                // Normal Property
                this.buffer.write8(this.OPCODES.DUP); // [Source, Source]
                
                // Key
                if (prop.key.type === 'Identifier' && !prop.computed) {
                    this._emitConstant(prop.key.name);
                    excludedKeys.push(prop.key.name);
                } else {
                    this._visit(prop.key);
                    // Dynamic keys are ignored for REST exclusion in this version
                }
                
                this.buffer.write8(this.OPCODES.GET_PROP); // [Source, Value]
                
                const target = prop.value;
                if (target.type === 'Identifier') {
                    if (this.scope.depth > 0) this.scope.declare(target.name);
                    this._visitIdentifier(target, 'STORE'); // [Source] (STORE pops value)
                } else if (target.type === 'ObjectPattern') {
                    // Recursive Destructuring
                    this._compileObjectDestructuring(target);
                    this.buffer.write8(this.OPCODES.POP); // Pop sub-object
                } else {
                    // Drop value if we can't bind it (e.g., specific value matching not supported)
                    this.buffer.write8(this.OPCODES.POP);
                }
            });
        },

        _visitExportNamed(node) {
            if (node.declaration) {
                this._visit(node.declaration);
            }
        },
        
        _visitExportDefault(node) {
            this._visit(node.declaration);
            this.buffer.write8(this.OPCODES.POP); 
        },
        
        _visitImport(node) {
            // Import logic handled by custom loaders or ignored in this simplified VM
        }
    };
})(typeof self !== 'undefined' ? self : this);
