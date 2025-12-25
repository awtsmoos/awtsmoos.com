
// B"H
(function() {
    window.MERKAVA_TESTS['intro'] = {
        name: "The First Emanation (Logic)",
        orchestrator: `// B"H - Sefer Yetzirah Logic (for...of test)
let nodes = [{v:1}, {v:2}, {v:6}];
let light = 0;
for (let n of nodes) {
  if(n.v % 2 == 0) light += n.v * 10;
  else light += n.v;
  console.log("Node:", n.v, "Total Light:", light);
}
console.log("Creation Complete.");`,
        
        /**
         * B"H - Manual Orchestration.
         * We manually call the components to ensure full control.
         */
        async run(Merkava, tools) {
            const source = this.orchestrator;
            const { MerkavahParser, MerkavaCompiler, MerkavaVM, MerkavaMemory } = window;
            
            tools.sysLog("B\"H - Manual Parsing...");
            const parser = new MerkavahParser(source);
            parser.registerExpressionParsers();
            parser.registerStatementParsers();
            parser.registerDeclarationParsers();
            const ast = parser.parse();
            
            tools.sysLog("B\"H - Manual Compiling...");
            const compiler = new MerkavaCompiler.Compiler();
            const code = compiler.compile(ast);
            
            tools.sysLog("B\"H - Initializing VM...");
            const memory = new MerkavaMemory.MemoryManager(1000);
            await memory.init();
            
            // Bridge console to our tools
            const context = {
                console: {
                    log: (...args) => tools.log(...args)
                }
            };
            
            const vm = new MerkavaVM(memory, { 0: tools.log }, context);
            const thread = vm.spawn(code);
            
            // Return a handle that the console can wait on
            return {
                vm, memory,
                stop: () => { thread.status = 'TERMINATED'; },
                done: new Promise((res) => {
                    const drive = () => {
                        try {
                            const active = vm.run(500);
                            if (thread.status === 'COMPLETED') res({ status: 'COMPLETED' });
                            else if (thread.status === 'CRASHED') res({ status: 'CRASHED' });
                            else if (active) setTimeout(drive, 10);
                            else res({ status: 'TERMINATED' });
                        } catch(e) {
                            tools.log("Internal VM Crash:", e.message);
                            res({ status: 'ERROR' });
                        }
                    };
                    drive();
                })
            };
        }
    };
})();
