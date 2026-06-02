// B"H

/**
 * Structured render snapshots for the worker bridge.
 *
 * Chapter 13: The Awtsmoos found the missing letters. Plain rectangles may
 * cross as numbers, but a death burst is a nest of particles, and stripping its
 * children makes the explosion vanish. Now the shatter carries every visible
 * otiyah through the worker while distant bodies remain silent outside view.
 */
export function cloneShape(source) {
  if (!source) return null;
  const clone = {};
  for (const [key, value] of Object.entries(source)) if (['number', 'string', 'boolean'].includes(typeof value)) clone[key] = value;
  return clone;
}

/** @param {Array<object>} list source list @param {object|null} win viewport window @returns {Array<object>} cloned list */
export function cloneList(list, win = null) { return (list || []).filter(item => !win || nearWindow(item, win)).map(cloneShape).filter(Boolean); }

/** @param {Array<object>} bursts death bursts @returns {Array<object>} burst clones with particles */
export function cloneBursts(bursts = []) {
  return bursts.map(burst => ({
    x: Number(burst.x || 0),
    y: Number(burst.y || 0),
    reason: burst.reason || '',
    life: Number(burst.life || 0),
    particles: (burst.particles || []).map(cloneShape).filter(Boolean)
  })).filter(burst => burst.particles.length);
}

/** @param {object} world active PhysicsWorld @param {object} viewport visible browser measure @returns {object} render snapshot */
export function toRenderSnapshot(world, viewport) {
  const camera = { x: Number(world.deathPause?.cameraX ?? world.visibleCameraX ?? 0), y: Number(world.deathPause?.cameraY ?? world.visibleCameraY ?? 0) };
  const win = renderWindow(camera, viewport, 520);
  return {
    viewport, player: cloneShape(world.player), level: cloneLevel(world.level, win), message: world.message || '', market: { message: world.market?.message || '' },
    performance: { ...(world.performance || {}) }, width: world.width || world.level?.width || 960, levelElapsed: world.levelElapsed || 0,
    realCoinsCollected: world.realCoinsCollected || 0, realCoinTotal: world.realCoinTotal || 0, keyCount: world.keyCount || 0,
    deathPause: cloneDeathPause(world.deathPause), deathBursts: cloneBursts(world.deathBursts || []), enemies: cloneList(world.enemies || [], win),
    coins: cloneList(world.coins || [], win), fakeCoins: cloneList(world.fakeCoins || [], win), trickCoinList: cloneList(world.trickCoins?.coins || [], win), keys: cloneList(world.keys || [], win),
    rotorBodies: cloneList(world.rotors?.bodies?.() || [], win), trickBodies: cloneList(world.tricks?.bodies?.() || [], win),
    trickVisualBodies: cloneList(world.tricks?.visualBodies?.() || [], win), trickHazardBodies: cloneList(world.tricks?.hazardBodies?.() || [], win),
    spikeDormant: cloneList(world.spikes?.dormant?.() || [], win), spikeWarning: cloneList(world.spikes?.warning?.() || [], win), spikeActive: cloneList(world.spikes?.active?.() || [], win),
    curseWarning: cloneList(world.momentumCurse?.warning?.() || [], win), curseActive: cloneList(world.momentumCurse?.active?.() || [], win), canExitNow: Boolean(world.canExit?.())
  };
}

function cloneLevel(level = {}, win = null) { return { name: level.name || '', law: level.law || '', width: level.width || 960, door: cloneShape(level.door) || { x: 0, y: 0, w: 40, h: 70 }, platforms: cloneList(level.platforms || [], win), groundY: level.groundY || 540 }; }
function cloneDeathPause(deathPause) { if (!deathPause) return null; return { promptAlpha: Number(deathPause.promptAlpha || 0), ready: Boolean(deathPause.ready), cameraX: deathPause.cameraX, cameraY: deathPause.cameraY }; }
function renderWindow(camera, viewport = {}, margin = 520) { const width = Number(viewport.width || 960), height = Number(viewport.height || 540); return { left: camera.x - margin, right: camera.x + width + margin, top: camera.y - margin, bottom: camera.y + height + margin }; }
function nearWindow(item, win) { const x = Number(item?.x || 0), y = Number(item?.y || 0), w = Number(item?.w || 28), h = Number(item?.h || 28); return x + w >= win.left && x <= win.right && y + h >= win.top && y <= win.bottom; }
