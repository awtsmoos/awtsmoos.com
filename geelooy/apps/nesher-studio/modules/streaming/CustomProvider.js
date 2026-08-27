/* B"H */
import { provider } from './GenericProvider.js';
export function createCustomProvider(input = {}) { return provider(input.id || 'custom', input.label || 'Custom Provider', { ...input, endpoint:input.endpoint || '' }); }
