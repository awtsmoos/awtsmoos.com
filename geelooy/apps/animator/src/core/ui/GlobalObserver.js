
// B"H
import { TooltipManager } from '../../ui/components/tooltip/TooltipManager.js';
import { ContextMenuManager } from '../../ui/components/contextmenu/ContextMenuManager.js';
import { CommandPaletteManager } from './command-palette/CommandPaletteManager.js';
import { ToastManager } from './toast/ToastManager.js';
import { PerformanceMonitor } from '../perf/PerformanceMonitor.js';
import { HistoryPanelManager } from './history/HistoryPanelManager.js';

/**
 * @class GlobalObserver
 * @description
 * Awakens the divine UI overlays (Tooltips, Right-click menus, Oracles)
 * immediately after the core tabernacle is established.
 */
export class GlobalObserver {
  static awaken(appState, appCore) {
    console.log('B"H - [GlobalObserver] Emanating interactive UI overlays.');
    
    TooltipManager.init();
    ContextMenuManager.init(appState, appCore);
    CommandPaletteManager.init(appCore);
    ToastManager.init();
    PerformanceMonitor.init(appState);

    // Give the DOM a millisecond to breathe, then mount the History Panel if available
    setTimeout(() => {
      const historyMount = document.getElementById('history-panel-mount');
      if (historyMount) HistoryPanelManager.mount(historyMount, appState);
      
      ToastManager.notify('Universe Successfully Actualized', 'success');
    }, 500);
  }
}
