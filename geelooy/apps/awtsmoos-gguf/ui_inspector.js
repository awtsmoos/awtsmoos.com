// B"H
/**
 * UI Inspector Module
 * Handles Metadata, Tensors, and Vocab views.
 */
import { uiSurgery } from './ui_surgery.js';
import { showTokenInspector } from './ui_modal.js';

const VOCAB_PAGE_SIZE = 200;

export const uiInspector = {
    meta: null,
    metaContainer: null,
    tensorsContainer: null,
    tensorList: null,
    tensorTotalCount: null,
    
    vocabGrid: null,
    vocabControlSection: null,
    vocabBrowserContainer: null,
    vocabSlider: null,
    vocabOffsetLabel: null,
    
    // Inputs shared with UI
    btnSearch: null,
    termInput: null,
    
    // Local state
    _vocab: [],
    _scores: [],
    _worker: null,
    _config: null,
    
    init: function() {
        this.meta = document.getElementById('metadata');
        this.tensorsContainer = document.getElementById('tensorsContainer');
        this.tensorList = document.getElementById('tensorList');
        this.tensorTotalCount = document.getElementById('tensorTotalCount');

        uiSurgery.init();

        this.vocabBrowserContainer = document.getElementById('vocabBrowserContainer');
        this.vocabGrid = document.getElementById('vocabGrid');
        this.vocabSlider = document.getElementById('vocabSlider');
        this.vocabOffsetLabel = document.getElementById('vocabOffsetLabel');
        
        this.btnSearch = document.getElementById('btnSearch');
        this.termInput = document.getElementById('termInput');
        
        // Buttons
        const btnMeta = document.getElementById('btnShowMeta');
        const btnTensors = document.getElementById('btnShowTensors');
        const btnVocab = document.getElementById('btnShowVocab');

        const switchView = (view) => {
            if (this.meta) this.meta.classList.add('hidden');
            if (this.tensorsContainer) this.tensorsContainer.classList.add('hidden');
            if (this.vocabBrowserContainer) this.vocabBrowserContainer.classList.add('hidden');

            [btnMeta, btnTensors, btnVocab].forEach(b => { 
                if(b) b.classList.remove('active'); 
            });

            if (view === 'meta') {
                if(this.meta) this.meta.classList.remove('hidden');
                if(btnMeta) btnMeta.classList.add('active');
            } else if (view === 'tensors') {
                if(this.tensorsContainer) this.tensorsContainer.classList.remove('hidden');
                if(btnTensors) btnTensors.classList.add('active');
            } else if (view === 'vocab') {
                if(this.vocabBrowserContainer) this.vocabBrowserContainer.classList.remove('hidden');
                if(btnVocab) btnVocab.classList.add('active');
            }
        };

        if (btnMeta) btnMeta.onclick = () => switchView('meta');
        if (btnTensors) btnTensors.onclick = () => switchView('tensors');
        if (btnVocab) btnVocab.onclick = () => switchView('vocab');
        
        if (this.btnSearch && this.termInput) {
            this.btnSearch.onclick = () => this.doVocabSearch();
            this.termInput.onkeydown = (e) => { if(e.key === 'Enter') this.doVocabSearch(); };
        }
        
        if (this.vocabSlider) {
            this.vocabSlider.oninput = (e) => {
                this.renderVocabSlice(parseInt(e.target.value));
            };
        }
    },
    
    setWorker: function(w) { 
        this._worker = w;
        uiSurgery.setWorker(w); 
    },
    
    setVocab: function(v, s) { 
        this._vocab = v || [];
        this._scores = s || [];
        if (!this.vocabSlider) return;

        if (this._vocab.length > 0) {
            this.vocabSlider.max = this._vocab.length - 1;
            this.vocabSlider.value = 0;
            this.vocabSlider.disabled = false;
        } else {
            this.vocabSlider.max = 0;
            this.vocabSlider.disabled = true;
        }
        this.renderVocabSlice(0);
    },

    renderVocabSlice: function(offset) {
        if (!this.vocabGrid || !this._vocab) return;

        const start = Math.max(0, offset);
        const end = Math.min(this._vocab.length, start + VOCAB_PAGE_SIZE);
        
        this.vocabGrid.innerHTML = '';
        if (this._vocab.length === 0) {
            this.vocabGrid.innerText = "Vocabulary not loaded.";
            if(this.vocabOffsetLabel) this.vocabOffsetLabel.innerText = "0 / 0";
            return;
        }
        
        if(this.vocabOffsetLabel) {
            this.vocabOffsetLabel.innerText = `${start} - ${end-1} / ${this._vocab.length}`;
        }
        
        const frag = document.createDocumentFragment();
        for (let i = start; i < end; i++) {
            const cell = document.createElement('div');
            cell.className = 'vocab-cell';
            cell.dataset.tokenId = i;
            // Truncate long words
            let word = this._vocab[i].replace('\u2581', ' ').replace('<0x0A>', '\\n');
            if(word.length > 12) word = word.substring(0, 10) + '..';
            
            cell.innerHTML = `<span class="vocab-id">${i}</span><span class="vocab-word">${word}</span>`;
            cell.title = `[${i}] ${this._vocab[i]}`;
            cell.onclick = () => this.inspectToken(i);
            frag.appendChild(cell);
        }
        this.vocabGrid.appendChild(frag);
    },
    
    inspectToken: function(id) {
        // Initial Show (Loading)
        const info = {
            id: id,
            text: this._vocab[id],
            score: this._scores[id],
            vector: null, 
            sizeBytes: 0 
        };
        showTokenInspector(info);
        
        // Request deep data from worker
        if(this._worker) {
            this._worker.postMessage({ type: 'INSPECT_TOKEN', payload: id });
        }
    },
    
    updateTokenInspector: function(payload) {
        const { id, vector } = payload;
        // B"H - Calculate memory footprint: Embedding (Float32)
        const size = vector ? (vector.length * 4) : 0;
        
        const info = {
            id: id,
            text: this._vocab[id],
            score: this._scores[id],
            vector: vector,
            sizeBytes: size
        };
        showTokenInspector(info);
    },

    doVocabSearch: function() {
        const term = this.termInput.value.toLowerCase();
        if (!term) return;

        const matchIndex = this._vocab.findIndex(v => v.toLowerCase().includes(term));

        if (matchIndex !== -1) {
            const newOffset = Math.floor(matchIndex / VOCAB_PAGE_SIZE) * VOCAB_PAGE_SIZE;
            this.vocabSlider.value = newOffset;
            this.renderVocabSlice(newOffset);
            
            setTimeout(() => {
                 Array.from(this.vocabGrid.children).forEach(c => c.classList.remove('highlight'));
                 const targetCell = this.vocabGrid.querySelector(`[data-token-id='${matchIndex}']`);
                 if (targetCell) {
                     targetCell.classList.add('highlight');
                     targetCell.scrollIntoView({ block: 'center', behavior: 'smooth' });
                 }
            }, 50);
        } else {
            Array.from(this.vocabGrid.children).forEach(c => c.classList.remove('highlight'));
        }
    }
};

export function resetMetadata() {
    if (uiInspector.meta) uiInspector.meta.innerHTML = '';
    if (uiInspector.tensorList) uiInspector.tensorList.innerHTML = '';
}

export function addMetaEntry(key, val) {
    if (!uiInspector.meta) return;
    
    let cat = 'General';
    if (key.startsWith('tokenizer')) cat = 'Tokenizer';
    else if (key.includes('attn') || key.includes('rope')) cat = 'Attention';
    else if (key.includes('block_count') || key.includes('layer')) cat = 'Architecture';

    let section = document.getElementById(`meta-sec-${cat}`);
    if (!section) {
        section = document.createElement('div');
        section.id = `meta-sec-${cat}`;
        section.className = "mb-4";
        section.innerHTML = `<div class="panel-header mb-2">${cat}</div><div class="data-list panel" id="meta-tbl-${cat}"></div>`;
        uiInspector.meta.appendChild(section);
    }

    const table = document.getElementById(`meta-tbl-${cat}`);
    const row = document.createElement('div');
    row.className = 'data-item';
    
    let valHtml = val;
    if (val.length > 60) valHtml = `<span title="${val}" class="opacity-70">${val.substring(0,60)}...</span>`;

    row.innerHTML = `<span class="font-bold text-text-secondary w-1/3 truncate" title="${key}">${key}</span><span class="text-accent-emerald truncate w-2/3 text-right">${valHtml}</span>`;
    table.appendChild(row);
}

export function populateTensorList(tensorList) {
    if (!uiInspector.tensorList) return;
    uiInspector.tensorList.innerHTML = '';
    if (uiInspector.tensorTotalCount) uiInspector.tensorTotalCount.innerText = tensorList.length;

    if (tensorList.length === 0) {
        uiInspector.tensorList.innerHTML = `<div class="p-4 text-center text-muted">Load a model to view tensors.</div>`;
        return;
    }

    const maxBytes = Math.max(...tensorList.map(t => t.size));

    tensorList.forEach(t => {
        const div = document.createElement('div');
        div.className = 'tensor-row';
        
        const pct = (t.size / maxBytes) * 100;
        
        const typeMap = {0:'F32', 1:'F16', 2:'Q4_0', 3:'Q4_1', 6:'Q5_0', 7:'Q5_1', 8:'Q8_0', 10:'Q2_K', 11:'Q3_K', 12:'Q4_K', 13:'Q5_K', 14:'Q6_K', 16:'IQ2_XXS', 19:'IQ1_S', 20:'IQ4_NL', 21:'IQ3_S', 22:'IQ2_S'};
        const typeStr = typeMap[t.type] || `T${t.type}`;
        const sizeMB = (t.size / (1024*1024)).toFixed(2);
        
        div.innerHTML = `
            <div class="tensor-bg" style="width: ${pct}%"></div>
            <div class="tensor-name" title="${t.name}">${t.name}</div>
            <div class="tensor-info" style="width: 60px;">${typeStr}</div>
            <div class="tensor-info" style="width: 100px; text-align:right;">[${t.dims.join(',')}]</div>
            <div class="tensor-info text-accent-blue font-bold" style="width: 60px; text-align:right;">${sizeMB}M</div>
        `;
        uiInspector.tensorList.appendChild(div);
    });
}

export function populateModelConfig(config) {
    uiInspector._config = config; // Cache for later use
    const grid = document.getElementById('modelConfigSection');
    if(grid) grid.classList.remove('hidden');

    const container = document.getElementById('configGrid');
    if(!container) return;

    container.innerHTML = '';
    const dataList = document.createElement('div');
    dataList.className = 'data-list';

    for(const key in config) {
        const row = document.createElement('div');
        row.className = 'data-item';
        row.innerHTML = `<span class="font-bold text-text-secondary">${key}</span><span class="text-accent-emerald">${config[key]}</span>`;
        dataList.appendChild(row);
    }
    container.appendChild(dataList);
}


export function showPurifyUI(x) { uiSurgery.show(x); }
export function logPurify(m) { uiSurgery.log(m); }
export function setTokenizerState() {}
export function setTokenOutput() {}
export function visualizeRoPE() {}