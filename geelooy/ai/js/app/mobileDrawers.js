//B"H
/**
 * Chapter 42: The Awtsmoos revealed that mobile is not a tiny desktop.
 * Each panel becomes its own world-scene, opened through a bottom dock.
 */
const MOBILE_QUERY = '(max-width: 760px)';
const SCENES = ['chat','conversations','automation'];

export function mountMobileScenes(dom = {}) {
  const sync = () => applyScene(document.body.dataset.mobileScene || 'chat', dom);
  matchMedia(MOBILE_QUERY)?.addEventListener?.('change', sync);
  sync();
  return {
    openChat: () => applyScene('chat', dom),
    openConversationDrawer: () => applyScene('conversations', dom),
    openAutomationDrawer: () => applyScene('automation', dom)
  };
}

export function openConversationDrawer(dom = {}) {
  applyScene('conversations', dom);
}

export function closeAutomationDrawer(dom = {}) {
  applyScene('chat', dom);
}

function applyScene(scene, dom) {
  const mobile = matchMedia(MOBILE_QUERY)?.matches;
  if (!mobile) return clearScenes(dom);
  document.body.dataset.mobileScene = SCENES.includes(scene) ? scene : 'chat';
  dom.sidebar?.classList.toggle('mobile-scene-active', scene === 'conversations');
  dom.automationPanel?.classList.toggle('mobile-scene-active', scene === 'automation');
  dom.main?.classList.toggle('mobile-scene-active', scene === 'chat');
}

function clearScenes(dom) {
  delete document.body.dataset.mobileScene;
  dom.sidebar?.classList.remove('mobile-scene-active');
  dom.automationPanel?.classList.remove('mobile-scene-active');
  dom.main?.classList.remove('mobile-scene-active');
}
