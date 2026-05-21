/**
 * B"H
 * Chapter 30: Rain Wrote Emerald Letters On Stone.
 */

export class DynamicWeatherRuntime {
  constructor(states = ['clear', 'fog', 'rain', 'storm']) {
    this.states = states;
    this.index = 0;
  }

  current() {
    const name = this.states[this.index];
    return {
      name,
      wetness: name === 'rain' || name === 'storm' ? 1 : 0,
      visibility: name === 'fog' ? 0.45 : 1
    };
  }

  advance() {
    this.index = (this.index + 1) % this.states.length;
    return this.current();
  }
}

export default DynamicWeatherRuntime;
