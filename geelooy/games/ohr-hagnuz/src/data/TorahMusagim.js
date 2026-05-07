
/**
 * B"H
 * TorahMusagim: The Elements of Reality.
 * 
 * PSHAT (Earth/Dust) - The physical surface. Solid, rigid, unyielding logic.
 * REMEZ (Water) - The flowing hints. Connective, adaptable, elusive.
 * DRUSH (Fire) - The burning inquiry. Expansive, destructive to falsehood.
 * SOD (Air/Spirit) - The hidden essence. Invisible, all-encompassing.
 */
export const MUSAGIM_TYPES = {
    PSHAT: { name: 'Pshat', element: 'EARTH', color: '#795548', beats: ['REMEZ'], weakTo: ['DRUSH'] },
    REMEZ: { name: 'Remez', element: 'WATER', color: '#0288d1', beats: ['DRUSH'], weakTo: ['PSHAT'] },
    DRUSH: { name: 'Drush', element: 'FIRE', color: '#d32f2f', beats: ['PSHAT'], weakTo: ['REMEZ'] },
    SOD: { name: 'Sod',   element: 'AIR',  color: '#9c27b0', beats: ['PSHAT', 'REMEZ', 'DRUSH'], weakTo: ['SOD'] }
};

export const SEFARIM_LIBRARY = [
    {
        name: "Sefer Bereishis",
        type: "PSHAT",
        power: 40,
        desc: "The story of beginnings, grounded in the dust of the earth.",
        moves: ["Dust of the Earth", "Ancient Narrative", "Firmament Shield"]
    },
    {
        name: "Sefer Yetzirah",
        type: "SOD",
        power: 90,
        desc: "The secrets of the Hebrew letters and the formation of the worlds.",
        moves: ["Letter Transformation", "Ten Sefirot Pulse", "Infinite Light Beam"]
    },
    {
        name: "Moreh Nevuchim",
        type: "DRUSH",
        power: 70,
        desc: "A guide for the perplexed, burning with the fire of intellect.",
        moves: ["Intellectual Flame", "Logical Paradox", "Parable Strike"]
    }
];
