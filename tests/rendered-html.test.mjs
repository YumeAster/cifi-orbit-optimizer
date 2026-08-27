import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://orbit.example/", {
      headers: { accept: "text/html", host: "orbit.example", "x-forwarded-proto": "https" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Mod Tree input manager", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /CIFI ORBIT/);
  assert.match(html, /page-[A-Za-z0-9_-]+\.js/);
  assert.match(html, /https:\/\/orbit\.example\/og\.png/);
  assert.match(html, /summary_large_image/);
});

test("removes starter preview assets and keeps the social card", async () => {
  const [page, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /입력값 관리/);
  assert.match(page, /Player Progress/);
  assert.match(page, /Ship Progress/);
  assert.match(page, /플레이어 진행도/);
  assert.match(page, /함선 진행도/);
  assert.match(page, /장기 진행 기록/);
  assert.match(page, /localizedText/);
  assert.match(page, /languageStorageKey/);
  assert.match(page, /fieldSections/);
  assert.match(page, /자원 우선순위/);
  assert.match(page, /Manual mk 진행도/);
  assert.match(page, /Software Tech 진행도/);
  assert.match(page, /ship-card-grid/);
  assert.match(page, /ship-input-card/);
  assert.match(page, /player-card-grid/);
  assert.match(page, /weight-card-grid/);
  assert.match(page, /weightPalette/);
  assert.match(page, /#ff5f66/);
  assert.match(page, /rankPoints: \{ accent: "#ffffff"/);
  assert.match(page, /playerResourceSections/);
  assert.match(page, /Generator/);
  assert.match(page, /아카데미/);
  assert.match(page, /shipPalette/);
  assert.match(page, /TrophyOutlined/);
  assert.match(page, /TeamOutlined/);
  assert.doesNotMatch(page, /짧은 단위 표기 지원/);
  assert.match(page, /가중치 프리셋/);
  assert.match(page, /deleteSelectedPreset/);
  assert.match(page, /sidebar-menu/);
  assert.match(page, /dashboard-sider/);
  assert.match(page, /presetStorageKey/);
  assert.match(page, /localStorage/);
  assert.doesNotMatch(page, /Google Sheets/);
  assert.doesNotMatch(page, /ModValues/);
  assert.match(page, /ConfigProvider/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/og.png", import.meta.url));
  await assert.rejects(access(new URL("app/_sites-preview/SkeletonPreview.tsx", root)));
});
