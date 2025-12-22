
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

    async load(buffer) {
        Logger.log(`[Direct] Parsing GGUF Header...`);
        const parsed = GGUFParser.parse(buffer);
        
        this.engine.metadata = parsed.kv;
        this.engine.vocab = parsed.vocab;
        this.scores = parsed.scores;
        this.tensorMap = parsed.tensorMap;
        this.dataOffset = parsed.dataOffset;
        
        // 1. Map Weights
        const maps = Tensors.mapWeights(this.tensorMap);
        this.layerTensorMap = maps.layerTensorMap;
        this.globalTensorMap = maps.globalTensorMap;
        
        // 2. Infer Params
        this.engine.params = Config.inferParams(this.engine.metadata, this.tensorMap);
    }

    getTensor(name, sliceStart = 0, sliceLength = null) {
        const info = this.tensorMap.get(name);
        if (!info) return null;
        return Tensors.readTensor(this.engine.buffer, this.dataOffset, info, sliceStart, sliceLength);
    }
    
    getLayerWeight(layerIdx, alias) {
        if (!this.layerTensorMap[layerIdx]) return null;
        const realName = this.layerTensorMap[layerIdx][alias];
        // If not in map, maybe try direct?
        if (!realName) return null;
        return this.getTensor(realName);
    }
}

module.exports = Loader;
