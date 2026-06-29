// B"H
export const createState = initialPath => ({ currentPath: initialPath || '/', viewMode: 'icons', sort: { by: 'name', order: 'asc' }, columnWidths: ['2fr', '1fr', '1fr'], selectionMode: false, remoteMode: String(initialPath || '').startsWith('awtsmoos://') });
