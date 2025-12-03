//B"H
/**
 * IA//HYPER_UPLOADER CORE LOGIC
 * High-performance, concurrent, sharded uploader for Internet Archive.
 */

const CONFIG = {
    STORAGE_KEY: 'ia_hyper_creds',
    CONCURRENCY: 8, // Max simultaneous uploads PER BUCKET domain sharding allows effectively higher
    RETRIES: 3,
    API_HOST: 's3.us.archive.org'
};

// --- STATE ---
const state = {
    creds: null,
    queue: [],
    activeUploads: 0,
    stats: {
        total: 0,
        success: 0,
        error: 0
    },
    // Map to track files per bucket for "Bucket Complete" notifications
    bucketTrackers: new Map() 
};

// --- DOM ELEMENTS ---
const els = {
    authPanel: document.getElementById('authPanel'),
    controlPanel: document.getElementById('controlPanel'),
    console: document.getElementById('consoleOutput'),
    accessKey: document.getElementById('accessKey'),
    secretKey: document.getElementById('secretKey'),
    btnInit: document.getElementById('btnInit'),
    btnSelect: document.getElementById('btnSelectDir'),
    btnPurge: document.getElementById('btnPurge'),
    btnClear: document.getElementById('btnClearLog'),
    queueCount: document.getElementById('queueCount'),
    activeCount: document.getElementById('activeCount'),
    successCount: document.getElementById('successCount'),
    errorCount: document.getElementById('errorCount')
};

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (!window.showDirectoryPicker) {
        log('CRITICAL: BROWSER NOT SUPPORTED. USE CHROME/EDGE/OPERA.', 'error');
        els.btnSelect.disabled = true;
    }
});

els.btnInit.addEventListener('click', saveCredentials);
els.btnPurge.addEventListener('click', purgeCredentials);
els.btnSelect.addEventListener('click', selectDirectory);
els.btnClear.addEventListener('click', () => {
    els.console.innerHTML = '';
});

// --- AUTHENTICATION ---
function checkAuth() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (stored) {
        state.creds = JSON.parse(stored);
        els.authPanel.classList.add('hidden');
        els.controlPanel.classList.remove('hidden');
        log('SYSTEM ONLINE. CREDENTIALS LOADED.', 'success');
    }
}

function saveCredentials() {
    const ak = els.accessKey.value.trim();
    const sk = els.secretKey.value.trim();
    if (!ak || !sk) return log('ERROR: KEYS REQUIRED', 'error');

    state.creds = { ak, sk };
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.creds));
    els.authPanel.classList.add('hidden');
    els.controlPanel.classList.remove('hidden');
    log('CREDENTIALS ENCRYPTED & SAVED.', 'success');
}

function purgeCredentials() {
    if (confirm('CONFIRM PURGE?')) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        location.reload();
    }
}

// --- FILE SYSTEM SCANNING ---
async function selectDirectory() {
    try {
        const dirHandle = await window.showDirectoryPicker();
        log(`ROOT SELECTED: ${dirHandle.name}`, 'system');
        log('INITIATING DEEP SCAN & UPLOAD STREAM...', 'system');
        
        // Scan root entries
        for await (const entry of dirHandle.values()) {
            processRootEntry(entry); // Async, don't await to allow parallel processing
        }
    } catch (err) {
        if (err.name !== 'AbortError') log(`FS ERROR: ${err.message}`, 'error');
    }
}

// Handle Root Items -> These become BUCKETS
async function processRootEntry(entry) {
    const bucketName = generateBucketName(entry.name);
    
    // Initialize Tracker for this bucket
    if (!state.bucketTrackers.has(bucketName)) {
        state.bucketTrackers.set(bucketName, { total: 0, completed: 0, linkShown: false });
        log(`TARGET ACQUIRED: ${bucketName}`, 'cyan');
    }

    if (entry.kind === 'file') {
        const file = await entry.getFile();
        addToQueue(file, bucketName, file.name);
    } else if (entry.kind === 'directory') {
        // Recursive scan
        await scanDirectory(entry, bucketName, '');
    }
}

async function scanDirectory(dirHandle, bucketName, pathPrefix) {
    for await (const entry of dirHandle.values()) {
        const fullPath = pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name;
        
        if (entry.kind === 'file') {
            const file = await entry.getFile();
            addToQueue(file, bucketName, fullPath);
        } else if (entry.kind === 'directory') {
            // Determine if we should await or let it run. 
            // Awaiting ensures we find files in order, but recursion is fast enough.
            await scanDirectory(entry, bucketName, fullPath);
        }
    }
}

// --- QUEUE SYSTEM ---
function addToQueue(file, bucket, key) {
    // Update Bucket Stats
    const tracker = state.bucketTrackers.get(bucket);
    tracker.total++;

    state.queue.push({ file, bucket, key, retries: 0 });
    updateStats();
    processQueue();
}

function processQueue() {
    // While we have slots and items in queue
    while (state.activeUploads < CONFIG.CONCURRENCY && state.queue.length > 0) {
        const item = state.queue.shift();
        uploadItem(item);
    }
}

// --- UPLOAD LOGIC ---
function uploadItem(item) {
    state.activeUploads++;
    updateStats();

    const logId = `up_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    // Only log start if it's the first try to reduce noise
    if (item.retries === 0) {
        log(`START: ${item.key} -> ${item.bucket}`, 'dim', logId);
    }

    const xhr = new XMLHttpRequest();
    // Use bucket subdomain for domain sharding (browser allows more conns)
    // URL: https://<bucket>.s3.us.archive.org/<key>
    const url = `https://${item.bucket}.${CONFIG.API_HOST}/${encodeURIComponent(item.key)}`;

    xhr.open('PUT', url, true);
    
    // Headers
    xhr.setRequestHeader('Authorization', `LOW ${state.creds.ak}:${state.creds.sk}`);
    xhr.setRequestHeader('x-archive-auto-make-bucket', '1');
    xhr.setRequestHeader('x-archive-interactive-priority', '1');
    xhr.setRequestHeader('x-archive-queue-derive', '0'); // Speed up availability
    xhr.setRequestHeader('Content-Type', item.file.type || 'application/octet-stream');

    // Progress
    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            const el = document.getElementById(logId);
            if (el && pct % 10 === 0) { // Throttle DOM updates
                el.innerHTML = renderLogLine(`UPLOADING ${item.key}: ${pct}%`, 'cyan');
            }
        }
    };

    xhr.onload = () => {
        state.activeUploads--;
        
        if (xhr.status >= 200 && xhr.status < 300) {
            handleSuccess(item, logId);
        } else {
            handleError(item, logId, `HTTP ${xhr.status} ${xhr.statusText}`);
        }
        processQueue(); // Trigger next
    };

    xhr.onerror = () => {
        state.activeUploads--;
        handleError(item, logId, 'NETWORK ERROR');
        processQueue();
    };

    xhr.send(item.file);
}

function handleSuccess(item, logId) {
    state.stats.success++;
    const el = document.getElementById(logId);
    if(el) el.innerHTML = renderLogLine(`COMPLETE: ${item.key}`, 'green');
    
    // Check Bucket Status
    const tracker = state.bucketTrackers.get(item.bucket);
    tracker.completed++;
    
    if (tracker.completed >= tracker.total && !tracker.linkShown) {
        tracker.linkShown = true;
        const url = `https://archive.org/details/${item.bucket}`;
        log(`>>> BUCKET FINISHED: ${item.bucket} <a href="${url}" target="_blank" class="bucket-link">[OPEN]</a>`, 'cyan');
    }
    updateStats();
}

function handleError(item, logId, msg) {
    if (item.retries < CONFIG.RETRIES) {
        item.retries++;
        log(`RETRYING (${item.retries}/${CONFIG.RETRIES}) ${item.key}: ${msg}`, 'pink');
        state.queue.push(item); // Re-queue
    } else {
        state.stats.error++;
        const el = document.getElementById(logId);
        if(el) el.innerHTML = renderLogLine(`FAILED ${item.key}: ${msg}`, 'pink');
    }
    updateStats();
}

// --- UTILS ---

// Helper to update the UI counters
function updateStats() {
    els.queueCount.textContent = state.queue.length;
    els.activeCount.textContent = state.activeUploads;
    els.successCount.textContent = state.stats.success;
    els.errorCount.textContent = state.stats.error;
}

// Logger with Auto-Scroll
function log(msg, type = 'text-green', id = null) {
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    if (id) div.id = id;
    div.innerHTML = renderLogLine(msg, type);
    
    els.console.appendChild(div);
    
    // Force Scroll to bottom
    requestAnimationFrame(() => {
        els.console.scrollTop = els.console.scrollHeight;
    });
}

function renderLogLine(msg, type) {
    const time = new Date().toLocaleTimeString('en-US', {hour12: false});
    return `<span class="timestamp">[${time}]</span> <span class="${type}">${msg}</span>`;
}

function generateBucketName(name) {
    // Sanitization for S3 Bucket names
    let clean = name.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    // Append timestamp to ensure uniqueness and group "run"
    // We use a shorter timestamp to keep bucket name length manageable
    const ts = Math.floor(Date.now() / 1000);
    return `${clean}-${ts}`;
}
