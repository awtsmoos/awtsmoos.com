//B"H
// ui/browser/tracks.js
import { enableHackerText } from '../effects.js';
import { fmt } from '../utils.js';

export function renderTracks(tracks, folderTitle, checkStatus, onSelect, onCtx) {
    const list = document.getElementById('list-tracks');
    if(!list) return;
    list.innerHTML = '';
    tracks.forEach((t, i) => {
        const d = document.createElement('div');
        d.className = 'item track-item';
        d.id = `track-${i}`;
        
        const statusSpan = document.createElement('span');
        statusSpan.className = 'status-slot';
        d.appendChild(statusSpan);
        d.appendChild(document.createTextNode(" "));

        const nameSpan = document.createElement('span');
        nameSpan.className = 't-name';
        nameSpan.textContent = t.title;
        nameSpan.style.fontFamily = 'monospace';
        d.appendChild(nameSpan);
        
        enableHackerText(nameSpan, t.title);

        const durSpan = document.createElement('span');
        durSpan.className = 't-dur';
        durSpan.style.float = 'right';
        durSpan.style.fontFamily = 'monospace';
        durSpan.style.color = '#888';
        durSpan.textContent = fmt(t.duration);
        d.appendChild(durSpan);

        if(checkStatus) {
            checkStatus(t.path).then(cached => {
                const s = cached ? '<span style="color:var(--c-cyan); font-size:0.8em;">[CACHED]</span>' : '';
                statusSpan.innerHTML = s;
            });
        }
        
        d.onclick = () => onSelect(i);
        d.oncontextmenu = (e) => {
            e.preventDefault();
            if(onCtx) onCtx(e.clientX, e.clientY, t, d);
        };
        list.appendChild(d);
    });
}