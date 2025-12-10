//B"H
// ui/player.js
import { fmt } from './utils.js';

export function updatePlayIcon(playing) {
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
    updatePlayIcon(!document.querySelector('audio')?.paused);
}

export function updateActiveTrack(idx) {
    document.querySelectorAll('.track-item').forEach(el => el.classList.remove('active'));
    const t = document.getElementById(`track-${idx}`);
    if(t) t.classList.add('active');
}

export function setTracksLoading(loading, title) {
    const h = document.getElementById('header-tracks-title');
    if(h) h.textContent = loading ? `LOADING ${title}...` : `AUDIO DATA // ${title}`;
    
    const list = document.getElementById('list-tracks');
    if (loading && list && list.children.length === 0) list.innerHTML = '<div style="padding:20px; color:var(--c-cyan);">SCANNING SECTOR...</div>';
    
    // Player Loading State
    const pt = document.getElementById('player-track-title');
    const fill = document.getElementById('player-fill');
    
    if (loading) {
        if(pt) pt.textContent = title ? `LOADING: ${title}` : "BUFFERING...";
        if(fill) fill.classList.add('loading');
    } else {
        if(fill) fill.classList.remove('loading');
    }
}

export function updateVideoProgress(msg, pct) {
    const t = document.getElementById('vid-status-text');
    if(t) t.textContent = msg;
    const f = document.getElementById('vid-progress-fill');
    if(f) f.style.width = (pct*100) + '%';
}