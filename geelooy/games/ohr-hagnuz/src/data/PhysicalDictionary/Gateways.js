
import { PortalBonds } from '../maps/PortalBonds.js';

export const Gateways = {};

const BUILDING_PORTALS = [
    '☗','☖','★','☆','♜','♖','⛺','🎪',
    '🏰','🏯','🏠','🏡','🏢','🏬','🕌','🕍', '🏣', '🏤', '🏕️', '🪔'
];

Object.keys(PortalBonds).forEach(key => {
    if (BUILDING_PORTALS.includes(key)) {
        Gateways[key] = { t: 'G_DOOR_WOOD', solid: false, isPortal: true, desc: 'A doorway to an inner realm.' };
    } else {
        Gateways[key] = { t: 'G_DIRT_PATH', solid: false, isPortal: true, desc: 'The King\'s Highway continues...' };
    }
});
