// B"H
/**
 * @file kokoro.js
 * @description
 * B"H
 * The High-Level Portable API.
 * Encapsulates the complexity of the Neural Engine, Worker Management, and Data Persistence.
 */

import { NeuralEngine } from './onnx/engine.js';
import * as DB from './storage.js';
import { log } from './logger.js';

// B"H - Divine Sources
// We target the Q8F16 model as the primary divine vessel.
const URLS = {
    [DB.AssetType.MODEL]: "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/onnx/model_q8f16.onnx",
    [DB.AssetType.VOICE]: "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/am_michael.bin",
    [DB.AssetType.TOKENIZER]: "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/tokenizer.json"
};

export class KokoroTTS {
    constructor() {
        this.engine = new NeuralEngine();
        this.isReady = false;
        // B"H - We will determine the actual key to use during integrity check
        this.activeModelKey = DB.AssetType.MODEL; 
    }

    async checkIntegrity() {
        try {
            const keys = await DB.debugStorage();
            
            // 1. Check Model
            let hasModel = await DB.hasAsset(DB.AssetType.MODEL);
            if (hasModel) {
                this.activeModelKey = DB.AssetType.MODEL;
            } else {
                // Fallback: Check if user has the previous q8 model
                if (keys.includes('model_q8.onnx')) {
                    log("B\"H - Detected legacy model (Q8). Using cached version.", "info");
                    this.activeModelKey = 'model_q8.onnx';
                    hasModel = true;
                }
            }

            const hasVoice = await DB.hasAsset(DB.AssetType.VOICE);
            const hasTokenizer = await DB.hasAsset(DB.AssetType.TOKENIZER);
            
            return { model: hasModel, voice: hasVoice, tokenizer: hasTokenizer };
        } catch (e) {
            log("Integrity Check Error: " + e.message, 'error');
            return { model: false, voice: false, tokenizer: false };
        }
    }

    async ignite({ onProgress, onLog } = {}) {
        const logger = (msg, type) => {
            log(msg, type);
            if (onLog) onLog(msg, type);
        };

        try {
            const status = await this.checkIntegrity();
            
            // 1. Acquire Model
            let modelBuffer;
            if (status.model) {
                logger(`B"H - Loading Neural Weights (${this.activeModelKey})...`, "info");
                modelBuffer = await DB.loadAsset(this.activeModelKey);
                if (!modelBuffer) throw new Error("Model data corrupted (Empty).");
            } else {
                logger("B\"H - Downloading Neural Weights (Q8F16)...", "warning");
                // We default to downloading the official Q8F16
                modelBuffer = await this.fetchAsset(DB.AssetType.MODEL, (p) => onProgress && onProgress('model', p), true);
                logger("B\"H - Caching Weights...", "success");
                await DB.saveAsset(DB.AssetType.MODEL, modelBuffer);
            }

            // 2. Acquire Voice
            let voiceBuffer;
            if (status.voice) {
                logger("B\"H - Loading Voice Bank...", "info");
                voiceBuffer = await DB.loadAsset(DB.AssetType.VOICE);
                if (!voiceBuffer) throw new Error("Voice data corrupted.");
            } else {
                logger("B\"H - Downloading Voice Bank...", "warning");
                voiceBuffer = await this.fetchAsset(DB.AssetType.VOICE, (p) => onProgress && onProgress('voice', p), true);
                await DB.saveAsset(DB.AssetType.VOICE, voiceBuffer);
            }

            // 3. Acquire Tokenizer
            let tokenizerJson;
            if (status.tokenizer) {
                logger("B\"H - Loading Tokenizer Logic...", "info");
                tokenizerJson = await DB.loadAsset(DB.AssetType.TOKENIZER);
                if (!tokenizerJson) throw new Error("Tokenizer data corrupted.");
            } else {
                logger("B\"H - Downloading Tokenizer Definitions...", "warning");
                tokenizerJson = await this.fetchTextAsset(DB.AssetType.TOKENIZER);
                await DB.saveAsset(DB.AssetType.TOKENIZER, tokenizerJson);
            }

            // 4. Initialize Engine
            logger("B\"H - Booting Neural Engine...", "info");
            this.engine.initWorker();
            
            onProgress && onProgress('model', 100);
            
            this.engine.worker.postMessage({ 
                type: 'INIT_MODEL', 
                payload: { 
                    buffer: modelBuffer,
                    vocab: typeof tokenizerJson === 'string' ? JSON.parse(tokenizerJson) : tokenizerJson
                } 
            }, [modelBuffer]);
            
            onProgress && onProgress('voice', 100);
            this.engine.worker.postMessage({ type: 'LOAD_VOICE', payload: { buffer: voiceBuffer } }, [voiceBuffer]);

            this.isReady = true;
            return true;
        } catch (e) {
            logger(`Ignition Failed: ${e.message}`, "error");
            throw e;
        }
    }

    async fetchAsset(type, onProgress, isBinary = true) {
        const url = URLS[type];
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${type}: ${response.statusText}`);

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        const reader = response.body.getReader();
        
        let receivedLength = 0; 
        let chunks = []; 

        while(true) {
            const {done, value} = await reader.read();
            if (done) break;

            chunks.push(value);
            receivedLength += value.length;

            if (total && onProgress) {
                const percent = (receivedLength / total) * 100;
                onProgress(percent);
            }
        }

        let chunksAll = new Uint8Array(receivedLength); 
        let position = 0;
        for(let chunk of chunks) {
            chunksAll.set(chunk, position);
            position += chunk.length;
        }

        return chunksAll.buffer;
    }

    async fetchTextAsset(type) {
        const url = URLS[type];
        const response = await fetch(url);
        return await response.text();
    }

    speak(text, speed = 1.0, isRaw = false) {
        if (!this.isReady) throw new Error("Engine not ignited.");
        this.engine.generate(text, speed, isRaw);
    }

    async purgeCache() {
        await DB.clearAllAssets();
        this.isReady = false;
        log("B\"H - Local Knowledge Purged.", "warning");
    }
}