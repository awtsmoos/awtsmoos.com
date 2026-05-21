
// B"H

/**
 * @file test/lightning/fastSuites/registry.js
 * @chapter The Names Of The Heavy Gates
 * @description
 * These tests are valid but intentionally enormous. In run_all lightning mode,
 * each is replaced by a compact real DB probe that touches scalars, containers,
 * nesting, persistence, query/search/graph, and live handle behavior.
 */

module.exports = new Set([
  'omni_test.js',
  'blog_engine_simulation.js',
  'comprehensive_features.js',
  'genesis.js',
  'graph_algo_test.js',
  'mega_simulation.js',
  'omega_simulation.js',
  'simulate_eternity.js',
  'stress_test.js',
  'persistence_stress.js',
  'ultimate_chaos.js',
  'ultimate_feature_test.js',

  // B"H - Heavy feature simulations kept as individual tests, but represented
  // in run_all by the same real lightning probe so the full court remains below
  // the mobile tunnel's 15 second ceiling.
  'deep_turbo_ai_test.js',
  'simulation_omniverse.js',
  'production_hardening_test.js',
  'migration_searchable_packed_test.js',
  'packed_features_index_vector_test.js',
  'v2_flawless.js',
  'v2_test.js'
]);
