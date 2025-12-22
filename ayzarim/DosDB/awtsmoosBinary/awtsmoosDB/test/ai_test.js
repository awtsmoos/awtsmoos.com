
// B"H
const DirectEngine = require('../api/ai/direct/index.js');
const path = require('path');

(async () => {
    console.log("B\"H - Starting Direct AI Test (Modular Mode)");

    const args = process.argv.slice(2);
    const ggufPath = args.find(a => a.endsWith('.gguf'));
    
    if (!ggufPath) {
        console.error("Please provide path to .gguf file.");
        process.exit(1);
    }

    const engine = new DirectEngine(ggufPath);
    await engine.init();
    
    // B"H - Updated prompt to match user's log for exact reproducibility
    const prompt = "B\"H\nWhy is the sky blue?";
    console.log(`Prompt: "${prompt}"`);
    process.stdout.write("Response: ");
    
    await engine.generate(prompt, (token) => {
        process.stdout.write(token);
    });
    
    console.log("\n\nB\"H - Done");
})();