import { chromium } from "playwright";
import { spawn } from "child_process";
import { createServer } from "http";
import { mkdirSync, writeFileSync, existsSync, readFileSync, statSync } from "fs";
import { resolve, extname, join } from "path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const outDir = resolve(root, "docs/screenshots");
const reportPath = resolve(root, "docs/verify-chrome.json");
const port = 5179;
const base = `http://127.0.0.1:${port}`;

mkdirSync(outDir, { recursive: true });

const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
};

function serveDist() {
  return new Promise((resolveListen, reject) => {
    const server = createServer((req, res) => {
      const urlPath = (req.url || "/").split("?")[0];
      const filePath = resolve(dist, urlPath === "/" ? "index.html" : `.${urlPath}`);
      if (!filePath.startsWith(dist) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, { "Content-Type": mime[extname(filePath)] || "application/octet-stream" });
      res.end(readFileSync(filePath));
    });
    server.listen(port, "127.0.0.1", () => resolveListen(server));
    server.on("error", reject);
  });
}

const report = {
  ok: false,
  startedAt: new Date().toISOString(),
  shots: [],
  checks: {},
  errors: [],
};

let server;
try {
  if (!existsSync(join(dist, "index.html"))) {
    throw new Error("dist/ missing — run npm run build first");
  }
  server = await serveDist();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(20000);
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.__chess === "function", null, { timeout: 20000 });
  await page.waitForTimeout(1000);

  const startShot = resolve(outDir, "start-position.png");
  await page.screenshot({ path: startShot, fullPage: true });
  report.shots.push({ name: "start-position", path: "docs/screenshots/start-position.png" });

  const canvas = await page.locator("canvas").count();
  const pieceCount = await page.evaluate(() => {
    const game = window.__chess();
    let n = 0;
    for (const row of game.board) for (const p of row) if (p) n += 1;
    return n;
  });
  const fen = await page.evaluate(() => window.__chess().fen());

  report.checks = {
    canvasPresent: canvas >= 1,
    startingPieceCount: pieceCount,
    fen,
  };

  const moved = await page.evaluate(() => window.__applyMove("e2", "e4"));
  report.checks.e2e4 = moved;
  await page.waitForTimeout(500);

  const afterShot = resolve(outDir, "after-e2e4.png");
  await page.screenshot({ path: afterShot, fullPage: true });
  report.shots.push({ name: "after-e2e4", path: "docs/screenshots/after-e2e4.png" });

  report.ok =
    report.checks.canvasPresent &&
    report.checks.startingPieceCount === 32 &&
    Boolean(moved?.ok) &&
    report.shots.length === 2;

  await browser.close();
} catch (err) {
  report.errors.push(String(err?.stack || err));
} finally {
  if (server) await new Promise((r) => server.close(r));
  report.finishedAt = new Date().toISOString();
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(report.ok ? "chrome verify ok" : "chrome verify failed");
  console.log("wrote", reportPath);
  if (report.errors.length) console.error(report.errors.join("\n"));
  if (!report.ok) process.exitCode = 1;
}
