// B"H
import { initUI, log, setStatus, resetMetadata, setTokenizerState, setTokenOutput, ui, enableChatTab, populateModelConfig, populateTensorList, visualizeRoPE, addMetaEntry, showPurifyUI, logPurify } from './ui.js';
import { initModal } from './ui_modal.js';
import { uiInspector } from './ui_inspector.js'; // Import direct access for vocab
import { uiSurgery } from './ui_surgery.js'; // B"H - Import for layer/vocab counts
import { setupChat } from './chat_main.js';
import { logEngine, streamToken, startStreamMessage, endStreamMessage, onChatReady, setGeneratingState, updateProgress, setTensorCount } from './chat_view.js';

import { createWorkerFromSources } from './worker_builder.js';
import { BaseSource } from './worker_src/base.js';
import { EnvSource } from './worker_src/env.js';
import { WorkerMainSource } from './worker_src/worker_main.js'; 
import { GGUFParserSource } from './worker_src/gguf_parser.js';
import { TokenizerSource } from './worker_src/tokenizer.js';
import { ModelLoaderSource } from './worker_src/model_loader.js'; 
import { MathKernelsSource } from './worker_src/math_kernels.js';
import { QuantCommonSource } from './worker_src/quant_common.js';
import { QuantLegacySource } from './worker_src/quant_legacy.js';
import { QuantKSource } from './worker_src/quant_k.js';
import { QuantIQSource } from './worker_src/quant_iq.js'; // B"H - Import new quantizer
import { TensorSource } from './worker_src/tensor.js';
import { ConfigSource } from './worker_src/config.js';
import { WeightsSource } from './worker_src/weights.js';
import { LoopSource } from './worker_src/loop.js';
import { MathStatsSource } from './worker_src/math_stats.js';
import { MathActSource } from './worker_src/math_act.js';
import { MathPosSource } from './worker_src/math_pos.js';
import { ModelAttnSource } from './worker_src/model_attn.js';
import { ModelFFNSource } from './worker_src/model_ffn.js';
import { ModelBlockSource } from './worker_src/model_block.js';

// SPM Modules
import { PriorityQueueSource } from './worker_src/vocab/priority_queue.js';
import { SPMSource } from './worker_src/vocab/spm.js';

// WASM Modules (Turbo)
import { AsmCommonSource } from './worker_src/asm_common.js';
import { AsmKernelSource } from './worker_src/asm_kernels.js';
import { AsmSource } from './worker_src/asm.js';
import { MathWasmSource } from './worker_src/math_wasm.js';

// Purification
import { PurifierSource } from './worker_src/purifier.js';

let vocab = [];
let worker = null;
let currentMeta = null;

export function bootstrap() {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}

function init() {
    if (!initUI()) return; 
    initModal(); // Init the modal logic

    // Turbo Mode Toggle
    const turboToggle = document.getElementById('turboToggle');
    if (turboToggle) {
        turboToggle.addEventListener('change', (e) => {
            if(worker) worker.postMessage({ type: 'CONFIG_UPDATE', payload: { useWasm: e.target.checked }});
            if(e.target.checked) log("Turbo Mode Activated: JIT Wasm Assembly Enabled", "accent");
            else log("Turbo Mode Deactivated: Standard JS Logic Enabled", "info");
        });
    }

    try {
        log("Constructing Modular Engine...", 'info');
        worker = createWorkerFromSources(
            BaseSource, 
            EnvSource, 
            WorkerMainSource,
            GGUFParserSource, 
            PriorityQueueSource, 
            SPMSource,
            TokenizerSource,
            ModelLoaderSource, 
            MathKernelsSource, 
            QuantCommonSource,
            QuantLegacySource,
            QuantKSource,
            QuantIQSource, 
            MathStatsSource,
            MathActSource,
            MathPosSource,
            TensorSource, 
            ConfigSource, 
            WeightsSource, 
            ModelAttnSource,
            ModelFFNSource,
            ModelBlockSource,
            LoopSource,
            // WASM Pipeline
            AsmCommonSource,
            AsmKernelSource,
            AsmSource,
            MathWasmSource,
            // Purification
            PurifierSource
        );
        
        // Give UI access to worker for purification
        uiInspector.setWorker(worker);
        
        worker.onmessage = (e) => {
            const { type, payload } = e.data;
            switch (type) {
                case 'LOG': logEngine(payload.msg, payload.level); break;
                case 'STATUS': setStatus(payload, true); break;
                case 'PROGRESS': updateProgress(payload.percent, payload.msg); break;
                case 'METADATA':
                    handleMetadata(payload);
                    break;
                case 'CONFIG': 
                    populateModelConfig(payload); 
                    visualizeRoPE(payload.rope_freq, payload.head_dim);
                    break;
                case 'TENSORS': 
                    populateTensorList(payload); 
                    setTensorCount(payload.length);
                    break;
                case 'READY': 
                    enableChatTab(true); 
                    onChatReady();
                    updateProgress(100, "Ready");
                    log("Engine Online - Logic Stabilized", 'accent');
                    showPurifyUI(true);
                    break;
                case 'TOKEN': streamToken(payload); break;
                case 'DONE': endStreamMessage(); setGeneratingState(false); break;
                case 'ERROR': 
                    // B"H - Payload now contains full stack trace from worker
                    log(`ENGINE FATAL: ${payload}`, 'error');
                    logEngine(`FATAL ERROR: ${payload}`, 'error');
                    setStatus("Error", false); setGeneratingState(false);
                    break;
                case 'TOKEN_DATA':
                    // B"H - Received Vector Data from Worker
                    uiInspector.updateTokenInspector(payload);
                    break;
                case 'PURIFY_LOG':
                    logPurify(payload);
                    break;
                case 'PURIFY_DONE':
                    handlePurifiedModel(payload.buffer);
                    break;
            }
        };
    } catch (e) {
        log(`Worker creation failed: ${e.message}\n${e.stack}`, 'error');
    }

    setupChat(sendPromptToWorker, stopWorkerGeneration, resetSession);
    if (ui.file) ui.file.addEventListener('change', handleFile);
    if (ui.btnSearch) ui.btnSearch.addEventListener('click', searchToken);
    if (ui.btnLookup) ui.btnLookup.addEventListener('click', lookupToken);
}

async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    resetMetadata();
    setTokenizerState(false);
    enableChatTab(false); 

    log(`Loading: ${file.name}`, 'accent');
    setStatus("Reading GGUF...", true);
    updateProgress(0, "Reading File...");

    try {
        const buffer = await file.arrayBuffer();
        updateProgress(5, "Sending to Worker...");
        if (worker) worker.postMessage({ type: 'INIT', payload: buffer }, [buffer]); 
    } catch (err) {
        log(`ERROR: ${err.message}\n${err.stack}`, 'error');
        setStatus("Load Failed");
    }
}

function handleMetadata(meta) {
    currentMeta = meta;
    vocab = meta.vocab;
    
    // Pass vocab to Inspector for Browser
    uiInspector.setVocab(vocab, meta.scores); // B"H - Pass scores as well
    
    // Populate UI Metadata
    for(const key in meta.kv) {
        let val = meta.kv[key];
        if (Array.isArray(val)) {
             addMetaEntry(key, `[Array(${val.length})]`);
        } else {
             addMetaEntry(key, String(val));
        }
    }
    
    if (vocab.length > 0) setTokenizerState(true);

    // B"H - Connect metadata to Surgery UI
    const blockCountKey = Object.keys(meta.kv).find(k => k.endsWith('.block_count'));
    const totalLayers = blockCountKey ? meta.kv[blockCountKey] : 28; // Default
    uiSurgery.setTotalLayers(totalLayers);
    uiSurgery.setTotalVocab(vocab.length);
}

function handlePurifiedModel(buffer) {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purified_${currentMeta.kv['general.name'] || 'model'}.gguf`;
    a.click();
    
    logPurify("Purification Complete. Offering download.");
    log("Purification Complete. New model vessel generated.", "accent");
    
    const btnPurify = document.getElementById('btnLobotomize');
    if (btnPurify) btnPurify.disabled = false;
}

export function sendPromptToWorker(params) {
    if (!worker) return;
    
    // params comes as { prompt, temp, top_p, ... }
    let prompt = params.prompt;
    
    if (currentMeta) {
        const arch = (currentMeta.kv['general.architecture'] || '').toLowerCase();
        if (arch.includes('gemma')) {
            const trim = (s) => s.trim();
            prompt = `<start_of_turn>user\n${trim(prompt)}<end_of_turn>\n<start_of_turn>model\n`;
        }
    }
    
    // Create new payload object with formatted prompt
    const payload = { ...params, prompt: prompt };
    
    startStreamMessage();
    worker.postMessage({ type: 'GENERATE', payload: payload });
}

export function stopWorkerGeneration() { if (worker) worker.postMessage({ type: 'STOP' }); }

export function resetSession() {
    if (worker) worker.postMessage({ type: 'RESET' });
}

function searchToken() {
    const term = ui.termInput?.value;
    if (!term) return;
    const matches = vocab.map((v,i)=>({v,i})).filter(x => String(x.v).includes(term));
    const exact = vocab.indexOf(term);
    
    let out = exact !== -1 ? `EXACT ID: ${exact}\n---\n` : '';
    out += matches.slice(0, 20).map(m=>`[${m.i}] ${m.v}`).join('\n');
    if (matches.length > 20) out += `\n...and ${matches.length - 20} more`;
    
    setTokenOutput(out);
}

function lookupToken() {
    const id = parseInt(ui.idInput?.value);
    if (!isNaN(id) && vocab[id]) setTokenOutput(`"${vocab[id]}"`);
}