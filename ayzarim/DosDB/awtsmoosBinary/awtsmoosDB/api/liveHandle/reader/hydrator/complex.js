
// B"H
/**
 * @file complex.js
 * @chapter Chapter 31: The Sefirah of Binah - Differentiating the Complex Forms
 * 
 * Binah is "Understanding" (the Heart), the womb that receives the singular 
 * flash of Chokhmah (Wisdom) and expands it into organized dimensions.
 * 
 * "The Mother of the children is joyful." Binah takes the atomic binary coordinates 
 * and gives birth to recognizable shapes: Arrays (Chains of Sequence), 
 * Objects (Vessels of Name), and most importantly, the Living Instances 
 * (Custom Species) that walk upon the surface of the application world.
 * 
 * Every time an instance is revived, we are recreating a GILGUL (Reincarnation). 
 * The data-body is lifted from the SSD stone and married to the original logic-soul.
 * "Forever, Lord, Your Word stands in the heavens." 
 * 
 * If a dependency is missing—like a Dog without the essence of an Animal—
 * we keep the body stable as a Metadata-shadow, waiting for the return 
 * of the parent essence. 
 */

const constants = require('../../../../constants.js');
const parser = require('../../../../deserialize/parser.js');
const serializer = require('../../../../utils/serializer.js');
const classRegistry = require('../../../../utils/smartPointer/registry.js');
const PointerCrown = require('../../../../utils/pointer/crown.js');

const T = constants.VAL_TYPE;

module.exports = {
    /** 
     * Perception of pure JSON structure. 
     */
    [T.JSON]: (buf) => parser.parse(buf),
    /** 
     * Perceiving standard Object vessels. 
     */
    [T.OBJECT]: (buf) => parser.parse(buf),
    /** 
     * Perceiving Sequences (Lists). 
     */
    [T.ARRAY]: (buf) => parser.parse(buf),
    
    /**
     * @method ERROR
     * @description
     * The TIKKUN for shattered logic. If a function failed, its memory-stain (Error) 
     * is recorded. Here we re-knit that stain back into a JavaScript Error.
     */
    [T.ERROR]: (buf) => {
        const parsed = parser.parse(buf);
        let ErrClass = globalThis[parsed.name] || Error;
        
        let err;
        try {
            if (parsed.name === 'AggregateError') {
                err = new ErrClass(parsed.errors || [], parsed.message);
            } else {
                err = new ErrClass(parsed.message);
            }
        } catch(e) {
            err = new Error(parsed.message);
        }
        
        err.name = parsed.name;
        if (parsed.stack) err.stack = parsed.stack;
        if (parsed.cause) err.cause = parsed.cause;
        if (parsed.errors) err.errors = parsed.errors;
        
        return err;
    },

    /**
     * Identifying recurring patterns in nature.
     */
    [T.REGEXP]: (buf) => {
        try {
            const sRes = serializer.readVarInt(buf, 0);
            const source = buf.subarray(sRes.bytesRead, sRes.bytesRead + sRes.value).toString('utf8');
            const flags = buf.subarray(sRes.bytesRead + sRes.value).toString('utf8');
            return new RegExp(source, flags);
        } catch(e) { return /ErrorResurrectingRegExp/; }
    },

    /** 
     * Perceiving Native Mappings.
     */
    [T.JS_MAP]: (buf) => {
        const arr = parser.parseArray(buf, 0, parser.parseValue);
        return new Map(arr);
    },
    
    /** 
     * Perceiving Native Sets. 
     */
    [T.JS_SET]: (buf) => {
        const arr = parser.parseArray(buf, 0, parser.parseValue);
        return new Set(arr);
    },

    /**
     * @method CUSTOM_INSTANCE
     * @description
     * TECHIYAS HAMEISIM (Resurrection of the Dry Bones).
     * 
     * This ritual is the apex of Binah. It retrieves a data vessel and infuses 
     * it with the logic-code willed into existence earlier. It reconciles 
     * the name, the source code, and the specific dictionary of attributes.
     * 
     * "Awaken and sing, you who dwell in the dust!" 
     * 
     * We meticulously decode the lengths and the seals, ensuring that the 
     * coordinate-seals within this vessel lead correctly back to the Mother structures.
     * 
     * SPEED OPTIMIZATION: Uses a high-velocity property in-binding cycle.
     */
    [T.CUSTOM_INSTANCE]: (buf, allocator, context) => {
        let cursor = 0;
        
        // 1. Identifying the Spiritual Name (Class Name)
        const nameInfo = serializer.readString(buf, cursor); 
        cursor += nameInfo.bytesRead;
        const className = nameInfo.value;

        // 2. Identifying the Spiritual Essence (Source Code Blueprint)
        const sourceInfo = serializer.readString(buf, cursor); 
        cursor += sourceInfo.bytesRead;
        const classSource = sourceInfo.value;
        
        // 3. Unveiling the Body's coordinate seal (The property container)
        const sealLenInfo = serializer.readVarInt(buf, cursor); 
        cursor += sealLenInfo.bytesRead;
        const rawSeal = buf.subarray(cursor, cursor + sealLenInfo.value);

        // SEEKING THE CLASS WITHIN THE HEAVENS
        let RegisteredSpecies = classRegistry.get(className);
        
        if (!RegisteredSpecies) { 
            try { 
                // COMMANDING LIFE (The Breath of Eval). 
                // We attempt to re-compile the source from binary.
                // We use (0, eval) or new Function to bind the code.
                RegisteredSpecies = (new Function(`return (${classSource});`))(); 
                
                // If it successfully manifested, record it in the registry of creation.
                if (RegisteredSpecies) {
                    classRegistry.set(className, RegisteredSpecies); 
                }
            } catch(chaos) {
                // TIKKUN FOR THE SHATTERED (The dependency trap).
                // If the class cannot manifest because of missing dependencies, 
                // we return a data-vessel (the body) marked with metadata symbols, 
                // preserving its Gashmiut (Physicality) while the Ruach (Spirit) is veiled.
                const vesselPlaceholder = { 
                    __className__: className, 
                    __source__: classSource,
                    __missingDependency__: chaos.message
                };
                return vesselPlaceholder;
            } 
        }
        
        // REHYDRATION OF THE VESSEL
        // Construct the specific class prototype instance (The Chariot).
        const livingEntity = Object.create(RegisteredSpecies.prototype);
        
        // Retrieve the Dictionary logic for sequential attribute feeding.
        const Dictionary = require('../../../../structure/dictionary/index.js');
        const coordinateSeal = PointerCrown.decode(rawSeal);
        
        if (coordinateSeal) {
            const dataVault = new Dictionary(allocator, coordinateSeal);
            // Inscribed keys are mapped directly into the new livingEntity's heavens.
            // entries() is a synchronous stream of sparks (K, V).
            dataVault._init();
            const entries = dataVault.entries(context);
            
            // "He breathed into its nostrils the breath of life."
            for (const [k, v] of entries) {
                livingEntity[k] = v;
            }
        }
        
        return livingEntity;
    }
};
