
/**
 * B"H
 * @module SoulSummoner
 */
export default class SoulSummoner {
    static async summon(olam, info) {
        let loaded = [];
        try {
            loaded = await olam.loadNivrayim(info.nivrayim);
            // B"H: silent

            return loaded;
        } catch(e) {
            console.error("B\"H - 🚨 MASSIVE GENESIS FAILURE:", e);
            olam.ayshPeula("error", { code: "LOAD_FAIL", details: e.stack });
            return null;
        }
    }
}
