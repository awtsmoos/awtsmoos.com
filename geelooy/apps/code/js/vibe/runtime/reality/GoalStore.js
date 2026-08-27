// B"H
/**
 * @file GoalStore.js
 * @brief Tiny persistence layer for autonomous goal entities.
 */

/**
 * Stores goal state in the browser when possible, while safely degrading to
 * in-memory persistence in tests, static previews, or restricted providers.
 */
export const GoalStore = {
    key: 'awtsmoos.vibe.goals',
    memory: new Map(),

    /**
     * Saves a serialized goal entity.
     *
     * @param {object} goal Goal JSON.
     * @returns {object} Saved goal.
     */
    save(goal = {}) {
        if (!goal.id) return goal;
        this.memory.set(goal.id, goal);
        const all = this.list();
        const next = [goal, ...all.filter(item => item.id !== goal.id)].slice(0, 50);
        writeBrowser(this.key, next);
        return goal;
    },

    /**
     * Lists known goals, newest first when browser storage exists.
     *
     * @returns {Array<object>} Goal records.
     */
    list() {
        const stored = readBrowser(this.key);
        if (Array.isArray(stored)) return stored;
        return Array.from(this.memory.values()).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    },

    /**
     * Finds one goal by id.
     *
     * @param {string} id Goal id.
     * @returns {object|null} Goal record.
     */
    get(id) {
        return this.list().find(goal => goal.id === id) || this.memory.get(id) || null;
    }
};

function readBrowser(key) {
    try {
        if (typeof localStorage === 'undefined') return null;
        const text = localStorage.getItem(key);
        return text ? JSON.parse(text) : null;
    } catch (e) {
        return null;
    }
}

function writeBrowser(key, value) {
    try {
        if (typeof localStorage === 'undefined') return false;
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        return false;
    }
}
