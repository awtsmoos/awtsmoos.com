// B"H
/**
 * DiscoveryNotificationRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function notifyDiscovery(id,title){ const detail={id,title,at:Date.now()}; globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:discovery',{detail})); return detail; }
export default { notifyDiscovery };
