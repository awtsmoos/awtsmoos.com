
// B"H
/**
 * @file loader.js
 * @description 
 *  Synchronous GGUF Loader.
 */
const GGUFParser = require('../utils/gguf/parser.js');
const Config = require('./loader/config.js');
const Tensors = require('./loader/tensors.js');
const Logger = require('../utils/logger.js');
const { DbSource, FileSource } = require('./tensor/source.js');

class Loader {
    constructor(engine) {
        this.engine = engine;
        this.tensorMap = null;
        this.dataOffset = 0;
        this.layerTensorMap = [];
        this.globalTensorMap = {};
        this.dbTensorCache = new Map();
    }

    load(source) {
        if (source instanceof DbSource) return this.loadFromDB(source);
        else if (source instanceof FileSource) return this.loadFromFile(source.buffer);
        throw new Error("Unknown Source Type");
    }

    loadFromFile(buffer) {
        Logger.log(`[Direct] Parsing GGUF Header (File Mode)...`);
        const parsed = GGUFParser.parse(buffer);
        this._applyParsedMeta(parsed);
    }

    loadFromDB(dbSource) {
        Logger.log(`[Direct] Loading Header from Neural Database...`);
        const meta = dbSource.meta;
        if (!meta) throw new Error("Model metadata missing");

        this.engine.metadata = meta.kv;
        this.engine.vocab = meta.vocab;
        this.engine.loader = this; 
        this.engine.scores = meta.scores || new Float32Array(meta.vocab.length).fill(0);

        this.tensorMap = new Map();
        for(const t of meta.tensorInfos) this.tensorMap.set(t.name, t);
        
        this.dataOffset = 0; 
        this._finalizeLoad();
    }

    _applyParsedMeta(parsed) {
        this.engine.metadata = parsed.kv;
        this.engine.vocab = parsed.vocab;
        this.engine.scores = parsed.scores;
        this.tensorMap = parsed.tensorMap;
        this.dataOffset = parsed.dataOffset;
        this._finalizeLoad();
    }

    _finalizeLoad() {
        const maps = Tensors.mapWeights(this.tensorMap);
        this.layerTensorMap = maps.layerTensorMap;
        this.globalTensorMap = maps.globalTensorMap;
        this.engine.params = Config.inferParams(this.engine.metadata, this.tensorMap);
    }

    getTensor(name) {
        if (this.engine.source.type === 'db') {
            if (this.dbTensorCache.has(name)) return this.dbTensorCache.get(name);
            const info = this.tensorMap.get(name);
            if (!info) return null;
            const rawData = this.engine.source.getTensorData(name);
            if (!rawData) return null;
            return Tensors.dequantizeSingle(rawData, info.type);
        } else {
            const info = this.tensorMap.get(name);
            if (!info) return null;
            return Tensors.readTensor(this.engine.buffer, this.dataOffset, info);
        }
    }
    
    getQuantizedTensor(name) {
         if (this.engine.source.type === 'db') {
             const raw = this.engine.source.getTensorData(name);
             if (!raw) return null;
             return Tensors.parseQuantizedBuffer(raw);
         } else {
             const info = this.tensorMap.get(name);
             if (!info) return null;
             return Tensors.readQuantizedTensor(this.engine.buffer, this.dataOffset, info);
         }
    }

    getLayerWeight(layerIdx, alias) {
        if (!this.layerTensorMap[layerIdx]) return null;
        const realName = this.layerTensorMap[layerIdx][alias];
        if (!realName) return null;
        return this.getTensor(realName);
    }
}

module.exports = Loader;
