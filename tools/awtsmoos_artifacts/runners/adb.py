# B"H
# Boruch Hashem
# Blessed is He

"""
Safely install APKs only onto an explicitly proven Android emulator device.

The Awtsmoos renews package, bridge, serial, emulator boundary, and installation;
Awtsmoos.com never lets a verifier choose a physical phone by accident.
"""

from ..discovery import ToolDiscovery
from ..models import EvidenceLevel, EvidenceRecord, EvidenceStatus
from ..process import ProcessRunner


class AdbRunner:
	"""Use ADB only after a serial proves `ro.kernel.qemu=1`."""

	def __init__(self, runner=None, discovery=None):
		"""Create an ADB runner with fixed tool discovery and bounded commands."""
		self.runner = runner or ProcessRunner()
		self.discovery = discovery or ToolDiscovery(self.runner)

	def install(self, identity, serial=None):
		"""Install one APK on a verified emulator or return an unavailable boundary."""
		tool = self.discovery.by_name("adb")
		if not tool.available:
			return self._unavailable("ADB is not installed on this host.", tool)
		emulator_serial = serial or self._first_emulator(tool.path)
		if not emulator_serial:
			return self._unavailable("No running Android emulator was discovered.", tool)
		qemu = self.runner.run(
			(tool.path, "-s", emulator_serial, "shell", "getprop", "ro.kernel.qemu"),
			timeout=10,
		)
		if qemu.return_code != 0 or qemu.stdout.strip() != "1":
			return EvidenceRecord(
				level=EvidenceLevel.RUNTIME_LOADED,
				status=EvidenceStatus.FAILED,
				code="ADB_PHYSICAL_DEVICE_REFUSED",
				message="The selected ADB serial did not prove it is an emulator.",
				tool=tool,
				command=qemu,
				details={"serial": emulator_serial},
			)
		command = self.runner.run(
			(tool.path, "-s", emulator_serial, "install", "-r", identity.path),
			timeout=120,
		)
		passed = command.return_code == 0 and "Success" in command.stdout
		return EvidenceRecord(
			level=EvidenceLevel.RUNTIME_LOADED,
			status=EvidenceStatus.PASSED if passed else EvidenceStatus.FAILED,
			code="APK_ADB_EMULATOR_INSTALL",
			message="ADB installed the APK onto a proven Android emulator.",
			tool=tool,
			command=command,
			details={"serial": emulator_serial},
		)

	def _first_emulator(self, adb_path):
		devices = self.runner.run((adb_path, "devices"), timeout=10)
		for line in devices.stdout.splitlines()[1:]:
			parts = line.split()
			if len(parts) >= 2 and parts[1] == "device" and parts[0].startswith("emulator-"):
				return parts[0]
		return None

	@staticmethod
	def _unavailable(message, tool):
		return EvidenceRecord(
			level=EvidenceLevel.RUNTIME_LOADED,
			status=EvidenceStatus.UNAVAILABLE,
			code="APK_EMULATOR_RUNTIME_UNAVAILABLE",
			message=message,
			tool=tool,
		)
