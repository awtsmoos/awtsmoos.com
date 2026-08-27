
/**
 * @file TaskManifestor.js
 * @description
 * THE SCRIBE'S BREATH (Nishmat HaSofer).
 * This class handles the "taking its time" aspect of the UI. When a trait is 
 * changed, it doesn't just snap into existence; it manifests through a 
 * simulated spiritual forge.
 */

import { HTMLGenerator } from './HTMLGenerator.js';

export class TaskManifestor {
  /**
   * Spawns a manifestation task overlay.
   * @param {string} title - The name of the vessel being forged.
   * @param {number} count - Number of sub-items (Nations/Sparks).
   * @returns {Promise<void>} Resolves when manifestation is 100%.
   */
  static async manifest(title, count = 10) {
    const mount = document.getElementById('hud-overlay');
    if (!mount) return;

    const taskId = `task-${Date.now()}`;
    const schema = {
      tag: 'div',
      attr: { id: taskId, className: 'manifest-task-vessel' },
      children: [
        {
          tag: 'div',
          attr: { className: 'task-header' },
          children: [
            { tag: 'span', attr: { className: 'task-title' }, children: `MANIFESTING: ${title}` },
            { tag: 'span', attr: { id: `${taskId}-pct`, className: 'task-pct' }, children: '0%' }
          ]
        },
        {
          tag: 'div',
          attr: { className: 'task-bar-outer' },
          children: [{ tag: 'div', attr: { id: `${taskId}-bar`, className: 'task-bar-inner' } }]
        },
        { tag: 'div', attr: { id: `${taskId}-log`, className: 'task-log' } }
      ]
    };

    const el = HTMLGenerator.generate(schema);
    mount.appendChild(el);

    const bar = el.querySelector(`#${taskId}-bar`);
    const pct = el.querySelector(`#${taskId}-pct`);
    const log = el.querySelector(`#${taskId}-log`);

    const nations = ['Keter', 'Chochmah', 'Binah', 'Chessed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malchut'];

    for (let i = 0; i <= count; i++) {
      const progress = (i / count) * 100;
      bar.style.width = `${progress}%`;
      pct.innerText = `${Math.floor(progress)}%`;
      
      const spark = nations[i % nations.length];
      log.innerText = `Solidifying Nation: ${spark}...`;
      
      // The time it takes to match reality
      await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
    }

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
      setTimeout(() => el.remove(), 500);
    }, 1000);
  }
}
