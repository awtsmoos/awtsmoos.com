
/* B”H */
import { HTMLGenerator } from '../../core/ui/HTMLGenerator.js';

/**
 * @class PropertyInspector
 * @description
 * THE KISEH HAMISHPAT (Throne of Judgment). 
 * Now allows the user to easily forge entire new characters into existence 
 * through the NLE Editor interface, complete with position and animation tracking.
 */
export class PropertyInspector {
  static show(event, container, state, app) {
    container.innerHTML = '';
    const jsonStr = JSON.stringify(event, null, 2);

    const content = HTMLGenerator.generate({
      tag: 'div',
      attr: { className: 'inspector-content', style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
      children: [
        { tag: 'h2', attr: { style: { color: 'var(--accent-primary)', fontSize: '0.8rem' } }, children: 'INSPECT_SPARK' },
        { tag: 'div', attr: { className: 'prop-row' }, children: `TYPE: ${event.type}` },
        { tag: 'textarea', attr: { id: 'clip-json-editor', className: 'prop-editor-json' }, children: jsonStr },
        { 
          tag: 'button', 
          attr: { className: 'btn btn-primary' }, 
          children: 'APPLY MODIFICATIONS',
          events: {
            click: () => {
              const area = container.querySelector('#clip-json-editor');
              try {
                const newEvent = JSON.parse(area.value);
                const seq = state.get('activeSequence');
                
                const index = seq.events.findIndex(e => e === event || (e.id === event.id && e.start === event.start));
                if (index !== -1) seq.events[index] = newEvent;
                else seq.events.push(newEvent); 
                
                state.set('activeSequence', seq);
                app.director.play(seq); 
                if (app.timeline) app.timeline.refreshTracks();
              } catch (e) {
                alert('B"H - Syntax Error in the Divine Decree: ' + e.message);
              }
            }
          }
        },
        {
          tag: 'button',
          attr: { className: 'btn', style: { border: '1px solid #ff0055', color: '#ff0055' } },
          children: 'DELETE SPARK',
          events: {
            click: () => {
              const seq = state.get('activeSequence');
              seq.events = seq.events.filter(e => e !== event && !(e.id === event.id && e.start === event.start));
              state.set('activeSequence', seq);
              app.director.play(seq);
              if (app.timeline) app.timeline.refreshTracks();
              container.innerHTML = '<div style="color:#aaa; font-size:0.6rem;">Spark returned to the void.</div>';
            }
          }
        }
      ]
    });
    container.appendChild(content);
  }

  static showForgeTemplate(state, app) {
    const panel = document.getElementById('prop-panel');
    const container = panel.querySelector('.prop-content');
    container.innerHTML = '';
    
    // Quick templates for the user
    const templateChar = {
      type: "character", id: "new_guy", start: 0, end: 5000, 
      pos: { from: {x:-500, y:0}, to: {x:0, y:0} },
      actions: [{ at: 0, key: "isWalking", value: true }]
    };

    const content = HTMLGenerator.generate({
      tag: 'div',
      attr: { className: 'inspector-content', style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
      children: [
        { tag: 'h2', attr: { style: { color: 'var(--accent-secondary)', fontSize: '0.8rem' } }, children: 'FORGE_NEW_SPARK' },
        { tag: 'div', attr: { style: { fontSize: '0.6rem', color: 'var(--text-muted)' } }, children: 'Define the JSON structure of your new event.' },
        
        { tag: 'textarea', attr: { id: 'forge-json-editor', className: 'prop-editor-json' }, children: JSON.stringify(templateChar, null, 2) },
        
        { 
          tag: 'button', 
          attr: { className: 'btn btn-primary' }, 
          children: 'INJECT INTO TIMELINE',
          events: {
            click: () => {
              const area = container.querySelector('#forge-json-editor');
              try {
                const newEvent = JSON.parse(area.value);
                const seq = state.get('activeSequence');
                seq.events.push(newEvent);
                
                // If it's a new character, ensure they exist in global state too
                if (newEvent.type === 'character') {
                  const chars = state.get('characters') || {};
                  if (!chars[newEvent.id]) {
                    chars[newEvent.id] = app.director.getDefaultChar();
                    state.set('characters', chars, true);
                  }
                }

                state.set('activeSequence', seq);
                app.director.play(seq);
                if (app.timeline) app.timeline.refreshTracks();
                
                panel.classList.remove('visible');
              } catch (e) {
                alert('B"H - Syntax Error: ' + e.message);
              }
            }
          }
        }
      ]
    });
    container.appendChild(content);
  }
}
