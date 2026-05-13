
/**
 * B"H
 * @file PortalDictionary.js
 * @chapter The Gates of Return (Teshuvah)
 * @description
 * When a generic portal character (like 🪜) is used in multiple maps, 
 * the DimensionalIndexer relies on this absolute dictionary to route the soul 
 * to the exact floor and coordinate.
 * 
 * Format: `[OriginMapId]_[UnicodeChar]`: { mapId: DestMap, x: DestX, y: DestY }
 */
export const PortalDictionary = {
    // Aliyah of House Aleph
    'HouseInteriorAleph_🪜': { mapId: 'HouseInteriorAleph_F2', x: 2, y: 4 },
    'HouseInteriorAleph_F2_🪜': { mapId: 'HouseInteriorAleph', x: 2, y: 4 }
};
