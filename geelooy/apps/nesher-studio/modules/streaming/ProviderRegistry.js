/* B"H */
import { createGenericProvider } from './GenericProvider.js';
import { createCustomProvider } from './CustomProvider.js';
import { createYouTubeProvider } from './YouTubeProvider.js';
import { createTwitchProvider } from './TwitchProvider.js';
import { createFacebookProvider } from './FacebookProvider.js';
export function createProviderRegistry(input = {}) { const providers = input.providers || [createGenericProvider(), createCustomProvider(), createYouTubeProvider(), createTwitchProvider(), createFacebookProvider()]; return { kind:'ProviderRegistry', providers }; }
export function getProvider(registry, id) { return registry.providers.find(p => p.id === id) || null; }
export function registerProvider(registry, provider) { registry.providers = registry.providers.filter(p => p.id !== provider.id).concat(provider); return provider; }
