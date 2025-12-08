/*
ב"ה
B"H
*/
import { dom } from './ui_helpers.js';

export function initDB(appState) {
    return new Promise((resolve) => {
        const request = indexedDB.open('EinSofEngineDB_v5', 1);
        request.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('settingsStore')) db.createObjectStore('settingsStore', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('presets')) db.createObjectStore('presets', { keyPath: 'name' });
        };
        request.onsuccess = e => {
            appState.db = e.target.result;
            loadPresets(appState); // Load presets immediately
            resolve();
        };
        request.onerror = e => {
            console.warn('IndexedDB failed.', e.target.error);
            resolve();
        };
    });
}

export function saveSettings(appState) {
    if (!appState.db) return;
    const settings = {};
    
    document.querySelectorAll('[id]').forEach(el => {
        if (el.type !== 'file' && !el.readOnly && el.id !== 'preset-select' && el.tagName !== 'TEXTAREA') {
            if (el.type === 'checkbox') settings[el.id] = el.checked;
            else settings[el.id] = el.value;
        }
    });

    // Save large text areas separately? Or just keep them.
    settings.mainCaptions = dom.mainCaptions.value;
    settings.translationCaptions = dom.translationCaptions.value;

    document.querySelectorAll('.control-group[data-control-name]').forEach(group => {
        const name = group.dataset.controlName;
        settings[name + '_randomize'] = group.classList.contains('randomize-active');
    });

    appState.db.transaction('settingsStore', 'readwrite').objectStore('settingsStore').put({ id: 'userSettings', ...settings });
}

export function loadSettings(appState) {
    if (!appState.db) return;
    return new Promise(resolve => {
        const request = appState.db.transaction('settingsStore', 'readonly').objectStore('settingsStore').get('userSettings');
        request.onsuccess = e => {
            const settings = e.target.result;
            if (settings) {
                for (const key in settings) {
                    const el = document.getElementById(key);
                    if (el && !el.readOnly && el.type !== 'file') {
                        if (el.type === 'checkbox') el.checked = settings[key];
                        else el.value = settings[key];
                        // Trigger input event to update any connected range displays
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
                
                // Restore Randomize Buttons
                document.querySelectorAll('.control-group[data-control-name]').forEach(group => {
                    const name = group.dataset.controlName;
                    const randKey = name + '_randomize';
                    const toggle = group.querySelector('.randomize-toggle');
                    
                    if (settings[randKey]) {
                        group.classList.add('randomize-active');
                        if(toggle) toggle.classList.add('active');
                    } else {
                        group.classList.remove('randomize-active');
                        if(toggle) toggle.classList.remove('active');
                    }
                });
            }
            resolve();
        };
    });
}

function loadPresets(appState) {
    if (!appState.db) return;
    const tx = appState.db.transaction('presets', 'readonly');
    const store = tx.objectStore('presets');
    const request = store.getAll();
    request.onsuccess = () => {
        dom.presetSelect.innerHTML = '<option value="">Load Preset...</option>';
        request.result.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.name;
            option.textContent = preset.name;
            dom.presetSelect.appendChild(option);
        });
    };
}

export function savePreset(appState) {
    if (!appState.db) return;
    const name = prompt("Enter preset name:");
    if (!name) return;
    
    const settings = {};
    // ... Logic similar to saveSettings but stored under 'name'
    document.querySelectorAll('[id]').forEach(el => {
        if (el.type !== 'file' && !el.readOnly && el.id !== 'preset-select') {
             if (el.type === 'checkbox') settings[el.id] = el.checked;
             else settings[el.id] = el.value;
        }
    });
    
    document.querySelectorAll('.control-group[data-control-name]').forEach(g => { 
        settings[g.dataset.controlName + '_randomize'] = g.classList.contains('randomize-active'); 
    });

    appState.db.transaction('presets', 'readwrite').objectStore('presets').put({ name, settings }).onsuccess = () => {
        alert(`Preset "${name}" saved.`);
        loadPresets(appState);
    };
}

export function deletePreset(appState) {
    if (!appState.db) return;
    const name = dom.presetSelect.value;
    if (!name) return;
    if (confirm(`Delete preset "${name}"?`)) {
        appState.db.transaction('presets', 'readwrite').objectStore('presets').delete(name).onsuccess = () => {
            loadPresets(appState);
        };
    }
}

export function applyPreset(appState, name) {
    if (!appState.db || !name) return;
    appState.db.transaction('presets', 'readonly').objectStore('presets').get(name).onsuccess = e => {
        const preset = e.target.result;
        if (preset) {
            for (const key in preset.settings) {
                const el = document.getElementById(key);
                if (el && !el.readOnly) {
                    if (el.type === 'checkbox') el.checked = preset.settings[key];
                    else el.value = preset.settings[key];
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
            // Restore random toggles similar to loadSettings...
            document.querySelectorAll('.control-group[data-control-name]').forEach(group => {
                const n = group.dataset.controlName;
                const r = preset.settings[n + '_randomize'];
                const t = group.querySelector('.randomize-toggle');
                if (r) { group.classList.add('randomize-active'); if(t) t.classList.add('active'); }
                else { group.classList.remove('randomize-active'); if(t) t.classList.remove('active'); }
            });
        }
    };
}