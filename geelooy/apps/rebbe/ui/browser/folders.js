//B"H
// ui/browser/folders.js
import { cleanArchiveName } from '../../modules/network/archive.js';

export function renderFolders(folders, onSelect) {
    const list = document.getElementById('list-folders');
    if(!list) return;
    list.innerHTML = '';

    Object.entries(folders).forEach(([id, f]) => {
        const d = document.createElement('div');
        d.className = 'item folder-item';

        const rawTitle = (typeof f === 'object' && f.title) ? f.title : f;
        const title = cleanArchiveName(rawTitle);

        const spanIcon = document.createElement('span');
        spanIcon.className = 'icon';
        spanIcon.textContent = '📂';

        const spanText = document.createElement('span');
        spanText.className = 'item-text';
        spanText.textContent = title || rawTitle;
        spanText.style.fontFamily = 'monospace';

        d.appendChild(spanIcon);
        d.appendChild(document.createTextNode(" "));
        d.appendChild(spanText);

        d.onclick = () => {
            document.querySelectorAll('.folder-item').forEach(i=>i.classList.remove('active'));
            d.classList.add('active');
            onSelect(id);
        };
        list.appendChild(d);
    });
}
