// B"H
/**
 * @file ui.js
 * @description 
 * B"H
 * Defines the physical appearance of the Neural Forge.
 * The Awtsmoos creates the interface between the human intent and the neural machine.
 * 
 * V3: Cyber-Glass Aesthetics & Data Management.
 */

export const HTML_TEMPLATE = `
  <div id="error-overlay" class="error-overlay hidden">
    <div class="error-content">
      <h2 class="error-title">FORGE RUPTURE</h2>
      <div id="error-message" class="error-msg">UNKNOWN_FAILURE</div>
      <pre id="error-stack" class="error-stack"></pre>
      <button onclick="window.location.reload()" class="reload-btn">RE-IGNITE SYSTEM</button>
    </div>
  </div>

  <header class="forge-header">
    <div class="brand">
      <div class="logo-mark">B"H</div>
      <div>
        <h1>KOKORO FORGE</h1>
        <p>Neural Audio Synthesis Foundry</p>
      </div>
    </div>
    <div id="status-indicator" class="status-module">
      <div class="status-dot" id="status-dot"></div>
      <span class="status-text" id="status-text">OFFLINE</span>
    </div>
  </header>

  <main class="forge-main">
    
    <!-- Left Column: Controls -->
    <section class="primary-column">
      
      <!-- Text Input Panel -->
      <div class="forge-panel input-wrapper">
        <div class="panel-header">
             <span class="panel-title">TEXT INPUT STREAM</span>
             <div class="toolbar-right">
                <label class="checkbox-wrapper">
                    <input type="checkbox" id="raw-mode-toggle" />
                    <span>IPA MODE</span>
                </label>
             </div>
        </div>
        <textarea id="text-input" spellcheck="false">B"H
Blessed is the Awtsmoos, the Creator of all Existence.</textarea>
        
        <div class="input-footer">
           <div class="meta-group">
               <span class="label">LENGTH</span>
               <span id="char-count" class="val">0</span>
           </div>
           <button id="convert-ipa-btn" class="text-btn">PHONEMIZE</button>
        </div>
      </div>

      <!-- Token Matrix -->
      <div id="token-matrix" class="forge-panel token-matrix">
        <div class="panel-header">
            <span class="panel-title">NEURAL TOKENS</span>
        </div>
        <div id="token-list">
           <span class="placeholder-text">WAITING FOR INPUT...</span>
        </div>
      </div>

      <!-- Ignite Button -->
      <button id="generate-btn" class="ignite-btn">
        <div class="btn-content">
            <span id="btn-text">INITIALIZE NEURAL LINK</span>
            <div id="btn-spinner" class="spinner hidden"></div>
        </div>
        <div class="btn-glitch"></div>
      </button>

    </section>

    <!-- Right Column: Data & Viz -->
    <section class="secondary-column">
      
      <!-- Visualizer -->
      <div class="forge-panel viz-panel">
        <canvas id="visualizer"></canvas>
        <div id="visualizer-placeholder" class="viz-overlay">
            <span>AWAITING VIBRATION</span>
        </div>
      </div>

      <!-- Audio Controls -->
      <div class="forge-panel audio-panel">
         <audio id="audio-player" controls></audio>
         <a id="download-btn" class="download-btn disabled" download="manifestation.wav">
            DOWNLOAD WAV
         </a>
      </div>

      <!-- Progress Module -->
      <div class="forge-panel progress-panel">
        <div class="panel-header"><span class="panel-title">SYSTEM STATUS</span></div>
        
        <div class="progress-row">
            <div class="prog-label">
                <span>MODEL WEIGHTS</span>
                <span id="load-progress-val">0%</span>
            </div>
            <div class="track"><div id="load-progress-fill" class="fill cyan"></div></div>
        </div>

        <div class="progress-row">
            <div class="prog-label">
                <span>VOICE BANK</span>
                <span id="voice-progress-val">0%</span>
            </div>
            <div class="track"><div id="voice-progress-fill" class="fill purple"></div></div>
        </div>

        <div class="progress-row">
            <div class="prog-label">
                <span>SYNTHESIS</span>
                <span id="gen-progress-val">0%</span>
            </div>
            <div class="track"><div id="gen-progress-fill" class="fill white"></div></div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="forge-panel data-panel">
         <div class="panel-header"><span class="panel-title">STORAGE MATRIX (IndexedDB)</span></div>
         <div class="data-grid">
             <div class="data-item">
                 <span>MODEL</span>
                 <span id="model-status" class="status-badge missing">MISSING</span>
             </div>
             <div class="data-item">
                 <span>VOICE</span>
                 <span id="voice-status" class="status-badge missing">MISSING</span>
             </div>
             <div class="data-item">
                 <span>TOKENIZER</span>
                 <span id="tokenizer-status" class="status-badge missing">MISSING</span>
             </div>
         </div>
         <div class="data-actions">
            <button id="purge-btn" class="danger-btn">PURGE CACHE</button>
         </div>
      </div>
      
      <!-- Speed Control -->
      <div class="forge-panel control-panel">
          <div class="panel-header">
            <span class="panel-title">TEMPORAL DENSITY</span>
            <span id="speed-val">1.0</span>
          </div>
          <input type="range" id="speed-slider" min="0.5" max="2.0" step="0.1" value="1.0">
      </div>

      <!-- Logs -->
      <div class="log-panel" id="logs"></div>

    </section>
  </main>
`;

// B"H - CSS Styles Injected via JS to ensure portability of the UI module
const STYLES = `
    :root {
        --bg-dark: #050505;
        --panel-bg: rgba(20, 20, 25, 0.6);
        --border-color: rgba(255, 255, 255, 0.1);
        --primary-cyan: #00f0ff;
        --primary-purple: #bd00ff;
        --alert-red: #ff2a2a;
        --text-main: #eeeeee;
        --text-dim: #888888;
        --font-head: 'Orbitron', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
    }

    body {
        background: var(--bg-dark);
        color: var(--text-main);
        font-family: var(--font-mono);
        margin: 0;
        min-height: 100vh;
        overflow-x: hidden;
        background-image: 
            radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.03) 0%, transparent 50%),
            linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(10,10,15,1) 100%);
    }

    /* --- Header --- */
    .forge-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 40px;
        border-bottom: 1px solid var(--border-color);
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(10px);
    }
    .brand { display: flex; align-items: center; gap: 15px; }
    .logo-mark {
        font-family: var(--font-head);
        font-weight: 900;
        color: var(--bg-dark);
        background: var(--primary-cyan);
        padding: 5px 10px;
        font-size: 1.2rem;
        box-shadow: 0 0 15px var(--primary-cyan);
    }
    .brand h1 { margin: 0; font-family: var(--font-head); font-size: 1.5rem; letter-spacing: 2px; }
    .brand p { margin: 0; font-size: 0.7rem; color: var(--text-dim); letter-spacing: 1px; }

    .status-module { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; letter-spacing: 1px; }
    .status-dot { width: 8px; height: 8px; background: #333; border-radius: 50%; box-shadow: 0 0 5px #333; }
    .status-dot.active { background: var(--primary-cyan); box-shadow: 0 0 10px var(--primary-cyan); }
    .status-text.active { color: var(--primary-cyan); text-shadow: 0 0 10px rgba(0, 240, 255, 0.5); }

    /* --- Layout --- */
    .forge-main {
        max-width: 1600px;
        margin: 0 auto;
        padding: 40px;
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 30px;
    }
    @media(max-width: 1000px) { .forge-main { grid-template-columns: 1fr; } }

    /* --- Panels --- */
    .forge-panel {
        background: var(--panel-bg);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        margin-bottom: 20px;
        position: relative;
        overflow: hidden;
    }
    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background: rgba(255,255,255,0.03);
        border-bottom: 1px solid var(--border-color);
    }
    .panel-title {
        font-family: var(--font-head);
        font-size: 0.7rem;
        letter-spacing: 1px;
        color: var(--primary-cyan);
    }

    /* --- Inputs --- */
    .input-wrapper { display: flex; flex-direction: column; height: 400px; }
    textarea {
        flex: 1;
        background: transparent;
        border: none;
        color: white;
        padding: 20px;
        font-family: var(--font-mono);
        font-size: 1.1rem;
        line-height: 1.6;
        resize: none;
        outline: none;
    }
    .input-footer {
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;
        background: rgba(0,0,0,0.3);
        border-top: 1px solid var(--border-color);
    }
    .meta-group { display: flex; gap: 10px; font-size: 0.7rem; align-items: center; }
    .meta-group .label { color: var(--text-dim); }
    .text-btn {
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--primary-cyan);
        font-size: 0.7rem;
        padding: 4px 10px;
        cursor: pointer;
        transition: 0.2s;
    }
    .text-btn:hover { background: var(--primary-cyan); color: black; }

    /* --- Tokens --- */
    .token-matrix { min-height: 100px; max-height: 200px; display: flex; flex-direction: column; }
    #token-list { padding: 15px; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 5px; }
    .token-chip { 
        background: rgba(0, 240, 255, 0.1); 
        border: 1px solid rgba(0, 240, 255, 0.2); 
        color: var(--primary-cyan); 
        font-size: 0.7rem; 
        padding: 2px 6px; 
    }
    .placeholder-text { color: var(--text-dim); font-size: 0.8rem; }

    /* --- Ignite Button --- */
    .ignite-btn {
        width: 100%;
        padding: 25px;
        background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.05), transparent);
        border: 1px solid var(--primary-cyan);
        color: var(--primary-cyan);
        font-family: var(--font-head);
        font-size: 1.2rem;
        letter-spacing: 3px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
        overflow: hidden;
    }
    .ignite-btn:hover {
        background: var(--primary-cyan);
        color: black;
        box-shadow: 0 0 30px rgba(0, 240, 255, 0.4);
    }
    .ignite-btn:disabled { border-color: #444; color: #444; background: transparent; cursor: not-allowed; box-shadow: none; }
    .btn-content { display: flex; align-items: center; justify-content: center; gap: 15px; }
    .spinner {
        width: 20px; height: 20px;
        border: 2px solid rgba(0,0,0,0.3);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 1s infinite linear;
    }

    /* --- Progress --- */
    .progress-panel { padding: 15px; }
    .progress-row { margin-bottom: 15px; }
    .progress-row:last-child { margin-bottom: 0; }
    .prog-label { display: flex; justify-content: space-between; font-size: 0.7rem; margin-bottom: 5px; color: var(--text-dim); }
    .track { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
    .fill { height: 100%; width: 0%; transition: width 0.2s; }
    .fill.cyan { background: var(--primary-cyan); box-shadow: 0 0 10px var(--primary-cyan); }
    .fill.purple { background: var(--primary-purple); box-shadow: 0 0 10px var(--primary-purple); }
    .fill.white { background: white; box-shadow: 0 0 10px white; }

    /* --- Data Management --- */
    .data-panel { padding: 15px; }
    .data-grid { display: flex; gap: 20px; margin-bottom: 15px; }
    .data-item { display: flex; flex-direction: column; gap: 5px; font-size: 0.7rem; flex: 1; }
    .status-badge { 
        background: #222; 
        padding: 5px; 
        text-align: center; 
        border: 1px solid #444; 
    }
    .status-badge.missing { color: var(--alert-red); border-color: var(--alert-red); }
    .status-badge.synced { color: var(--primary-cyan); border-color: var(--primary-cyan); background: rgba(0, 240, 255, 0.1); }
    .danger-btn {
        width: 100%;
        background: transparent;
        border: 1px solid var(--alert-red);
        color: var(--alert-red);
        padding: 8px;
        font-family: var(--font-mono);
        font-size: 0.7rem;
        cursor: pointer;
        transition: 0.2s;
    }
    .danger-btn:hover { background: var(--alert-red); color: white; }

    /* --- Viz & Audio --- */
    .viz-panel { height: 120px; display: flex; align-items: center; justify-content: center; background: black; }
    canvas { width: 100%; height: 100%; }
    .viz-overlay { position: absolute; font-size: 0.7rem; letter-spacing: 2px; color: #444; }
    
    .audio-panel { padding: 15px; display: flex; gap: 10px; align-items: center; }
    audio { flex: 1; height: 35px; filter: invert(1) hue-rotate(180deg); }
    .download-btn {
        background: var(--primary-cyan);
        color: black;
        text-decoration: none;
        padding: 0 15px;
        height: 35px;
        display: flex; align-items: center;
        font-size: 0.7rem;
        font-weight: bold;
        transition: 0.2s;
    }
    .download-btn:hover { background: white; box-shadow: 0 0 15px white; }
    .download-btn.disabled { opacity: 0.5; pointer-events: none; background: #444; color: #888; }

    /* --- Logs --- */
    .log-panel { height: 150px; background: rgba(0,0,0,0.8); border: 1px solid var(--border-color); overflow-y: auto; font-size: 0.7rem; padding: 10px; }
    .log-entry { margin-bottom: 4px; padding-left: 5px; border-left: 2px solid #333; }
    .log-entry.info { border-color: var(--primary-cyan); color: var(--text-dim); }
    .log-entry.success { border-color: #0f0; color: #cfc; }
    .log-entry.error { border-color: var(--alert-red); color: #fcc; }
    .log-entry.warning { border-color: orange; color: #fe9; }

    /* --- Animations --- */
    @keyframes spin { 100% { transform: rotate(360deg); } }
`;

export const checkDivineTools = () => {
    try {
        if (!window.Worker) throw new Error("Worker implementation missing in this browser vessel.");
        if (!window.WebAssembly) throw new Error("WebAssembly manifestation missing. The engine cannot compute.");
        if (!window.indexedDB) throw new Error("IndexedDB missing. Cannot sustain memories.");
    } catch (e) {
        shoutError("Incompatible Environment", e);
        throw e;
    }
};

export const shoutError = (message, errorObj = null) => {
    const overlay = document.getElementById('error-overlay');
    const msgEl = document.getElementById('error-message');
    const stackEl = document.getElementById('error-stack');
    if (overlay && msgEl && stackEl) {
        msgEl.textContent = message.toUpperCase();
        stackEl.textContent = `B"H - FATAL EXCEPTION DETECTED\n\nMESSAGE: ${message}\n\nSTACK:\n${errorObj?.stack || errorObj || 'EMPTY_TRACE'}`;
        overlay.classList.remove('hidden');
    }
};

export const getElements = () => ({
    textInput: document.getElementById('text-input'),
    rawModeToggle: document.getElementById('raw-mode-toggle'),
    convertIpaBtn: document.getElementById('convert-ipa-btn'),
    tokenList: document.getElementById('token-list'),
    generateBtn: document.getElementById('generate-btn'),
    btnText: document.getElementById('btn-text'),
    btnSpinner: document.getElementById('btn-spinner'),
    speedSlider: document.getElementById('speed-slider'),
    speedVal: document.getElementById('speed-val'),
    logs: document.getElementById('logs'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    charCount: document.getElementById('char-count'),
    visualizer: document.getElementById('visualizer'),
    visualizerPlaceholder: document.getElementById('visualizer-placeholder'),
    audioPlayer: document.getElementById('audio-player'),
    downloadBtn: document.getElementById('download-btn'),
    loadProgressFill: document.getElementById('load-progress-fill'),
    loadProgressVal: document.getElementById('load-progress-val'),
    voiceProgressFill: document.getElementById('voice-progress-fill'),
    voiceProgressVal: document.getElementById('voice-progress-val'),
    genProgressFill: document.getElementById('gen-progress-fill'),
    genProgressVal: document.getElementById('gen-progress-val'),
    
    // New Data Elements
    modelStatus: document.getElementById('model-status'),
    voiceStatus: document.getElementById('voice-status'),
    tokenizerStatus: document.getElementById('tokenizer-status'),
    purgeBtn: document.getElementById('purge-btn')
});

export const updateDataStatus = (status) => {
    const els = getElements();
    
    // Helper
    const set = (el, ok) => {
        if (!el) return;
        el.textContent = ok ? "SYNCED" : "MISSING";
        el.className = ok ? "status-badge synced" : "status-badge missing";
    };

    set(els.modelStatus, status.model);
    set(els.voiceStatus, status.voice);
    set(els.tokenizerStatus, status.tokenizer);
};

export const updateLoadProgress = (percent) => {
    const els = getElements();
    if (!els.loadProgressFill) return;
    const p = Math.min(100, Math.max(0, percent));
    els.loadProgressFill.style.width = `${p}%`;
    els.loadProgressVal.textContent = `${Math.round(p)}%`;
};

export const updateVoiceProgress = (percent) => {
    const els = getElements();
    if (!els.voiceProgressFill) return;
    const p = Math.min(100, Math.max(0, percent));
    els.voiceProgressFill.style.width = `${p}%`;
    els.voiceProgressVal.textContent = `${Math.round(p)}%`;
};

export const updateGenProgress = (percent) => {
    const els = getElements();
    if (!els.genProgressFill) return;
    const p = Math.min(100, Math.max(0, percent));
    els.genProgressFill.style.width = `${p}%`;
    els.genProgressVal.textContent = `${Math.round(p)}%`;
};

export const updateStatus = (online) => {
    const els = getElements();
    if (!els.statusDot) return;
    if (online) {
        els.statusDot.classList.add('active');
        els.statusText.classList.add('active');
        els.statusText.textContent = "SYSTEM READY";
        els.generateBtn.disabled = false;
        els.btnText.textContent = "IGNITE FORGE";
    } else {
        els.statusDot.classList.remove('active');
        els.statusText.classList.remove('active');
        els.statusText.textContent = "OFFLINE";
        els.btnText.textContent = "INITIALIZE NEURAL LINK";
    }
};

export const setProcessing = (isProc) => {
    const els = getElements();
    if (!els.generateBtn) return;
    els.generateBtn.disabled = isProc;
    if (isProc) {
        els.btnSpinner.classList.remove('hidden');
        els.btnText.textContent = "PROCESSING...";
    } else {
        els.btnSpinner.classList.add('hidden');
        els.btnText.textContent = "IGNITE FORGE";
    }
};

export const displayTokens = (tokens) => {
  const els = getElements();
  if (!els.tokenList) return;
  els.tokenList.innerHTML = tokens.map(t => `<span class="token-chip">${t}</span>`).join('');
};

export const initLayout = () => {
    const root = document.getElementById('root');
    if (!root) return;
    
    // Inject CSS
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    // Inject HTML
    root.innerHTML = HTML_TEMPLATE;
};