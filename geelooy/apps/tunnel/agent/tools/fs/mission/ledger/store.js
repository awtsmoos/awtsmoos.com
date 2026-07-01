// B"H
const fsp = require('fs/promises');
const Paths = require('./paths.js');

/** B"H: small JSON ledger store; durable, boring, and honest. */
async function save(config, mission) {
  await Paths.ensure(config);
  await fsp.writeFile(Paths.missionPath(config, mission.missionId), JSON.stringify(mission, null, 2), 'utf8');
  return mission;
}

async function load(config, missionId) {
  try { return JSON.parse(await fsp.readFile(Paths.missionPath(config, missionId), 'utf8')); }
  catch { return null; }
}

async function list(config) {
  await Paths.ensure(config);
  const names = await fsp.readdir(Paths.root(config)).catch(() => []);
  const missions = [];
  for (const name of names.filter(x => x.endsWith('.json'))) {
    try { missions.push(JSON.parse(await fsp.readFile(`${Paths.root(config)}/${name}`, 'utf8'))); } catch (_) {}
  }
  return missions.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
}

module.exports = { save, load, list };
