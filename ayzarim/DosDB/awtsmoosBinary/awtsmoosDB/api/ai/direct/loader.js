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
        // We parse only the header buffer
        const parsed = GGUFParser.parse(headerBuffer);
        
        this.engine.metadata = parsed.kv;
        this.engine.vocab = parsed.vocab;
        this.scores = parsed.scores;
        this.tensorMap = parsed.tensorMap;
        this.dataOffset = parsed.dataOffset;
        
        // Map Weights
        const maps = Tensors.mapWeights(this.tensorMap);
        this.layerTensorMap = maps.layerTensorMap;
        this.globalTensorMap = maps.globalTensorMap;
        
        // Infer Params
        this.engine.params = Config.inferParams(this.engine.metadata, this.tensorMap);
    }

    getTensor(name, sliceStart = 0, sliceLength = null) {
        const info = this.tensorMap.get(name);
        if (!info) return null;
        
        // B"H: Optimization - Pass File Descriptor and Header Buffer
        return Tensors.readTensor(
            this.engine.fd,           // File Descriptor
            this.engine.headerBuffer, // Header (Fast RAM access if small)
            this.dataOffset,          // Base Data Offset
            info, 
            sliceStart, 
            sliceLength
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