
/**
 * B"H
 * @class StringEmanation
 * @chapter The Purity of the Letters
 * @description
 * "He carved them, He hewed them, He permuted them, He weighed them, He transformed them..." (Sefer Yetzirah).
 * In the digital realm, Unicode introduces 'Variation Selectors' (like \uFE0F) that append to base characters,
 * causing standard array spreads `[...str]` to fracture a single visual entity into two broken vessels (Shevirat HaKelim).
 * This class purifies the string, ensuring that every soul and object is mathematically whole!
 */
export class StringEmanation {
    /**
     * @description Purifies a string of physical dimension artifacts and splits it into discrete Otiot.
     * @param {string} rawString - The unrefined emanation from the map.
     * @returns {Array<string>} The perfected array of single characters.
     */
    static split(rawString) {
        if (!rawString) return [];
        // Strip the Variation Selector-16 which forces emoji presentation, breaking our grid!
        const purified = rawString.replace(/\uFE0F/g, '');
        return [...purified];
    }
}
