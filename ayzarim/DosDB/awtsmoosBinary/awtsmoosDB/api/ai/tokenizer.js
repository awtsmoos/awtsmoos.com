// B"H
class PriorityQueue {
    constructor(compareFn, initialItems = null) {
        this.heap = initialItems || [];
        this.compare = compareFn || ((a, b) => a - b);
        if (this.heap.length > 0) this._heapify();
    }
    push(item) { this.heap.push(item); this._siftUp(); }
    pop() {
        if (this.size() === 0) return null;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.size() > 0) { this.heap[0] = bottom; this._siftDown(0); }
        return top;
    }
    size() { return this.heap.length; }
    isEmpty() { return this.heap.length === 0; }
    _heapify() { for (let i = (this.heap.length >>> 1) - 1; i >= 0; i--) this._siftDown(i); }
    _siftUp() {
        let node = this.heap.length - 1;
        while (node > 0) {
            const parent = (node - 1) >>> 1;
            if (this.compare(this.heap[node], this.heap[parent]) > 0) { this._swap(node, parent); node = parent; } else break;
        }
    }
    _siftDown(node) {
        while ((node * 2 + 1) < this.heap.length) {
            let left = (node * 2) + 1; let right = left + 1; let largest = left;
            if (right < this.heap.length && this.compare(this.heap[right], this.heap[left]) > 0) largest = right;
            if (this.compare(this.heap[largest], this.heap[node]) > 0) { this._swap(node, largest); node = largest; } else break;
        }
    }
    _swap(i, j) { const temp = this.heap[i]; this.heap[i] = this.heap[j]; this.heap[j] = temp; }
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
        
        const vocabSize = await this.modelHandle.config.get('vocab_size');
        
        if (!this.vocab || this.vocab.length === 0) {
            const vocabHandle = this.modelHandle.vocab_data;
            this.vocab = new Array(vocabSize);
            let idx = 0;
            for await (const token of vocabHandle.values()) {
                if (idx < vocabSize) this.vocab[idx++] = token;
            }
        }
        
        if (!this.scores || this.scores.length === 0) {
            const scoresBuf = await this.modelHandle.config.get('scores_raw');
            if (scoresBuf) {
                const ab = scoresBuf.buffer.slice(scoresBuf.byteOffset, scoresBuf.byteOffset + scoresBuf.byteLength);
                this.scores = new Float32Array(ab);
            } else {
                this.scores = new Float32Array(vocabSize || this.vocab.length).fill(0);
            }
        }

        const knownSpecials = new Set(['<start_of_turn>', '<end_of_turn>', '<bos>', '<eos>', '<pad>', '<unk>', '<|endoftext|>', '<|im_start|>', '<|im_end|>', '<|eot_id|>', '<|start_header_id|>', '<|end_header_id|>']);
        for (let i = 0; i < this.vocab.length; i++) {
            const text = this.vocab[i];
            if(!text) continue;
            if (!this.tokenMap.has(text)) this.tokenMap.set(text, i);
            if (text.length === 6 && text.startsWith('<0x') && text.endsWith('>')) {
                const hex = text.substring(3, 5); const byteVal = parseInt(hex, 16);
                if (!isNaN(byteVal)) this.byteTokens.set(byteVal, i);
            }
            if (knownSpecials.has(text)) this.specialTokens.set(text, i);
        }
        const asp = await this.modelHandle.config.get('tokenizer.ggml.add_space_prefix');
        if (asp === false) this.addSpacePrefix = false;
        this.initialized = true;
    }

    async tokenize(text) {
        if (!this.initialized) await this.init();
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
            if (this.specialTokens.has(part)) output.push(this.specialTokens.get(part));
            else this._tokenizeSegment(part, output);
        }
        return output;
    }

    _tokenizeSegment(text, output) {
        let processed = text.replace(/ /g, '\u2581');
        if (this.addSpacePrefix && processed.length > 0 && processed[0] !== '\u2581' && text[0] !== '\n') processed = '\u2581' + processed;
        if (processed.length > 2000 && processed.includes('\n')) {
            const chunks = processed.split(/(\n)/);
            for (const chunk of chunks) if (chunk) this._runBPE(chunk, output);
        } else {
            this._runBPE(processed, output);
        }
    }

    _runBPE(text, output) {
        const len = text.length; if (len === 0) return;
        const next = new Int32Array(len); const prev = new Int32Array(len); const syms = new Array(len);
        for (let i = 0; i < len; i++) { syms[i] = text[i]; prev[i] = i - 1; next[i] = i + 1; }
        next[len - 1] = -1;
        const initialBigrams = [];
        for (let i = 0; i < len - 1; i++) {
            const pairText = syms[i] + syms[i+1]; const id = this.tokenMap.get(pairText);
            if (id !== undefined) { const score = this.scores ? this.scores[id] : 0.0; initialBigrams.push({ left: i, right: i + 1, score, text: pairText }); }
        }
        const pq = new PriorityQueue((a, b) => { if (Math.abs(a.score - b.score) > 1e-6) return a.score - b.score; return b.left - a.left; }, initialBigrams);
        const tryAdd = (left, right) => {
            if (left === -1 || right === -1) return;
            const pairText = syms[left] + syms[right]; const id = this.tokenMap.get(pairText);
            if (id !== undefined) { const score = this.scores ? this.scores[id] : 0.0; pq.push({ left: right, right: left, score, text: pairText }); }
        };
        while (!pq.isEmpty()) {
            const item = pq.pop(); const left = item.left; const right = item.right;
            if (next[left] !== right) continue; if (syms[left] + syms[right] !== item.text) continue; 
            syms[left] = item.text; const nextNode = next[right]; next[left] = nextNode;
            if (nextNode !== -1) prev[nextNode] = left;
            tryAdd(prev[left], left); tryAdd(left, next[left]);
        }
        let ptr = 0; const encoder = new TextEncoder();
        while (ptr !== -1) {
            const txt = syms[ptr]; const id = this.tokenMap.get(txt);
            if (id !== undefined) output.push(id);
            else { const bytes = encoder.encode(txt); for(let k=0; k<bytes.length; k++) { const b = bytes[k]; const byteTokenId = this.byteTokens.get(b); output.push(byteTokenId !== undefined ? byteTokenId : 0); } }
            ptr = next[ptr];
        }
    }

    async detokenize(ids) {
        if (!this.initialized) await this.init();
        let text = "";
        for (const id of ids) { const token = this.vocab[id]; if (token) text += token; }
        return text.replace(/\u2581/g, ' ').replace(/<0x0A>/g, '\n');
    }
}

module.exports = SPMTokenizer;