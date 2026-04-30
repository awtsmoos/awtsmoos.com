
import DivineDictionary from '../../core/DivineDictionary.js';

/**
 * B"H
 * @class OyvedCommunicationProtocol
 * @description
 * 📬 PROTOCOL OF THE ANGELIC EMISSARIES 📬
 * Web Worker Messaging fundamentally requires knowing the "Type" of message. 
 * Often mankind writes a massive "switch" block. That is forbidden.
 * Everything must be a Sefirotic structure (Objects/Dictionaries).
 * 
 * We build an interface of pure reaction. We register callbacks mapped 
 * directly to explicit energetic signatures.
 */
export default class OyvedCommunicationProtocol {
    constructor() {
        // DivineDictionary acts as our purely object-oriented resolution!
        this.dispatcher = new DivineDictionary();
    }

    /**
     * @method establishTreaty
     * @description Ties an energetic event string to an angelic executor function.
     * @param {string} eventSignature 
     * @param {Function} executionBlock 
     */
    establishTreaty(eventSignature, executionBlock) {
        this.dispatcher.addChannel(eventSignature, executionBlock);
    }

    /**
     * @method ingestTransmission
     * @description Reads the sealed raw event payload from a MessageEvent
     * @param {MessageEvent} e - Standard event
     */
    ingestTransmission(e) {
        const essencePayload = e.data;
        if (!essencePayload || !essencePayload.type) return;

        const channeledForce = this.dispatcher.resolveChannel(essencePayload.type);
        if (typeof channeledForce === 'function') {
            channeledForce(essencePayload); // Directly run without conditions!
        }
    }
}
