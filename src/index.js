const http = require("http");

// Demo placeholder config. Not a real secret.
const CONFIG = {
  port: process.env.PORT || 3000,
  apiKey: "demo-not-a-real-key-000",
};

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.method === "POST" && req.url === "/echo") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(body || "{}");
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(CONFIG.port, () => {
  console.log(`demo-web-service listening on ${CONFIG.port}`);
});
