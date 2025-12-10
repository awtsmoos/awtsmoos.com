//B"H
// ui/browser/years.js
import { enableHackerText } from '../effects.js';

export function renderYears(years, onSelect) {
    const list = document.getElementById('list-years');
    if(!list) return;
    list.innerHTML = '';
    Object.keys(years).forEach(y => {
        const d = document.createElement('div');
        d.className = 'item year-item';
        
        const spanIcon = document.createElement('span');
        spanIcon.className = 'icon';
        spanIcon.textContent = '📁';
        
        const spanText = document.createElement('span');
        spanText.className = 'item-text';
        spanText.textContent = y;
        spanText.style.fontFamily = 'monospace';
        
        d.appendChild(spanIcon);
        d.appendChild(document.createTextNode(" "));
        d.appendChild(spanText);
        
        enableHackerText(spanText, y);

        d.onclick = () => {
             document.querySelectorAll('.year-item').forEach(i=>i.classList.remove('active'));
             d.classList.add('active');
             onSelect(y);
        };
        list.appendChild(d);
    });
}