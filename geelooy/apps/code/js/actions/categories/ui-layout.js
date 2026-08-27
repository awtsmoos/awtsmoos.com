
// B"H
import { ViewActions } from '../view.js';
import { App } from '../../app.js';

export const UI_LAYOUT_ACTIONS = {
    'refresh': async () => {
        const { Workspaces } = await import('../../workspaces/index.js');
        Workspaces.render();
    },
    'toggle-theme': () => ViewActions.toggleTheme(),
    'toggle-fullscreen': () => ViewActions.toggleFullscreen(),
    'zen-mode': () => ViewActions.zenMode(),
    'settings': () => ViewActions.showSettings(),
    'visual-settings': () => ViewActions.visualSettings(),
    'toggle-keyboard-helper': () => ViewActions.toggleKeyboardHelper(),
    'commit-changes': async () => {
        App.commitAllChanges();
    },
    'show-docs': () => ViewActions.showDocs(),
    'find-replace': () => ViewActions.findReplace(),
    'command-palette': () => {
        import('../../command-palette.js').then(m => m.CommandPalette.toggle());
    },
    'toggle-matrix': () => {
        import('../../effects.js').then(m => m.Effects.toggleMatrix());
    },
    'toggle-power': () => {
        import('../../effects.js').then(m => m.Effects.togglePowerMode());
    },
    'toggle-sonic': () => {
        import('../../effects.js').then(m => m.Effects.toggleSonic());
    },
    'toggle-entropy': () => {
        import('../../effects.js').then(m => m.Effects.toggleEntropy());
    },
    'toggle-spotlight': () => {
        import('../../effects.js').then(m => m.Effects.toggleSpotlight());
    },
    'voice-command': () => {
        import('../../effects.js').then(m => m.Effects.voiceCommand());
    }
};
