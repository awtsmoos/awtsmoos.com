
// B"H
const GGUFParser = require('../utils/gguf_parser.js');
const Config = require('./loader_config.js');
const Tensors = require('./loader_tensors.js');
const Logger = require('../utils/logger.js');
const { DbSource, FileSource } = require('./tensor_source.js');

class Loader {
    constructor(engine) {
        this.engine = engine;
        this.tensorMap = null;
        this.dataOffset = 0;
        this.layerTensorMap = [];
        this.globalTensorMap = {};
        
        // Cache for DB-loaded tensors to prevent thrashing
        this.dbTensorCache = new Map();
    }

    async load(source) {
        if (source instanceof DbSource) {
            return this.loadFromDB(source);
        } else if (source instanceof FileSource) {
            // Backward Compatibility: Pass the raw buffer to the file loader
            return this.loadFromFile(source.buffer);
        } else {
            // Fallback for direct buffer passing
            return this.loadFromFile(source);
        }
    }

    async loadFromFile(buffer) {
        Logger.log(`[Direct] Parsing GGUF Header (File Mode)...`);
        const parsed = GGUFParser.parse(buffer);
        this.engine.metadata = parsed.kv;
        this.engine.vocab = parsed.vocab;
        this.scores = parsed.scores;
        this.tensorMap = parsed.tensorMap;
        this.dataOffset = parsed.dataOffset;
        
        this._finalizeLoad();
    }

    async loadFromDB(dbSource) {
        Logger.log(`[Direct] Connecting to Neural Database...`);
        
        // 1. Load Metadata (already resolved in source.init)
        const meta = dbSource.meta;
        if (!meta) throw new Error("Model metadata missing in DB");

        this.engine.metadata = meta.kv;
        this.engine.vocab = meta.vocab;
        this.scores = meta.scores;
        
        // 2. Reconstruct Tensor Map from DB info
        // The DB 'info' object should store the tensor definitions (dims, type)
        // keys are tensor names
        this.tensorMap = new Map();
        for(const t of meta.tensorInfos) {
            this.tensorMap.set(t.name, t);
        }
        
        this.dataOffset = 0; // Not used in DB mode
        this._finalizeLoad();
    }

    _finalizeLoad() {
        const maps = Tensors.mapWeights(this.tensorMap);
        this.layerTensorMap = maps.layerTensorMap;
        this.globalTensorMap = maps.globalTensorMap;
        this.engine.params = Config.inferParams(this.engine.metadata, this.tensorMap);
    }

    async getTensor(name) {
        // Hybrid handling
        if (this.engine.source.type === 'db') {
            if (this.dbTensorCache.has(name)) return this.dbTensorCache.get(name);
            
            const info = this.tensorMap.get(name);
            if (!info) return null;
            
            // Fetch raw buffer from DB
            const rawData = await this.engine.source.getTensorData(name);
            
            // Dequantize if needed (Logic similar to Tensors.readTensor but adaptation required)
            // If stored as raw bytes in DB, we need to dequantize.
            // Tensors.readTensor expects a monolithic buffer. We have a slice.
            
            if (!rawData) return null;
            
            // Use specialized single-tensor reader
            const res = Tensors.dequantizeSingle(rawData, info.type);
            
            // Cache heavy tensors? (Maybe use LRU later)
            // this.dbTensorCache.set(name, res); 
            return res;
        } else {
            // File Mode
            const info = this.tensorMap.get(name);
            if (!info) return null;
            return Tensors.readTensor(this.engine.buffer, this.dataOffset, info);
        }
    }
    
    // B"H: Special Q4_0 accessor for Wasm
    async getQuantizedTensor(name) {
         if (this.engine.source.type === 'db') {
             // For DB, we fetch the raw buffer, which IS the quantized data.
             // We need to parse the scales/quants structure manually here since it's not contiguous in a file anymore.
             
             const raw = await this.engine.source.getTensorData(name);
             if (!raw) return null;
             
             // Reuse the logic from Tensors.readQuantizedTensor but on this buffer
             return Tensors.parseQuantizedBuffer(raw);
         } else {
             const info = this.tensorMap.get(name);
             if (!info) return null;
             return Tensors.readQuantizedTensor(this.engine.buffer, this.dataOffset, info);
         }
    }

    // B"H: Made Async to support DB
    async getLayerWeight(layerIdx, alias) {
        if (!this.layerTensorMap[layerIdx]) return null;
        const realName = this.layerTensorMap[layerIdx][alias];
        if (!realName) return null;
        
        return await this.getTensor(realName);
    }
}

module.exports = Loader;
