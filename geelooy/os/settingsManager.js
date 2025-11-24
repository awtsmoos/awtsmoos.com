// B"H

// This manager handles loading and saving OS settings from a file.

const SYSTEM_FOLDER_PATH = '.system'; // A hidden folder for system files
const SETTINGS_FILE_NAME = '.defaults.json';
const FULL_SETTINGS_PATH = SYSTEM_FOLDER_PATH+"/"+SETTINGS_FILE_NAME;






export const SettingsManager = {
    /**
     * Loads settings from .system/.defaults.json.
     * If the file doesn't exist, it creates it with initial defaults.
     * @param {AwtsmoosDB} db - The OS database instance.
     * @returns {Promise<object>} The settings object for default programs.
     */
    // 

async load(db, initialSettings) {
    try {
        const settingsJson = await db.Laynin(SYSTEM_FOLDER_PATH, SETTINGS_FILE_NAME);
        if (!settingsJson) {
             throw new Error("Settings file is empty or corrupt.");
        }
        const savedSettings = JSON.parse(settingsJson);
        
        // --- THE FIX IS HERE ---
        // Merge saved settings on top of the initial defaults.
        // This ensures new defaults are added without overwriting user preferences.
        const mergedSettings = { ...initialSettings, ...savedSettings };
        
        console.log("OS Settings loaded and merged from file.");
        return mergedSettings;

    } catch (error) {
        // If loading fails for any reason, create a fresh settings file with the initial defaults.
        console.log("No settings file found or file was corrupt. Creating with initial defaults.");
        await this.save(db, initialSettings);
        return initialSettings;
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