//B"H
// ui/lists.js
import { fmt } from './utils.js';

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
        const title = item.title || "Unknown";
        d.innerHTML = `<span style="color:var(--c-cyan)">>></span> ${title}`;
        d.onclick = () => onSelect(item.path);
        r.appendChild(d);
    });
}