// B"H
export class WeatherState {
  static get(time) {
    return {
      rainIntensity: 0.5 + Math.sin(time * 0.0001) * 0.5,
      windSpeed: 2 + Math.cos(time * 0.00005) * 5
    };
  }
}
