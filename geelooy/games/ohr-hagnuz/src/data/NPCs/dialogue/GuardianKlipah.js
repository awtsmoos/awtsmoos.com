
/**
 * B"H
 * @module GuardianKlipah
 * @description The dialogue tree for the static obstacle Klipot on the map.
 */
export const GuardianKlipah = {
    'START': {
        lines: [
            "I am the husk that conceals the light!", 
            "Your path ends here, unless you can prove the unity of all existence!",
            "I am bound by the strict geometries of Asiyah!"
        ],
        options: [
            { label: "Shatter! (Debate)", next: 'END', action: 'BATTLE' },
            { label: "I will return.", next: 'END' }
        ]
    }
};
