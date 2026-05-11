
// B"H
/**
 * @file ProviderRegistry.js
 * @brief The Map of the External Heavens.
 * 
 * CHAPTER CXI: THE COORDINATES OF THE GATEWAYS
 * 
 * To obtain a Golden Key, one must know where to travel. 
 * This module provides the holy links to the sacred sites: 
 * Google AI Studio for the native Gemini sparks, 
 * and OpenRouter for the multi-faceted fragments of the multiverse.
 */

export const Providers = {
    google: {
        id: 'google',
        name: 'Google Gemini',
        link: 'https://aistudio.google.com/app/apikey',
        icon: '⚡',
        color: 'var(--neon-cyan)',
        prefix: 'AIza'
    },
    openrouter: {
        id: 'openrouter',
        name: 'OpenRouter',
        link: 'https://openrouter.ai/keys',
        icon: '🌐',
        color: 'var(--neon-magenta)',
        prefix: 'sk-or'
    }
};

export const ProviderUtils = {
    detect(rawKey) {
        if (rawKey.startsWith(Providers.google.prefix)) return Providers.google;
        if (rawKey.startsWith(Providers.openrouter.prefix)) return Providers.openrouter;
        return null;
    }
};
