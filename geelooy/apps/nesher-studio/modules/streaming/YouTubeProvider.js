/* B"H */
import { provider } from './GenericProvider.js';
export function createYouTubeProvider(input = {}) { return provider('youtube', 'YouTube', { ...input, protocol:'hls', supportsRealIngest:false }); }
