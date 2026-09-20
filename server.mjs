import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve(process.argv[2] || "."),
  port = Number(process.env.PORT || process.argv[3] || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".json": "application/json",
};
createServer(async (req, res) => {
  try {
    let p = resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://local").pathname),
    );
    if (p !== root && !p.startsWith(root + sep)) {
      res.writeHead(403);
      return res.end();
    }
    if ((await stat(p)).isDirectory()) p = resolve(p, "index.html");
    res.writeHead(200, {
      "Content-Type": types[extname(p)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(await readFile(p));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log("Local: http://127.0.0.1:" + port),
);
