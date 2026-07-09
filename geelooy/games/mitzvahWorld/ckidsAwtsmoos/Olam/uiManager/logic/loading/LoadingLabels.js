// B"H
/** Human labels for the loader chapter the player is living through. */
function lower(stage) { return String(stage || '').toLowerCase(); }
function has(stage, words) { const s = lower(stage); return words.some(word => s.includes(word)); }
function detailFrom(data) {
  if (data.detail) return String(data.detail);
  if (data.details) return String(data.details);
  if (data.module) return 'Module: ' + data.module;
  if (data.url) return 'Fetching: ' + String(data.url).split('/').slice(-3).join('/');
  return '';
}

export function label(stage, data = {}) {
  const name = lower(stage);
  if (data.humanLabel) return String(data.humanLabel);
  if (has(name, ['fatal', 'error', 'oyved_import'])) return 'Load error detected — showing diagnostic details';
  if (has(name, ['workerboot', 'entrypoint', 'angelic-invoker:start'])) return 'Starting worker boot sequence';
  if (has(name, ['import-vessels', 'olam core', 'vessel'])) return 'Loading Olam core vessel';
  if (has(name, ['graft-start', 'grafting'])) return 'Attaching world abilities to Olam';
  if (has(name, ['threemodule', 'renderer', 'canvas'])) return 'Connecting renderer and canvas';
  if (has(name, ['terrain'])) return 'Building terrain and ground collision';
  if (has(name, ['octree', 'collision', 'physics'])) return 'Preparing collision and physics';
  if (has(name, ['npc', 'nivrayim', 'entities'])) return 'Loading characters and world entities';
  if (has(name, ['combat'])) return 'Preparing combat runtime';
  if (has(name, ['texture', 'material', 'paint'])) return 'Preparing textures and materials';
  if (has(name, ['postbuild', 'polish'])) return 'Running post-build world polish';
  if (has(name, ['loadedworld'])) return 'World data received; waiting for playable frame';
  if (has(name, ['ready', 'playable', 'first-playable'])) return 'Confirming first playable frame';
  if (has(name, ['background'])) return 'Still loading in the background';
  return 'Preparing Mitzvah World';
}

export function detail(stage, data = {}) {
  const specific = detailFrom(data);
  if (specific) return specific;
  const name = lower(stage);
  if (data.subAction) return String(data.subAction);
  if (data.action && data.action !== label(stage, data)) return String(data.action);
  if (has(name, ['fatal', 'error'])) return 'The loader stopped waiting and exposed the exact error below.';
  if (has(name, ['workerboot', 'entrypoint'])) return 'Creating module worker, binding message channel, and checking the boot imports.';
  if (has(name, ['import-vessels', 'vessel'])) return 'Fetching OlamVessel and its boot-safe dependencies.';
  if (has(name, ['graft'])) return 'Loading world methods one by one so parser errors reveal their module.';
  if (has(name, ['terrain'])) return 'Generating ground, terrain visuals, safety floor, and collision faces.';
  if (has(name, ['collision', 'octree', 'physics'])) return 'Building spatial lookup, capsule contacts, and player physics guards.';
  if (has(name, ['npc', 'nivrayim', 'entities'])) return 'Instantiating characters, trees, houses, pickups, and interactive objects.';
  if (has(name, ['texture', 'material'])) return 'Loading or generating textures; gameplay waits only for required materials.';
  if (has(name, ['postbuild', 'polish'])) return 'Auditing houses, trees, portals, and runtime visual guarantees.';
  if (has(name, ['playable', 'ready'])) return 'Waiting for the first rendered playable frame before hiding this screen.';
  return 'Reading boot signals from the worker; details update whenever the subsystem changes.';
}

export function logLine(stage, data = {}) {
  const bits = [label(stage, data), detail(stage, data)];
  if (data.percent != null) bits.push('texture ' + Math.round(Number(data.percent)) + '%');
  if (data.total != null) bits.push('overall ' + Math.round(Number(data.total)) + '%');
  return bits.filter(Boolean).join(' | ');
}
