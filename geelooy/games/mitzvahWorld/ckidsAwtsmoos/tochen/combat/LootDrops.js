/**
 * B\"H
 * @file LootDrops.js
 * @description
 * Loot and spark drops from refined klipos.
 */

export function createLootDrop(enemy = {}) {
  const sparks = Math.max(1, Number(enemy.sparkDrop) || 1);
  const exp = Math.max(0, Number(enemy.exp) || 0);

  const items = [
    { id: "spark_of_creation", name: "Spark of Creation", amount: sparks, type: "resource" },
    { id: "experience_light", name: "Light of Experience", amount: exp, type: "exp" }
  ];

  if ((enemy.level || 1) >= 10) {
    items.push({ id: "scroll_fragment", name: "Sacred Scroll Fragment", amount: 1, type: "resource" });
  }

  return items;
}
