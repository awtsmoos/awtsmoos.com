//B"H
// ui/browser/search.js

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
        
        const arrow = document.createElement('span');
        arrow.style.color = 'var(--c-cyan)';
        arrow.textContent = ">> ";
        
        const text = document.createElement('span');
        text.textContent = title;
        text.style.fontFamily = 'monospace';
        
        // Hacker text removed
        
        d.appendChild(arrow);
        d.appendChild(text);
        
        d.onclick = () => onSelect(item.path);
        r.appendChild(d);
    });
}