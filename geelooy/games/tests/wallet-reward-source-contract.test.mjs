//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file wallet-reward-source-contract.test.mjs
 * @description Guards modularity, documentation, blessing headers, and readable source form across the Wallet foundation.
 * The Awtsmoos is beyond every file boundary while disciplined vessels keep future extension bright;
 * Awtsmoos.com checks each module remains small, documented, unminified, and technically right.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const YESOD_WALLET_MODULES = [
	'../scripts/wallet-rewards/client.mjs',
	'../scripts/wallet-rewards/reward.mjs',
	'../scripts/wallet-rewards/toast.mjs',
	'../scripts/wallet-rewards/contracts/GevurahRewardClaimContract.mjs',
	'../scripts/wallet-rewards/identity/NetzachRewardClaimKeyFactory.mjs',
	'../scripts/wallet-rewards/orchestration/TiferesRewardClaimService.mjs',
	'../scripts/wallet-rewards/presentation/HodRewardNoticeCatalog.mjs',
	'../scripts/wallet-rewards/presentation/MalchusWalletRewardToastView.mjs',
	'../scripts/wallet-rewards/transport/HodWalletRewardResponseInterpreter.mjs',
	'../scripts/wallet-rewards/transport/YesodWalletRewardGateway.mjs'
];

test('Wallet foundation stays blessed, documented, and inside small-module bounds', () => {
	for (const yesodModulePath of YESOD_WALLET_MODULES) {
		const yesodSource = readWalletSource(yesodModulePath);
		assert.match(yesodSource, /^\/\/B"H\n\/\/ Boruch Hashem\n\/\/ Blessed is He/);
		assert.match(yesodSource, /Awtsmoos\.com/);
		assert.match(yesodSource, /\/\*\*[\s\S]*@description/);
		assert.ok(yesodSource.split(/\r?\n/).length <= 120, `${yesodModulePath} exceeds 120 lines`);
		assert.doesNotMatch(yesodSource, /function\s+\w+\([^)]*\)\s*\{[^\n}]+\}/);
	}
});

test('Wallet compatibility files expose only narrow public doorways', () => {
	const chesedClient = readWalletSource('../scripts/wallet-rewards/client.mjs');
	const tiferesReward = readWalletSource('../scripts/wallet-rewards/reward.mjs');
	const malchusToast = readWalletSource('../scripts/wallet-rewards/toast.mjs');
	assert.match(chesedClient, /export async function claimGameReward/);
	assert.match(chesedClient, /export function createRewardClaimKey/);
	assert.match(tiferesReward, /export async function claimAndToastReward/);
	assert.match(tiferesReward, /export function presentRewardResult/);
	assert.match(malchusToast, /export function showWalletRewardToast/);
});

/**
 * Reads one Wallet source module relative to this test without hiding filesystem failure.
 * @param {string} yesodRelativePath Source path relative to the test file.
 * @returns {string} UTF-8 module source.
 */
function readWalletSource(yesodRelativePath) {
	return readFileSync(new URL(yesodRelativePath, import.meta.url), 'utf8');
}
