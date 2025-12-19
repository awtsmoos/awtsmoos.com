
// B"H
const AwtsmoosDB = require('../index.js');
const path = require('path');

(async () => {
    console.log("B\"H - Starting AI Test");

    // CLI args parsing
    const args = process.argv.slice(2);
    const useWasm = args.includes('--wasm');
    const ggufPath = args.find(a => a.endsWith('.gguf'));
    
    // B"H - Tuning: 60,000 blocks * 4KB = ~240MB Cache
    // This allows the small 270M model (~200MB) to fit entirely in RAM.
    const db = new AwtsmoosDB('gemma.db', { cacheSize: 60000 });
    await db.open();

    const ai = db.ai;
    const modelName = 'gemma-270m';

    const exists = await ai.hasModel(modelName);
    
    if (!exists) {
        if (!ggufPath) {
            console.error("Model not found in DB. Please provide path to .gguf file as argument.");
            console.error("Usage: node test/ai_test.js <path-to-gguf> [--wasm]");
            process.exit(1);
        }
        await ai.importModel(ggufPath, modelName);
    }

    console.log(`Loading Engine... (WASM: ${useWasm})`);
    const engine = await ai.loadModel(modelName, { useWasm });
    await engine.init();

    const prompt = "Why is the sky blue?";
    console.log(`Prompt: "${prompt}"`);
    process.stdout.write("Response: ");
    
    await engine.generate(prompt, (token) => {
        process.stdout.write(token);
    });
    
    console.log("\n\nB\"H - Done");
    await db.close();
})();
