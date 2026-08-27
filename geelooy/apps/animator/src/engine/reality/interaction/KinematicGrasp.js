
// B"H
/**
 * @file KinematicGrasp.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 6: THE HAND THAT MOVES THE WORLD (Yad HaMeziyza)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Actions now include:
 * - 'pickup': Binds a target to the actor's hand.
 * - 'drop': Releases it to the earth.
 * - 'throw': Releases it with a massive horizontal velocity matrix.
 * - 'mount': Binds the actor's root to the target (sitting down).
 * - 'unmount': Severs the bond, returning the actor to the earth.
 * 
 * @class KinematicGrasp
 */

export class KinematicGrasp {
    static evaluate(event, state) {
        if (event.type !== 'interact' || !event.action) return;

        const chars = state.get('characters') || {};
        const scene = state.get('scene') || {};
        const actor = chars[event.actor];
        
        if (!actor) return;

        const targetId = event.target;
        let targetEntity = this._findEntity(targetId, chars, scene);

        switch (event.action) {
            case 'pickup':
                if (targetEntity) {
                    targetEntity.parentId = actor.id;
                    targetEntity.parentBone = 'wrist_right';
                    // Reset local offsets to sit cleanly in the hand
                    targetEntity.x = 20; 
                    targetEntity.y = 10;
                    actor.ikTargetRight = { x: 45, y: 15 }; 
                }
                break;

            case 'drop':
            case 'throw':
                const heldEntity = this._findHeldBy(actor.id, chars, scene);
                if (heldEntity) {
                    heldEntity.parentId = null;
                    heldEntity.parentBone = null;
                    
                    import('../hierarchy/HierarchyResolver.js').then(({ HierarchyResolver }) => {
                        const worldPos = HierarchyResolver.resolve(actor, state);
                        heldEntity.x = worldPos.x + (actor.flipX ? -40 : 40);
                        heldEntity.y = worldPos.y - 40;
                        
                        if (event.action === 'throw') {
                            // Epic parabolic arc velocity!
                            heldEntity.velocity = { 
                                x: (actor.flipX ? -35 : 35), 
                                y: -25 
                            };
                            heldEntity.angularVelocity = 15;
                        }
                    });
                    
                    actor.ikTargetRight = null;
                }
                break;

            case 'mount':
                if (targetEntity) {
                    actor.mountedTo = targetId;
                    actor.pose = 'sitting';
                    actor.mountOffsetY = -30; // Perfect sit depth
                }
                break;

            case 'unmount':
                actor.mountedTo = null;
                actor.pose = 'standing';
                actor.mountOffsetY = 0;
                break;
        }

        state.set('scene', { ...scene }, true);
        state.set('characters', { ...chars }, true);
    }

    static _findEntity(id, chars, scene) {
        if (!id) return null;
        if (chars[id]) return chars[id];
        const domains = ['props', 'foliage', 'buildings', 'mountains'];
        for (const domain of domains) {
            if (scene[domain]) {
                const found = scene[domain].find(e => e.id === id);
                if (found) return found;
            }
        }
        return null;
    }

    static _findHeldBy(actorId, chars, scene) {
        for (const char of Object.values(chars)) {
            if (char.parentId === actorId) return char;
        }
        const domains = ['props', 'foliage', 'buildings'];
        for (const domain of domains) {
            if (scene[domain]) {
                const found = scene[domain].find(e => e.parentId === actorId);
                if (found) return found;
            }
        }
        return null;
    }
}
