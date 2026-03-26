
// B"H
/**
 * @module MentionParser
 * @description
 * The Eye that sees the Hidden Names.
 */
import { AppStore } from '../../../state/store.js';

export const MentionParser = {
    /**
     * B"H
     * Translates text into an array of Blueprints/Strings.
     * @param {string} text - The raw word.
     * @returns {Array} A list of blueprints for the Architect.
     */
    parse(text) {
        if (!text) return [];
        
        const userNames = Object.values(AppStore.users).map(u => u.name);
        if (!userNames.includes(AppStore.currentUser.name)) userNames.push(AppStore.currentUser.name);
        
        const sortedNames = userNames.sort((a, b) => b.length - a.length);
        const namePattern = sortedNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        
        if (!namePattern) return [text];

        const regex = new RegExp(`@(${namePattern})`, 'g');
        const sparks = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                sparks.push(text.substring(lastIndex, match.index));
            }

            const name = match[1];
            let userId = 'me';
            const user = Object.values(AppStore.users).find(u => u.name === name);
            if (user) userId = user.id;

            sparks.push({
                tag: 'span',
                className: 'mention-link profile-click-trigger',
                dataset: { userid: userId },
                style: { color: 'var(--c-primary)', fontWeight: '900', cursor: 'pointer' },
                on: { click: () => window.AppGlobals.Actions.viewUserProfile(userId) },
                text: `@${name}`
            });

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            sparks.push(text.substring(lastIndex));
        }

        return sparks;
    }
};
