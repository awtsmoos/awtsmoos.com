/* B"H
 *
 * Awtsmoos native runtime: java.lang.Character ASCII core.
 *
 * Behavioral spec: Java Character semantics restricted to ASCII, as the
 * task's "(ASCII)" scope requires. The emulator declares the Character
 * covenant in frameworkJavaPrimitiveTypeFields.js (TYPE field); these are
 * the compilable method bodies.
 *
 * Code points arrive as int (Java char widens). Boolean results are 0/1.
 * Numeric literals are used for ASCII codes because the C lexer does not
 * accept character literals yet: 48='0', 57='9', 65='A', 90='Z',
 * 97='a', 122='z', 9='\t', 10='\n', 11=vertical tab, 12=form feed,
 * 13='\r', 32=space.
 */

int java_lang_Character_isDigit(int c) {
	return c >= 48 && c <= 57;
}

int java_lang_Character_isLetter(int c) {
	return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
}

int java_lang_Character_isWhitespace(int c) {
	/* Java isWhitespace ASCII set: \t \n \x0B \f \r and space.
	 * (0x1C-0x1F are NOT whitespace in Java; neither is 0.) */
	return c == 9 || c == 10 || c == 11 || c == 12 || c == 13 || c == 32;
}

int java_lang_Character_toLowerCase(int c) {
	if (c >= 65 && c <= 90) return c + 32;
	return c;
}

int java_lang_Character_toUpperCase(int c) {
	if (c >= 97 && c <= 122) return c - 32;
	return c;
}
