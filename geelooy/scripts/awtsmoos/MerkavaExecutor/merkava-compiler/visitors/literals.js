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
            // Compile template literal: `a${b}c` -> "a" + b + "c"
            const quasis = node.quasis;
            const exprs = node.expressions;
            
            // Push the first quasi (string part)
            this._emitConstant(quasis[0].value.cooked);
            
            for (let i = 0; i < exprs.length; i++) {
                // Visit expression
                this._visit(exprs[i]);
                // Concatenate (VM uses JS '+' so it handles string coercion)
                this.buffer.write8(this.OPCODES.ADD);
                
                // Push next quasi
                this._emitConstant(quasis[i + 1].value.cooked);
                // Concatenate
                this.buffer.write8(this.OPCODES.ADD);
            }
        },

        _visitObject(node) {
            this.buffer.write8(this.OPCODES.ALLOC_OBJECT);
            node.properties.forEach(prop => {
                this.buffer.write8(this.OPCODES.DUP);
                if (prop.key.type === 'Identifier' && !prop.computed) this._emitConstant(prop.key.name);
                else this._visit(prop.key);
                this._visit(prop.value);
                this.buffer.write8(this.OPCODES.SET_PROP);
                this.buffer.write8(this.OPCODES.POP);
            });
        },
 
        _visitArray(node) {
            this.buffer.write8(this.OPCODES.ALLOC_ARRAY);
            node.elements.forEach((elem, idx) => {
                if (!elem) return;
                this.buffer.write8(this.OPCODES.DUP);
                this._emitConstant(idx);
                this._visit(elem);
                this.buffer.write8(this.OPCODES.SET_PROP);
                this.buffer.write8(this.OPCODES.POP);
            });
        }
    };
})(typeof self !== 'undefined' ? self : this);