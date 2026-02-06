// B"H

export const PROBABILITIES = [
    {
        id: 'shaar_hayichud',
        name: 'Shaar HaYichud (Gate of Unity)',
        description: 'Activates a chance per turn for Portals to manifest. Probability increases each turn it fails.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Random chance for teleporting portals to appear.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            This is the contemplation of Unity. You are meditating on the concept that "God is One." 
            Often, the world conceals this unity, appearing fragmented.
            
            By activating this, you begin a spiritual work. At first, the gates may stay closed (low probability). 
            But "Yagata U'Matzata" (If you toil, you will find). Every turn you persist, your yearning creates a vessel. 
            The probability rises. Eventually, the "Shaar" (Gate) MUST open.
            
            When it does, it connects the lowest world (Malchut) directly to the highest (Keter), bypassing the hierarchy. 
            Your balls travel through these wormholes of holiness, unifying the grid in a flash of insight.</p>
        `,
        icon: '⛩️',
        type: 'consumable',
        cost: 1200,
        probability_start: 0.1,
        probability_inc: 0.15,
    },
    {
        id: 'tohu_chaos',
        name: 'Orot d\'Tohu (Lights of Chaos)',
        description: 'Activates a chance per turn for a Bomb Brick to spawn. Probability increases each turn it fails.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Random chance for a bomb to appear in the grid.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            The World of Tohu (Chaos) possessed immense lights but weak vessels. This caused them to shatter. 
            Usually, we avoid Tohu. But here, we strategically invoke it.
            
            You are calling down a light so intense it cannot be contained. You are planting a "seed of chaos" (the Bomb) 
            into the rigid structure of the grid. It might not happen immediately; the world resists such intensity. 
            But when the pressure builds (probability increases), the spark descends. 
            
            When struck, it releases the pent-up energy of the primordial world, shattering the orderly "Klipot" in a 
            radius of divine destruction.</p>
        `,
        icon: '💥',
        type: 'consumable',
        cost: 1200,
        probability_start: 0.1,
        probability_inc: 0.15,
    },
    {
        id: 'ohr_makif',
        name: 'Ohr Makif (Surrounding Light)',
        description: 'Activates a chance per turn for balls to gain a damaging Aura. Probability increases each turn.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Balls get a glow that kills bricks without touching them.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            There is "Ohr Pnimi" (Inner Light) which fills the vessel, and "Ohr Makif" (Surrounding Light) which transcends it. 
            Normally, a ball (vessel) must physically touch a brick to affect it.
            
            This power invokes the Surrounding Light. When it manifests, your balls are enveloped in a transcendent aura. 
            They become so holy that impurity cannot exist in their presence. They do not need to "touch" the brick to break it; 
            their very proximity is judgment. The brick shatters from the awe of the nearness of the Divine.</p>
        `,
        icon: '✨',
        type: 'consumable',
        cost: 1500,
        probability_start: 0.05,
        probability_inc: 0.10,
    },
];