
// B"H
import { CommandPaletteState } from './CommandPaletteState.js';
import { CommandRegistry } from './CommandRegistry.js';
import { CommandFuzzySearch } from './CommandFuzzySearch.js';

export class CommandPaletteRenderer {
  static render(appCore, manager) {
    const allCommands = CommandRegistry.getCommands(appCore);
    const filtered = CommandFuzzySearch.filter(allCommands, CommandPaletteState.searchQuery);

    const inputNode = {
      tag: 'input',
      attr: {
        id: 'cmd-palette-input',
        className: 'cmd-input',
        type: 'text',
        placeholder: 'Speak your intent to the Awtsmoos...',
        value: CommandPaletteState.searchQuery,
        autocomplete: 'off'
      },
      events: {
        input: (e) => {
          CommandPaletteState.searchQuery = e.target.value;
          CommandPaletteState.selectedIndex = 0;
          manager.triggerRefresh();
          // Keep focus
          setTimeout(() => { document.getElementById('cmd-palette-input')?.focus(); }, 10);
        },
        keydown: (e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            CommandPaletteState.selectedIndex = Math.min(filtered.length - 1, CommandPaletteState.selectedIndex + 1);
            manager.triggerRefresh();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            CommandPaletteState.selectedIndex = Math.max(0, CommandPaletteState.selectedIndex - 1);
            manager.triggerRefresh();
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const selectedCmd = filtered[CommandPaletteState.selectedIndex];
            if (selectedCmd) {
              selectedCmd.execute();
              manager.hide();
            }
          }
        }
      }
    };

    const resultsNode = {
      tag: 'div',
      attr: { className: 'cmd-results' },
      children: filtered.length > 0 ? filtered.map((cmd, idx) => ({
        tag: 'div',
        attr: { className: `cmd-item ${idx === CommandPaletteState.selectedIndex ? 'active' : ''}` },
        events: {
          click: () => {
            cmd.execute();
            manager.hide();
          },
          mouseover: () => {
            CommandPaletteState.selectedIndex = idx;
            manager.triggerRefresh();
          }
        },
        children: [
          { tag: 'span', attr: { className: 'cmd-icon' }, children: cmd.icon },
          { tag: 'div', attr: { className: 'cmd-text-col' }, children: [
            { tag: 'span', attr: { className: 'cmd-title' }, children: cmd.title },
            { tag: 'span', attr: { className: 'cmd-category' }, children: cmd.category }
          ]}
        ]
      })) : [{ tag: 'div', attr: { className: 'cmd-empty' }, children: 'No echoes found in the void.' }]
    };

    return {
      tag: 'div',
      attr: { className: 'cmd-palette-box glass-heavy anim-slide-down' },
      children: [inputNode, resultsNode]
    };
  }
}
