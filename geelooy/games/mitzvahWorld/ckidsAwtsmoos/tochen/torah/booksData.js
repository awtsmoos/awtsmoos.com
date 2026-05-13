/**
 * B"H
 * @file booksData.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE LIBRARY OF LIGHT — Master Re-Exporter                          ║
 * ║                                                                      ║
 * ║  Re-exports everything from the modular books sub-system.            ║
 * ║  Maintains backward compatibility with existing imports.             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export {
    ALL_PASSAGES,
    PASSAGE_BY_ID,
    PASSAGES_BY_TYPE,
    PASSAGES_BY_TIER,
    STARTER_PASSAGES,
    TYPE_CHART
} from './books/index.js';

// ─── LEGACY TORAH_BOOKS format (for backward compat) ─────────────────────────
import { PIRKEI_AVOS_PASSAGES } from './books/pirkeiAvos.js';
import { REBBE_12_PESUKIM }     from './books/rebbesPesakim.js';
import { TANYA_PASSAGES }       from './books/tanyaPassages.js';
import { GEMARA_PASSAGES }      from './books/gemaraPassages.js';

export const TORAH_BOOKS = {
    CHUMASH: {
        name: "Chumash", type: "Ground", icon: "📜",
        description: "The Five Books of Moses. The foundation of all reality.",
        passages: REBBE_12_PESUKIM.filter(p => ["rebbe_pesuk_5","rebbe_pesuk_6","rebbe_pesuk_7","rebbe_pesuk_8","rebbe_pesuk_9","rebbe_pesuk_10"].includes(p.id))
    },
    PIRKEI_AVOS: {
        name: "Pirkei Avos", type: "Ground", icon: "📖",
        description: "Ethics of the Fathers. The moral spine of Jewish civilization.",
        passages: PIRKEI_AVOS_PASSAGES
    },
    GEMARA: {
        name: "Gemara", type: "Fire", icon: "📘",
        description: "The deep debates of the Sages. The fire of intellectual refinement.",
        passages: GEMARA_PASSAGES
    },
    TANYA: {
        name: "Tanya", type: "Air", icon: "📕",
        description: "The Map of the Soul. The Chassidic manual for inner battle.",
        passages: TANYA_PASSAGES
    },
    REBBE_PESUKIM: {
        name: "Rebbe's 12 Pesukim", type: "Air", icon: "🔱",
        description: "The Rebbe's eternal Torah utterances. LEGENDARY tier — the most powerful moves.",
        passages: REBBE_12_PESUKIM
    }
};
