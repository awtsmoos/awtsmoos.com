// B"H
/**
 * @module Purifier
 * @description
 * Refines the model by removing unnecessary layers, slicing width, and pruning vocabulary.
 * A surgery of the machine soul to let the specific light shine brighter.
 */
export const PurifierSource = () => {
    
    self.WasmPurifier = class WasmPurifier {
        /**
         * B"H
         * Prepares the surgical instruments for the model refinement.
         */
        constructor(buffer, meta, options) {
            this.oldBuffer = new Uint8Array(buffer);
            this.meta = meta;
            this.oldVocab = meta.vocab;
            this.oldScores = meta.scores || [];
            
            // Options: { keepStart, keepEnd, widthPct, vocabSize, regex, regexMode }
            this.keepStart = options.keepStart;
            this.keepEnd = options.keepEnd;
            this.widthPct = (options.widthPct || 100) / 100.0;
            this.targetVocab = options.vocabSize;
            this.regex = options.regex;
            this.regexMode = options.regexMode; // 'keep' or 'remove'
            
            self.logDB(`[PURIFY] Init: Layers Keep ${this.keepStart}/${this.keepEnd}, Width=${this.widthPct.toFixed(2)}, VocabTarget=${this.targetVocab}, RegexMode=${this.regexMode}`, 'info');
            
            this.specialIds = new Set();
            const kv = this.meta.kv;
            const specialKeys = ['tokenizer.ggml.bos_token_id', 'tokenizer.ggml.eos_token_id', 'tokenizer.ggml.unknown_token_id', 'tokenizer.ggml.padding_token_id', 'tokenizer.ggml.separator_token_id'];
            specialKeys.forEach(key => { if (kv[key] !== undefined) this.specialIds.add(kv[key]); });
            
            this.keptIndices = [];
            this.newVocabSize = 0;
            this.indexMap = new Int32Array(this.oldVocab.length).fill(-1);
            this.layerMap = new Map(); // Old Layer ID -> New Layer ID
        }

        async purify(onProgress) {
            let lastLogTime = performance.now();
            const LOG_INTERVAL_MS = 500;
            const yieldControl = async (msg, force = false) => {
                const now = performance.now();
                if (force || (now - lastLogTime > LOG_INTERVAL_MS)) {
                    onProgress(msg);
                    lastLogTime = now;
                    await new Promise(r => setTimeout(r, 0));
                }
            };

            await yieldControl("B\"H - Starting Purification...", true);
            this._selectVocab();
            await yieldControl(`Vocab Surgery: ${this.oldVocab.length} -> ${this.newVocabSize} tokens.`, true);

            let modelLayers = 0;
            const tensorNames = Array.from(self.env.tensorMap.keys());
            for (const name of tensorNames) {
                const match = name.match(/(?:blk|layers)\.(\d+)\./);
                if (match) modelLayers = Math.max(modelLayers, parseInt(match[1]) + 1);
            }
            
            this._planLayerSurgery(modelLayers);
            const keptLayerCount = this.layerMap.size;
            await yieldControl(`Layer Surgery: ${modelLayers} -> ${keptLayerCount} layers.`, true);

            const newKV = { ...this.meta.kv };
            newKV['tokenizer.ggml.tokens'] = this.keptIndices.map(i => this.oldVocab[i]);
            if (this.oldScores.length) newKV['tokenizer.ggml.scores'] = this.keptIndices.map(i => this.oldScores[i]);
            
            let blockCountKey = Object.keys(newKV).find(k => k.endsWith('.block_count'));
            if (blockCountKey) newKV[blockCountKey] = keptLayerCount;

            let originalFFNLen = 0, newFFN = 0;
            let ffnLenKey = Object.keys(newKV).find(k => k.endsWith('.feed_forward_length'));
            if (ffnLenKey && newKV[ffnLenKey]) {
                originalFFNLen = newKV[ffnLenKey];
                if (this.widthPct < 1.0) {
                    newFFN = Math.ceil((originalFFNLen * this.widthPct) / 256) * 256;
                    newKV[ffnLenKey] = newFFN;
                    await yieldControl(`Width Surgery: FFN ${originalFFNLen} -> ${newFFN}`, true);
                }
            }

            await yieldControl("Phase 4: Slicing Tensors...", true);
            const tensors = Array.from(self.env.tensorMap.values());
            const newTensorInfos = [];
            let currentDataOffset = 0;
            const alignment = this.meta.alignment || 32;
            const align = (offset) => (offset + alignment - 1) & ~(alignment - 1);
            
            for (const t of tensors) {
                let newName = t.name, dims = [...t.dims], data = null;
                const match = t.name.match(/(?:blk|layers)\.(\d+)\./);
                if (match) {
                    const oldL = parseInt(match[1]);
                    if (!this.layerMap.has(oldL)) continue;
                    newName = t.name.replace(`.${oldL}.`, `.${this.layerMap.get(oldL)}.`);
                }
                
                const oldRaw = self.getRawTensorView(t);
                if (!oldRaw) throw new Error("Source tensor corrupted: " + t.name);

                const isVocabTensor = t.dims.includes(this.oldVocab.length) && (newName.includes("token_embd") || newName.includes("output.weight") || newName.includes("lm_head"));
                const isGateUp = this.widthPct < 1.0 && originalFFNLen > 0 && (newName.includes("ffn_gate") || newName.includes("ffn_up") || newName.match(/w[13]\.weight/));
                const isDown = this.widthPct < 1.0 && originalFFNLen > 0 && (newName.includes("ffn_down") || newName.match(/w2\.weight/));

                if (isVocabTensor) data = this._sliceVocabTensor(t, dims, oldRaw);
                else if (isGateUp || isDown) data = this._sliceFFNTensor(t, dims, oldRaw, isGateUp, newFFN);
                else data = oldRaw;

                newTensorInfos.push({ name: newName, dims: dims, type: t.type, dataOffset: currentDataOffset, buffer: data });
                currentDataOffset = align(currentDataOffset + data.byteLength);
            }

            await yieldControl("Phase 5: Binding New Model Existence...", true);
            const finalGGUF = this.buildGGUF(newKV, newTensorInfos, alignment);
            const savings = (this.oldBuffer.byteLength - finalGGUF.byteLength) / (1024 * 1024);
            await yieldControl(`Surgery Successful. ${savings.toFixed(2)} MB removed.`, true);
            
            return finalGGUF;
        }

        _selectVocab() {
            const keepSet = new Set(this.specialIds);
            const knownSpecials = new Set(['<start_of_turn>', '<end_of_turn>', '<|eot_id|>']);

            // B"H - First pass: Absolutely preserve essential tokens
            for (let i = 0; i < this.oldVocab.length; i++) {
                const text = this.oldVocab[i];
                // Preserve all byte tokens and known special tokens
                if ((text.length === 6 && text.startsWith('<0x') && text.endsWith('>')) || knownSpecials.has(text)) {
                    keepSet.add(i);
                }
            }
            self.logDB(`[PURIFY] Preserved ${keepSet.size} essential control tokens.`, 'warn');

            const candidateIndices = [];
            let re = null;
            try { re = new RegExp(this.regex, 'u'); } catch (e) {
                self.logDB(`[PURIFY] Invalid Regex: ${e.message}`, 'error');
                re = /./; // Match everything as a fallback
            }

            for (let i = 0; i < this.oldVocab.length; i++) {
                // If it's already preserved, skip filtering
                if (keepSet.has(i)) continue;
                
                const text = this.oldVocab[i];
                const matches = re.test(text);
                if ((this.regexMode === 'keep' && matches) || (this.regexMode === 'remove' && !matches)) {
                    candidateIndices.push(i);
                }
            }

            // Sort filtered candidates by frequency score (higher is better)
            candidateIndices.sort((a, b) => (this.oldScores[b] || 0) - (this.oldScores[a] || 0));
            
            // Determine how many slots are left after accounting for essential tokens
            const remainingSlots = Math.max(0, this.targetVocab - keepSet.size);
            const finalCandidates = candidateIndices.slice(0, remainingSlots);
            finalCandidates.forEach(idx => keepSet.add(idx));

            this.keptIndices = [];
            for (let i = 0; i < this.oldVocab.length; i++) {
                if (keepSet.has(i)) {
                    this.indexMap[i] = this.keptIndices.length;
                    this.keptIndices.push(i);
                }
            }
            this.newVocabSize = this.keptIndices.length;
        }

        _planLayerSurgery(totalLayers) {
            this.layerMap.clear();
            const kStart = Math.min(this.keepStart, totalLayers);
            let kEnd = this.keepEnd;
            if (kStart + kEnd > totalLayers) kEnd = Math.max(0, totalLayers - kStart);
            
            for (let i = 0; i < kStart; i++) this.layerMap.set(i, i);
            const startEndBlock = totalLayers - kEnd;
            for (let i = 0; i < kEnd; i++) this.layerMap.set(startEndBlock + i, kStart + i);
        }

        _sliceVocabTensor(t, dims, oldRaw) {
            let vocabDimIdx = t.dims.findIndex(d => Math.abs(Number(d) - this.oldVocab.length) < 1024);
            if (vocabDimIdx === -1) return oldRaw; // Cannot determine vocab dimension
            
            dims[vocabDimIdx] = this.newVocabSize;
            const { blockElements, blockSize } = self.getByteSize(t.type);

            if (vocabDimIdx === 1) { // e.g., token_embd.weight [n_embd, n_vocab]
                const elementsPerRow = t.dims[0]; // n_embd
                const rowBytes = (elementsPerRow / blockElements) * blockSize;
                const data = new Uint8Array(this.newVocabSize * rowBytes);
                for (let i = 0; i < this.newVocabSize; i++) {
                    const srcStart = this.keptIndices[i] * rowBytes;
                    if (srcStart + rowBytes <= oldRaw.byteLength) {
                        data.set(oldRaw.subarray(srcStart, srcStart + rowBytes), i * rowBytes);
                    }
                }
                return data;
            } else if (vocabDimIdx === 0) { // e.g., output.weight [n_vocab, n_embd]
                const oldRows = t.dims[0];
                const newRows = this.newVocabSize;
                const elementsPerRow = t.dims[1]; // n_embd
                const rowBytes = (elementsPerRow / blockElements) * blockSize;
                const data = new Uint8Array(newRows * rowBytes);
                 for (let i = 0; i < newRows; i++) {
                    const srcStart = this.keptIndices[i] * rowBytes;
                    if (srcStart + rowBytes <= oldRaw.byteLength) {
                        data.set(oldRaw.subarray(srcStart, srcStart + rowBytes), i * rowBytes);
                    }
                }
                return data;
            }
            return oldRaw;
        }

        _sliceFFNTensor(t, dims, oldRaw, isGateUp, newFFN) {
             const { blockElements, blockSize } = self.getByteSize(t.type);
             if (isGateUp) { // Shape: [n_ff, n_embd], slice on n_ff (outer dim)
                 dims[0] = newFFN;
                 const newBytes = (newFFN / t.dims[0]) * oldRaw.byteLength;
                 return oldRaw.slice(0, newBytes);
             } else { // Shape: [n_embd, n_ff], slice on n_ff (inner dim)
                 dims[1] = newFFN;
                 const numRows = t.dims[0]; // n_embd
                 const oldRowBytes = (t.dims[1] / blockElements) * blockSize;
                 const newRowBytes = (newFFN / blockElements) * blockSize;
                 const data = new Uint8Array(numRows * newRowBytes);
                 for (let r = 0; r < numRows; r++) {
                     const srcStart = r * oldRowBytes;
                     data.set(oldRaw.subarray(srcStart, srcStart + newRowBytes), r * newRowBytes);
                 }
                 return data;
             }
        }

        buildGGUF(kv, tensorInfos, alignment = 32) {
            const encoder = new TextEncoder();
            const parts = [];
            const write = (data) => parts.push(data);
            const writeU32 = (val) => write(new Uint8Array(new Uint32Array([val]).buffer));
            const writeU64 = (val) => write(new Uint8Array(new BigUint64Array([BigInt(val)]).buffer));
            const writeStr = (str) => { const buf = encoder.encode(str); writeU64(buf.length); write(buf); };

            write(new Uint8Array([0x47, 0x47, 0x55, 0x46])); // GGUF
            writeU32(3); writeU64(tensorInfos.length); writeU64(Object.keys(kv).length);

            for (const [key, value] of Object.entries(kv)) {
                writeStr(key);
                if (typeof value === 'string') { writeU32(8); writeStr(value); }
                else if (typeof value === 'number') { if (Number.isInteger(value)) { writeU32(4); writeU32(value); } else { writeU32(6); write(new Uint8Array(new Float32Array([value]).buffer)); } }
                else if (Array.isArray(value)) {
                    writeU32(9);
                    if (value.length === 0 || typeof value[0] === 'string') { writeU32(8); writeU64(value.length); value.forEach(s => writeStr(s || "")); }
                    else if (typeof value[0] === 'number') { const isF = !Number.isInteger(value[0]); writeU32(isF ? 6 : 5); writeU64(value.length); write(new Uint8Array((isF ? new Float32Array(value) : new Int32Array(value)).buffer)); }
                }
                else if (typeof value === 'boolean') { writeU32(7); write(new Uint8Array([value ? 1 : 0])); }
            }
            
            for (const t of tensorInfos) { writeStr(t.name); writeU32(t.dims.length); t.dims.forEach(d => writeU64(d)); writeU32(t.type); writeU64(t.dataOffset); }

            let currentSize = parts.reduce((a, b) => a + b.byteLength, 0);
            let padSize = ((currentSize + alignment - 1) & ~(alignment - 1)) - currentSize;
            if (padSize > 0) write(new Uint8Array(padSize));

            for (const t of tensorInfos) { write(t.buffer); padSize = ((t.buffer.byteLength + alignment - 1) & ~(alignment - 1)) - t.buffer.byteLength; if (padSize > 0) write(new Uint8Array(padSize)); }

            const totalSize = parts.reduce((a, b) => a + b.byteLength, 0);
            const out = new Uint8Array(totalSize);
            let offset = 0;
            for (const p of parts) { out.set(p, offset); offset += p.byteLength; }
            return out.buffer;
        }
    };
};