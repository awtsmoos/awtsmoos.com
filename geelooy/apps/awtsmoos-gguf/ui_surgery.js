// B"H
/**
 * UI Surgery Module
 * Handles Lobotomy and Pruning UI Logic
 */
import { showConfirm } from './ui_modal.js';

export const uiSurgery = {
    surgerySection: null,
    btnLobotomize: null,
    surgeryLog: null,
    
    // Layer Retention
    rngKeepStart: null,
    valKeepStart: null,
    rngKeepEnd: null,
    valKeepEnd: null,
    
    rngWidth: null,
    valWidth: null,
    rngVocab: null,
    valVocab: null,
    
    // Regex Filtering
    regexModeToggle: null,
    keepRegexArea: null,
    removeRegexArea: null,
    
    layerPlanDisplay: null,
    
    worker: null,
    
    // State to track max values
    totalLayers: 100,
    totalVocab: 256000,

    init: function() {
        this.surgerySection = document.getElementById('surgerySection');
        this.btnLobotomize = document.getElementById('btnLobotomize');
        this.surgeryLog = document.getElementById('surgeryLog');
        
        this.rngKeepStart = document.getElementById('rngKeepStart');
        this.valKeepStart = document.getElementById('valKeepStart');
        this.rngKeepEnd = document.getElementById('rngKeepEnd');
        this.valKeepEnd = document.getElementById('valKeepEnd');
        
        this.rngWidth = document.getElementById('rngWidth');
        this.valWidth = document.getElementById('valWidth');
        this.rngVocab = document.getElementById('rngVocab');
        this.valVocab = document.getElementById('valVocab');
        
        this.regexModeToggle = document.getElementById('regexModeToggle');
        this.keepRegexArea = document.getElementById('keepRegexArea');
        this.removeRegexArea = document.getElementById('removeRegexArea');
        
        this.layerPlanDisplay = document.getElementById('layerPlanDisplay');

        // Bind Sliders
        const bind = (rng, val, suffix='', callback) => {
            if(rng && val) rng.oninput = (e) => {
                val.innerText = e.target.value + suffix;
                if (callback) callback();
            };
        };
        
        bind(this.rngKeepStart, this.valKeepStart, '', () => this.updateLayerPlan());
        bind(this.rngKeepEnd, this.valKeepEnd, '', () => this.updateLayerPlan());
        bind(this.rngWidth, this.valWidth, '%');
        bind(this.rngVocab, this.valVocab);

        // Regex Mode Toggle
        if(this.regexModeToggle) {
            this.regexModeToggle.onchange = (e) => {
                const isKeep = e.target.checked;
                if(this.keepRegexArea) this.keepRegexArea.style.display = isKeep ? 'block' : 'none';
                if(this.removeRegexArea) this.removeRegexArea.style.display = isKeep ? 'none' : 'block';
            };
            // Initial state
            if(this.keepRegexArea) this.keepRegexArea.style.display = 'block';
            if(this.removeRegexArea) this.removeRegexArea.style.display = 'none';
        }

        // Surgery Button
        if (this.btnLobotomize) {
            this.btnLobotomize.onclick = async () => {
                if (!this.worker) {
                    alert("Worker not ready. Please load a model first.");
                    return;
                }
                
                const keepStart = parseInt(this.rngKeepStart.value);
                const keepEnd = parseInt(this.rngKeepEnd.value);
                
                if (keepStart + keepEnd > this.totalLayers) {
                    return alert(`Cannot keep more layers than exist! (Start+End=${keepStart+keepEnd} > Total=${this.totalLayers})`);
                }

                const isKeepMode = this.regexModeToggle.checked;
                const regex = isKeepMode ? this.keepRegexArea.value : this.removeRegexArea.value;

                const options = {
                    keepStart: keepStart,
                    keepEnd: keepEnd,
                    widthPct: parseInt(this.rngWidth.value),
                    vocabSize: parseInt(this.rngVocab.value),
                    regex: regex,
                    regexMode: isKeepMode ? 'keep' : 'remove',
                };
                
                this.log("Preparing Surgery with options: " + JSON.stringify(options));
                
                const msg = `WARNING: DIVINE SURGERY\n\n` +
                            `Layers: Keeping First ${options.keepStart} & Last ${options.keepEnd}\n` + 
                            `Width: ${options.widthPct}%\n` +
                            `Vocab Mode: ${options.regexMode.toUpperCase()}\n` +
                            `Vocab Limit: Top ${options.vocabSize} (by Freq)\n\n` +
                            `This will PERMANENTLY alter the model structure in memory.\nProceed?`;
                
                const confirmed = await showConfirm(msg);
                
                if (confirmed) {
                    this.btnLobotomize.disabled = true;
                    if(this.surgeryLog) this.surgeryLog.innerHTML = '<div class="text-yellow-400 animate-pulse">> Sending commands to surgeon...</div>';
                    this.worker.postMessage({ type: 'PURIFY', payload: options });
                } else {
                    this.log("Surgery Cancelled.");
                }
            };
        }
    },
    
    setWorker: function(w) {
        this.worker = w;
    },
    
    updateLayerPlan: function() {
        if (!this.layerPlanDisplay || !this.rngKeepStart || !this.rngKeepEnd) return;
        
        const start = parseInt(this.rngKeepStart.value);
        const end = parseInt(this.rngKeepEnd.value);
        const total = this.totalLayers;
        const removed = Math.max(0, total - start - end);
        
        let msg = "";
        if (start + end >= total) {
             msg = `Keeps ALL ${total} layers (No Pruning)`;
             this.layerPlanDisplay.className = "text-[10px] text-gray-400 font-mono mt-1 h-4 text-center";
        } else {
             const endStartIdx = total - end;
             msg = `Keep [0-${start-1}] ... DELETE ${removed} ... Keep [${endStartIdx}-${total-1}]`;
             this.layerPlanDisplay.className = "text-[10px] text-red-400 font-mono mt-1 h-4 text-center font-bold";
        }
        this.layerPlanDisplay.innerText = msg;
    },
    
    setTotalLayers(n) {
        this.totalLayers = n;
        if (this.rngKeepStart) {
            this.rngKeepStart.max = n;
            this.rngKeepStart.value = Math.min(parseInt(this.rngKeepStart.value), n);
            if(this.valKeepStart) this.valKeepStart.innerText = this.rngKeepStart.value;
        }
        if (this.rngKeepEnd) {
            this.rngKeepEnd.max = n;
            this.rngKeepEnd.value = Math.min(parseInt(this.rngKeepEnd.value), n);
            if(this.valKeepEnd) this.valKeepEnd.innerText = this.rngKeepEnd.value;
        }
        this.updateLayerPlan();
    },

    setTotalVocab(n) {
        this.totalVocab = n;
        if (this.rngVocab) {
            this.rngVocab.max = n;
            this.rngVocab.value = Math.min(parseInt(this.rngVocab.value), n);
            if(this.valVocab) this.valVocab.innerText = this.rngVocab.value;
        }
    },

    log: function(msg) {
        if (!this.surgeryLog) return;
        const div = document.createElement('div');
        div.innerText = `> ${msg}`;
        this.surgeryLog.appendChild(div);
        this.surgeryLog.scrollTop = this.surgeryLog.scrollHeight;
    },
    
    show: function(enabled) {
        if (!this.surgerySection) return;
        if (enabled) this.surgerySection.classList.remove('hidden');
        else this.surgerySection.classList.add('hidden');
    }
};