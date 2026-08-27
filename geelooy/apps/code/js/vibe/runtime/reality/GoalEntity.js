// B"H

/**
 * @file GoalEntity.js
 * @brief Turns one human sentence into a persistent runtime covenant.
 *
 * The Awtsmoos is not trapped in the letters, yet the letters carry the
 * life-force of the software world. This class gives the one-line user intent
 * a durable vessel: phases, evidence, failures, previews, and verification.
 */

/**
 * Represents one autonomous app-building goal as a living state object.
 */
export class GoalEntity {
    /**
     * @param {object} seed Goal seed.
     * @param {string} seed.goal Human intent.
     * @param {string} [seed.target="/"] Project path.
     * @param {object} [seed.options] Execution options.
     */
    constructor(seed = {}) {
        this.id = seed.id || GoalEntity.createId();
        this.goal = String(seed.goal || seed.intent || '').trim();
        this.target = seed.target || seed.project_path || '/';
        this.options = seed.options || {};
        this.status = 'born';
        this.createdAt = seed.createdAt || new Date().toISOString();
        this.updatedAt = this.createdAt;
        this.phases = [];
        this.previews = [];
        this.snapshots = [];
        this.repairs = [];
        this.failures = [];
        this.verification = null;
    }

    /**
     * Creates a stable-enough local id for a browser runtime session.
     *
     * @returns {string} Goal id.
     */
    static createId() {
        return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    /**
     * Records an execution phase with evidence.
     *
     * @param {string} name Phase name.
     * @param {object} [details] Phase evidence.
     * @returns {GoalEntity} This entity.
     */
    phase(name, details = {}) {
        this.phases.push({
            name,
            status: details.status || 'observed',
            at: new Date().toISOString(),
            details
        });
        return this.touch(details.status || this.status);
    }

    /**
     * Adds a preview descriptor to the goal history.
     *
     * @param {object} preview Preview result.
     * @returns {GoalEntity} This entity.
     */
    preview(preview = {}) {
        this.previews.push({
            id: preview.id || null,
            status: preview.status || null,
            url: preview.url || preview.localUrl || preview.virtualUrl || null,
            publicUrl: preview.publicUrl || null,
            at: new Date().toISOString()
        });
        return this.touch('previewed');
    }

    /**
     * Adds a runtime snapshot to the goal.
     *
     * @param {object} snapshot Runtime snapshot.
     * @returns {GoalEntity} This entity.
     */
    snapshot(snapshot = {}) {
        this.snapshots.push(snapshot);
        return this.touch('inspected');
    }

    /**
     * Records a repair or proposed repair action.
     *
     * @param {object} repair Repair record.
     * @returns {GoalEntity} This entity.
     */
    repair(repair = {}) {
        this.repairs.push({ ...repair, at: new Date().toISOString() });
        return this.touch('repairing');
    }

    /**
     * Records failure evidence without hiding it.
     *
     * @param {object|string} failure Failure evidence.
     * @returns {GoalEntity} This entity.
     */
    fail(failure) {
        this.failures.push({
            message: typeof failure === 'string' ? failure : failure?.message || 'failure',
            evidence: typeof failure === 'string' ? null : failure,
            at: new Date().toISOString()
        });
        return this.touch('blocked');
    }

    /**
     * Stores the latest verification result.
     *
     * @param {object} verification Verification record.
     * @returns {GoalEntity} This entity.
     */
    verify(verification = {}) {
        this.verification = { ...verification, at: new Date().toISOString() };
        return this.touch(verification.ok ? 'verified' : 'needs_repair');
    }

    /**
     * Updates mutable timestamps and status.
     *
     * @param {string} status New status.
     * @returns {GoalEntity} This entity.
     */
    touch(status = this.status) {
        this.status = status;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    /**
     * Serializes the goal into a plain JSON vessel.
     *
     * @returns {object} Serializable goal state.
     */
    toJSON() {
        return {
            id: this.id,
            goal: this.goal,
            target: this.target,
            options: this.options,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            phases: this.phases,
            previews: this.previews,
            snapshots: this.snapshots,
            repairs: this.repairs,
            failures: this.failures,
            verification: this.verification
        };
    }
}
