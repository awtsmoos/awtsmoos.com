
/**
 * B"H
 * @module Stage2Events
 * @description
 * Binding the abstract laws of nature to the active world instance.
 */
export default class Stage2Events {
    static bind(olam, info) {
        if (info.on) {
            console.log("B\"H - 🌌 STAGE 2: Binding the laws of nature.");
            Object.keys(info.on).forEach(q => olam.on(q, info.on[q]));
        }
    }
}
