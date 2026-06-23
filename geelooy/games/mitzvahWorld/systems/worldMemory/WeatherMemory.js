// B"H
/** @file WeatherMemory.js @description Weather leaves memory: mud, drought, storms, wetness. */
export function createWeatherMemory(store, events) {
  function record(kind, data = {}) {
    events?.record?.(`weather-${kind}`, data);
    return store.remember(`weather-${kind}`, 'weather', data);
  }
  function recent(kind = null) {
    return store.database.query({ target:'weather' }).filter(f => !kind || f.kind === `weather-${kind}`);
  }
  function wetness() { return store.score('weather-rain', 'weather', 'amount') - store.score('weather-drought', 'weather', 'severity'); }
  return { record, recent, wetness };
}
export default createWeatherMemory;
