// B"H

const DOM = {
    years: document.getElementById('yearList'),
    container: document.getElementById('eventsContainer'),
    title: document.getElementById('currentViewTitle'),
    log: document.getElementById('consoleOutput')
};

const API_BASE = "https://5qlaecnhel.execute-api.us-east-1.amazonaws.com/prod/ashreinu/api/v1";

// --- Logger ---
function log(msg, type='info') {
    const div = document.createElement('div');
    div.textContent = `> ${msg}`;
    if(type === 'error') div.style.color = 'var(--error)';
    if(type === 'success') div.style.color = 'var(--success)';
    DOM.log.appendChild(div);
    DOM.log.scrollTop = DOM.log.scrollHeight;
}

// --- Proxy Fetcher ---
async function awtsFetch(targetUrl, method = "GET") {
    try {
        const response = await fetch("/api/fetch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: targetUrl,
                method: method,
                headers: { "User-Agent": "Mozilla/5.0 AwtsmoosJem" }
            })
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error);
        return result;
    } catch (e) {
        log(`Network Error: ${e.message}`, "error");
        throw e;
    }
}

// --- Data Fetching Logic ---

async function getYearEvents(year) {
    log(`Fetching year ${year}...`);
    const url = `${API_BASE}/events?year=${year}&has=audio`;
    const res = await awtsFetch(url);
    
    // B"H: FIX - Carefully parse the nested structure
    // The API returns a JSON string inside 'data'.
    // That JSON string parses into { data: [Array] }
    try {
        if (!res.isBinary && typeof res.data === 'string') {
            const parsedOuter = JSON.parse(res.data);
            if(parsedOuter && Array.isArray(parsedOuter.data)) {
                return parsedOuter.data; // Return the ARRAY
            }
        }
        return [];
    } catch(e) {
        log("Error parsing year data", "error");
        return [];
    }
}

async function getEventData(eventId) {
    const url = `${API_BASE}/event/${eventId}`;
    const res = await awtsFetch(url);
    try {
        if (!res.isBinary && typeof res.data === 'string') {
            const parsed = JSON.parse(res.data);
            // Typically single event returns { data: { ... } } or just { ... }
            return parsed.data || parsed; 
        }
        return null;
    } catch(e) {
        return null;
    }
}

// --- The Core Logic from Original Script ---
// This prepares the Metadata. It does NOT download yet.
function getAudioCandidates(eventData) {
    let audios = [];

    // Logic from original script:
    // If sub_events exist, map them to their first audio recording.
    if(eventData.sub_events && eventData.sub_events.length) {
        audios = eventData.sub_events
            .map(sub => sub.audio_recordings?.[0])
            .filter(Boolean);
    } 
    // Otherwise use main audio_recordings
    else if (eventData.audio_recordings) {
        audios = eventData.audio_recordings;
    }

    // Map to useful objects
    return audios.map((rec, index) => {
        const asset = rec.assets?.[0];
        if(!asset) return null;

        const assetURI = asset.uri; // e.g., https://.../file.mp3
        try {
            const uri = new URL(assetURI);
            const extDot = uri.pathname.lastIndexOf(".");
            if(extDot < 0) return null;

            const mainPart = uri.pathname.substring(0, extDot); // path without extension
            const defaultFormat = asset.file_format; // 'mp3' or 'opus'
            const otherFormat = defaultFormat === "mp3" ? "opus" : "mp3";

            // Base URL without extension
            const baseUrl = uri.origin + mainPart;

            return {
                title: rec.title || `Track ${index + 1}`,
                baseUrl: baseUrl,
                defaultFormat: defaultFormat,
                otherFormat: otherFormat,
                originalRec: rec
            };
        } catch(e) { return null; }
    }).filter(Boolean);
}

// --- UI Logic ---

function init() {
    for (let y = 5708; y <= 5752; y++) {
        const btn = document.createElement('button');
        btn.className = 'year-btn';
        btn.textContent = `Year ${y}`;
        btn.onclick = () => loadYear(y, btn);
        DOM.years.appendChild(btn);
    }
}

async function loadYear(year, btn) {
    document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    DOM.title.textContent = `Events for ${year}`;
    DOM.container.innerHTML = '<div style="padding:20px;">Loading Events... <span class="spinner"></span></div>';

    const events = await getYearEvents(year);

    DOM.container.innerHTML = '';
    if(!events || events.length === 0) {
        DOM.container.innerHTML = '<div style="padding:20px;">No events found (or API error).</div>';
        return;
    }

    log(`Found ${events.length} events.`);

    events.forEach(evt => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-header">
                <div>
                    <div class="event-title">${evt.name_he || evt.name_en || "Untitled"}</div>
                    <div class="event-date">${evt.date_he || ""}</div>
                </div>
                <button class="btn btn-primary" onclick="expandEvent('${evt.id}', this)">
                    View Tracks
                </button>
            </div>
            <div class="track-container" style="display:none;"></div>
        `;
        DOM.container.appendChild(card);
    });
}

async function expandEvent(eventId, btn) {
    const container = btn.closest('.event-card').querySelector('.track-container');
    container.style.display = 'block';
    container.innerHTML = 'Loading track details... <span class="spinner"></span>';
    btn.style.display = 'none';

    const fullData = await getEventData(eventId);
    if(!fullData) {
        container.innerHTML = 'Error loading details.';
        return;
    }

    // Use our logic that mimics the original script's flattening
    const tracks = getAudioCandidates(fullData);

    if(tracks.length === 0) {
        container.innerHTML = 'No audio tracks available.';
        return;
    }

    container.innerHTML = '';
    tracks.forEach(track => {
        const div = document.createElement('div');
        div.className = 'track-item';
        
        // Clean filename for download
        const cleanName = (track.title).replace(/[^a-zA-Z0-9\u0590-\u05ff ]/g, "_");

        div.innerHTML = `
            <div class="track-info">
                <strong>${track.title}</strong>
                <span>Format: .${track.defaultFormat} (alt: .${track.otherFormat})</span>
            </div>
            <button class="btn btn-primary" onclick="downloadSmart('${track.baseUrl}', '${track.defaultFormat}', '${track.otherFormat}', '${cleanName}', this)">
                Download
            </button>
        `;
        container.appendChild(div);
    });
}

// --- The "Smart" Downloader (Original Script Logic) ---
// Tries default format. If fails (or text/html error), tries other format.
async function downloadSmart(baseUrl, format1, format2, filename, btn) {
    const originalText = btn.textContent;
    btn.disabled = true;
    
    // Helper to process download
    const tryDownload = async (fmt) => {
        const targetUrl = `${baseUrl}.${fmt}`;
        log(`Trying ${targetUrl}...`);
        
        const res = await awtsFetch(targetUrl, "GET");
        
        // Check if valid binary
        if(!res.isBinary || !res.data) {
            // It might be an HTML error page (AWS error)
            return false;
        }

        // Convert and Download
        const byteCharacters = atob(res.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const mime = res.headers['content-type'] || 'audio/mpeg';
        const blob = new Blob([byteArray], { type: mime });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${filename}.${fmt}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        return true;
    };

    try {
        btn.innerHTML = `Try .${format1} <span class="spinner"></span>`;
        let success = await tryDownload(format1);

        if(!success) {
            log(`.${format1} failed. Trying .${format2}...`, "error");
            btn.innerHTML = `Try .${format2} <span class="spinner"></span>`;
            success = await tryDownload(format2);
        }

        if(success) {
            log("Download Complete!", "success");
            btn.textContent = "Done";
            btn.style.backgroundColor = "var(--success)";
        } else {
            throw new Error("Both formats failed");
        }
    } catch(e) {
        log("Download failed.", "error");
        btn.textContent = "Failed";
        btn.style.backgroundColor = "var(--error)";
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = originalText;
            btn.style.backgroundColor = "";
        }, 3000);
    }
}

// Start
init();