// B"H
/**
 * @file worldStartDispatcher.js
 * @description Chapter 368: Starting a world is either delegated to the manager
 * or emitted through the ikar start event.
 */
import { q } from './domKit.js';
export async function dispatchWorldStart(manager, clean, data) {
  q('loading')?.classList.remove('hidden');
  const owner = manager?._managerOfAllWorlds || window.mana;
  const detail = { worldDayuh: data, sourcePath: clean, gameUiHTML: window.awtsmoosGameUI };
  if (owner?.startWorld) return Boolean(await owner.startWorld(detail) || true);
  const ikar = q('ikar') || document.body.querySelector("[shaym='ikar']");
  if (!ikar) throw new Error('ikar element missing and manager unavailable');
  ikar.dispatchEvent(new CustomEvent('start', { detail }));
  return true;
}
