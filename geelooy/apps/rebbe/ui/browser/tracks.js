//B"H
// ui/browser/tracks.js
import { enableHackerText } from '../effects.js';
import { fmt } from '../utils.js';

export function renderTracks(tracks, folderTitle, checkStatus, onSelect, onAction) {
    const list = document.getElementById('list-tracks');
    if(!list) return;
    list.innerHTML = '';
    tracks.forEach((t, i) => {
        const d = document.createElement('div');
        d.className = 'item track-item';
        d.id = `track-${i}`;
        
        // Left side container for name and status
        const left = document.createElement('div');
        left.style.flex = '1';
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.overflow = 'hidden';

        const statusSpan = document.createElement('span');
        statusSpan.className = 'status-slot';
        left.appendChild(statusSpan);
        left.appendChild(document.createTextNode(" "));

        const nameSpan = document.createElement('span');
        nameSpan.className = 't-name';
        nameSpan.textContent = t.title;
        nameSpan.style.fontFamily = 'monospace';
        nameSpan.style.whiteSpace = 'nowrap';
        nameSpan.style.overflow = 'hidden';
        nameSpan.style.textOverflow = 'ellipsis';
        left.appendChild(nameSpan);
        
        // enableHackerText(nameSpan, t.title); // disabled for performance as requested

        // Right side actions
        const actions = document.createElement('div');
        actions.className = 'item-actions';
        actions.style.display = 'flex';
        actions.style.gap = '8px';
        actions.style.marginLeft = '10px';

        const durSpan = document.createElement('span');
        durSpan.className = 't-dur';
        durSpan.style.fontFamily = 'monospace';
        durSpan.style.color = '#888';
        durSpan.textContent = fmt(t.duration);
        actions.appendChild(durSpan);
        
        // Download Button (Disk)
        const btnDl = document.createElement('button');
        btnDl.innerHTML = '⬇';
        btnDl.title = "Download MP3";
        btnDl.className = 'mini-btn';
        btnDl.onclick = (e) => { e.stopPropagation(); onAction('download', t); };
        actions.appendChild(btnDl);

        // Cache Button (App)
        const btnCache = document.createElement('button');
        btnCache.innerHTML = '⚡';
        btnCache.title = "Save to App";
        btnCache.className = 'mini-btn';
        btnCache.onclick = (e) => { e.stopPropagation(); onAction('cache', t); };
        actions.appendChild(btnCache);

        d.appendChild(left);
        d.appendChild(actions);

        if(checkStatus) {
            checkStatus(t.path).then(cached => {
                const s = cached ? '<span style="color:var(--c-cyan); font-weight:bold;">● </span>' : '';
                statusSpan.innerHTML = s;
                if(cached) btnCache.style.color = 'var(--c-cyan)';
            });
        }
        
        d.onclick = () => onSelect(i);
        list.appendChild(d);
    });
}