// B"H
import Tool from "../tool.js";
export default class Sefer extends Tool {
    type = "Sefer";
    static isTool = true;
    static itemName = "Holy Sefer";
    static className = "Sefer";
    static icon = "📖";
    static description = "A Holy Book. Fires Hebrew letters when used.";
    
    async shoot() {
        if(this.olam && this.olam.chossid) {
            this.olam.chossid.shootHebrewLetter();
        }
    }

    /**
     * B"H: Read the sefer to reveal Torah insights.
     */
    async read() {
        if (!this.olam || !this.olam.chossid) return;
        
        const pasukId = this.pasukId || "torah_tziva";
        const pasuk = (await import('../../tochen/torah/pesukim.js')).PESUKIM_DATA[pasukId];
        
        if (pasuk) {
            this.olam.ayshPeula("ui event", "torahStudyOverlay", {
                pasuk: pasuk,
                learnedLevel: this.olam.chossid.studyManager.learned[pasukId] || 0
            });
        }
    }
}
