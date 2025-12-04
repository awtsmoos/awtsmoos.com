//B"H
import { parseCSV, generateCSV } from './csv.js';
import { GridUI } from './grid.js';

// --- State ---
const state = {
    filename: 'existence.csv',
    fileHandle: null,
    data: Array(20).fill(0).map(() => Array(10).fill('')) // Initial empty state
};

// --- DOM Elements ---
const gridContainer = document.getElementById('grid-container');
const fileInput = document.getElementById('file-input');
const filenameDisplay = document.getElementById('filename-display');
const toastElement = document.getElementById('toast');
const reloadBtn = document.getElementById('btn-reload');

// --- Initialization ---
const grid = new GridUI(gridContainer, state.data, (newData) => {
    state.data = newData;
});

// --- UI Helpers ---

function showToast(message, isError = false) {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.style.borderColor = isError ? '#ff4444' : 'var(--creation)';
    toastElement.style.color = isError ? '#ff4444' : 'var(--creation)';
    toastElement.classList.add('active');
    
    if (toastElement._timeout) clearTimeout(toastElement._timeout);
    
    toastElement._timeout = setTimeout(() => {
        toastElement.classList.remove('active');
    }, 2500);
}

function updateFilename(name) {
    state.filename = name;
    filenameDisplay.textContent = name;
}

// --- IndexedDB Logic ---
const DB_NAME = 'AwtsmoosGridDB';
const DB_VERSION = 1;
const STORE_NAME = 'session';
const KEY_HANDLE = 'currentFileHandle';

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function storeFileHandle(handle) {
    try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(handle, KEY_HANDLE);
        await new Promise(resolve => tx.oncomplete = resolve);
        console.log("Handle stored in DB");
    } catch (e) {
        console.warn("Could not store handle in DB", e);
    }
}

async function getStoredFileHandle() {
    try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const handle = await new Promise((resolve, reject) => {
            const req = tx.objectStore(STORE_NAME).get(KEY_HANDLE);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        return handle;
    } catch (e) {
        console.warn("Could not retrieve handle from DB", e);
        return null;
    }
}

async function restoreSession() {
    const handle = await getStoredFileHandle();
    if (!handle) return;

    console.log("Found stored handle:", handle.name);
    state.fileHandle = handle;
    updateFilename(handle.name);

    // Permission check usually requires gesture. 
    // We try to query. If granted, load. If not, show reload button.
    try {
        const perm = await handle.queryPermission({ mode: 'read' });
        if (perm === 'granted') {
            const file = await handle.getFile();
            const text = await file.text();
            loadData(text, handle.name, handle, false); // false = don't re-save to DB
        } else {
            console.log("Permission needed for stored handle.");
            reloadBtn.classList.remove('hidden');
            showToast("Restore session?", false);
        }
    } catch (e) {
        console.error("Error restoring session:", e);
        reloadBtn.classList.remove('hidden');
    }
}

// --- Core File Logic ---

async function verifyPermission(fileHandle, readWrite) {
    const options = {};
    if (readWrite) {
        options.mode = 'readwrite';
    }
    // Check if permission was already granted.
    if ((await fileHandle.queryPermission(options)) === 'granted') {
        return true;
    }
    // Request permission. If the user grants permission, return true.
    if ((await fileHandle.requestPermission(options)) === 'granted') {
        return true;
    }
    return false;
}

async function openFile() {
    if (window.showOpenFilePicker) {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{
                    description: 'CSV File',
                    accept: { 'text/csv': ['.csv', '.txt'] }
                }],
                multiple: false
            });

            const file = await handle.getFile();
            const text = await file.text();
            
            loadData(text, file.name, handle, true);
            return;
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.log("FS Access API failed, fallback.", err);
        }
    }
    fileInput.click();
}

function loadData(csvText, filename, handle = null, saveToDB = false) {
    try {
        const parsed = parseCSV(csvText);
        state.data = parsed;
        state.filename = filename;
        state.fileHandle = handle;
        
        updateFilename(state.filename);
        grid.setData(state.data);
        
        // Hide reload button if we successfully loaded
        reloadBtn.classList.add('hidden');

        if (saveToDB && handle) {
            storeFileHandle(handle);
        }
    } catch (err) {
        console.error('Error parsing file:', err);
        alert('Failed to parse the void.');
    }
}

async function saveFile() {
    if (state.fileHandle) {
        try {
            // CRITICAL: Verify permission before writing!
            const hasPerm = await verifyPermission(state.fileHandle, true);
            if (!hasPerm) {
                // User denied permission, switch to Save As to give them a way out
                throw new Error("Permission denied");
            }

            const csvContent = generateCSV(state.data);
            const writable = await state.fileHandle.createWritable();
            await writable.write(csvContent);
            await writable.close(); // Important to await close
            
            console.log('Saved to existing handle.');
            showToast('SAVED');
            
            // Re-store handle to ensure it's fresh in DB
            storeFileHandle(state.fileHandle);
        } catch (err) {
            console.error('Save failed:', err);
            if (err.name === 'NotAllowedError' || err.message === 'Permission denied') {
                saveFileAs(); 
            } else {
                showToast('SAVE FAILED', true);
                alert('Failed to save. ' + err.message);
            }
        }
    } else {
        saveFileAs();
    }
}

async function saveFileAs() {
    const csvContent = generateCSV(state.data);
    
    try {
        if (window.showSaveFilePicker) {
            const handle = await window.showSaveFilePicker({
                suggestedName: state.filename,
                types: [{
                    description: 'CSV File',
                    accept: { 'text/csv': ['.csv'] },
                }],
            });
            
            // Verify permission (though creates usually grant it implicitly)
            // But checking ensures we have the write lock
            const writable = await handle.createWritable();
            await writable.write(csvContent);
            await writable.close();
            
            state.fileHandle = handle;
            updateFilename(handle.name);
            storeFileHandle(handle);
            
            showToast('SAVED');
            reloadBtn.classList.add('hidden');
        } else {
            downloadBlob(csvContent, state.filename);
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Save As failed:', err);
            downloadBlob(csvContent, state.filename);
        }
    }
}

function downloadBlob(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    showToast('DOWNLOADED');
}

// --- Event Listeners ---

document.getElementById('btn-open').addEventListener('click', openFile);
document.getElementById('btn-save').addEventListener('click', saveFile);
document.getElementById('btn-save-as').addEventListener('click', saveFileAs);

// Reload Button Logic (Unlock stored handle)
reloadBtn.addEventListener('click', async () => {
    if (state.fileHandle) {
        try {
            // Request permission explicitly on click
            const hasPerm = await verifyPermission(state.fileHandle, false); // Read permission first
            if (hasPerm) {
                const file = await state.fileHandle.getFile();
                const text = await file.text();
                loadData(text, state.fileHandle.name, state.fileHandle, true);
                showToast("SESSION RESTORED");
            } else {
                showToast("PERMISSION DENIED", true);
            }
        } catch (e) {
            console.error("Reload failed:", e);
            showToast("RESTORE FAILED", true);
        }
    }
});

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const text = await file.text();
    // Cannot store legacy handles in IDB in a meaningful way to reuse
    loadData(text, file.name, null, false);
    fileInput.value = '';
});

document.getElementById('btn-add-row').addEventListener('click', () => {
    grid.addRow();
});

document.getElementById('btn-add-col').addEventListener('click', () => {
    grid.addCol();
});

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveFile();
    }
});

// --- Restore Session on Load ---
window.addEventListener('load', () => {
    restoreSession();
});

console.log("Awtsmoos Grid Initialized. Created from nothing.");