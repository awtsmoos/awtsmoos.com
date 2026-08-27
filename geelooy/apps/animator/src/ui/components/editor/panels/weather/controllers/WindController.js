// B"H
import { WeatherRegistry } from '../data/WeatherRegistry.js';

export class WindController {
  static render(state) {
    const config = WeatherRegistry.wind;
    const val = state.get('scene')?.weatherParams?.wind || 0;
    return {
      tag: 'div', attr: { className: 'weather-ctrl flex-col gap-2' },
      children: [
        { tag: 'label', attr: { className: 'text-mono text-xs text-bold' }, children: `${config.icon} ${config.label}` },
        { tag: 'input', attr: { type: 'range', min: config.min, max: config.max, step: config.step, value: val, className: 'range-input' },
          events: { input: (e) => {
            const scene = state.get('scene') || {};
            scene.weatherParams = scene.weatherParams || {};
            scene.weatherParams.wind = parseFloat(e.target.value);
            state.set('scene', scene);
          }}
        }
      ]
    };
  }
}