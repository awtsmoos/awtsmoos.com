// B"H
/** Opens one command/search surface from any Geelooy chamber. */
const SOURCES = ['Posts', 'Series', 'People', 'Aliases', 'Heichelos', 'Mail', 'Commands', 'Media'];
const COMMANDS = [
  ['Create post', '/heichelos/submit'],
  ['Open mail', '/email'],
  ['Browse Heichelos', '/heichelos'],
  ['Open profile', '/profile']
];
export function bindSpotlight(root = document) {
  const host = ensureSpotlight();
  const open = () => { document.body.dataset.geelooySpotlightOpen = 'true'; host.querySelector('input')?.focus(); };
  const close = () => { document.body.dataset.geelooySpotlightOpen = 'false'; };
  root.addEventListener('click', event => {
    if (event.target.closest('[data-home-open-search], [data-geelooy-open-search]')) open();
    if (event.target.closest('[data-geelooy-close-search]')) close();
  });
  root.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); open(); }
    if (event.key === 'Escape') close();
  });
}
function ensureSpotlight() {
  let host = document.querySelector('.geelooy-spotlight');
  if (host) return host;
  host = document.createElement('section');
  host.className = 'geelooy-spotlight';
  host.setAttribute('role', 'dialog');
  host.setAttribute('aria-label', 'Search Geelooy');
  host.innerHTML = `${searchMarkup()}${sourceMarkup()}${commandMarkup()}`;
  document.body.appendChild(host);
  return host;
}
function searchMarkup() {
  return '<div class="geelooy-search"><span>⌕</span><input type="search" placeholder="Search posts, series, people, mail, commands..."><button type="button" data-geelooy-close-search>Close</button></div>';
}
function sourceMarkup() {
  return `<div class="geelooy-spotlight-sources" aria-label="Search sources">${SOURCES.map(source => `<span class="geelooy-chip">${source}</span>`).join('')}</div>`;
}
function commandMarkup() {
  return `<nav class="geelooy-spotlight-commands" aria-label="Quick commands">${COMMANDS.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}</nav>`;
}
export function spotlightSources() { return [...SOURCES]; }
