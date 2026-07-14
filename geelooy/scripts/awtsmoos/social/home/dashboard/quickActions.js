// B"H
export function bindQuickActions() {
  document.querySelectorAll('.home-action-card').forEach(card => {
    card.addEventListener('pointerdown', () => card.dataset.pressed = 'true');
    card.addEventListener('pointerup', () => delete card.dataset.pressed);
    card.addEventListener('pointercancel', () => delete card.dataset.pressed);
  });
}
