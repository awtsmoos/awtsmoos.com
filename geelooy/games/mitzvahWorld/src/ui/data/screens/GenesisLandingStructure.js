
/**
 * B"H
 * @file GenesisLandingStructure.js
 * @description
 * 📐 ARCHITECTURE OF THE BRIDGE BETWEEN REALMS 📐
 * When moving from the external physical menu into the infinite game,
 * there must be a translation phase, just as souls journey. 
 * This returns the JSON scaffolding. No HTML hardcoded blocks allowed!
 */
export const getGenesisLandingStructure = () => {
    return {
        sefirahTag: 'div',
        sealId: 'veilOfGenesis',
        garments: ['tzimtzum-gate'],
        childEmanations:[
            {
                sefirahTag: 'h2',
                garments: ['atzmus-pulse-text'],
                innerLight: 'ESTABLISHING HISHTALSHELUS...'
            },
            {
                sefirahTag: 'div',
                garments: ['sefira-container-track'],
                childEmanations:[
                    {
                        sefirahTag: 'div',
                        sealId: 'lightStreamProgress',
                        garments: ['ein-sof-light-stream']
                    }
                ]
            },
            {
                sefirahTag: 'div',
                sealId: 'divineCommStreamText',
                garments:['divine-commentary'],
                innerLight: 'Extracting Reshimu (Initial Imprint)...'
            }
        ]
    };
};
