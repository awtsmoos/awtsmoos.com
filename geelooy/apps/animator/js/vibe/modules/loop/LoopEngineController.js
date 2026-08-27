
// B"H
/**
 * @file LoopEngineController.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 13: THE INSTANT MANIFESTATION (Hitgalut Rega'it)
 * THE DUPLICATE DIRECTORY-CREATION RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * "And God saw all that He had made, and behold, it was very good."
 * — Bereishis 1:31
 *
 * THE BUG OF THE DUPLICATE FOUNDATION-BUILDER:
 * LoopEngineController._verifyFoundationsPresent() was a complete
 * copy of ArchitectOfDomains.ensureExists(). Both maintained their own
 * private Set of known folders. When running in parallel (Promise.all),
 * they both detected 'folder not in my set' and both attempted to
 * create the same directory simultaneously, causing race conditions
 * and wasted disk I/O.
 *
 * THE POEM OF THE DUPLICATE BUILDER:
 * Two architects stood at the same blueprint,
 * Each building the folders without a clue!
 * One's cache said 'unknown', the other agreed,
 * And both tried to mkdir at furious speed!
 * Collisions, errors, and wasted disk time,
 * Now one architect builds — the other steps aside in rhyme!
 *
 * RECTIFICATION: _verifyFoundationsPresent is DELETED.
 * All directory creation delegates to ArchitectOfDomains.ensureExists()
 * which maintains a single, shared RAM cache and distributed lock map.
 *
 * @module LoopEngineController
 */
import { State }              from '../../../state.js';
import { FileSystemProvider } from '../../../fs-provider.js';
import { Workspaces }         from '../../../workspaces/index.js';
import { UI }                 from '../../../ui.js';
import { VibeDB }             from '../../../db.js';
import { LoopGitPusher }      from './LoopGitPusher.js';
import { LoopErrorHandler }   from './LoopErrorHandler.js';
import { ArchitectOfDomains } from './engine/ArchitectOfDomains.js';

export const LoopEngineController = {

  /**
   * @function executeBatch
   * @description
   * Applies a compiled array of file changes to the physical disk in
   * maximum parallel, broadcasting UI updates instantly at 0ms latency.
   *
   * THE HYMN OF THE LIGHTNING BATCH:
   * Ten files, a hundred, a thousand alight,
   * All launched to the disk at the speed of light!
   * No chunking, no waiting, no sequential chain,
   * Promise.all fires them all in the same eternal flame!
   *
   * @param {Array<Object>}  compiledChangeArray    - The file operations to execute.
   * @param {string|number}  parentWorldId          - The workspace ID.
   * @param {string|null}    timestreamTokenId      - Session ID for timeline ledger.
   * @param {boolean}        blockTimelinePush      - If true, skip history recording.
   * @param {Function|null}  iterationProgressSignal - Optional per-item progress cb.
   * @returns {Promise<void>}
   */
  async executeBatch(compiledChangeArray, parentWorldId, timestreamTokenId = null, blockTimelinePush = false, iterationProgressSignal = null) {
    if (!compiledChangeArray || compiledChangeArray.length === 0) return;

    console.log(`[LoopEngine] B"H - Initiating INSTANT Manifestation of ${compiledChangeArray.length} vessels.`);

    const foundationRef = State.workspaces.find(vessel => String(vessel?.id) === String(parentWorldId));
    if (!foundationRef) return;

    const corePhysicalContextType  = foundationRef.originalType || foundationRef.type;
    const triggerDirectoryUpdates  = new Set();
    const activeTimelineLedger     = [];
    let   volumetricBytesPushed    = 0;

    const taskId = `vibe-batch-${Date.now()}`;
    const total  = compiledChangeArray.length;

    UI.startTask(taskId, `Manifesting ${total} vessels...`);
    let completed = 0;

    // ── 1. ABSOLUTE INSTANT UI BROADCAST (0ms Latency) ──────────
    compiledChangeArray.forEach(shiftObject => {
      this._broadcastUIAdjustments(shiftObject, parentWorldId);
      if (iterationProgressSignal) iterationProgressSignal(shiftObject, true);
    });

    // ── 2. MASSIVE PARALLEL PHYSICAL DISK I/O ───────────────────
    await Promise.all(compiledChangeArray.map(async (shiftObject) => {
      const safePathName = shiftObject.path.split('/').pop();

      const physicalRepresentationObj = {
        ...foundationRef,
        path: shiftObject.path,
        kind: 'file',
        workspaceId: parentWorldId,
        type: corePhysicalContextType,
        originalType: corePhysicalContextType
      };

      // ── PHASE A: LIGHTNING LEDGER PRE-READ ─────────────────
      if (!blockTimelinePush && timestreamTokenId) {
        let priorStoredContent = null;

        const openTab = State.tabs.find(
          t => t.item.path === shiftObject.path && String(t.item.workspaceId) === String(parentWorldId)
        );

        if (openTab && openTab.content !== undefined && openTab.content !== null) {
          priorStoredContent = openTab.content;
        } else {
          try {
            const bytesRaw     = await FileSystemProvider.read(physicalRepresentationObj);
            priorStoredContent = (bytesRaw instanceof Blob) ? await bytesRaw.text() : String(bytesRaw);
          } catch (e) { /* File doesn't exist yet — that's fine */ }
        }

        const prospectiveBytesValue = shiftObject.operation === 'delete' ? null : shiftObject.content;
        volumetricBytesPushed += prospectiveBytesValue ? prospectiveBytesValue.length : 0;

        activeTimelineLedger.push({
          path:       shiftObject.path,
          operation:  shiftObject.operation,
          oldContent: priorStoredContent,
          newContent:  prospectiveBytesValue
        });
      }

      // ── PHASE B: INSTANT PHYSICAL WRITE ────────────────────
      try {
        if (shiftObject.operation === 'delete') {
          await FileSystemProvider.delete(physicalRepresentationObj);
        } else {
          // RECTIFICATION: Delegate entirely to ArchitectOfDomains.
          // _verifyFoundationsPresent has been REMOVED to eliminate the
          // duplicate cache, the duplicate lock map, and the race condition.
          await ArchitectOfDomains.ensureExists(foundationRef, shiftObject.path, corePhysicalContextType);
          await FileSystemProvider.write(physicalRepresentationObj, shiftObject.content);
        }

        const extractionIdx        = shiftObject.path.lastIndexOf('/');
        const superiorCoordinate   = extractionIdx <= 0 ? '/' : shiftObject.path.substring(0, extractionIdx);
        triggerDirectoryUpdates.add(superiorCoordinate);

      } catch (errDataBlock) {
        LoopErrorHandler.handle(errDataBlock, shiftObject.path, taskId, null, shiftObject);
      }

      completed++;
      if (completed % 10 === 0 || completed === total) {
        UI.updateTask(taskId, (completed / total) * 100, `Solidified: ${safePathName}`);
      }
    }));

    UI.endTask(taskId, 'success', `Solidified ${total} vessels.`);

    // ── 3. ASYNC BACKGROUND TASKS (History & Git) ───────────────
    if (!blockTimelinePush && timestreamTokenId && activeTimelineLedger.length > 0) {
      VibeDB.saveTimelineRecord({
        id:          String(Date.now()),
        sessionId:   timestreamTokenId,
        workspaceId: parentWorldId,
        timestamp:   Date.now(),
        sizeBytes:   volumetricBytesPushed,
        changes:     activeTimelineLedger
      }).catch(e => console.warn('Timeline save delayed', e));
    }

    LoopGitPusher.autoCommit(foundationRef, compiledChangeArray).catch(() => {});

    for (const coordPoint of triggerDirectoryUpdates) {
      Workspaces.refreshNode({
        ...foundationRef, path: coordPoint,
        kind: 'directory', workspaceId: parentWorldId,
        type: corePhysicalContextType
      }).catch(() => {});
    }
  },

  /**
   * @function _broadcastUIAdjustments
   * @description
   * Instantly updates any open editor tabs that correspond to changed files,
   * achieving 0ms perceived write latency in the UI.
   *
   * @param {Object}        shiftObjRef    - The change descriptor.
   * @param {string|number} systemWSIDKey  - The workspace ID string.
   * @returns {void}
   * @private
   */
  _broadcastUIAdjustments(shiftObjRef, systemWSIDKey) {
    const openTab = State.tabs.find(
      t => t.item.path === shiftObjRef.path && String(t.item.workspaceId) === String(systemWSIDKey)
    );
    if (openTab && shiftObjRef.operation !== 'delete') {
      openTab.content       = shiftObjRef.content;
      openTab.isDirty       = false;
      openTab.isUncommitted = true;
      if (State.activeTabId === openTab.id) {
        import('../../../editor.js').then(({ Editor }) => {
          if (Editor && Editor.setCurrentContent) Editor.setCurrentContent(shiftObjRef.content);
        });
      }
    }
  }
};
