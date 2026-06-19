
// B"H
import { PersistentReality } from '../../state/PersistentReality.js';
import { CommandRegistryExtensions } from './CommandRegistryExtensions.js';

export class CommandRegistry {
  static getCommands(appCore) {
    const baseCommands = [
      {
        id: 'cmd_play',
        title: 'Play / Pause Sequence',
        category: 'Playback',
        icon: '▶',
        execute: () => {
          if (appCore.director.isPlaying) appCore.director.stop();
          else appCore.director.play(appCore.state.get('activeSequence'));
        }
      },
      {
        id: 'cmd_add_char',
        title: 'Spawn New Character',
        category: 'Entities',
        icon: '👤',
        execute: () => {
          const chars = appCore.state.get('characters') || {};
          const newId = 'c' + Date.now().toString().slice(-4);
          chars[newId] = { position: { x: 0, y: 0 }, view: 'front', colors: { skin: '#ffdbac' } };
          appCore.state.set('characters', chars);
        }
      },
      {
        id: 'cmd_weather_rain',
        title: 'Set Weather: Rain',
        category: 'Environment',
        icon: '🌧️',
        execute: () => {
          const scene = appCore.state.get('scene') || {};
          scene.weatherParams = { rain: 1.0, wind: 2.0 };
          appCore.state.set('scene', scene);
        }
      },
      {
        id: 'cmd_tohu',
        title: 'Purge Universe (Tohu Va-Vohu)',
        category: 'Danger',
        icon: '☢',
        execute: () => {
          appCore.state.set('activeSequence', { duration: 10000, events: [] });
          PersistentReality.obliterate();
        }
      },
      {
        id: 'cmd_export',
        title: 'Export Video (MP4)',
        category: 'System',
        icon: '💾',
        execute: () => {
          const btn = document.getElementById('btn-export-toggle');
          if (btn) btn.click();
        }
      }
    ];

    return CommandRegistryExtensions.attach(baseCommands);
  }
}
