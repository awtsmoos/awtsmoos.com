//B"H
// ui/browser/years.js

/**
 * B"H
 * Years are mountain-gates. Opening a whole year does not force the browser to
 * manufacture a giant local zip; it sends the seeker to archive.org itself,
 * where the year already stands as a complete vessel.
 */
export function renderYears(years, onSelect) {
  const list = document.getElementById('list-years');
  if (!list) return;
  list.innerHTML = '';
  Object.entries(years).forEach(([year, archiveId]) => list.appendChild(yearRow(year, archiveId, onSelect)));
}

function yearRow(year, archiveId, onSelect) {
  const row = document.createElement('div');
  row.className = 'item year-item';
  row.appendChild(label(year));
  row.appendChild(openArchiveButton(archiveId));
  row.onclick = () => {
    document.querySelectorAll('.year-item').forEach(item => item.classList.remove('active'));
    row.classList.add('active');
    onSelect(year);
  };
  return row;
}

function label(year) {
  const content = document.createElement('div');
  content.style.flex = '1';
  content.innerHTML = `<span class="icon">📁</span> <span class="item-text" style="font-family:monospace;">${year}</span>`;
  return content;
}

function openArchiveButton(archiveId) {
  const button = document.createElement('button');
  button.innerHTML = '🌐';
  button.className = 'mini-btn';
  button.title = 'Open whole year on Archive.org';
  button.onclick = event => {
    event.stopPropagation();
    window.open(`https://archive.org/details/${archiveId}`, '_blank');
  };
  return button;
}
