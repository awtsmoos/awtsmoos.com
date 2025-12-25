// B"H
// File: /BH/awtsmoos.com/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/ai/importer.js

const fs = require('fs');
const GGUFParser = require('./utils/gguf_parser.js');
const Tensors = require('./direct/loader_tensors.js');

class ModelImporter {
    constructor(db) {
        this.db = db;
    }

    /**
     * @description Manifests a GGUF file as a binary sequence within the database.
     */
    async importGGUF(filePath, modelName) {
        console.log(`\x1b[36mB"H Importer: Reading ${filePath}...\x1b[0m`);
        const buffer = fs.readFileSync(filePath);
        
        console.log(`\x1b[36mB"H Importer: Parsing GGUF Header...\x1b[0m`);
        const parsed = GGUFParser.parse(buffer);
        
        const root = this.db.root;
        
        // Ensure ai/models exists
        if (!await this.db.has(root, 'ai')) await this.db.createMap(root, 'ai');
        if (!await this.db.has(root.ai, 'models')) await this.db.createMap(root.ai, 'models');
        
        // Create Model Container
        if (await this.db.has(root.ai.models, modelName)) {
            console.log(`\x1b[33mB"H Importer: Model ${modelName} exists. Overwriting...\x1b[0m`);
        } else {
            await this.db.createMap(root.ai.models, modelName);
        }
        
        const modelHandle = root.ai.models[modelName];
        
        const metaObj = {
            kv: parsed.kv,
            vocab: parsed.vocab,
            scores: parsed.scores,
            tensorInfos: []
        };
        
        if (!await this.db.has(modelHandle, 'tensors')) {
            await this.db.createMap(modelHandle, 'tensors');
        }
        const tensorsHandle = modelHandle.tensors;

        const totalTensors = parsed.tensorMap.size;
        console.log(`\x1b[35mB"H Importer: Reincarnating ${totalTensors} tensors to DB...\x1b[0m`);
        
        let count = 0;
        const startTime = Date.now();

        // B"H: Visual Progress Helper
        const renderProgress = (current, total) => {
            const width = 30;
            const filled = Math.floor((current / total) * width);
            const empty = width - filled;
            const pct = Math.floor((current / total) * 100);
            const bar = "=".repeat(filled) + ">" + "-".repeat(empty);
            process.stdout.write(`\r    \x1b[35m[${bar}] ${pct}% (${current}/${total} Tensors)\x1b[0m`);
        };

        // Use batch to accelerate the gathering of sparks
        await this.db.batch(async () => {
            for (const [name, info] of parsed.tensorMap) {
                try {
                    const start = parsed.dataOffset + info.dataOffset;
                    const { blockSize, blockElements } = require('./math/types.js').getByteSize(info.type);
                    const numElements = info.dims.reduce((a,b)=>a*b, 1);
                    const byteLength = Math.ceil(numElements / blockElements) * blockSize;
                    
                    const tensorData = buffer.subarray(start, start + byteLength);
                    
                    // Copy to new buffer to detach from file buffer
                    const persistentBuffer = Buffer.from(tensorData);
                    
                    await tensorsHandle.set(name, persistentBuffer);
                    
                    metaObj.tensorInfos.push({
                        name: info.name,
                        dims: info.dims,
                        type: info.type,
                        dataOffset: 0 
                    });
                    
                    count++;
                    if (count % 5 === 0 || count === totalTensors) {
                        renderProgress(count, totalTensors);
                    }
                } catch (e) {
                    console.error(`\n\x1b[31mB"H Error importing tensor '${name}': ${e.message}\x1b[0m`);
                    throw e;
                }
            }
        });
        
        console.log(`\n\x1b[36mB"H Importer: Saving Metadata Architecture...\x1b[0m`);
        await modelHandle.set('info', metaObj);
        
        console.log(`\x1b[36mB"H Importer: Sealing the Vessels (Flushing Disk)...\x1b[0m`);
        await this.db.waitForIdle();
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\x1b[32mB"H Importer: ${modelName} successfully manifested in ${duration}s.\x1b[0m`);
        
        return modelHandle;
    }
}

module.exports = ModelImporter;
