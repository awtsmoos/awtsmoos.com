
/**
 * B"H
 * @module SoulSummoner
 */
export default class SoulSummoner {
    static async summon(olam, info) {
        let loaded = [];
        try {
            loaded = await olam.loadNivrayim(info.nivrayim);
            console.log(`B"H - 👥 All [${loaded.length}] souls have been summoned.`);
            return loaded;
        } catch(e) {
            console.error("B\"H - 🚨 MASSIVE GENESIS FAILURE:", e);
            olam.ayshPeula("error", { code: "LOAD_FAIL", details: e.stack });
            return null;
        }
    }
}
