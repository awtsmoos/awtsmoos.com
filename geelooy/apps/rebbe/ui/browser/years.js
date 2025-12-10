//B"H
// ui/browser/years.js

export function renderYears(years, onSelect) {
    const list = document.getElementById('list-years');
    if(!list) return;
    list.innerHTML = '';
    Object.entries(years).forEach(([y, archiveId]) => {
        const d = document.createElement('div');
        d.className = 'item year-item';
        
        const content = document.createElement('div');
        content.style.flex = '1';
        content.innerHTML = `<span class="icon">📁</span> <span class="item-text" style="font-family:monospace;">${y}</span>`;
        d.appendChild(content);

        // ZIP DL
        const btnZip = document.createElement('button');
        btnZip.innerHTML = '📦';
        btnZip.className = 'mini-btn';
        btnZip.title = "Download Year ZIP (Archive.org)";
        btnZip.onclick = (e) => {
            e.stopPropagation();
            const url = `https://archive.org/compress/${archiveId}`;
            window.open(url, '_blank');
        };
        d.appendChild(btnZip);

        // Hacker text removed

        d.onclick = () => {
             document.querySelectorAll('.year-item').forEach(i=>i.classList.remove('active'));
             d.classList.add('active');
             onSelect(y);
        };
        list.appendChild(d);
    });
}