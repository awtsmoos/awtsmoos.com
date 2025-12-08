/* B"H */
import { DOM } from './config.js';

// Initialize Database
export function initDB(appState) {
    return new Promise((resolve) => {
        const request = indexedDB.open('EinSofEngineDB_v5.1', 1);
        
        request.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('settingsStore')) {
                db.createObjectStore('settingsStore', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('presets')) {
                db.createObjectStore('presets', { keyPath: 'name' });
            }
        };
        
        request.onsuccess = e => {
            appState.db = e.target.result;
            loadPresets(); // Load preset list into UI
            resolve();
        };
        
        request.onerror = e => {
            console.warn('IndexedDB failed.', e.target.error);
            resolve(); // Resolve anyway to let app start
        };
    });
}

// Save Current UI State
export function saveSettings(appState) {
    if (!appState.db) return;
    const settings = {};
    
    // Save standard inputs
    document.querySelectorAll('[id]').forEach(el => {
        // Filter out elements we don't want to save
        if (el.type !== 'file' && 
            !el.readOnly && 
            el.id !== 'preset-select' && 
            el.tagName !== 'TEXTAREA' // Optional: Skip large text if causing lag
        ) {
            if (el.type === 'checkbox') settings[el.id] = el.checked;
            else settings[el.id] = el.value;
        }
    });

    // Explicitly save text areas
    if(DOM.mainCaptions) settings.mainCaptions = DOM.mainCaptions.value;
    if(DOM.translationCaptions) settings.translationCaptions = DOM.translationCaptions.value;

    // Save Randomize Toggles
    document.querySelectorAll('.fieldset-randomize, .randomize-toggle').forEach(el => {
        // Logic depends on how you structure randomization. 
        // Assuming classes on parent containers:
        const group = el.closest('.control-group');
        if(group && group.dataset.controlName) {
            settings[group.dataset.controlName + '_randomize'] = group.classList.contains('randomize-active');
        }
    });

    const tx = appState.db.transaction('settingsStore', 'readwrite');
    tx.objectStore('settingsStore').put({ id: 'userSettings', ...settings });
}

// Load UI State
export function loadSettings(appState) {
    if (!appState.db) return;
    return new Promise(resolve => {
        const tx = appState.db.transaction('settingsStore', 'readonly');
        const req = tx.objectStore('settingsStore').get('userSettings');
        
        req.onsuccess = e => {
            const settings = e.target.result;
            if (settings) {
                applySettingsToDOM(settings);
            }
            resolve();
        };
    });
}

// Helper to map object -> DOM
function applySettingsToDOM(settings) {
    for (const key in settings) {
        const el = document.getElementById(key);
        if (el && !el.readOnly && el.type !== 'file') {
            if (el.type === 'checkbox') {
                el.checked = settings[key];
            } else {
                el.value = settings[key];
            }
            // Trigger events so sliders update their text displays
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    // Restore Randomize States
    document.querySelectorAll('.control-group[data-control-name]').forEach(group => {
        const name = group.dataset.controlName;
        const isRandom = settings[name + '_randomize'];
        if (isRandom) group.classList.add('randomize-active');
        else group.classList.remove('randomize-active');
    });
}

// --- Presets ---

function loadPresets() {
    // We assume appState is globally available or passed, but here we need access to DB.
    // Ideally, pass appState or use a module-level var if initDB sets it.
    // For safety, we re-open or assume the caller handles flow. 
    // BUT since we are in module, let's use a cleaner approach:
    // This function is called by initDB which has scope.
    // To call it externally, we need the DB instance.
}

export function savePreset(appState) {
    if (!appState.db) return;
    const name = prompt("Enter preset name:");
    if (!name) return;
    
    // Capture current settings similar to saveSettings logic
    const settings = {};
    document.querySelectorAll('[id]').forEach(el => {
        if (el.type !== 'file' && !el.readOnly && el.id !== 'preset-select') {
             if (el.type === 'checkbox') settings[el.id] = el.checked;
             else settings[el.id] = el.value;
        }
    });
    
    const tx = appState.db.transaction('presets', 'readwrite');
    tx.objectStore('presets').put({ name, settings });
    tx.oncomplete = () => {
        alert("Saved.");
        refreshPresetList(appState);
    };
}

export function deletePreset(appState) {
    if (!appState.db || !DOM.presetSelect) return;
    const name = DOM.presetSelect.value;
    if (!name) return;
    
    if(confirm(`Delete "${name}"?`)) {
        const tx = appState.db.transaction('presets', 'readwrite');
        tx.objectStore('presets').delete(name);
        tx.oncomplete = () => refreshPresetList(appState);
    }
}

export function applyPreset(appState, name) {
    if (!appState.db || !name) return;
    const tx = appState.db.transaction('presets', 'readonly');
    tx.objectStore('presets').get(name).onsuccess = e => {
        const preset = e.target.result;
        if (preset && preset.settings) {
            applySettingsToDOM(preset.settings);
        }
    };
}

function refreshPresetList(appState) {
    if (!DOM.presetSelect) return;
    const tx = appState.db.transaction('presets', 'readonly');
    const req = tx.objectStore('presets').getAll();
    req.onsuccess = () => {
        DOM.presetSelect.innerHTML = '<option value="">Load Preset...</option>';
        req.result.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name;
            opt.textContent = p.name;
            DOM.presetSelect.appendChild(opt);
        });
    };
}