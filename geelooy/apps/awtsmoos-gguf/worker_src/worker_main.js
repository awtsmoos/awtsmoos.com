// B"H
export const WorkerMainSource = () => {
    
    self.onmessage = async (e) => {
        const { type, payload } = e.data;

        try {
            if (type === 'INIT') {
                const buffer = payload;
                
                self.postMessage({ type: 'PROGRESS', payload: { percent: 10, msg: "Parsing Metadata (Worker)..." } });
                
                if (!self.parseGGUF) throw new Error("GGUF Parser not loaded");
                const metaData = self.parseGGUF(buffer);
                
                // Store metadata in env for purifier access
                self.env.metaData = metaData;
                
                self.postMessage({ type: 'METADATA', payload: metaData });
                self.postMessage({ type: 'PROGRESS', payload: { percent: 30, msg: "Initializing Session..." } });
                
                if (!self.initSession) throw new Error("Inference Loop not loaded");
                await self.initSession(buffer, metaData);
                
                self.postMessage({ type: 'STATUS', payload: 'Engine Online' });
                self.postMessage({ type: 'READY' });
                
                self.logDB("Worker: Model Initialized and Memory Mapped.", 'accent');
            }
            else if (type === 'GENERATE') {
                if (!self.env.isInitialized) throw new Error("Worker not initialized");
                // B"H - Payload contains prompt and config params
                const params = payload; 
                const onToken = (token) => self.postMessage({ type: 'TOKEN', payload: token });
                const onDone = () => self.postMessage({ type: 'DONE' });
                await self.runInference(params, onToken, onDone);
            }
            else if (type === 'STOP') {
                self.env.stop = true;
                self.logDB("Worker: Stop signal received.", 'warn');
            }
            else if (type === 'RESET') {
                self.env.pos = 0;
                self.env.history = [];
                self.env.kv = []; 
                self.logDB("Worker: Context Reset.", 'warn');
            }
            else if (type === 'CONFIG_UPDATE') {
                if (payload.useWasm !== undefined) {
                    self.env.useWasm = payload.useWasm;
                    self.logDB(`[CONFIG] Wasm Turbo Mode: ${self.env.useWasm}`, 'accent');
                    if (self.env.useWasm) {
                         await self.initWasmKernel();
                    }
                }
            }
            else if (type === 'INSPECT_TOKEN') {
                const id = payload;
                if (self.getTokenVector) {
                    const vec = self.getTokenVector(id);
                    // Transfer the vector to avoid copy overhead if possible, though it's small
                    self.postMessage({ type: 'TOKEN_DATA', payload: { id, vector: vec } });
                } else {
                    self.logDB("Worker: getTokenVector not available", 'error');
                }
            }
            else if (type === 'PURIFY') {
                try {
                    if (!self.WasmPurifier) throw new Error("Purifier not loaded");
                    
                    self.logDB("Worker: Received PURIFY command. Initializing surgeon...", "warn");
                    
                    // B"H - Corrected: payload contains the full options object { layers, widthPct, vocabSize, regex }
                    const purifier = new self.WasmPurifier(self.env.buffer, self.env.metaData, payload);
                    
                    const progress = (m) => self.postMessage({ type: 'PURIFY_LOG', payload: m });
                    
                    const result = await purifier.purify(progress);
                    
                    self.postMessage({ type: 'PURIFY_DONE', payload: { buffer: result } }, [result]);
                } catch (pErr) {
                    const fatal = `PURIFY FATAL: ${pErr.message}\n${pErr.stack}`;
                    self.postMessage({ type: 'ERROR', payload: fatal });
                    self.logDB(fatal, 'error');
                }
            }
        } catch (err) {
            const fatal = `WORKER FATAL: ${err.message}\n${err.stack}`;
            self.postMessage({ type: 'ERROR', payload: fatal });
            self.console.error(err);
        }
    };
};