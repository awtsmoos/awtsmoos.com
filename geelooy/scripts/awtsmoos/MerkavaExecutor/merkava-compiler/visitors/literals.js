
// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};
    root.MerkavaCompiler.Visitors = root.MerkavaCompiler.Visitors || {};

    root.MerkavaCompiler.Visitors.Literals = {
        _visitLiteral(node) {
            const v = node.value;
            if (v === null) this.buffer.write8(this.OPCODES.PUSH_NULL);
            else if (v === undefined) this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
            else if (v === true) this.buffer.write8(this.OPCODES.PUSH_TRUE);
            else if (v === false) this.buffer.write8(this.OPCODES.PUSH_FALSE);
            else this._emitConstant(v);
        },

        _visitTemplateLiteral(node) {
            const quasis = node.quasis;
            const exprs = node.expressions;
            this._emitConstant(quasis[0].value.cooked);
            for (let i = 0; i < exprs.length; i++) {
                this._visit(exprs[i]);
                this.buffer.write8(this.OPCODES.ADD);
                this._emitConstant(quasis[i + 1].value.cooked);
                this.buffer.write8(this.OPCODES.ADD);
            }
        },

        _visitObject(node) {
            this.buffer.write8(this.OPCODES.ALLOC_OBJECT);
            // B"H - Updated for Spread Support
            node.properties.forEach(prop => {
                this.buffer.write8(this.OPCODES.DUP); // Keep object for next Op
                
                if (prop.type === 'SpreadElement') {
                    this._visit(prop.argument);
                    this.buffer.write8(this.OPCODES.OBJECT_MERGE);
                } else {
                    if (prop.key.type === 'Identifier' && !prop.computed) this._emitConstant(prop.key.name);
                    else this._visit(prop.key);
                    
                    this._visit(prop.value);
                    this.buffer.write8(this.OPCODES.SET_PROP);
                    this.buffer.write8(this.OPCODES.POP); // Pop the value left by SET_PROP
                }
            });
        },
 
        _visitArray(node) {
            this.buffer.write8(this.OPCODES.ALLOC_ARRAY);
            // B"H - Updated for Spread Support: Use PUSH instead of Index Assignment
            // FIX: Removed DUP because ARRAY_PUSH/SPREAD peeks at the array.
            node.elements.forEach(elem => {
                if (!elem) {
                    // Sparse array (e.g. [1,,2]). Push undefined for now.
                    this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
                    this.buffer.write8(this.OPCODES.ARRAY_PUSH);
                    return;
                }
                
                if (elem.type === 'SpreadElement') {
                    this._visit(elem.argument);
                    this.buffer.write8(this.OPCODES.ARRAY_SPREAD);
                } else {
                    this._visit(elem);
                    this.buffer.write8(this.OPCODES.ARRAY_PUSH);
                }
            });
        }
    };
})(typeof self !== 'undefined' ? self : this);
