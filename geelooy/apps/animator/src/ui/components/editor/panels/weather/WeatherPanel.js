// B"H
import { RainController } from './controllers/RainController.js';
import { WindController } from './controllers/WindController.js';
import { HeatController } from './controllers/HeatController.js';
import { TimeController } from './controllers/TimeController.js';

export class WeatherPanel {
  static render(state) {
    return {
      tag: 'div',
      attr: { className: 'weather-panel-root flex-col gap-4' },
      children: [
        { tag: 'h4', attr: { className: 'text-uppercase text-mono text-bold', style: { color: 'var(--accent-primary)', marginBottom: '10px' } }, children: 'ENVIRONMENT SETTINGS' },
        TimeController.render(state),
        RainController.render(state),
        WindController.render(state),
        HeatController.render(state)
      ]
    };
  }
}