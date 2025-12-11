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
    const overlay = document.getElementById('loading-overlay');
    const label = document.getElementById('loader-text');
    
    if (loading) {
        if(overlay) overlay.classList.remove('hidden');
        if(label && title) label.textContent = title.toUpperCase();
        
        // Backup Header Text
        const h = document.getElementById('header-tracks-title');
        if(h) h.textContent = `LOADING...`;
    } else {
        if(overlay) {
            // Slight delay for effect
            setTimeout(() => overlay.classList.add('hidden'), 500);
        }
        const h = document.getElementById('header-tracks-title');
        if(h) h.textContent = `AUDIO DATA`;
    }
    
    const list = document.getElementById('list-tracks');
    if (loading && list && list.children.length === 0) {
        // Optional: Keep list clear or show skeleton
    }
}

export function updateVideoProgress(msg, pct) {
    const t = document.getElementById('vid-status-text');
    if(t) t.textContent = msg;
    const f = document.getElementById('vid-progress-fill');
    if(f) f.style.width = (pct*100) + '%';
}