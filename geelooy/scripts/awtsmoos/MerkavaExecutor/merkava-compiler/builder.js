
// B"H
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};

    class BytecodeBuilder {
        constructor() { this.bytes = []; }
        
        write8(byte) { 
            if (byte === undefined || byte === null) {
                throw new Error("[BytecodeBuilder] Attempted to write undefined/null byte. Opcode missing/undefined?");
            }
            if (typeof byte !== 'number') {
                 throw new Error(`[BytecodeBuilder] Attempted to write non-number: ${byte}`);
            }
            this.bytes.push(byte & 0xFF); 
            return this.bytes.length - 1; 
        }
        
        write16(int) { 
            if (int === undefined || int === null) {
                throw new Error("[BytecodeBuilder] Attempted to write undefined/null int16.");
            }
            this.bytes.push(int & 0xFF); 
            this.bytes.push((int >> 8) & 0xFF); 
            return this.bytes.length - 2; 
        }
        
        patch16(index, value) { 
            this.bytes[index] = value & 0xFF; 
            this.bytes[index + 1] = (value >> 8) & 0xFF; 
        }
        
        get currentAddress() { return this.bytes.length; }
        toBuffer() { return new Uint8Array(this.bytes); }
    }

    root.MerkavaCompiler.BytecodeBuilder = BytecodeBuilder;
})(typeof self !== 'undefined' ? self : this);
