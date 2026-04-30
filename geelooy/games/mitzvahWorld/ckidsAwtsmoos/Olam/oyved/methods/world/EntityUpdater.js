
/**
 * B"H
 * @module EntityUpdater
 */
export default class EntityUpdater {
    static async update(me, id, data) {
        if (me.olam) {
            const ent = me.olam.nivrayim.find(n => n.id === id);
            if (ent) Object.assign(ent, data);
        }
    }
}
