//B"H
// render.js - UI View Logic

let callbacks = {};
const el = (id) => document.getElementById(id);

export function initUI(cbs) {
    callbacks = cbs;
    setupGlobalListeners();
}

function setupGlobalListeners() {
    // Navigation
    if(el('btn-close-folders')) el('btn-close-folders').onclick = () => {
        el('col-folders').classList.remove('open');
        el('col-tracks').classList.remove('open');
    };
    if(el('btn-close-tracks')) el('btn-close-tracks').onclick = () => {
        el('col-tracks').classList.remove('open');
    };
    
    // Player
    el('btn-play').onclick = callbacks.onPlayPause;
    el('btn-next').onclick = callbacks.onNext;
    el('btn-prev').onclick = callbacks.onPrev;
    
    // Scrubber
    el('scrubber').onclick = (e) => {
        const rect = el('scrubber').getBoundingClientRect();
        const p = (e.clientX - rect.left) / rect.width;
        callbacks.onSeek(p);
    };

    // Settings
    el('btn-settings').onclick = () => openModal('modal-settings');
    el('btn-close-settings').onclick = () => closeModal('modal-settings');
    el('btn-clear-db').onclick = callbacks.onClearDB;
    
    // Search
    el('btn-search').onclick = () => openModal('modal-search');
    el('btn-close-search').onclick = () => closeModal('modal-search');
    el('btn-exec-search').onclick = () => {
        const month = el('inp-month').value;
        const day = el('inp-day').value;
        if(!day) {
            alert("DAY COORDINATE REQUIRED");
            return;
        }
        callbacks.onSearch(month, day);
    };

    // Close Context Menu on click elsewhere
    document.addEventListener('click', (e) => {
        const menu = el('ctx-menu');
        if (!menu.classList.contains('hidden') && !menu.contains(e.target)) {
            menu.classList.add('hidden');
        }
    });
}

export function renderSearchResults(results) {
    const list = el('search-results');
    list.innerHTML = '';
    
    if (results.length === 0) {
        list.innerHTML = '<div class="search-placeholder" style="color:var(--c-magenta)">NO VECTORS FOUND</div>';
        return;
    }
    
    results.forEach(res => {
        const d = document.createElement('div');
        d.className = 'search-result-item';
        d.innerHTML = `
            <div class="s-title">${res.title}</div>
            <div class="s-meta">
                ${res.year} | ${res.month} ${res.day}
            </div>
            <div class="s-meta" style="color:var(--c-cyan)">${res.folder}</div>
        `;
        d.onclick = () => callbacks.onSearchResultSelect(res);
        list.appendChild(d);
    });
}

// --- List Renderers ---

export function renderYears(yearsMap) {
    const list = el('list-years');
    list.innerHTML = '';
    
    Object.keys(yearsMap).sort((a,b)=>b.localeCompare(a)).forEach(year => {
        const d = document.createElement('div');
        d.className = 'item year-item';
        d.innerHTML = `
            <div>${year}</div>
            <div class="item-meta">ID: ${yearsMap[year].split('-')[1]}</div>
            <div class="dl-badge">⬇</div>
        `;
        d.onclick = (e) => {
            if(e.target.className.includes('dl-badge')) return;
            document.querySelectorAll('.year-item').forEach(i=>i.classList.remove('active'));
            d.classList.add('active');
            callbacks.onYearSelect(year, yearsMap[year]);
        };
        
        const btn = d.querySelector('.dl-badge');
        btn.onclick = (e) => {
            e.stopPropagation();
            showContextMenu(e.pageX, e.pageY, 'year', yearsMap[year].split('-')[1]);
        };

        list.appendChild(d);
    });
}

export function renderFolders(foldersMap) {
    const list = el('list-folders');
    list.innerHTML = '';
    
    const names = Object.keys(foldersMap).sort();
    
    if (names.length === 0) {
        list.innerHTML = '<div class="item" style="color:var(--c-neon-pink)">NO DATA</div>';
    } else {
        names.forEach(name => {
            const tracks = foldersMap[name]; 
            const d = document.createElement('div');
            d.className = 'item folder-item';
            d.innerHTML = `
                <div>${name}</div>
                <div class="item-meta">
                    <span>${tracks ? tracks.length + ' FILES' : 'UNKNOWN SIZE'}</span>
                </div>
                <div class="dl-badge">⬇</div>
            `;
            
            d.onclick = (e) => {
                if(e.target.className.includes('dl-badge')) return;
                document.querySelectorAll('.folder-item').forEach(i=>i.classList.remove('active'));
                d.classList.add('active');
                callbacks.onFolderSelect(name);
            };

            const btn = d.querySelector('.dl-badge');
            btn.onclick = (e) => {
                e.stopPropagation();
                showContextMenu(e.pageX, e.pageY, 'folder', name);
            };
            
            list.appendChild(d);
        });
    }
    el('col-folders').classList.add('open');
}

export function renderTracks(tracks) {
    const list = el('list-tracks');
    list.innerHTML = '';

    if (!tracks || tracks.length === 0) {
         list.innerHTML = '<div class="item">EMPTY SECTOR</div>';
    } else {
        tracks.forEach((t, i) => {
            const d = document.createElement('div');
            d.className = 'item track-item';
            d.id = `track-${i}`;
            d.innerHTML = `
                <div>${t.name}</div>
                <div class="item-meta">
                    <span class="status-text">...</span>
                </div>
                <div class="dl-badge">⬇</div>
            `;
            
            callbacks.checkStatus(t.path).then(saved => {
                const s = d.querySelector('.status-text');
                if (s) s.textContent = saved ? "SYNCED" : "CLOUD";
                if(saved) d.classList.add('downloaded');
            });
    
            d.onclick = (e) => {
                if(e.target.className.includes('dl-badge')) return;
                callbacks.onTrackSelect(i);
            };
    
            const btn = d.querySelector('.dl-badge');
            btn.onclick = (e) => {
                e.stopPropagation();
                showContextMenu(e.pageX, e.pageY, 'track', i);
            };
    
            list.appendChild(d);
        });
    }
    el('col-tracks').classList.add('open');
}

export function setTracksLoading(isLoading) {
    const list = el('list-tracks');
    if (isLoading) {
        list.innerHTML = '<div class="item" style="color:var(--c-neon-blue); animation: blink 0.5s infinite;">DECRYPTING MANIFEST...</div>';
        el('col-tracks').classList.add('open');
    }
}

export function updatePlayer(name, time, dur) {
    el('track-name').textContent = name || "AWAITING INPUT";
    el('track-time').textContent = `${fmt(time)} / ${fmt(dur)}`;
    el('fill').style.width = (dur > 0 ? (time/dur)*100 : 0) + '%';
    el('btn-play').textContent = callbacks.isPlaying() ? "⏸" : "▶";
}

export function updateActiveTrack(idx) {
    document.querySelectorAll('.track-item').forEach(i=>i.classList.remove('active'));
    const t = el(`track-${idx}`);
    if(t) {
        t.classList.add('active');
        t.scrollIntoView({block: 'nearest'});
    }
}

export function log(msg, isErr=false) {
    const d = document.createElement('div');
    d.className = isErr ? 'log-line log-err' : 'log-line';
    d.textContent = `> ${msg}`;
    const term = el('terminal');
    term.insertBefore(d, term.firstChild);
    if(term.children.length > 50) term.lastChild.remove();
}

export function openModal(id) {
    el('overlay-layer').classList.remove('hidden');
    el(id).classList.remove('hidden');
}

export function closeModal(id) {
    el(id).classList.add('hidden');
    el('overlay-layer').classList.add('hidden');
}

function showContextMenu(x, y, type, target) {
    const menu = el('ctx-menu');
    
    let html = `<div class="ctx-head">SELECT PROTOCOL</div>`;
    
    if (type === 'year') {
         html += `<div class="ctx-item" id="ctx-zip">DOWNLOAD ARCHIVE (.ZIP)</div>`;
    } else {
        html += `
            <div class="ctx-item" id="ctx-app">SYNC TO CORE (APP)</div>
            <div class="ctx-item" id="ctx-disk">EXTRACT TO DISK (FILE)</div>
        `;
    }
    
    menu.innerHTML = html;
    
    menu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 150) + 'px';
    menu.classList.remove('hidden');

    if (type === 'year') {
        el('ctx-zip').onclick = () => {
             menu.classList.add('hidden');
             callbacks.onDownloadAction(type, target, 'zip');
        };
    } else {
        el('ctx-app').onclick = () => {
            menu.classList.add('hidden');
            callbacks.onDownloadAction(type, target, 'app');
        };
        el('ctx-disk').onclick = () => {
            menu.classList.add('hidden');
            callbacks.onDownloadAction(type, target, 'disk');
        };
    }
}

function fmt(s) {
    if(isNaN(s)) return "00:00";
    const m = Math.floor(s/60);
    const sec = Math.floor(s%60);
    return `${m}:${sec<10?'0'+sec:sec}`;
}