// B"H
export const createState = initialPath => ({
  currentPath: initialPath || '/',
  viewMode: 'icons',
  density: 'comfortable',
  theme: 'night-graph',
  sort: { by:'name', order:'asc' },
  selectionMode: false,
  remoteMode: String(initialPath || '').startsWith('awtsmoos://'),
  loading: false,
  error: '',
  items: []
});

/** B"H: state is small again; meaning lives in the controller and render model. */
