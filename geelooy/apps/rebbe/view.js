//B"H
// view.js - DOM Manipulation

export function initUI(cb) {
    console.log("VIEW: Initializing UI...");
    
    // -- Player Controls --
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) {
        btnPlay.onclick = (e) => {
            e.stopPropagation();
            cb.onPlayPause();
            updatePlayIcon(cb.isPlaying());
        };
    }

    const btnNext = document.getElementById('btn-next');
    if (btnNext) btnNext.onclick = cb.onNext;

    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) btnPrev.onclick = cb.onPrev;

    // Seeker
    const fill = document.getElementById('player-fill');
    if (fill && fill.parentElement) {
        fill.parentElement.onclick = (e) => {
            const rect = fill.parentElement.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            if (cb.onSeekFraction) cb.onSeekFraction(pct);
        };
    }

    // -- Header Tools --
    
    // SEARCH
    const btnSearch = document.getElementById('btn-search');
    if (btnSearch) {
        btnSearch.onclick = () => {
            openModal('modal-search');
            setTimeout(() => document.getElementById('inp-search').focus(), 100);
        };
    }
    
    const inpSearch = document.getElementById('inp-search');
    if (inpSearch) {
        inpSearch.onkeydown = (e) => { 
            if (e.key === 'Enter') cb.onSearch(inpSearch.value); 
        };
    }

    // SHARE
    const btnShare = document.getElementById('btn-share');
    if (btnShare) btnShare.onclick = cb.onShare;

    // SETTINGS
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
        btnSettings.onclick = () => openModal('modal-settings');
    }

    // Actions inside Settings
    const btnActionClear = document.getElementById('btn-action-clear');
    if (btnActionClear) {
        btnActionClear.onclick = () => {
             if(confirm("DELETE ALL CACHED AUDIO?")) {
                 cb.onClearDB();
             }
        };
    }
    
    // Modal Close Logic
    document.querySelectorAll('.modal-close').forEach(b => {
        b.onclick = () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
            document.getElementById('overlay-layer').classList.add('hidden');
        };
    });

    // Close on overlay click
    const overlay = document.getElementById('overlay-layer');
    if(overlay) {
        overlay.onclick = (e) => {
            if(e.target === overlay) {
                document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
                overlay.classList.add('hidden');
            }
        };
    }
}

function updatePlayIcon(playing) {
    const iPlay = document.getElementById('icon-play');
    const iPause = document.getElementById('icon-pause');
    if(iPlay && iPause) {
        if(playing) {
            iPlay.classList.add('hidden');
            iPause.classList.remove('hidden');
        } else {
            iPlay.classList.remove('hidden');
            iPause.classList.add('hidden');
        }
    }
}

export function log(msg, isError) {
    const term = document.getElementById('terminal');
    if (!term) return; 
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = `> ${msg}`;
    if (isError) line.style.color = 'var(--c-magenta)';
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
}

export function toggleTerminal() {
    const t = document.getElementById('terminal-wrap');
    if(t) t.classList.toggle('hidden');
}

export function openModal(id) {
    const overlay = document.getElementById('overlay-layer');
    if(overlay) overlay.classList.remove('hidden');
    
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    
    const m = document.getElementById(id);
    if(m) m.classList.remove('hidden');
}

export function closeModal(id) {
    const m = document.getElementById(id);
    if(m) m.classList.add('hidden');
    // Hide overlay only if no other modals open
    const open = document.querySelectorAll('.modal:not(.hidden)');
    if(open.length === 0) document.getElementById('overlay-layer').classList.add('hidden');
}

export function setTracksLoading(loading, title) {
    const h = document.getElementById('header-tracks-title');
    if(h) h.textContent = loading ? `LOADING ${title}...` : `AUDIO DATA // ${title}`;
    const list = document.getElementById('list-tracks');
    if (loading && list) list.innerHTML = '<div style="padding:20px; color:var(--c-cyan);">SCANNING SECTOR...</div>';
}

export function renderYears(years, onSelect) {
    const list = document.getElementById('list-years');
    if(!list) return;
    list.innerHTML = '';
    Object.keys(years).forEach(y => {
        const d = document.createElement('div');
        d.className = 'item year-item';
        d.innerHTML = `<span class="icon">📁</span> ${y}`;
        d.onclick = () => {
             document.querySelectorAll('.year-item').forEach(i=>i.classList.remove('active'));
             d.classList.add('active');
             onSelect(y);
        };
        list.appendChild(d);
    });
}

export function renderFolders(folders, onSelect) {
    const list = document.getElementById('list-folders');
    if(!list) return;
    list.innerHTML = '';
    Object.entries(folders).forEach(([id, f]) => {
        const d = document.createElement('div');
        d.className = 'item folder-item';
        const title = (typeof f === 'object' && f.title) ? f.title : f;
        d.innerHTML = `<span class="icon">📂</span> ${title}`;
        d.onclick = () => {
             document.querySelectorAll('.folder-item').forEach(i=>i.classList.remove('active'));
             d.classList.add('active');
             onSelect(id);
        };
        list.appendChild(d);
    });
}

export function renderTracks(tracks, folderTitle, checkStatus, onSelect, onCtx) {
    const list = document.getElementById('list-tracks');
    if(!list) return;
    list.innerHTML = '';
    tracks.forEach((t, i) => {
        const d = document.createElement('div');
        d.className = 'item track-item';
        d.id = `track-${i}`;
        
        if(checkStatus) {
            checkStatus(t.path).then(cached => {
                const s = cached ? '<span style="color:var(--c-cyan); font-size:0.8em;">[CACHED]</span>' : '';
                const slot = d.querySelector('.status-slot');
                if(slot) slot.innerHTML = s;
            });
        }

        d.innerHTML = `
            <span class="status-slot"></span> 
            <span class="t-name">${t.title}</span> 
            <span class="t-dur" style="float:right; font-family:monospace; color:#888;">${fmt(t.duration)}</span>
        `;
        
        d.onclick = () => onSelect(i);
        d.oncontextmenu = (e) => {
            e.preventDefault();
            if(onCtx) onCtx(e.clientX, e.clientY, t, d);
        };
        list.appendChild(d);
    });
}

export function renderSearchResults(res, onSelect) {
    const r = document.getElementById('search-results');
    if(!r) return;
    r.innerHTML = '';
    if (res.length === 0) {
        r.innerHTML = '<div style="padding:20px; color:#666;">NO MATCHES FOUND</div>';
        return;
    }
    res.forEach(item => {
        const d = document.createElement('div');
        d.className = 'result-item';
        // Bold the year if present
        const title = item.title || "Unknown";
        d.innerHTML = `<span style="color:var(--c-cyan)">>></span> ${title}`;
        d.onclick = () => onSelect(item.path);
        r.appendChild(d);
    });
}

export function updateActiveTrack(idx) {
    document.querySelectorAll('.track-item').forEach(el => el.classList.remove('active'));
    const t = document.getElementById(`track-${idx}`);
    if(t) t.classList.add('active');
}

export function updatePlayer(title, cur, dur) {
    const pt = document.getElementById('player-track-title');
    if(pt) pt.textContent = title || "PLAYING...";
    
    const ptm = document.getElementById('player-time');
    if(ptm) ptm.textContent = `${fmt(cur)} / ${fmt(dur)}`;
    
    const fill = document.getElementById('player-fill');
    if(fill) {
        const pct = dur > 0 ? (cur / dur) * 100 : 0;
        fill.style.width = `${pct}%`;
    }
    
    // Auto update icon if needed
    updatePlayIcon(!document.querySelector('audio')?.paused);
}

// Background Matrix Effect
export function initBackgroundEffect() {
    let canvas = document.getElementById('matrix-bg');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'matrix-bg';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0.15';
        canvas.style.pointerEvents = 'none';
        document.body.prepend(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const letters = 'אבגדהוזחטיכלמנסעפצקרשת';
    const fontSize = 16;
    const columns = width / fontSize;
    const drops = [];
    for (let i = 0; i < columns; i++) drops[i] = 1;
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#0ff';
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = letters.charAt(Math.floor(Math.random() * letters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        requestAnimationFrame(draw);
    }
    draw();
}

export function updateVideoProgress(msg, pct) {
    const t = document.getElementById('vid-status-text');
    if(t) t.textContent = msg;
    const f = document.getElementById('vid-progress-fill');
    if(f) f.style.width = (pct*100) + '%';
}

export function showContextMenu(x, y, data, el, actionCb) {
    const m = document.getElementById('ctx-menu');
    m.classList.remove('hidden');
    m.style.left = x + 'px';
    m.style.top = y + 'px';
    m.innerHTML = `
        <div style="background:var(--c-cyan); color:black; padding:5px; font-weight:bold;">${data.title || 'OPTIONS'}</div>
        <div class="ctx-item" id="ctx-dl">DOWNLOAD MP3</div>
    `;
    document.getElementById('ctx-dl').onclick = () => {
        actionCb(data);
        m.classList.add('hidden');
    };
}

function fmt(s) {
    if(isNaN(s) || !isFinite(s)) return "00:00";
    const m = Math.floor(s/60);
    const sec = Math.floor(s%60);
    return `${m}:${sec<10?'0'+sec:sec}`;
}