//B"H
export const SEFIROT = {
    KETER: 'crown', 
    CHACHMAH: 'wisdom', 
    BINAH: 'understanding', 
    DAAT: 'knowledge', 
    CHESED: 'kindness', 
    GEVURAH: 'severity', 
    TIFERET: 'beauty', 
    NETZACH: 'eternity', 
    HOD: 'splendor', 
    YESOD: 'foundation', 
    MALCHUT: 'kingship' 
};

export const TRAITS = {
    SCHOLAR: { name: 'TALMID', desc: 'XP +50%', stat: SEFIROT.CHACHMAH },
    WARRIOR: { name: 'GIBOR', desc: 'DMG +20%', stat: SEFIROT.GEVURAH },
    MYSTIC: { name: 'MEKUBAL', desc: 'SPELL +30%', stat: SEFIROT.DAAT },
    TZADIK: { name: 'TZADIK', desc: 'SHIELD +1', stat: SEFIROT.TIFERET },
    KOHEN: { name: 'KOHEN', desc: 'MENORAH START', stat: SEFIROT.CHESED }
};
