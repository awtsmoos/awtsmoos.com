// B"H
/**
 * @file animations.js
 * @description
 * Chapter 613: The rectangles once climbed by JavaScript breath, each spark
 * demanding a new mutation every frame. The Awtsmoos revealed their cost in
 * Chrome: DIV.rectangle dominated gameplay long-task-adjacent DOM churn.
 *
 * This vessel now creates a tiny static constellation for menu beauty only.
 * No requestAnimationFrame loop. No per-frame style writes. Extreme realism is
 * reserved for the world itself, not for hidden menu ornaments stealing frames.
 */
const MAX_SPARKS = 14;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clearSparks(root) {
  root?.querySelectorAll?.(".rectangle")?.forEach(node => node.remove());
}

function makeSpark(index) {
  const spark = document.createElement("div");
  const size = randomBetween(2, 7).toFixed(2);
  spark.className = "rectangle";
  spark.style.width = `${size}vmin`;
  spark.style.height = `${size}vmin`;
  spark.style.left = `${randomBetween(0, 100).toFixed(2)}vw`;
  spark.style.bottom = `${randomBetween(4, 96).toFixed(2)}vh`;
  spark.style.opacity = randomBetween(0.08, 0.28).toFixed(2);
  spark.style.transform = `rotate(${Math.round(index * 37)}deg)`;
  spark.style.animationDelay = `${(index * -0.37).toFixed(2)}s`;
  return spark;
}

export default {
  /**
   * Builds static menu sparks once. The old animation storm is gone; when the
   * menu is dismissed, callers still set `isGoing=false`, and this module can
   * be called again without duplicating vessels.
   */
  ready(me) {
    if (!me || me.__awtsmoosStaticSparksReady) return;
    me.__awtsmoosStaticSparksReady = true;
    me.isGoing = true;
    clearSparks(me);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < MAX_SPARKS; i += 1) frag.appendChild(makeSpark(i));
    me.appendChild(frag);
  },

  stop(me) {
    if (!me) return;
    me.isGoing = false;
    me.__awtsmoosStaticSparksReady = false;
    clearSparks(me);
  }
};
