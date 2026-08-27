// B"H
export class ClipMenuMap {
  static getOptions() {
    return [
      { label: 'Split Clip', icon: '✂️', actionKey: 'split_clip' },
      { label: 'Duplicate', icon: '📋', actionKey: 'duplicate_clip' },
      'divider',
      { label: 'Delete', icon: '🗑️', actionKey: 'delete_clip' },
      { label: 'Ripple Delete', icon: '🌊', actionKey: 'ripple_delete_clip' }
    ];
  }
}