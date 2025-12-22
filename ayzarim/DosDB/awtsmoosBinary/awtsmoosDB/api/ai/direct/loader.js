// B"H
const GGUFParser = require('../utils/gguf_parser.js');
const Config = require('./loader_config.js');
const Tensors = require('./loader_tensors.js');
const Logger = require('../utils/logger.js');

class Loader {
    constructor(engine) {
        this.engine = engine;
        this.tensorMap = null;
        this.dataOffset = 0;
        this.layerTensorMap = [];
        this.globalTensorMap = {};
    }

    async load(headerBuffer) {
        Logger.log(`[Direct] Parsing GGUF Header...`);
        const parsed = GGUFParser.parse(headerBuffer);
        this.engine.metadata = parsed.kv;
        this.engine.vocab = parsed.vocab;
        this.scores = parsed.scores;
        this.tensorMap = parsed.tensorMap;
        this.dataOffset = parsed.dataOffset;
        const maps = Tensors.mapWeights(this.tensorMap);
        this.layerTensorMap = maps.layerTensorMap;
        this.globalTensorMap = maps.globalTensorMap;
        this.engine.params = Config.inferParams(this.engine.metadata, this.tensorMap);
    }

    getTensor(name, sliceStart = 0, sliceLength = null, raw = false) {
        const info = this.tensorMap.get(name);
        if (!info) return null;
        
        // B"H: FIX - Pass 7 arguments to match loader_tensors.js
        return Tensors.readTensor(
            this.engine.fd,           // 1. File Descriptor
            this.engine.headerBuffer, // 2. Header
            this.dataOffset,          // 3. Offset
            info,                     // 4. Info (was ending up here as 'offset' before)
            sliceStart,               // 5.
            sliceLength,              // 6.
            raw                       // 7.
        );
    }
    
    getLayerWeight(layerIdx, alias) {
        if (!this.layerTensorMap[layerIdx]) return null;
        const realName = this.layerTensorMap[layerIdx][alias];
        if (!realName) return null;
        return this.getTensor(realName);
    }
}

module.exports = Loader;