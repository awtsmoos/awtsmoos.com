// B"H
/** @file npcOverlayActions.js @description NPC overlay actions never block the game with dialogs. */
import { bindPress, closePanels } from './domKit.js';
import { launchLevel } from './levelLauncher.js';
import { openShopOverlay } from './shopOverlay.js';
function sendOlam(manager, peula) { manager?.eved?.postMessage?.({ olamPeula:peula }); }
function notice(manager, text, error) { console.error('B"H | NPC_ACTION_FAILED', { text, message:error?.message || String(error || '') }); manager?.eved?.postMessage?.({ olamPeula:{ uiNotice:{ text, color:'#ffd95a' } } }); }
async function safeLaunch(manager, level) { try { closePanels(); await launchLevel(manager, level); } catch (error) { notice(manager, 'Could not load that path yet.', error); } }
export function bindNpcOverlayActions(overlay, manager, data, openLevelSelect) {
  bindPress(overlay, e => { if (e.target === overlay) closePanels(e); });
  bindPress(overlay.querySelector('[data-npc-close]'), closePanels);
  bindPress(overlay.querySelector('[data-npc-choose]'), () => openLevelSelect(manager, { ...data, title:data.selectorTitle || 'NPC CHALLENGES' }));
  bindPress(overlay.querySelector('[data-npc-travel]'), () => safeLaunch(manager, data.travelPath));
  bindPress(overlay.querySelector('[data-npc-buy]'), () => openShopOverlay(manager, data, 'buy'));
  bindPress(overlay.querySelector('[data-npc-sell]'), () => openShopOverlay(manager, data, 'sell'));
  bindPress(overlay.querySelector('[data-npc-mission]'), () => { sendOlam(manager, { acceptVillageMission:{ missionId:data.missionId } }); closePanels(); });
  bindPress(overlay.querySelector('[data-npc-skill]'), () => { sendOlam(manager, { learnNpcSkill:{ skillId:data.learnSkillId } }); closePanels(); });
  overlay.querySelectorAll('[data-level-id]').forEach(btn => bindPress(btn, () => safeLaunch(manager, btn.dataset.levelId)));
}
