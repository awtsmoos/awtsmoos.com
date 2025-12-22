// B"H
/**
 * Inference Loop
 * Runs inside the Worker.
 */
import { initLoader, getEmbeddingRow, getVocab, loadWeight } from './model_loader.js';
import { tokenize } from './engine_tokenizer.js';
import { inferStats } from './model_stats.js';
import { forwardLayer } from './layer_attn.js';
import { rmsNorm } from './math_stats.js';
import { matVecMul } from './math_matrix.js';

let stats = null;
let kv_cache = [];
let pos = 0;
let logFn = null; // Abstracted logger

export async function initSession(buffer, metaData, logger) {
    logFn = logger || console.log;
    initLoader(buffer, metaData);
    stats = inferStats();
    kv_cache = [];
    pos = 0;
    logFn("Engine initialized in Worker.", 'info');
}

export async function runInference(prompt, onToken, onDone) {
    if (!stats) {
        logFn("Error: Engine not initialized.", 'error');
        return;
    }
    
    logFn(`--- INFERENCE START ---`, 'accent');
    
    const tokens = tokenize(prompt);
    logFn(`Processing ${tokens.length} input tokens...`, 'info');
    
    let nextToken = null;
    
    // 1. Context Phase
    for (let i = 0; i < tokens.length; i++) {
        nextToken = await processToken(tokens[i], true);
    }
    
    // 2. Generation Phase
    const MAX_GEN = 256; 
    logFn(`Generating...`, 'info');

    for(let g = 0; g < MAX_GEN; g++) {
        if (nextToken === 2) {
            logFn("EOS Token reached.", 'info');
            break;
        }
        
        // Decode
        const vocab = getVocab();
        let text = vocab[nextToken] || '';
        if (typeof text === 'string') {
            text = text.replace('\u2581', ' ').replace('<0x0A>', '\n');
            if (text.startsWith('<|')) text = ''; 
        } else {
            text = '';
        }
        
        // Send to main thread
        onToken(text);
        
        // Next Step
        nextToken = await processToken(nextToken, false);
    }
    
    logFn("--- DONE ---", 'info');
    onDone();
}

async function processToken(id, isPrompt) {
    let x = getEmbeddingRow(id, stats.n_embd);
    
    for (let l = 0; l < stats.n_layer; l++) {
        x = await forwardLayer(x, l, stats, pos, kv_cache);
    }

    const w_norm = loadWeight('output_norm.weight');
    if (w_norm) x = rmsNorm(x, w_norm, stats.norm_eps);
    
    let w_out = loadWeight('output.weight');
    if (!w_out) w_out = loadWeight('token_embd.weight');
    
    const vocab = getVocab();
    const logits = matVecMul(x, w_out, vocab.length);
    
    let maxId = 0;
    let maxVal = -Infinity;
    for(let i=0; i<logits.length; i++) {
        if (logits[i] > maxVal) { maxVal = logits[i]; maxId = i; }
    }
    
    pos++;
    return maxId;
}