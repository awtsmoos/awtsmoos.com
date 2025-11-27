// B"H

const DOM = {
    years: document.getElementById('yearList'),
    container: document.getElementById('eventsContainer'),
    title: document.getElementById('currentViewTitle'),
    log: document.getElementById('consoleOutput'),
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    menuToggle: document.getElementById('menuToggle')
};

const API_BASE = "https://5qlaecnhel.execute-api.us-east-1.amazonaws.com/prod/ashreinu/api/v1";

// --- Logger ---
function log(msg, type='info') {
    const div = document.createElement('div');
    div.innerHTML = `<span style="opacity:0.6">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    if(type === 'error') div.style.color = 'var(--error)';
    if(type === 'success') div.style.color = 'var(--success)';
    DOM.log.appendChild(div);
    DOM.log.scrollTop = DOM.log.scrollHeight;
}

// --- Mobile Sidebar Logic ---
function toggleSidebar() {
    DOM.sidebar.classList.toggle('open');
    DOM.overlay.classList.toggle('active');
}

DOM.menuToggle.addEventListener('click', toggleSidebar);
DOM.overlay.addEventListener('click', toggleSidebar);

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
    
    try {
        if (!res.isBinary && typeof res.data === 'string') {
            const parsedOuter = JSON.parse(res.data);
            if(parsedOuter && Array.isArray(parsedOuter.data)) {
                return parsedOuter.data; 
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

// --- Name Resolution Helper ---
function getEventName(evt) {
    return evt.name_he || evt.name_en || evt.name || evt.title || "Untitled Event";
}

function getTrackName(rec, index) {
    return rec.title || rec.title_he || rec.title_en || rec.description || `Track ${index + 1}`;
}

// --- Audio Logic ---
function getAudioCandidates(eventData) {
    let audios = [];

    // Flatten logic
    if(eventData.sub_events && eventData.sub_events.length) {
        audios = eventData.sub_events.map(sub => {
            const rec = sub.audio_recordings?.[0];
            if(rec) {
                // If the sub-event has a name, use it as the track title
                if(sub.name_he || sub.name_en) {
                    rec.title = sub.name_he || sub.name_en;
                }
                return rec;
            }
            return null;
        }).filter(Boolean);
    } 
    else if (eventData.audio_recordings) {
        audios = eventData.audio_recordings;
    }

    return audios.map((rec, index) => {
        const asset = rec.assets?.[0];
        if(!asset) return null;

        const assetURI = asset.uri; 
        try {
            const uri = new URL(assetURI);
            const extDot = uri.pathname.lastIndexOf(".");
            if(extDot < 0) return null;

            const mainPart = uri.pathname.substring(0, extDot); 
            const defaultFormat = asset.file_format; 
            const otherFormat = defaultFormat === "mp3" ? "opus" : "mp3";
            const baseUrl = uri.origin + mainPart;

            return {
                title: getTrackName(rec, index),
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
        btn.innerHTML = `<span>Year ${y}</span> <i class="fas fa-chevron-right" style="font-size:0.7em; opacity:0.5"></i>`;
        btn.onclick = () => {
            loadYear(y, btn);
            if(window.innerWidth <= 768) toggleSidebar(); // Auto-close on mobile
        };
        DOM.years.appendChild(btn);
    }
}

async function loadYear(year, btn) {
    document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    DOM.title.textContent = `Events for ${year}`;
    DOM.container.innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; flex-direction:column; color:var(--text-muted)"><div class="spinner" style="width:30px; height:30px; margin-bottom:10px;"></div>Loading...</div>';

    const events = await getYearEvents(year);

    DOM.container.innerHTML = '';
    if(!events || events.length === 0) {
        DOM.container.innerHTML = '<div style="padding:20px; text-align:center;">No events found.</div>';
        return;
    }

    log(`Found ${events.length} events.`);

    events.forEach(evt => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-header">
                <div class="event-info">
                    <h4>${getEventName(evt)}</h4>
                    <span class="event-date"><i class="far fa-calendar-alt"></i> ${evt.date_he || ""}</span>
                </div>
                <button class="btn" onclick="expandEvent('${evt.id}', this)">
                    <i class="fas fa-list-ul"></i> Tracks
                </button>
            </div>
            <div class="track-container" style="display:none;"></div>
        `;
        DOM.container.appendChild(card);
    });
}

async function expandEvent(eventId, btn) {
    const container = btn.closest('.event-card').querySelector('.track-container');
    
    if(container.style.display === 'block') {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = '<div style="padding:15px; text-align:center; color:var(--text-muted)"><span class="spinner"></span> Resolving tracks...</div>';
    
    const fullData = await getEventData(eventId);
    if(!fullData) {
        container.innerHTML = '<div style="padding:15px; color:var(--error)">Error loading details.</div>';
        return;
    }

    const tracks = getAudioCandidates(fullData);

    if(tracks.length === 0) {
        container.innerHTML = '<div style="padding:15px; text-align:center">No playable audio.</div>';
        return;
    }

    container.innerHTML = '';
    tracks.forEach(track => {
        const div = document.createElement('div');
        div.className = 'track-item';
        
        const cleanName = (track.title).replace(/[^a-zA-Z0-9\u0590-\u05ff ]/g, "_");

        div.innerHTML = `
            <div class="track-info">
                <span class="track-name">${track.title}</span>
                <div class="track-meta">
                    <span class="tag">.${track.defaultFormat}</span>
                </div>
            </div>
            <button class="btn btn-small" onclick="downloadSmart('${track.baseUrl}', '${track.defaultFormat}', '${track.otherFormat}', '${cleanName}', this)">
                <i class="fas fa-download"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

async function downloadSmart(baseUrl, format1, format2, filename, btn) {
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    
    const tryDownload = async (fmt) => {
        const targetUrl = `${baseUrl}.${fmt}`;
        log(`Downloading: ${filename}.${fmt}`);
        
        const res = await awtsFetch(targetUrl, "GET");
        
        if(!res.isBinary || !res.data) return false;

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
        btn.innerHTML = `<span class="spinner"></span>`;
        let success = await tryDownload(format1);

        if(!success) {
            log(`.${format1} missing. Trying .${format2}...`);
            success = await tryDownload(format2);
        }

        if(success) {
            log("Success!", "success");
            btn.innerHTML = `<i class="fas fa-check"></i>`;
            btn.style.background = "var(--success)";
        } else {
            throw new Error("Formats unavailable");
        }
    } catch(e) {
        log("Failed", "error");
        btn.innerHTML = `<i class="fas fa-times"></i>`;
        btn.style.background = "var(--error)";
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            btn.style.background = "";
        }, 3000);
    }
}

// Start
init();