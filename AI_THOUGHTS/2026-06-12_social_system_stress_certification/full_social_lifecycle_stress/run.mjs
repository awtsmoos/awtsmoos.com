//B"H
/**
 * @module FullSocialLifecycleStressRun
 * @description
 * Ten gates, one river: the Awtsmoos reveals whether the social API lives.
 */
import { seedApiKey, startServer, stopServer, dbRoot } from './server.mjs';
import { runIdentityGates } from './gates_identity.mjs';
import { runContentGates } from './gates_content.mjs';
import { runPlatformGates } from './gates_platform.mjs';

function makeContext() {
  const suffix = Date.now().toString(36);
  const runId = `BH_FULL_SOCIAL_${suffix}`;
  return {
    suffix,
    runId,
    userId: `${runId}_USER_A`,
    userIdB: `${runId}_USER_B`,
    aliasA: `full_a_$${suffix}`,
    aliasB: `full_b_$${suffix}`,
    heichelId: `fullHeichel_$${suffix}`,
    seriesA: `fullSeriesA_$${suffix}`,
    seriesB: `fullSeriesB_$${suffix}`,
    seriesDelete: `fullSeriesDelete_$${suffix}`,
    questionId: `fullQuestion_$${suffix}`,
    answerId: `fullAnswer_$${suffix}`,
    sectionId: `fullSection_$${suffix}`
  };
}

async function main() {
  const ctx = makeContext();
  ctx.apiKey = await seedApiKey(ctx.userId);
  ctx.apiKeyB = await seedApiKey(ctx.userIdB);
  const server = await startServer();
  try {
    await runIdentityGates(ctx);
    await runContentGates(ctx);
    await runPlatformGates(ctx);
    console.log('B"H full social lifecycle stress passed', JSON.stringify({
      dbRoot,
      runId: ctx.runId,
      aliases: [ctx.aliasA, ctx.aliasB],
      heichelId: ctx.heichelId,
      series: [ctx.seriesA, ctx.seriesB, ctx.seriesDelete],
      postId: ctx.postId,
      questionId: ctx.questionId,
      answerId: ctx.answerId,
      commentId: ctx.commentId,
      replyIdDeleted: ctx.replyId,
      gates: 10
    }, null, 2));
  } finally {
    await stopServer(server);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
