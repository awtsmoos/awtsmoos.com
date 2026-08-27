/* B"H */
import { provider } from './GenericProvider.js';
export function createTwitchProvider(input = {}) { return provider('twitch', 'Twitch', { ...input, protocol:'rtmp-or-hls', supportsRealIngest:false }); }
