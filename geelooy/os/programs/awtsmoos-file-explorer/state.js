// B"H
export const createState = initialPath => ({
  currentPath: initialPath || '/',
  viewMode: 'icons',
  density: 'comfortable',
  theme: 'xp-classic',
  sort: { by:'name', order:'asc' },
  filter: '',
  selectionMode: false,
  remoteMode: String(initialPath || '').startsWith('awtsmoos://'),
  history: { back:[], forward:[] },
  loading: false,
  error: '',
  items: []
});
/** B"H: state now remembers XP theme, history, filter, sort, and selection. */
