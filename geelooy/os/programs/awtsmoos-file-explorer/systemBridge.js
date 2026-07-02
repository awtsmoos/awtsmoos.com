// B"H
export function createSystemBridge(system = {}) {
  const bridge = system || {};
  return {
    ...bridge,
    makeToast(message, type = 'info', source = 'explorer') {
      if (typeof bridge.makeToast === 'function') return bridge.makeToast(message, type, source);
      if (typeof bridge.toast === 'function') return bridge.toast(message, type, source);
      console[type === 'error' ? 'error' : 'log'](`[${source}] ${message}`);
    },
    openWindow(options = {}) {
      if (typeof bridge.addWindow === 'function') return bridge.addWindow(options);
      if (typeof bridge.openWindow === 'function') return bridge.openWindow(options);
      throw new Error('No window bridge is available.');
    }
  };
}
/** B"H: the bridge turns OS thunder into simple Explorer vessels. */
