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

        _visitFor(node) {
            if (node.init) this._visit(node.init);
            
            const startAddr = this.buffer.currentAddress;
            let endJump = null;

            if (node.test) {
                this._visit(node.test);
                this.buffer.write8(this.OPCODES.JUMP_IF_FALSE);
                endJump = this.buffer.write16(0);
            }

            const loop = { breaks: [], continues: [] };
            this.loops.push(loop);

            this._visit(node.body);

            // Continue jumps here
            const continueAddr = this.buffer.currentAddress;
            if (node.update) this._visit(node.update);

            this.buffer.write8(this.OPCODES.JUMP);
            const backOffset = startAddr - (this.buffer.currentAddress + 2);
            this.buffer.write16(backOffset);

            const endAddr = this.buffer.currentAddress;
            if (endJump !== null) this.buffer.patch16(endJump, endAddr - endJump - 2);

            loop.breaks.forEach(b => this.buffer.patch16(b, endAddr - b - 2));
            loop.continues.forEach(c => this.buffer.patch16(c, continueAddr - c - 2));
            this.loops.pop();
        },

        _visitForOf(node) {
            // 1. Get Iterator
            this._visit(node.right);
            this.buffer.write8(this.OPCODES.GET_ITERATOR);
            
            const startAddr = this.buffer.currentAddress;

            // 2. Next
            this.buffer.write8(this.OPCODES.DUP);
            this.buffer.write8(this.OPCODES.ITERATOR_NEXT);
            this.buffer.write8(this.OPCODES.DUP);
            this.buffer.write8(this.OPCODES.ITERATOR_DONE);
            
            this.buffer.write8(this.OPCODES.JUMP_IF_TRUE);
            const endJump = this.buffer.write16(0);

            // 3. Assign Value
            this.buffer.write8(this.OPCODES.ITERATOR_VALUE);
            
            // Handle Assignment
            if (node.left.type === 'VariableDeclaration') {
                const decl = node.left.declarations[0];
                if (decl.id.type === 'Identifier') {
                    if (this.scope.depth > 0) this.scope.declare(decl.id.name);
                    this._visitIdentifier(decl.id, 'STORE');
                } else {
                    this.buffer.write8(this.OPCODES.POP); // TODO: Destructuring
                }
                this.buffer.write8(this.OPCODES.POP); // Consume result of STORE
            } else if (node.left.type === 'Identifier') {
                this._visitIdentifier(node.left, 'STORE');
                this.buffer.write8(this.OPCODES.POP);
            } else {
                this.buffer.write8(this.OPCODES.POP);
            }

            // 4. Body
            const loop = { breaks: [], continues: [] };
            this.loops.push(loop);
            
            this._visit(node.body);
            
            this.buffer.write8(this.OPCODES.JUMP);
            const backOffset = startAddr - (this.buffer.currentAddress + 2);
            this.buffer.write16(backOffset);

            // 5. Cleanup & Patching
            const endAddr = this.buffer.currentAddress;
            this.buffer.patch16(endJump, endAddr - endJump - 2);
            
            // Clean stack: [iter, result] -> []
            this.buffer.write8(this.OPCODES.POP); // result
            this.buffer.write8(this.OPCODES.POP); // iter

            // Break Logic: When breaking, stack is [iter]. 
            // We need to jump to a place that pops [iter].
            const breakTarget = this.buffer.currentAddress;
            this.buffer.write8(this.OPCODES.POP); // clean iter for breaks

            loop.breaks.forEach(b => this.buffer.patch16(b, breakTarget - b - 2));
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