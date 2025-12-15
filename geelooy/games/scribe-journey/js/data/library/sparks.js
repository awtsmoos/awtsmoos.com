
// B"H
// js/data/library/sparks.js

// The 288 Sparks of Tohu shattered into fragments. 
// We generate 667 distinct collectible "concepts".

const adjectives = ["Holy", "Hidden", "Bright", "Fallen", "Redeemed", "Silent", "Singing", "Burning", "Deep", "High", "Broken", "Whole", "Ancient", "New", "Sweet", "Bitter", "Strong", "Soft", "Pure", "Clouded"];
const nouns = ["Light", "Voice", "Letter", "Word", "Thought", "Deed", "Will", "Wisdom", "Love", "Fear", "Beauty", "Truth", "Mercy", "Justice", "Foundation", "Kingdom", "Crown", "Song", "Prayer", "Cry"];
const sources = ["of Atzilut", "of Beriah", "of Yetzirah", "of Asiyah", "of the Void", "of the Temple", "of the Heart", "of the Mind", "of the Field", "of the City", "of the Night", "of the Day"];

export function generateSparks() {
    const sparks = {};
    let count = 0;
    
    // Generate combinations
    for(let a of adjectives) {
        for(let n of nouns) {
            for(let s of sources) {
                if(count >= 667) break;
                const id = `spark_${count}`;
                const name = `${a} ${n} ${s}`;
                sparks[id] = {
                    id: id,
                    name: name,
                    desc: "A spark of holiness waiting to be elevated.",
                    type: 'consumable', // Consuming elevates it
                    effect: { stat: 'xp', amount: 10 + Math.floor(Math.random() * 50) },
                    sellValue: 18,
                    rarity: Math.random() > 0.9 ? 'holy' : 'common'
                };
                count++;
            }
            if(count >= 667) break;
        }
        if(count >= 667) break;
    }
    return sparks;
}

export const sparksList = generateSparks();
