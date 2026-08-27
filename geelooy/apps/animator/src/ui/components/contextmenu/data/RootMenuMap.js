// B"H
export class RootMenuMap {
  static getOptions() {
    return [
      { label: 'Add Character', icon: '👤', actionKey: 'add_char' },
      { label: 'Add Prop', icon: '📦', actionKey: 'add_prop' },
      'divider',
      { label: 'Reset Camera', icon: '🏠', actionKey: 'reset_cam' }
    ];
  }
}