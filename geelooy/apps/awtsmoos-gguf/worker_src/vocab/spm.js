
// B"H
export const SPMSource = () => {
    /**
     * SentencePiece BPE Logic
     * Ported from llama-vocab.cpp: llm_tokenizer_spm_session
     */
    self.SPMTokenizer = class SPMTokenizer {
        constructor(vocab, scores, addSpacePrefix = true) {
            this.vocab = vocab;
            this.scores = scores;
            this.addSpacePrefix = addSpacePrefix;
            this.tokenMap = new Map();
            this.byteTokens = new Map(); // Map byte value (0-255) to Token ID
            this.specialTokens = new Map(); // Map special token string to ID

            // Common special tokens to look for
            // In a full implementation we would parse these from tokenizer.ggml.tokens types
            // For now, we heuristically identify them or add common Gemma/Llama specials
            const knownSpecials = new Set([
                '<start_of_turn>', '<end_of_turn>', 
                '<bos>', '<eos>', '<pad>', '<unk>', 
                '<|endoftext|>', '<|im_start|>', '<|im_end|>',
                '<|eot_id|>', '<|start_header_id|>', '<|end_header_id|>'
            ]);
            
            // Fast lookup for token -> ID
            for (let i = 0; i < vocab.length; i++) {
                const text = vocab[i];
                this.tokenMap.set(text, i);
                
                // Detect byte tokens like <0x0A>
                if (text.length === 6 && text.startsWith('<0x') && text.endsWith('>')) {
                    const hex = text.substring(3, 5);
                    const byteVal = parseInt(hex, 16);
                    if (!isNaN(byteVal)) {
                        this.byteTokens.set(byteVal, i);
                    }
                }

                // Detect Special Tokens
                if (knownSpecials.has(text)) {
                    this.specialTokens.set(text, i);
                }
            }
        }

        tokenize(text, logger) {
            const log = logger || (() => {});
            // log(`[SPM] Input: "${text.replace(/\n/g, '\\n')}"`);

            // 1. Split by Special Tokens
            // We escape special tokens for regex
            const specialKeys = Array.from(this.specialTokens.keys());
            let parts = [text];
            
            if (specialKeys.length > 0) {
                // Create a regex that matches any special token
                // We sort by length descending to match longest specials first (<|im_start|> vs <|im_s...)
                specialKeys.sort((a, b) => b.length - a.length);
                const pattern = new RegExp(`(${specialKeys.map(s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'g');
                parts = text.split(pattern);
            }

            const output = [];

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (!part) continue;

                if (this.specialTokens.has(part)) {
                    output.push(this.specialTokens.get(part));
                    // log(`[SPM] Special: ${part}`);
                } else {
                    // Regular Text Processing
                    this.tokenizeSegment(part, output, logger);
                }
            }
            
            return output;
        }

        tokenizeSegment(text, output, log) {
            // 2. Preprocess: Replace spaces with SPIECE_UNDERLINE
            let processed = text.replace(/ /g, '\u2581');

            // Add leading space if configured and not start of line (simplified)
            // Note: Gemma GGUF usually has add_space_prefix = false
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
                    text: char,
                    n: 1, 
                    prev: index - 1,
                    next: index + 1,
                    index: index,
                    is_valid: true
                });
                index++;
            }
            if (symbols.length > 0) symbols[symbols.length - 1].next = -1;

            // 4. Priority Queue for Bigrams
            const pq = new self.PriorityQueue((a, b) => {
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
                    const score = this.scores ? this.scores[id] : 0.0;
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
            while (ptr !== -1 && ptr < symbols.length) {
                const sym = symbols[ptr];
                const id = this.tokenMap.get(sym.text);
                
                if (id !== undefined) {
                    output.push(id);
                } else {
                    // Byte Fallback
                    const encoder = new TextEncoder();
                    const bytes = encoder.encode(sym.text);
                    for(let k=0; k<bytes.length; k++) {
                        const b = bytes[k];
                        const byteTokenId = this.byteTokens.get(b);
                        if (byteTokenId !== undefined) {
                            output.push(byteTokenId);
                        } else {
                            const unk = this.tokenMap.get('<unk>') || 0;
                            output.push(unk);
                        }
                    }
                }
                ptr = sym.next;
            }
        }
    };
};
