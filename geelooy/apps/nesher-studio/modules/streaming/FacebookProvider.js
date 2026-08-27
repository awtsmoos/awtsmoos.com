/* B"H */
import { provider } from './GenericProvider.js';
export function createFacebookProvider(input = {}) { return provider('facebook', 'Facebook Live', { ...input, protocol:'hls', supportsRealIngest:false }); }
