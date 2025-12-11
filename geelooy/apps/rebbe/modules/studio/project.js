//B"H
// modules/studio/project.js
import state from '../state.js';
import * as Render from '../../render.js';
import { initStudio } from './core/lifecycle.js';

const DB_NAME = 'RebbeStudioProjects';
const STORE = 'projects';

// --- DB INIT ---
function openDB() {
    return new Promise((resolve, reject) => {
        const r = indexedDB.open(DB_NAME, 1);
        r.onupgradeneeded = (e) => {
            const db = e.target.result;
            if(!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, { keyPath: 'id' });
            }
        };
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
    });
}

// --- SAVE / LOAD ---

export async function saveProjectToDB() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE, 'readwrite');
        const store = tx.objectStore(STORE);
        
        const project = {
            id: state.projectId || Date.now(),
            name: state.projectName,
            date: Date.now(),
            data: await serializeState()
        };
        
        store.put(project);
        Render.log(`PROJECT SAVED: ${state.projectName}`);
        return true;
    } catch(e) {
        console.error(e);
        alert("SAVE FAILED: " + e.message);
        return false;
    }
}

export async function loadProjectList() {
    const db = await openDB();
    return new Promise(resolve => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).getAll();
        req.onsuccess = () => resolve(req.result);
    });
}

export async function loadProject(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(id);
        req.onsuccess = async () => {
            if(req.result) {
                await deserializeState(req.result.data);
                state.projectId = req.result.id;
                state.projectName = req.result.name;
                
                // Refresh Studio
                Render.closeModal('modal-studio'); // Close to reset
                setTimeout(() => {
                    Render.openModal('modal-studio');
                    initStudio();
                }, 100);
                resolve(true);
            } else resolve(false);
        };
    });
}

export async function deleteProject(id) {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    Render.log(`PROJECT DELETED`);
}

// --- IMPORT / EXPORT JSON ---

export async function exportProjectJSON() {
    const data = await serializeState();
    const project = {
        meta: {
            name: state.projectName,
            version: "1.0",
            date: Date.now()
        },
        content: data
    };
    
    const blob = new Blob([JSON.stringify(project)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.projectName.replace(/\s+/g,'_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export function importProjectJSON(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target.result);
            if(!json.content) throw new Error("Invalid Format");
            
            await deserializeState(json.content);
            state.projectName = json.meta.name || "Imported Project";
            state.projectId = Date.now();
            
            // Refresh
            initStudio();
            Render.log("PROJECT IMPORTED");
        } catch(err) {
            alert("IMPORT FAILED: " + err.message);
        }
    };
    reader.readAsText(file);
}

// --- SERIALIZATION HELPERS ---

async function serializeState() {
    // We need to convert Blob URLs to DataURIs for JSON portability
    // Audio Buffer is NOT serialized fully (too big). We store reference if possible or skip.
    // For this version, we assume Audio needs to be re-loaded or is minimal.
    // However, for uploaded images/videos, we convert to DataURI.
    
    const processedMedia = await Promise.all(state.mediaLayers.map(async l => {
        if(l.src && l.src.startsWith('blob:')) {
            const b = await fetch(l.src).then(r=>r.blob());
            const dataUri = await blobToData(b);
            return { ...l, src: dataUri };
        }
        return l;
    }));

    return {
        mediaLayers: processedMedia,
        audioLayers: state.audioLayers, // offsets only
        captions: state.captions,
        global: state.studioGlobal,
        fx: state.studioFX,
        trackSettings: state.trackSettings,
        resolution: state.resolutionSetting
    };
}

async function deserializeState(data) {
    state.mediaLayers = data.mediaLayers || [];
    state.audioLayers = data.audioLayers || [];
    state.captions = data.captions || [];
    state.studioGlobal = data.global || state.studioGlobal;
    state.studioFX = data.fx || state.studioFX;
    state.trackSettings = data.trackSettings || state.trackSettings;
    state.resolutionSetting = data.resolution || 'portrait';
    
    // Audio Buffer restoration is tricky without the source file.
    // The user will have to re-import audio if it's missing, or we assume it's there.
}

function blobToData(blob) {
    return new Promise(resolve => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.readAsDataURL(blob);
    });
}