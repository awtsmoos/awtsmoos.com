
// B"H
(function(root) {
    // B"H - Robust Global Resolution
    let globalScope = root;
    if (typeof globalThis !== 'undefined') globalScope = globalThis;
    else if (typeof self !== 'undefined') globalScope = self;
    else if (typeof window !== 'undefined') globalScope = window;

    globalScope.MerkavaCompiler = globalScope.MerkavaCompiler || {};

    console.log("[MerkavaCompiler] Initializing BytecodeBuilder Module...");

    class BytecodeBuilder {
        constructor() { this.bytes = []; }
        
        write8(byte) { 
            if (byte === undefined || byte === null) {
                throw new Error("[BytecodeBuilder] Attempted to write undefined/null byte.");
            }
            if (typeof byte !== 'number' || isNaN(byte)) {
                 throw new Error(`[BytecodeBuilder] Attempted to write invalid number: ${byte}`);
            }
            this.bytes.push(byte & 0xFF); 
            return this.bytes.length - 1; 
        }
        
        write16(int) { 
            if (int === undefined || int === null) {
                throw new Error("[BytecodeBuilder] Attempted to write undefined/null int16.");
            }
            if (typeof int !== 'number' || isNaN(int)) {
                 throw new Error(`[BytecodeBuilder] Attempted to write invalid int16: ${int}`);
            }
            this.bytes.push(int & 0xFF); 
            this.bytes.push((int >> 8) & 0xFF); 
            return this.bytes.length - 2; 
        }
        
        patch16(index, value) { 
            if (value === undefined || value === null || isNaN(value)) {
                throw new Error(`[BytecodeBuilder] Invalid patch value: ${value}`);
            }
            this.bytes[index] = value & 0xFF; 
            this.bytes[index + 1] = (value >> 8) & 0xFF; 
        }
        
        get currentAddress() { return this.bytes.length; }
        toBuffer() { return new Uint8Array(this.bytes); }
    }

    globalScope.MerkavaCompiler.BytecodeBuilder = BytecodeBuilder;
    console.log("[MerkavaCompiler] BytecodeBuilder Class Defined and Attached.");

})(typeof self !== 'undefined' ? self : this);
