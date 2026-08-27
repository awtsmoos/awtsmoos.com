// B"H
export const LoopSource = () => {

    self.initSession = async function(buffer, meta) {
        self.env.buffer = buffer;
        self.env.metaKV = meta.kv;
        self.env.vocab = meta.vocab;
        
        // 1. Scan Tensors to find Data Offset
        const dataOffset = self.scanTensors(buffer, meta.endOffset, meta.tensorCount, meta.alignment);
        self.env.dataOffset = dataOffset;
        
        // 2. Infer Config
        self.env.stats = self.inferStats(meta);
        
        // 3. Map Weights
        if (self.autoMapWeights) self.autoMapWeights();

        // 4. Init WASM (B"H Turbo)
        if (self.initWasmKernel) {
             await self.initWasmKernel();
             if (self.resetWasmHeap) self.resetWasmHeap(); // CRITICAL: Reset heap for new session
        }
        
        // 5. Send Config to UI
        self.postMessage({ type: 'CONFIG', payload: self.env.stats });
        
        // 6. Send Tensor List to UI
        const tensorList = Array.from(self.env.tensorMap.values()).map(t => ({
            name: t.name,
            dims: t.dims,
            type: t.type,
            size: (t.dims.reduce((a,b)=>a*b,1) * self.getByteSize(t.type).blockSize) / self.getByteSize(t.type).blockElements
        }));
        self.postMessage({ type: 'TENSORS', payload: tensorList });

        self.env.isInitialized = true;
        self.env.pos = 0;
        self.env.history = [];
        self.env.kv = [];
        
        // Initialize the loader helper
        self.initLoader(buffer, meta);
    };

    self.runInference = async function(params, onToken, onDone) {
        if (!self.env.stats) throw new Error("Engine not ready");
        
        // params is now an object: { prompt, temp, top_p, penalty, max_tokens }
        const prompt = params.prompt;
        const config = {
            temp: params.temp || 0.8,
            top_p: params.top_p || 0.9,
            repeat_penalty: params.penalty || 1.1,
            max_tokens: params.max_tokens || 512
        };

        self.env.stop = false;
        self.env.hasLoggedWasmUsage = false; // Reset log flag
        self.logDB(`--- INFERENCE START ---`, 'accent');
        
        // Log Raw Prompt
        // self.logDB(`[PROMPT] Raw: ${JSON.stringify(prompt)}`, 'read');

        // 1. Tokenize
        let tokens = self.tokenize(prompt);
        
        // Gemma specific: Add BOS (2) if start of session
        if (self.env.pos === 0 && self.env.stats.arch.includes('gemma')) {
             if (tokens[0] !== 2) {
                 tokens.unshift(2);
                 self.logDB(`[PROMPT] Added BOS (2) at start`, 'warn');
             }
        }

        // Log Tokens
        self.logDB(`[PROMPT] IDs: [${tokens.join(', ')}]`, 'info');
        const tokenStrs = tokens.map(id => {
            const s = self.env.vocab[id];
            return s ? s.replace('\u2581', '_').replace(/\n/g, '\\n') : 'UNK';
        });
        self.logDB(`[PROMPT] Toks: ${tokenStrs.join(' ')}`, 'info');

        self.logDB(`Processing ${tokens.length} tokens...`, 'info');
        
        // 2. Prompt Processing
        let nextToken = null;
        for (let i = 0; i < tokens.length; i++) {
            if (self.env.stop) break;
            // Only the last token needs generation phase sampling logic
            const phase = (i === tokens.length - 1) ? 'GEN' : 'PROMPT';
            
            // B"H - Async processing allows event loop to check for STOP
            nextToken = await self.processToken(tokens[i], phase, config);
        }
        
        // 3. Generation Loop
        let generated = 0;
        
        if (nextToken !== null) { 
             while (!self.env.stop && generated < config.max_tokens) {
                if (nextToken === 1 || nextToken === 106 || nextToken === 2) { 
                    self.logDB("EOS Reached", 'info');
                    break;
                }
                
                const text = self.getWord(nextToken);
                onToken(text);
                
                generated++;
                
                // B"H - Yield to allow UI updates and Stop signals
                await new Promise(r => setTimeout(r, 0));
                
                nextToken = await self.processToken(nextToken, 'GEN', config);
            }
        }
        
        onDone();
    };

    self.getWord = function(id) {
        let w = self.env.vocab[id];
        if (!w) return '';
        if (typeof w !== 'string') return ''; 
        return w.replace('\u2581', ' ').replace('<0x0A>', '\n');
    };

    self.processToken = async function(id, phase, config) {
        const stats = self.env.stats;
        const currentPos = self.env.pos;
        
        // B"H - Performance Tuning
        const TIME_BUDGET_MS = 100;
        let startTime = performance.now();

        // 1. Embedding
        let x = self.getEmbeddingRow(id, stats.n_embd);
        if (!x) throw new Error("Embedding Missing for ID: " + id);

        // Scale (Gemma)
        if (stats.useEmbScale) {
            const embScale = Math.sqrt(stats.n_embd);
            for(let i=0; i<x.length; i++) x[i] *= embScale;
        }

        // 2. Layers
        for (let l = 0; l < stats.n_layer; l++) {
            if (self.env.stop) return -1;
            
            x = self.forwardLayer(x, l, stats, currentPos);
            
            if (performance.now() - startTime > TIME_BUDGET_MS) {
                 await new Promise(r => setTimeout(r, 0));
                 startTime = performance.now();
            }
        }

        // 3. Final Norm
        let w_norm = self.loadWeight('output_norm.weight');
        if (w_norm) x = self.rmsNorm(x, w_norm, stats.norm_eps, 0.0);

        // 4. Logits
        if (phase === 'GEN') {
            const w_out = self.loadWeight('output.weight', false) || self.loadWeight('token_embd.weight', false);
            const logits = self.matVecMul(x, w_out, self.env.vocab.length);

            // FINAL SOFT CAPPING (Gemma 3)
            if (stats.final_soft_cap > 0) {
                const cap = stats.final_soft_cap;
                const invCap = 1.0 / cap;
                for(let i=0; i<logits.length; i++) {
                    logits[i] = cap * Math.tanh(logits[i] * invCap);
                }
            }
            
            // SAMPLING
            const nextId = self.sampleToken(logits, self.env.history, config);
            
            self.env.pos++;
            self.env.history.push(nextId);
            return nextId;
        } else {
            // PROMPT phase
            self.env.pos++;
            self.env.history.push(id);
            return -1;
        }
    };
    
    self.sampleToken = function(logits, history, params) {
        const temp = params.temp; // 0.8 default
        const top_p = params.top_p; // 0.9 default
        const penalty = params.repeat_penalty; // 1.1 default
        const penalty_n = 64; // Lookback window
        
        // 0. Greedy Bypass if temp is very low
        if (temp < 0.01) {
             let maxVal = -Infinity;
             let maxId = 0;
             for(let i=0; i<logits.length; i++) {
                 if (logits[i] > maxVal) { maxVal = logits[i]; maxId = i; }
             }
             return maxId;
        }

        // 1. Repetition Penalty
        // Apply penalty to logits of recently seen tokens
        const start = Math.max(0, history.length - penalty_n);
        const context = history.slice(start);
        const seen = new Set(context);
        
        for (const id of seen) {
            // Llama.cpp style penalty: if logit > 0, divide. if logit < 0, multiply.
            if (logits[id] > 0) logits[id] /= penalty;
            else logits[id] *= penalty;
        }

        // 2. Temperature scaling
        // Find max for numerical stability
        let maxLogit = -Infinity;
        for (let i = 0; i < logits.length; i++) {
            logits[i] /= temp;
            if (logits[i] > maxLogit) maxLogit = logits[i];
        }
        
        // 3. Softmax
        const probs = new Float32Array(logits.length);
        let sum = 0;
        for (let i = 0; i < logits.length; i++) {
            const p = Math.exp(logits[i] - maxLogit);
            probs[i] = p;
            sum += p;
        }
        if (sum === 0) sum = 1; // Prevent division by zero if all probs are zero

        // 4. Top-P (Nucleus) Sampling
        // Create candidates array [id, p]
        let candidates = [];
        const threshold = 0.0001 / self.env.vocab.length; 
        
        for(let i=0; i<probs.length; i++) {
            const norm_p = probs[i] / sum;
            if (norm_p > threshold) {
                 candidates.push({ id: i, p: norm_p });
            }
        }
        
        // Sort descending by probability
        candidates.sort((a, b) => b.p - a.p);
        
        // B"H - ROBUSTNESS: Handle empty candidates from faulty models
        if (candidates.length === 0) {
            self.logDB('[SAMPLER] CRITICAL: All candidates filtered. Logits may be NaN or all -Infinity. Taking top logit as fallback.', 'error');
            let maxVal = -Infinity;
            let maxId = 0; // Default to padding token
            for(let i=0; i<logits.length; i++) {
                if (isFinite(logits[i]) && logits[i] > maxVal) { maxVal = logits[i]; maxId = i; }
            }
            return maxId;
        }

        let cumSum = 0;
        let cutoff = candidates.length - 1;
        
        for (let i = 0; i < candidates.length; i++) {
            cumSum += candidates[i].p;
            if (cumSum >= top_p) {
                cutoff = i;
                break;
            }
        }
        
        // Log Top 5 for debug (only first few gens to save logs)
        if (self.env.pos % 50 === 0 && candidates.length > 0) {
             let msg = `[GEN ${self.env.pos}] Top 5:\n`;
             for(let k=0; k<Math.min(5, candidates.length); k++) {
                 const c = candidates[k];
                 const word = (self.env.vocab[c.id]||"").replace('\n','\\n').replace('\u2581','_');
                 msg += `  ${k+1}. [${c.id}] "${word}" (${(c.p*100).toFixed(1)}%)\n`;
             }
             self.logDB(msg, 'calc');
        }

        // 5. Random Choice within Top-P
        // We re-normalize within the cutoff subset for correct distribution
        // Or simpler: generate random number up to cumSum of cutoff
        const r = Math.random() * cumSum;
        let acc = 0;
        for (let i = 0; i <= cutoff; i++) {
            acc += candidates[i].p;
            if (acc >= r) return candidates[i].id;
        }
        
        return candidates[0].id; // Fallback
    };
};