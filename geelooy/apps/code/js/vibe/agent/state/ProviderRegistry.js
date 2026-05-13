// B"H
/**
 * @file ProviderRegistry.js
 * @brief Provider metadata and API key prefix detection.
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
    },
    groq: {
        id: 'groq',
        name: 'Groq',
        link: 'https://console.groq.com/keys',
        icon: '🚀',
        color: 'var(--neon-lime)',
        prefix: 'gsk_'
    },
    cerebras: {
        id: 'cerebras',
        name: 'Cerebras',
        link: 'https://cloud.cerebras.ai/platform/api-keys',
        icon: '🧠',
        color: 'var(--neon-cyan)',
        prefix: 'csk-'
    },
    openai: {
        id: 'openai',
        name: 'OpenAI',
        link: 'https://platform.openai.com/api-keys',
        icon: '🤖',
        color: 'var(--neon-cyan)',
        prefix: 'sk-'
    },
    xai: {
        id: 'xai',
        name: 'xAI (Grok)',
        link: 'https://console.x.ai',
        icon: '🛰️',
        color: 'var(--neon-magenta)',
        prefix: 'xai-'
    },
    together: {
        id: 'together',
        name: 'Together AI',
        link: 'https://api.together.xyz/settings/api-keys',
        icon: '🧩',
        color: 'var(--neon-lime)',
        prefix: 'together-'
    }
};

export const ProviderUtils = {
    detect(rawKey = '') {
        if (rawKey.startsWith(Providers.openrouter.prefix)) return Providers.openrouter;
        if (rawKey.startsWith(Providers.groq.prefix)) return Providers.groq;
        if (rawKey.startsWith(Providers.cerebras.prefix)) return Providers.cerebras;
        if (rawKey.startsWith(Providers.xai.prefix)) return Providers.xai;
        if (rawKey.startsWith(Providers.together.prefix)) return Providers.together;
        if (rawKey.startsWith(Providers.google.prefix)) return Providers.google;
        if (rawKey.startsWith(Providers.openai.prefix)) return Providers.openai;
        return null;
    }
};
