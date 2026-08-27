// B"H
/** Chapter 558: Sparks fall through the visual layer and open their payloads. */
function label(event) { return String(event?.type || 'civilization.event').toUpperCase(); }
function priority(event) { return Number(event?.priority || 0) >= 5 ? 'hot' : 'normal'; }
function left() { return `${Math.max(8, Math.floor(Math.random() * (innerWidth - 180)))}px`; }
export const CivilizationEventRain = {
  layer: null,
  init() { this.layer = document.getElementById('visual-layer') || document.body; },
  spark(event, onOpen) {
    if (!this.layer) this.init();
    const node = document.createElement('button');
    node.className = 'civilization-event-spark';
    node.dataset.priority = priority(event);
    node.textContent = label(event);
    node.style.left = left();
    node.style.top = '-28px';
    node.onclick = () => onOpen?.(event);
    node.addEventListener('animationend', () => node.remove());
    this.layer.appendChild(node);
    return node;
  },
  sprinkle(events = [], onOpen) { for (const event of events.slice(0, 5)) this.spark(event, onOpen); }
};
