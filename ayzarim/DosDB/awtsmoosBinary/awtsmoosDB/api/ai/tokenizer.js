
// B"H
class PriorityQueue {
    constructor(compareFn) {
        this.heap = [];
        this.compare = compareFn || ((a, b) => a - b);
    }
    push(item) {
        this.heap.push(item);
        this._siftUp();
    }
    pop() {
        if (this.size() === 0) return null;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.size() > 0) {
            this.heap[0] = bottom;
            this._siftDown();
        }
        return top;
    }
    size() { return this.heap.length; }
    isEmpty() { return this.heap.length === 0; }
    _siftUp() {
        let node = this.heap.length - 1;
        while (node > 0) {
            const parent = (node - 1) >>> 1;
            if (this.compare(this.heap[node], this.heap[parent]) > 0) {
                this._swap(node, parent);
                node = parent;
            } else break;
        }
    }
    _siftDown() {
        let node = 0;
        while ((node * 2 + 1) < this.heap.length) {
            let left = (node * 2) + 1;
            let right = left + 1;
            let largest = left;
            if (right < this.heap.length && this.compare(this.heap[right], this.heap[left]) > 0) largest = right;
            if (this.compare(this.heap[largest], this.heap[node]) > 0) {
                this._swap(node, largest);
                node = largest;
            } else break;
        }
    }
    _swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
}

class SPMTokenizer {
    constructor(modelHandle) {
        this.modelHandle = modelHandle;
        this.vocab = [];
        this.scores = null;
        this.tokenMap = new Map();
        this.byteTokens = new Map();
        this.specialTokens = new Map();
        this.initialized = false;
        this.addSpacePrefix = true;
    }

    async init() {
        if (this.initialized) return;
        
        // 1. Load Vocab from Chunks
        const vocabSize = await this.modelHandle.config.get('vocab_size');
        const chunkSize = (await this.modelHandle.config.get('vocab_chunk_size')) || 1024;
        const chunkCount = Math.ceil(vocabSize / chunkSize);
        
        if (!this.vocab || this.vocab.length === 0) {
            this.vocab = new Array(vocabSize);
            for(let i=0; i<chunkCount; i++) {
                const raw = await this.modelHandle.vocab_data.get(`chunk_${i}`);
                if(raw) {
                    const chunk = JSON.parse(raw);
                    for(let k=0; k<chunk.length; k++) {
                        const idx = i * chunkSize + k;
                        if(idx < vocabSize) this.vocab[idx] = chunk[k];
                    }
                }
            }
        }
        
        // 2. Load Scores
        if (!this.scores || this.scores.length === 0) {
            const scoresBuf = await this.modelHandle.config.get('scores_raw');
            if (scoresBuf) {
                const ab = scoresBuf.buffer.slice(
                    scoresBuf.byteOffset, 
                    scoresBuf.byteOffset + scoresBuf.byteLength
                );
                this.scores = new Float32Array(ab);
            } else {
                this.scores = new Float32Array(vocabSize || this.vocab.length).fill(0);
            }
        }

        // 3. Build Maps
        const knownSpecials = new Set([
            '<start_of_turn>', '<end_of_turn>', 
            '<bos>', '<eos>', '<pad>', '<unk>', 
            '<|endoftext|>', '<|im_start|>', '<|im_end|>',
            '<|eot_id|>', '<|start_header_id|>', '<|end_header_id|>'
        ]);

        for (let i = 0; i < this.vocab.length; i++) {
            const text = this.vocab[i];
            if(!text) continue;
            
            // B"H: Strict overwrite to match browser behavior (first match wins usually, but browser does first pass)
            if (!this.tokenMap.has(text)) {
                this.tokenMap.set(text, i);
            }
            
            if (text.length === 6 && text.startsWith('<0x') && text.endsWith('>')) {
                const hex = text.substring(3, 5);
                const byteVal = parseInt(hex, 16);
                if (!isNaN(byteVal)) {
                    this.byteTokens.set(byteVal, i);
                }
            }

            if (knownSpecials.has(text)) {
                this.specialTokens.set(text, i);
            }
        }
        
        const asp = await this.modelHandle.config.get('tokenizer.ggml.add_space_prefix');
        if (asp === false) this.addSpacePrefix = false;

        this.initialized = true;
    }

    async tokenize(text) {
        if (!this.initialized) await this.init();
        
        // 1. Split by Special Tokens
        const specialKeys = Array.from(this.specialTokens.keys());
        let parts = [text];
        
        if (specialKeys.length > 0) {
            specialKeys.sort((a, b) => b.length - a.length);
            const pattern = new RegExp(`(${specialKeys.map(s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'g');
            parts = text.split(pattern);
        }

        const output = [];
        for (const part of parts) {
            if (!part) continue;
            if (this.specialTokens.has(part)) {
                output.push(this.specialTokens.get(part));
            } else {
                this._tokenizeSegment(part, output);
            }
        }
        
        return output;
    }

    _tokenizeSegment(text, output) {
        // 2. Preprocess: Replace spaces with SPIECE_UNDERLINE
        let processed = text.replace(/ /g, '\u2581');

        if (this.addSpacePrefix) {
            if (processed.length > 0 && processed[0] !== '\u2581' && text[0] !== '\n') {
                processed = '\u2581' + processed;
            }
        }

        // 3. Initial Symbol Split
        const symbols = [];
        let index = 0;
        const chars = [...processed];
        for (const char of chars) {
            symbols.push({
                text: char, n: 1, 
                prev: index - 1, next: index + 1,
                index: index, is_valid: true
            });
            index++;
        }
        if (symbols.length > 0) symbols[symbols.length - 1].next = -1;

        // 4. Priority Queue for Bigrams
        const pq = new PriorityQueue((a, b) => {
            if (Math.abs(a.score - b.score) > 1e-6) return a.score - b.score; 
            return b.left - a.left; 
        });

        const tryAddBigram = (leftIdx, rightIdx) => {
            if (leftIdx === -1 || rightIdx === -1) return;
            const symLeft = symbols[leftIdx];
            const symRight = symbols[rightIdx];
            if (!symLeft.is_valid || !symRight.is_valid) return;

            const text = symLeft.text + symRight.text;
            const id = this.tokenMap.get(text);
            if (id !== undefined) {
                const score = this.scores && this.scores.length > 0 ? this.scores[id] : 0.0;
                pq.push({ left: leftIdx, right: rightIdx, score, text });
            }
        };

        for (let i = 1; i < symbols.length; i++) {
            tryAddBigram(i - 1, i);
        }

        // 5. Merge Loop
        while (!pq.isEmpty()) {
            const bigram = pq.pop();
            const leftSym = symbols[bigram.left];
            const rightSym = symbols[bigram.right];

            if (!leftSym.is_valid || !rightSym.is_valid) continue;
            if (leftSym.text + rightSym.text !== bigram.text) continue; 

            leftSym.text += rightSym.text;
            leftSym.n += rightSym.n;
            leftSym.next = rightSym.next;
            rightSym.is_valid = false;
            if (rightSym.next !== -1) symbols[rightSym.next].prev = bigram.left;

            tryAddBigram(leftSym.prev, bigram.left);
            tryAddBigram(bigram.left, leftSym.next);
        }

        // 6. Collect
        let head = 0;
        while(head < symbols.length && !symbols[head].is_valid) head++;

        let ptr = head;
        const encoder = new TextEncoder();
        
        while (ptr !== -1 && ptr < symbols.length) {
            const sym = symbols[ptr];
            const id = this.tokenMap.get(sym.text);
            
            if (id !== undefined) {
                output.push(id);
            } else {
                // Byte Fallback
                const bytes = encoder.encode(sym.text);
                for(let k=0; k<bytes.length; k++) {
                    const b = bytes[k];
                    const byteTokenId = this.byteTokens.get(b);
                    if (byteTokenId !== undefined) {
                        output.push(byteTokenId);
                    } else {
                        const unkId = this.tokenMap.get('<unk>') || 0;
                        output.push(unkId);
                    }
                }
            }
            ptr = sym.next;
        }
    }

    async detokenize(ids) {
        if (!this.initialized) await this.init();
        let text = "";
        for (const id of ids) {
            const token = this.vocab[id];
            if (token) text += token;
        }
        return text.replace(/\u2581/g, ' ').replace(/<0x0A>/g, '\n');
    }
}

module.exports = SPMTokenizer;
