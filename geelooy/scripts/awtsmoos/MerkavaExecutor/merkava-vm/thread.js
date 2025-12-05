
// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    
    // Dependencies (constants)
    const { VM_THREAD_STATUS } = root.MerkavaOpcodes;

    class Thread {
        constructor(id, codeObject, memory) {
            this.id = id;
            this.status = VM_THREAD_STATUS.RUNNING;
            this.ip = 0; 
            this.currentStartIP = 0; 
            this.bp = 0; 
            this.sp = 0; 
            
            this.stack = []; 
            this.frames = []; 
            this.code = codeObject.bytecode; 
            this.constants = codeObject.constants; 
            
            this.scopePtr = null; 
            this.catchStack = [];
            this.errorRegister = null;
        }
    }

    root.MerkavaVM.Thread = Thread;
})(typeof self !== 'undefined' ? self : this);
