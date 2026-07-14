// B"H
export function hydrateFeedMetrics() {
  const cards = document.querySelectorAll('.home-feed-metrics article');
  cards.forEach((card, index) => card.style.setProperty('--metric-index', String(index)));
}
