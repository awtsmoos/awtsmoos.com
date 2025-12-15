
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
            // B"H - Live Binding Implementation
            // We use __define_live_export(exports, exportName, this, localName)
            // 'this' in a module scope corresponds to the module environment/context.

            // 1. Handle Declarations (export let x = 1;)
            if (node.declaration) {
                this._visit(node.declaration); // Defines the var/func locally
                
                const names = [];
                if (node.declaration.type === 'FunctionDeclaration') {
                    names.push(node.declaration.id.name);
                } else if (node.declaration.type === 'VariableDeclaration') {
                    node.declaration.declarations.forEach(d => {
                        if (d.id.type === 'Identifier') names.push(d.id.name);
                    });
                } else if (node.declaration.type === 'ClassDeclaration' && node.declaration.id) {
                    names.push(node.declaration.id.name);
                }
                
                names.forEach(name => this._emitLiveExportCall(name, name));
            }
            
            // 2. Handle Specifiers (export { x, y as z })
            if (node.specifiers && node.specifiers.length > 0) {
                node.specifiers.forEach(spec => {
                    this._emitLiveExportCall(spec.exported.name, spec.local.name);
                });
            }
        },

        _emitLiveExportCall(exportName, localName) {
            // Generates: __define_live_export(exports, 'exportName', this, 'localName')
            
            // 1. Load function __define_live_export
            const fnIdx = this._addConstant('__define_live_export');
            this.buffer.write8(this.OPCODES.LOAD_GLOBAL);
            this.buffer.write16(fnIdx);
            
            // 2. Push Undefined Context (for CALL) - Stack: [Func, Undefined]
            this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
            this.buffer.write8(this.OPCODES.SWAP);
            
            // 3. Arg1: exports
            const expIdx = this._addConstant('exports');
            this.buffer.write8(this.OPCODES.LOAD_GLOBAL);
            this.buffer.write16(expIdx);
            
            // 4. Arg2: exportName (string)
            this._emitConstant(exportName);
            
            // 5. Arg3: this (Module Environment)
            this.buffer.write8(this.OPCODES.PUSH_THIS);
            
            // 6. Arg4: localName (string)
            this._emitConstant(localName);
            
            // 7. Call (4 arguments)
            this.buffer.write8(this.OPCODES.CALL);
            this.buffer.write8(4);
            this.buffer.write8(this.OPCODES.POP); // Pop return value
        },

        _visitExportDefault(node) {
            if (node.declaration.type === 'FunctionDeclaration' || node.declaration.type === 'ClassDeclaration') {
                if (node.declaration.id) {
                    this._visit(node.declaration);
                    // Named function/class defaults can be live bound
                    this._emitLiveExportCall('default', node.declaration.id.name);
                    return;
                } else {
                    // Anonymous: Treat as expression
                    if (node.declaration.type === 'FunctionDeclaration') {
                        this._visitFuncExpr({...node.declaration, type: 'FunctionExpression'});
                    } else {
                        this._visitClassExpr({...node.declaration, type: 'ClassExpression'});
                    }
                }
            } else {
                this._visit(node.declaration); // Push Value (Expression)
            }
            
            // Standard Value Export for default (exports['default'] = val)
            // Note: 'export default x' is a value snapshot in JS, not a live binding to x (unlike named exports).
            const exportsIdx = this._addConstant('exports');
            this.buffer.write8(this.OPCODES.LOAD_GLOBAL); 
            this.buffer.write16(exportsIdx);
            
            this.buffer.write8(this.OPCODES.SWAP);        
            this.buffer.write8(this.OPCODES.DUP);         
            
            this._emitConstant('default');                
            this.buffer.write8(this.OPCODES.SWAP);        
            this.buffer.write8(this.OPCODES.SET_PROP);    
            this.buffer.write8(this.OPCODES.POP);         
            this.buffer.write8(this.OPCODES.POP);         
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
