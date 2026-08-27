// B"H

export const CONSUMABLES = [
    {
        id: 'horizontal_blast',
        name: 'Kav Yosher (Direct Line)',
        description: 'Clears the lowest row of bricks instantly.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Destroys the bottom row of bricks.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            When the "Klipot" (Evil Husks) threaten to overwhelm the "Malchut" (Kingdom/Bottom of the screen), 
            one cannot rely on the gradual process of evolution (Seder Hishtalshelus). One needs a direct revelation.
            
            "Kav Yosher" is the direct light of the Creator that bypasses the worlds. It does not negotiate with the bricks; 
            it annuls them. It clears the immediate danger by revealing that "Ain Od Milvado" (There is nothing but Him). 
            In the face of such revelation, the lowest barriers simply cease to exist.</p>
        `,
        icon: '↔️',
        type: 'consumable',
        cost: 500,
    },
    {
        id: 'vertical_blast',
        name: 'Amud HaTavech (Middle Pillar)',
        description: 'Clears a random column of bricks instantly.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Destroys a vertical column of bricks.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            This is the "Amud HaTavech," the Middle Pillar that synthesizes Chesed (Right) and Gevura (Left). 
            It rises from Earth to Heaven. By invoking this power, you create a ladder of ascent. 
            
            It pierces through the confusion of the grid, creating a clear channel for the light to descend and the souls to ascend. 
            It establishes a "Tzinor" (Conduit) of clarity in a world of chaotic obstacles.</p>
        `,
        icon: '↕️',
        type: 'consumable',
        cost: 500,
    },
    {
        id: 'meteor_strike',
        name: 'Esh Kodesh (Holy Fire)',
        description: 'Destroys 3 random bricks on the field.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Blows up 3 random bricks anywhere.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            Sometimes, logic is insufficient. You need "Mesirus Nefesh" (Self-Sacrifice), which burns like fire. 
            This power calls down meteors of holy fire from the world of Atzilut. 
            
            They do not follow a path; they strike where they are needed by Divine Providence. 
            They consume the "Korban" (Sacrifice), turning the stone of the brick into a pleasing aroma before the Creator. 
            It is a chaotic, beautiful disruption of the order of the grid.</p>
        `,
        icon: '☄️',
        type: 'consumable',
        cost: 350,
    },
    {
        id: 'brick_converter',
        name: 'Birur (Clarification)',
        description: 'Changes a random strong brick to have 1 health.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Makes a strong brick very weak.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            The toughest obstacles are often illusions ("Olam HaSheker"). The process of "Birur" is the separation of good from waste. 
            This item performs an intellectual clarification upon a stubborn brick. 
            
            It reveals that the formidable health of the brick is merely a shell. Once the shell is exposed as a lie, 
            its power evaporates. The mountain becomes a molehill. It teaches us that with the right perspective, 
            the hardest challenges are easily overcome.</p>
        `,
        icon: '✨',
        type: 'consumable',
        cost: 400,
    },
    {
        id: 'ball_doubler',
        name: 'Piru v\'Rivu (Be Fruitful)',
        description: 'Doubles the number of balls on your next shot.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Shoot twice as many balls for one turn.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            The very first commandment: "Be fruitful and multiply." This is the power of generation. 
            For one specific moment of Will (Ratzon), your efforts are blessed with infinite fertility. 
            
            Every good deed creates an angel; here, every ball creates a twin. It is an exponential explosion of light, 
            overwhelming the darkness by sheer volume of holiness. It turns a trickle of influence into a flood.</p>
        `,
        icon: '²ˣ',
        type: 'consumable',
        cost: 750,
    },
    {
        id: 'ghost_spirit',
        name: 'Ibbur (Impregnation)',
        description: 'Balls turn into ghosts for one turn, passing through bricks.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Balls fly through bricks, damaging them but not bouncing off.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            An "Ibbur" is a righteous soul that joins a living person to help them. Here, the balls transcend their physical limitations. 
            They become like spiritual entities, unhindered by solid matter.
            
            They pass through the "Klipot" like light through glass. They affect the essence without being repelled by the surface. 
            This allows them to reach the deepest, most hidden parts of the grid (the top rows) that are usually inaccessible.</p>
        `,
        icon: '👻',
        type: 'consumable',
        cost: 850,
    },
    {
        id: 'peruta_doubler',
        name: 'Bracha (Blessing)',
        description: 'Doubles all Perutas earned for the next 3 turns.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Get 2x money for 3 turns.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            "The blessing of the Lord makes rich." This item opens the channel of "Parnassa" (Livelihood). 
            It places a lens of blessing over your actions. The effort remains the same, but the yield is doubled. 
            
            It teaches that wealth comes not from "Kocho v'Otzem Yado" (My power and the might of my hand), 
            but from the blessing inherent in the act when done with the right intention.</p>
        `,
        icon: '💰',
        type: 'consumable',
        cost: 1000,
    },
    {
        id: 'rebound_field',
        name: 'Magen (Shield)',
        description: 'Your paddle can bounce balls back up. Unused bounces carry over.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> A safety net that bounces balls back up if you miss.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            "Magen Avraham" (Shield of Abraham). This is the protective aspect of faith. 
            Even when we fail, even when we miss the mark and the light falls towards the abyss, the Magen is there. 
            
            It catches the fallen sparks and says, "You are not lost." It redirects them back towards their purpose. 
            It gives the player the confidence to take risks, knowing that they are held by an eternal support system.</p>
        `,
        icon: '🔄',
        type: 'consumable',
        cost: 250,
        customizable: true,
        unitName: 'charge',
        max_purchase: 100,
    },
    {
        id: 'anti_gravity',
        name: 'Aliyah (Ascent)',
        description: 'Reverses gravity for one turn! Balls fall upwards.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Balls fall UP instead of down.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            "The spirit of man ascends upward." Gravity is the pull of the material ("Gashmius"). 
            This power invokes a state of "Ratzo" (Running towards God) so powerful that it overrides the laws of nature.
            
            The balls are seized with a yearning for their Source. They flee the earth. 
            This reversal of nature confuses the "Klipot," attacking them from an angle they cannot comprehend—from below, 
            driven by pure spiritual yearning.</p>
        `,
        icon: '⬆️',
        type: 'consumable',
        cost: 1500,
    },
    {
        id: 'health_halver',
        name: 'Hachna\'ah (Submission)',
        description: 'Halves the health of all bricks on screen (rounded up).',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> All bricks lose 50% HP.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            The first stage of spiritual growth is "Hachna'ah" (Submission/Silencing the Ego). 
            The bricks stand tall in their arrogance ("Yeshut"). This power emits a frequency of humility.
            
            It forces the bricks to recognize their nothingness before the Creator. Their ego breaks. 
            Their resistance (Health) is halved not by force, but by the realization of the Truth. 
            A broken heart is a vessel for holiness; a broken brick is ready to be cleared.</p>
        `,
        icon: '💔',
        type: 'consumable',
        cost: 2000,
    },
    {
        id: 'paddle_golem',
        name: 'Golem (Helper)',
        description: 'Summons a helper paddle at the bottom of the screen.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> A second, smaller paddle helps you catch balls.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            Based on the legend of the Maharal of Prague. You use the letters of the Holy Name to animate lifeless matter. 
            The Golem has no will of its own; it is pure Bittul (Nullification) to the master.
            
            It stands at the threshold of the abyss, a sleepless guardian. While you focus on the high intentions, 
            the Golem handles the simple mechanics of survival. It represents the sanctification of the body to serve the soul.</p>
        `,
        icon: '🤖',
        type: 'consumable',
        cost: 2500,
    },
    {
        id: 'second_chance',
        name: 'Teshuva (Return)',
        description: 'Automatically retry a turn if you lose.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> If you die, you get to try the turn again.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            "Teshuva" (Repentance) was created before the world. It is the power to rewrite history. 
            Normally, time flows forward; a mistake is eternal. But Teshuva allows one to reach a place above time.
            
            When you fail, this power activates. It resets the timeline. It says, "That fall was not the end; it was a descent for the sake of ascent." 
            You return to the moment before the sin (failure) with the experience of the fall, now empowered to succeed.</p>
        `,
        icon: '💖',
        type: 'consumable',
        cost: 3000,
    },
    {
        id: 'divine_intervention',
        name: 'Hashgacha (Providence)',
        description: 'Saves you from losing by clearing the lowest row.',
        longDescription: `
            <p><strong>The Simple Meaning:</strong> Saves your life at the last second.</p>
            <hr>
            <p><strong>The Inner Dimension (Pnimiyut):</strong>
            "Hashgacha Pratis" means that the Creator oversees every detail of existence. 
            Sometimes, by the laws of nature ("Tevar"), you are doomed. The bricks are at the line. Logic dictates defeat.
            
            But you appeal to the Transcendent. This power is the answer. It is a miracle that overrides nature. 
            The Creator Himself intervenes, sweeping away the decree. It is the ultimate reliance on the One Above.</p>
        `,
        icon: '🙏',
        type: 'consumable',
        cost: 5000,
    },
];