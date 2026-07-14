// B"H
export function bindSearchFocus() {
  const trigger = document.querySelector('[data-home-open-search]');
  const input = document.getElementById('home-global-search');
  if (!trigger || !input) return;
  trigger.addEventListener('click', () => input.focus());
}
