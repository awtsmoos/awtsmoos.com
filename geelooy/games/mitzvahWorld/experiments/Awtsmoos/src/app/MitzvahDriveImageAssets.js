// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahDriveImageAssets.js
 * @description
 * The Awtsmoos keeps photographic bodies in public Drive while source carries only immutable coordinates.
 * Every URL below is content-addressed by the SHA-256 of the verified image it reveals.
 */

const DRIVE_ROOT = 'https://awtsmoos.com/api/social/drive/public/awtsfixmvplwhac/repo-assets/sha256';

/** Build one immutable public Drive URL from a verified digest and filename. */
function driveImageUrl(sha256, filename) {
	return `${DRIVE_ROOT}/${sha256}/${filename}`;
}

export const HOUSE_PHOTO_URL_BY_ROLE = Object.freeze({
	brick: driveImageUrl('8b2492a0483446093038c5620dce1fa7c9f66c4824985030b3c95dba77ac0269', 'brick_4.jpg'),
	brickLight: driveImageUrl('82e43c68bddebb55a18577ae3cb0d01c02c23f086d342a854ff8a174d9f4fd73', 'clay_plaster.jpg'),
	floor: driveImageUrl('aab330227974aadbc477b2022351112f5696fa7048d99dc776c2e6f23f4e0d2a', 'cobblestone_01.jpg'),
	mezuzah: driveImageUrl('f715ed3e4346e94f971ef8dd61221ff6cc774886c20f65381e01e1dc0bb0a634', 'oak_wood_planks.jpg'),
	roof: driveImageUrl('aac0f4e742a2cce21afb5dfb523b47c720c6a8e2782a312b823608fe3f80eae6', 'clay_roof_tiles.jpg'),
	wood: driveImageUrl('f715ed3e4346e94f971ef8dd61221ff6cc774886c20f65381e01e1dc0bb0a634', 'oak_wood_planks.jpg')
});

export const MITZVAH_REMOTE_IMAGE_ASSETS = Object.freeze({

essentialGrass: driveImageUrl('632d94c4225546aa57db7b75b3f6819c4cc95343b4b7add5ada44688f8722942', 'essential-grass.jpg'),
	barkAlbedo: driveImageUrl('986f2f186b102cd43062bb8452011e435c3fb277f22c3b6024a7159d3d224aa1', 'bark-albedo.png'),
	barkNormal: driveImageUrl('1ba9fdf124455921377c51d8f602b62477cbe1ae3e6607c1d0b06c04b947f95b', 'bark-normal.png'),
	barkRough: driveImageUrl('861e5ee6830647e5ff3bbf18cdcbfbdb1b32a209bf2d62299515636cce2e99b6', 'bark-rough.png')
});
