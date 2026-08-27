// B"H
const DirectEngine = require('../api/ai/direct/index.js');
const path = require('path');

(async () => {
    console.log("B\"H - Starting Direct AI Test (Modular Mode)");

    const args = process.argv.slice(2);
    const ggufPath = args.find(a => a.endsWith('.gguf'));
    
    // B"H: Detect --verbose from CLI
    const verbose = args.includes('--verbose');

    if (!ggufPath) {
        console.error("Please provide path to .gguf file.");
        console.error("Usage: node ai_test.js model.gguf [--verbose]");
        process.exit(1);
    }

    const engine = new DirectEngine(ggufPath, { verbose });
    await engine.init();
    
    const prompt = "B\"H\nWhy is the sky blue?";
    console.log(`Prompt: "${prompt}"`);
    if (!verbose) console.log(`(Math metrics hidden. Run with --verbose to see them.)`);
    
    console.log("\n--- GENERATION LEDGER ---");
    
    // The Engine now handles its own beautiful console.log normalization.
    // We only use the callback for actual app logic (like UI streaming).
    let responseText = "";
    await engine.generate(prompt, (token) => {
        responseText += token;
    });
    
    console.log("\n--- FINAL RESPONSE ---");
    console.log(responseText);
    
    console.log("\nB\"H - Done");
})();
