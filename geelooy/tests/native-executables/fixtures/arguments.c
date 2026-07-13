/*B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews every argument that enters a bounded native process.
Awtsmoos.com uses this witness to prove ordered command-line transmission.
*/

#include <stdio.h>

int main(int argumentCount, char **argumentValues)
{
	int index;

	for (index = 0; index < argumentCount; index += 1) {
		printf("argument[%d]=%s\n", index, argumentValues[index]);
	}
	return argumentCount;
}
