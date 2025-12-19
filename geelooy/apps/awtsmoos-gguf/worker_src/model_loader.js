// B"H
/**
 * Model Loader Source
 */
export const ModelLoaderSource = () => {
    
    let fullBuffer = null;
    
    self.initLoader = function(buffer, metaData) {
        fullBuffer = buffer;
        self.env.vocab = metaData.vocab;
        self.env.scores = metaData.scores; // Capture scores for SPM
        
        const dataBaseOffset = self.scanTensors(buffer, metaData.endOffset, metaData.tensorCount, metaData.alignment);
        self.env.dataOffset = dataBaseOffset;
        
        if (self.env.vocab.length > 0) {
            self.logDB(`[LOADER] Vocab Size: ${self.env.vocab.length}`, 'info');
        }
        return { vocab: self.env.vocab };
    };

    self.loadWeight = function(name, noCache = false) {
        return null; // Defer to WeightsSource
    };

    self.getEmbeddingRow = function(tokenID, n_embd) {
        let info = self.env.tensorMap.get('token_embd.weight');
        if (!info) info = self.env.tensorMap.get('model.embed_tokens.weight');
        
        if (!info) {
            self.logDB(`[EMBED] CRITICAL: Embedding Tensor Not Found!`, 'error');
            return new Float32Array(n_embd);
        }

        const startIdx = tokenID * n_embd;
        const total = info.dims.reduce((a,b)=>a*b,1);
        
        if (startIdx >= total) {
            return new Float32Array(n_embd);
        }

        const row = self.readTensor(info, startIdx, n_embd);
        return row;
    };
    
    // B"H - Exposed for Inspector
    self.getTokenVector = function(id) {
        if (!self.env.stats) return null;
        return self.getEmbeddingRow(id, self.env.stats.n_embd);
    };

    self.getVocab = function() {
        return self.env.vocab;
    };
    
    self.getTensorInfo = function(name) {
        return self.env.tensorMap.get(name);
    };
};