// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};
    root.MerkavaCompiler.Visitors = root.MerkavaCompiler.Visitors || {};

    root.MerkavaCompiler.Visitors.Statements = {
        _visitIf(node) {
            this._visit(node.test);
            this.buffer.write8(this.OPCODES.JUMP_IF_FALSE);
            const elseJump = this.buffer.write16(0);
            
            this._visit(node.consequent);
            
            if (node.alternate) {
                this.buffer.write8(this.OPCODES.JUMP);
                const endJump = this.buffer.write16(0);
                const elseAddr = this.buffer.currentAddress;
                this.buffer.patch16(elseJump, elseAddr - elseJump - 2);
                this._visit(node.alternate);
                const endAddr = this.buffer.currentAddress;
                this.buffer.patch16(endJump, endAddr - endJump - 2);
            } else {
                const endAddr = this.buffer.currentAddress;
                this.buffer.patch16(elseJump, endAddr - elseJump - 2);
            }
        },

        _visitWhile(node) {
            const startAddr = this.buffer.currentAddress;
            this._visit(node.test);
            
            this.buffer.write8(this.OPCODES.JUMP_IF_FALSE);
            const endJump = this.buffer.write16(0);
            
            const loop = { breaks: [], continues: [] };
            this.loops.push(loop);
            
            this._visit(node.body);
            
            this.buffer.write8(this.OPCODES.JUMP);
            const backOffset = startAddr - (this.buffer.currentAddress + 2);
            this.buffer.write16(backOffset); 
            
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(endJump, endAddr - endJump - 2);
            
            loop.breaks.forEach(b => this.buffer.patch16(b, endAddr - b - 2));
            loop.continues.forEach(c => this.buffer.patch16(c, startAddr - c - 2));
            this.loops.pop();
        },

        _visitReturn(node) {
            if (node.argument) this._visit(node.argument);
            else this.buffer.write8(this.OPCODES.PUSH_UNDEFINED);
            this.buffer.write8(this.OPCODES.RETURN);
        },

        _visitBreak(node) {
            if (this.loops.length === 0) throw new Error("Illegal break");
            const loop = this.loops[this.loops.length - 1];
            this.buffer.write8(this.OPCODES.JUMP);
            loop.breaks.push(this.buffer.write16(0));
        },
        
        _visitContinue(node) {
            if (this.loops.length === 0) throw new Error("Illegal continue");
            const loop = this.loops[this.loops.length - 1];
            this.buffer.write8(this.OPCODES.JUMP);
            loop.continues.push(this.buffer.write16(0));
        },

        _visitTry(node) {
            this.buffer.write8(this.OPCODES.ENTER_TRY);
            const catchJump = this.buffer.write16(0); 

            this._compileBlock(node.block.body);
            
            this.buffer.write8(this.OPCODES.EXIT_TRY);
            this.buffer.write8(this.OPCODES.JUMP);
            const skipCatch = this.buffer.write16(0); 

            const catchStart = this.buffer.currentAddress;
            this.buffer.patch16(catchJump, catchStart - catchJump - 2);

            if (node.handler) {
                if (node.handler.param) {
                    this.scope.declare(node.handler.param.name);
                    this._visitIdentifier(node.handler.param, 'STORE');
                    this.buffer.write8(this.OPCODES.POP); 
                } else {
                    this.buffer.write8(this.OPCODES.POP); 
                }
                this._compileBlock(node.handler.body.body);
            }

            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(skipCatch, endAddr - skipCatch - 2);
            
            if (node.finalizer) {
                this._compileBlock(node.finalizer.body);
            }
        },

        _visitThrow(node) {
            this._visit(node.argument);
            this.buffer.write8(this.OPCODES.THROW);
        }
    };
})(typeof self !== 'undefined' ? self : this);