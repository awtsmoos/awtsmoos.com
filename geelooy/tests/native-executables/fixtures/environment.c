/*B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews the bounded environment surrounding every process.
Awtsmoos.com uses this witness to prove declared values without inherited secrets.
*/

#include <stdio.h>
#include <stdlib.h>

int main(void)
{
	const char *value = getenv("AWTSMOOS_TEST_VALUE");

	printf("AWTSMOOS_TEST_VALUE=%s\n", value == NULL ? "<missing>" : value);
	return value == NULL ? 2 : 0;
}
