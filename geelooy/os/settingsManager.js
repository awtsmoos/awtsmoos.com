// B"H
const SYSTEM_FOLDER_PATH = '.system';
const SETTINGS_FILE_NAME = '.defaults.json';

export const SettingsManager = {
  async load(db, initialSettings) {
    try {
      const settingsJson = await db.Laynin(SYSTEM_FOLDER_PATH, SETTINGS_FILE_NAME);
      if (!settingsJson) throw new Error('Settings file is empty.');
      return { ...initialSettings, ...JSON.parse(settingsJson) };
    } catch (error) {
      if (isAliasNotReady(error)) { console.info('B"H OS settings: alias not ready; using in-memory defaults.'); return initialSettings; }
      console.info('B"H OS settings: creating defaults after load miss.');
      await this.save(db, initialSettings);
      return initialSettings;
    }
  },
  async save(db, settingsObject) {
    try { await db.Koysayv(SYSTEM_FOLDER_PATH, SETTINGS_FILE_NAME, JSON.stringify(settingsObject, null, 2), 'file'); return true; }
    catch (error) { if (isAliasNotReady(error)) { console.info('B"H OS settings: alias not ready; skipped settings save.'); return false; } throw error; }
  }
};

function isAliasNotReady(error) { return error?.code === 'awtsmoos_alias_not_ready' || /alias is not ready|User not logged in/i.test(error?.message || ''); }

/** B"H: settings wait for identity; they do not summon duplicate login alerts at dawn. */
