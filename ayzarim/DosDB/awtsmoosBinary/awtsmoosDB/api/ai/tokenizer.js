
// B"H
class DBTokenizer {
    constructor(modelHandle) {
        this.modelHandle = modelHandle;
        
        this.BUCKET_COUNT = 2048; // Matched with importer
        this.CHUNK_SIZE = 1024;
        
        // LRU Cache for buckets
        this.bucketCache = new Map();
        this.chunkCache = new Map();
        this.CACHE_LIMIT = 50; 

        this.specials = {
            '<start_of_turn>': 106,
            '<end_of_turn>': 107,
            '<bos>': 2,
            '<eos>': 1,
            '<unk>': 3
        };
    }

    async init() {
        this.BUCKET_COUNT = (await this.modelHandle.config.get('vocab_bucket_count')) || 2048;
        this.CHUNK_SIZE = (await this.modelHandle.config.get('vocab_chunk_size')) || 1024;
    }

    _getBucketId(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return (hash >>> 0) % this.BUCKET_COUNT;
    }

    async _loadBucket(bucketId) {
        // Fast path for cache hit
        if (this.bucketCache.has(bucketId)) return this.bucketCache.get(bucketId);
        
        const raw = await this.modelHandle.vocab_data.get(`bucket_${bucketId}`);
        let data = {};
        if (raw) {
            try { data = JSON.parse(raw); } catch(e) {}
        }
        
        if (this.bucketCache.size >= this.CACHE_LIMIT) {
            const first = this.bucketCache.keys().next().value;
            this.bucketCache.delete(first);
        }
        this.bucketCache.set(bucketId, data);
        return data;
    }

    async _loadChunk(chunkId) {
        if (this.chunkCache.has(chunkId)) return this.chunkCache.get(chunkId);
        
        const raw = await this.modelHandle.vocab_data.get(`chunk_${chunkId}`);
        let data = [];
        if (raw) {
            try { data = JSON.parse(raw); } catch(e) {}
        }
        
        if (this.chunkCache.size >= this.CACHE_LIMIT) {
            const first = this.chunkCache.keys().next().value;
            this.chunkCache.delete(first);
        }
        this.chunkCache.set(chunkId, data);
        return data;
    }

    async findId(token) {
        const bId = this._getBucketId(token);
        const bucket = await this._loadBucket(bId);
        if (bucket && bucket[token] !== undefined) {
            return bucket[token];
        }
        return undefined;
    }

    async tokenize(text) {
        let processed = text.replace(/ /g, '\u2581'); 
        let tokens = [];
        for (const char of processed) tokens.push(char);

        const mergedTokens = [];
        let i = 0;
        
        while (i < tokens.length) {
            // B"H - Parallel Lookahead for Speed
            // We generate all candidates for the lookahead window [i, i+24]
            // and fetch their IDs in parallel using Promise.all
            const candidates = [];
            let currentStr = "";
            for (let j = 0; j < 24 && (i + j) < tokens.length; j++) {
                currentStr += tokens[i + j];
                candidates.push(currentStr);
            }

            // This fires all DB reads (if not cached) in parallel
            const results = await Promise.all(candidates.map(c => this.findId(c)));

            // Find longest match (iterate backwards)
            let matchId = -1;
            let matchLen = 0;

            for (let j = results.length - 1; j >= 0; j--) {
                if (results[j] !== undefined) {
                    matchLen = j + 1; // Length in characters
                    matchId = results[j];
                    break; 
                }
            }
            
            if (matchId !== -1) {
                mergedTokens.push(matchId);
                i += matchLen;
            } else {
                // Fallback: Single char or UNK
                const char = tokens[i];
                // We likely already checked char in results[0], but let's be safe
                const id = results[0];
                if (id !== undefined) {
                    mergedTokens.push(id);
                } else {
                    mergedTokens.push(this.specials['<unk>'] || 3);
                }
                i++;
            }
        }
        return mergedTokens;
    }

    async detokenize(ids) {
        let text = "";
        for (const id of ids) {
            const chunkId = Math.floor(id / this.CHUNK_SIZE);
            const offset = id % this.CHUNK_SIZE;
            
            const chunk = await this._loadChunk(chunkId);
            const token = chunk[offset];
            
            if (token) text += token;
        }
        return text.replace(/\u2581/g, ' ').replace(/<0x0A>/g, '\n');
    }
}

module.exports = DBTokenizer;
