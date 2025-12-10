//B"H
// ui/browser/folders.js
import { enableHackerText } from '../effects.js';

export function renderFolders(folders, onSelect) {
    const list = document.getElementById('list-folders');
    if(!list) return;
    list.innerHTML = '';
    Object.entries(folders).forEach(([id, f]) => {
        const d = document.createElement('div');
        d.className = 'item folder-item';
        const title = (typeof f === 'object' && f.title) ? f.title : f;
        
        const spanIcon = document.createElement('span');
        spanIcon.className = 'icon';
        spanIcon.textContent = '📂';
        
        const spanText = document.createElement('span');
        spanText.className = 'item-text';
        spanText.textContent = title;
        spanText.style.fontFamily = 'monospace';
        
        d.appendChild(spanIcon);
        d.appendChild(document.createTextNode(" "));
        d.appendChild(spanText);
        
        enableHackerText(spanText, title);

        d.onclick = () => {
             document.querySelectorAll('.folder-item').forEach(i=>i.classList.remove('active'));
             d.classList.add('active');
             onSelect(id);
        };
        list.appendChild(d);
    });
}