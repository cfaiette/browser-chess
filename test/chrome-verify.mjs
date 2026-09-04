import { chromium } from "playwright";
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

async function shot(page, name, report) {
  const path = resolve(outDir, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  report.shots.push({ name, path: `docs/screenshots/${name}.png` });
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
  await page.waitForTimeout(900);

  const canvas = await page.locator("canvas").count();
  const pieceCount = await page.evaluate(() => {
    const game = window.__chess();
    let n = 0;
    for (const row of game.board) for (const p of row) if (p) n += 1;
    return n;
  });
  report.checks.canvasPresent = canvas >= 1;
  report.checks.startingPieceCount = pieceCount;
  report.checks.fen = await page.evaluate(() => window.__chess().fen());

  await shot(page, "start-position", report);

  await page.evaluate(() => window.__setCamera(10, 6, 10));
  await page.waitForTimeout(200);
  await shot(page, "angle-corner", report);

  await page.evaluate(() => window.__setCamera(0, 14, 0.01));
  await page.waitForTimeout(200);
  await shot(page, "angle-top", report);

  await page.evaluate(() => window.__setVsAi(false));
  await page.evaluate(() => window.__setCamera(0, 9.5, 11.5));
  const moved = await page.evaluate(() => window.__applyMove("e2", "e4"));
  report.checks.e2e4 = moved;
  await page.waitForTimeout(450);
  await shot(page, "after-e2e4", report);

  const capture = await page.evaluate(() => {
    const black = window.__applyMove("d7", "d5");
    const white = window.__applyMove("e4", "d5");
    return { black, white };
  });
  report.checks.captureExd5 = capture;
  await page.waitForTimeout(500);
  await shot(page, "after-capture", report);

  report.ok =
    report.checks.canvasPresent &&
    report.checks.startingPieceCount === 32 &&
    Boolean(moved?.ok) &&
    Boolean(capture?.white?.ok) &&
    report.shots.length >= 5;

  await browser.close();
} catch (err) {
  report.errors.push(String(err?.stack || err));
} finally {
  if (server) await new Promise((r) => server.close(r));
  report.finishedAt = new Date().toISOString();
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(report.ok ? "chrome verify ok" : "chrome verify failed");
  console.log("wrote", reportPath, `(${report.shots.length} shots)`);
  if (report.errors.length) console.error(report.errors.join("\n"));
  if (!report.ok) process.exitCode = 1;
}
