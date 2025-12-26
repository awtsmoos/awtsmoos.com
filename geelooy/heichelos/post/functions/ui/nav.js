//B"H
export function makeNavBars(post, seriesParent, indexInSeries) {
    var cur = parseInt(indexInSeries) || 0;
    var length = seriesParent.posts.length;
    var hasPrevious = cur > 0;
    var hasNext = cur < length - 1;
    
    var html = `<div class="nav">
        <div class="controls">CHAPTER ${cur + 1} / ${length}</div>`;
    
    if (hasPrevious) html += `<a id="last" class="nav button primary" href="${encodeURIComponent(cur - 1)}">← PREVIOUS</a>`;
    if (hasNext) html += `<a id="next" class="nav button primary" href="${encodeURIComponent(cur + 1)}">NEXT →</a>`;
    
    html += `</div><script>if(window.next) next.href = next.href; if(window.last) last.href = last.href;</script>`;
    return html;
}
