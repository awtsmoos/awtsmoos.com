//B"H
// ui/browser/search.js

export function renderSearchResults(res, onSelect) {
    const r = document.getElementById('search-results');
    if (!r) return;
    r.innerHTML = '';

    if (!Array.isArray(res) || !res.length) {
        r.innerHTML = '<div class="search-empty">NO DATE INDEX MATCHES FOUND</div>';
        return;
    }

    const summary = document.createElement('div');
    summary.className = 'search-summary';
    summary.innerHTML = `<span>${res.length}</span> EVENTS FOUND`;
    r.appendChild(summary);

    res.forEach(item => {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'result-item date-result';

        const title = cleanName(item.title || 'Unknown');
        const month = item.month || `Month ${item.month_id || '?'}`;
        const day = item.day || '?';
        const year = item.year || '????';
        const bucket = item.bucket || '';
        const folder = item.folder || '';

        d.innerHTML = `
            <div class="result-topline">
                <span class="result-date">${month} ${day}, ${year}</span>
                <span class="result-arrow">OPEN →</span>
            </div>
            <div class="result-title"></div>
            <div class="result-meta">
                <span>${bucket}</span>
                <span>${cleanName(folder)}</span>
            </div>
        `;

        d.querySelector('.result-title').textContent = title;
        d.onclick = () => {
            if (onSelect) return onSelect(item);
            const url = new URL(window.location);
            url.searchParams.set('year', String(year));
            url.searchParams.set('folder', folder);
            url.searchParams.set('track', '0');
            url.searchParams.set('autoplay', '1');
            window.location.href = url.toString();
        };

        r.appendChild(d);
    });
}

function cleanName(value) {
    return String(value || '')
        .replace(/^BH[_\s-]*\d+[_\s-]*/i, '')
        .replace(/_/g, ' ')
        .replace(/\s*-\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
