
// B"H

/**
 * @file WorldStageContract.js
 * @description
 * ============================================================================
 * CHAPTER: THE CONTRACT THAT STOPPED THE BACKGROUND FROM VANISHING
 * ============================================================================
 *
 * This contract deliberately supports many possible render context shapes,
 * because the app's RenderContext may expose canvas data through canvas, ctx,
 * viewport, width getters, or client dimensions.
 *
 * Every modular scene file must use this contract and never hardcode tiny
 * 320x240 world sizes again.
 *
 * @module WorldStageContract
 */

/**
 * @class WorldStageContract
 * @description
 * Resolves real stage dimensions and named y-lines.
 */
export class WorldStageContract {
  /**
   * Resolves a contract from render context.
   *
   * @param {Object} renderContext - Render context.
   * @returns {Object} Contract.
   */
  static resolve(renderContext = {}) {
    const canvas = this.canvasOf(renderContext);
    const viewport = renderContext.viewport || {};
    const width = Math.max(
      1,
      Number(canvas.width || viewport.width || renderContext.width || renderContext.clientWidth || globalThis.innerWidth || 800)
    );
    const height = Math.max(
      1,
      Number(canvas.height || viewport.height || renderContext.height || renderContext.clientHeight || globalThis.innerHeight || 600)
    );

    const horizonY = height * 0.48;
    const skylineBaseY = height * 0.72;
    const sidewalkTopY = height * 0.72;
    const roadTopY = height * 0.84;
    const actorGroundY = roadTopY + (height - roadTopY) * 0.56;

    const contract = {
      width,
      height,
      dpr: Math.max(1, Number(globalThis.devicePixelRatio || 1)),
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      centerX: width * 0.5,
      centerY: height * 0.5,
      horizonY,
      skylineBaseY,
      sidewalkTopY,
      roadTopY,
      actorGroundY,
      stageBottomY: height,
      stageWidth: width,
      stageHeight: height
    };

    contract.resolveX = value => this.resolveX(contract, value);
    contract.resolveY = value => this.resolveY(contract, value);

    return contract;
  }

  /**
   * Finds canvas from many possible context shapes.
   *
   * @param {Object} context - Render context.
   * @returns {Object} Canvas-like object.
   */
  static canvasOf(context = {}) {
    return context.canvas || context.ctx?.canvas || context.context?.canvas || context.renderer?.canvas || {};
  }

  /**
   * Resolves x value.
   *
   * @param {Object} contract - Contract.
   * @param {number|string} value - Value.
   * @returns {number} X.
   */
  static resolveX(contract, value) {
    if (typeof value === 'number') return value <= 1 && value >= 0 ? contract.width * value : value;
    if (value === 'center') return contract.centerX;
    if (value === 'left') return contract.left;
    if (value === 'right') return contract.right;
    return 0;
  }

  /**
   * Resolves y value.
   *
   * @param {Object} contract - Contract.
   * @param {number|string} value - Value.
   * @returns {number} Y.
   */
  static resolveY(contract, value) {
    if (typeof value === 'number') return value <= 1 && value >= 0 ? contract.height * value : value;

    const map = {
      top: 0,
      horizon: contract.horizonY,
      horizonY: contract.horizonY,
      skylineBase: contract.skylineBaseY,
      skylineBaseY: contract.skylineBaseY,
      sidewalkTop: contract.sidewalkTopY,
      sidewalkTopY: contract.sidewalkTopY,
      roadTop: contract.roadTopY,
      roadTopY: contract.roadTopY,
      actorGround: contract.actorGroundY,
      actorGroundY: contract.actorGroundY,
      bottom: contract.stageBottomY,
      stageBottom: contract.stageBottomY,
      stageBottomY: contract.stageBottomY
    };

    return Number.isFinite(map[value]) ? map[value] : 0;
  }
}
