
// B"H
/**
 * @file importer.js
 * @description
 *  Manifests GGUF models into the database vessels.
 */

const fs = require('fs');
const GGUFParser = require('./utils/gguf/parser.js');
const Tensors = require('./direct/loader/tensors.js');

class ModelImporter {
    constructor(db) {
        this.db = db;
    }

    async importGGUF(filePath, modelName) {
        console.log(`\x1b[36mB"H Importer: Reading ${filePath}...\x1b[0m`);
        const buffer = fs.readFileSync(filePath);
        
        console.log(`\x1b[36mB"H Importer: Parsing GGUF Header...\x1b[0m`);
        const parsed = GGUFParser.parse(buffer);
        
        const root = this.db.root;
        
        if (!await this.db.has(root, 'ai')) root.ai = new this.db.Map();
        if (!await this.db.has(root.ai, 'models')) root.ai.models = new this.db.Map();
        
        if (await this.db.has(root.ai.models, modelName)) {
            console.log(`\x1b[33mB"H Importer: Model ${modelName} exists. Overwriting...\x1b[0m`);
        } else {
            root.ai.models[modelName] = new this.db.Map();
        }
        
        const modelHandle = root.ai.models[modelName];
        
        const metaObj = {
            kv: parsed.kv,
            vocab: parsed.vocab,
            scores: parsed.scores,
            tensorInfos: []
        };
        
        if (!await this.db.has(modelHandle, 'tensors')) {
            modelHandle.tensors = new this.db.Map();
        }
        const tensorsHandle = modelHandle.tensors;

        const totalTensors = parsed.tensorMap.size;
        console.log(`\x1b[35mB"H Importer: Reincarnating ${totalTensors} tensors to DB...\x1b[0m`);
        
        let count = 0;
        const startTime = Date.now();

        const renderProgress = (current, total) => {
            const width = 30;
            const filled = Math.floor((current / total) * width);
            const bar = "=".repeat(filled) + ">" + "-".repeat(width - filled);
            process.stdout.write(`\r    \x1b[35m[${bar}] ${Math.floor((current/total)*100)}% (${current}/${total} Tensors)\x1b[0m`);
        };

        await this.db.batch(async () => {
            for (const [name, info] of parsed.tensorMap) {
                try {
                    const start = parsed.dataOffset + info.dataOffset;
                    const { blockSize, blockElements } = require('./math/types.js').getByteSize(info.type);
                    const numElements = info.dims.reduce((a,b)=>a*b, 1);
                    const byteLength = Math.ceil(numElements / blockElements) * blockSize;
                    
                    const tensorData = buffer.subarray(start, start + byteLength);
                    const persistentBuffer = Buffer.from(tensorData);
                    
                    await tensorsHandle.set(name, persistentBuffer);
                    
                    metaObj.tensorInfos.push({
                        name: info.name, dims: info.dims, type: info.type, dataOffset: 0 
                    });
                    
                    count++;
                    if (count % 5 === 0 || count === totalTensors) renderProgress(count, totalTensors);
                } catch (e) { throw e; }
            }
        });
        
        console.log(`\n\x1b[36mB"H Importer: Saving Metadata Architecture...\x1b[0m`);
        await modelHandle.set('info', metaObj);
        await this.db.waitForIdle();
        
        console.log(`\x1b[32mB"H Importer: ${modelName} manifested in ${((Date.now()-startTime)/1000).toFixed(2)}s.\x1b[0m`);
        return modelHandle;
    }
}
module.exports = ModelImporter;
