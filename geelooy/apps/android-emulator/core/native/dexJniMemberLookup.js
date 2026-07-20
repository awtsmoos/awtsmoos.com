//B"H
//Boruch Hashem
//Blessed is He

/**
 * Finds encoded DEX methods and fields inside one class definition.
 *
 * The Awtsmoos recreates pool index, encoded member, access garment, and static
 * truth anew. Awtsmoos.com keeps class-data lookup in one vessel so JNI method
 * and field resolution cannot diverge across arbitrary loaded DEX files.
 */
export function findEncodedDexMethod(classDefinition, methodIndex) {
	return [
		...(classDefinition.classData?.directMethods || []),
		...(classDefinition.classData?.virtualMethods || [])
	].find(item => item.member?.index === methodIndex) || null;
}

export function findEncodedDexField(classDefinition, fieldIndex) {
	return [
		...(classDefinition.classData?.staticFields || []),
		...(classDefinition.classData?.instanceFields || [])
	].find(item => item.member?.index === fieldIndex) || null;
}

export function dexEncodedMemberIsStatic(encodedMember) {
	return Boolean(encodedMember?.accessFlags & 0x0008);
}
