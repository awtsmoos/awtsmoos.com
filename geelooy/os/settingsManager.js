// B"H

// This manager handles loading and saving OS settings from a file.

const SYSTEM_FOLDER_PATH = '.system'; // A hidden folder for system files
const SETTINGS_FILE_NAME = '.defaults.json';
const FULL_SETTINGS_PATH = `${SYSTEM_FOLDER_PATH}/${SETTINGS_FILE_NAME}`;

// In settingsManager.js, replace the load method
async load(db, initialSettings) {
    try {
        const settingsJson = await db.Laynin(SYSTEM_FOLDER_PATH, SETTINGS_FILE_NAME);
        if (!settingsJson) {
             throw new Error("Settings file is empty or corrupt.");
        }
        console.log("OS Settings loaded from file.");
        return JSON.parse(settingsJson);
    } catch (error) {
        // If loading fails, save and return the initial settings we were given.
        console.log("No settings file found. Creating with initial defaults provided by the OS.");
        await this.save(db, initialSettings);
        return initialSettings;
    }
},

export const SettingsManager = {
    /**
     * Loads settings from .system/.defaults.json.
     * If the file doesn't exist, it creates it with initial defaults.
     * @param {AwtsmoosDB} db - The OS database instance.
     * @returns {Promise<object>} The settings object for default programs.
     */
    async load(db) {
        try {
            // Try to read the settings file
            const settingsJson = await db.Laynin(SYSTEM_FOLDER_PATH, SETTINGS_FILE_NAME);
            if (!settingsJson) {
                 throw new Error("Settings file is empty or corrupt.");
            }
            console.log("OS Settings loaded from file.");
            return JSON.parse(settingsJson);
        } catch (error) {
            // If it fails (e.g., first boot), create the file with initial settings
            console.log("No settings file found. Creating with initial defaults.");
            await this.save(db, initialDefaults);
            return initialDefaults;
        }
    },

    /**
     * Saves a settings object to the .system/.defaults.json file.
     * @param {AwtsmoosDB} db - The OS database instance.
     * @param {object} settingsObject - The settings object to save.
     */
    async save(db, settingsObject) {
        // Ensure the .system folder exists. The DB will create it if needed.
        const settingsJson = JSON.stringify(settingsObject, null, 2); // Pretty-print the JSON
        await db.Koysayv(SYSTEM_FOLDER_PATH, SETTINGS_FILE_NAME, settingsJson);
        console.log("OS Settings saved to file.");
    }
};