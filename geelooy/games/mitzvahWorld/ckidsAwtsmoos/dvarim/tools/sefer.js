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
}
