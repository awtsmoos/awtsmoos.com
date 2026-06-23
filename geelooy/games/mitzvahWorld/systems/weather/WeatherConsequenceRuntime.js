// B"H
/** @file WeatherConsequenceRuntime.js @description Weather leaves mud, drought, storm damage, and story hooks. */
export function createWeatherConsequenceRuntime(memory = globalThis.__MITZVAH_WORLD_MEMORY__, environment = globalThis.__MITZVAH_ENVIRONMENT_WEAR__) {
  const history = [];
  function record(kind, severity = 1, target = 'world') { const e = { kind, severity, target, at:Date.now() }; history.push(e); memory?.weather?.record?.(kind, e); if (kind === 'rain') environment?.mark?.(target, 'mud', severity); if (kind === 'storm') environment?.mark?.(target, 'damage', severity); return e; }
  function drought(target = 'world', severity = 1) { return record('drought', severity, target); }
  function rain(target = 'world', severity = 1) { return record('rain', severity, target); }
  function storm(target = 'world', severity = 1) { return record('storm', severity, target); }
  function report() { return { events:history.length, recent:history.slice(-5) }; }
  return { record, drought, rain, storm, report, history };
}
export default createWeatherConsequenceRuntime;
