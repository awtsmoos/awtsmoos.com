
// B"H
export class HUDIndicatorDot {
  static render(isPlaying) {
    const color = isPlaying ? 'var(--accent-primary)' : 'var(--accent-warn)';
    return `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; box-shadow: 0 0 10px ${color};"></div>`;
  }
}
