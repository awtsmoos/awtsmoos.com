/* B"H */
self.AwtsVideoBase = self.AwtsVideoBase || {};
self.AwtsVideoBase.postStatus = message => self.postMessage({ type: 'STATUS_UPDATE', payload: { message } });
self.AwtsVideoBase.postComplete = (blob, options) => self.postMessage({ type: 'VIDEO_COMPLETE', payload: { blob, ...options } });
self.AwtsVideoBase.postFatalError = (message, error) => self.postMessage({ type: 'FATAL_ERROR', payload: { message, error: error?.toString?.() || String(error) } });
