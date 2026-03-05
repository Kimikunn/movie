const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(process.cwd(), 'analysis', 'screenshots');
const REPORT_PATH = path.resolve(process.cwd(), 'analysis', 'screenshot-report.json');
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const PAGES = ['/dashboard', '/profile', '/movies'];
const SCROLLER_SELECTOR = '.app-content';

async function run() {
  const { chromium } = require('playwright');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 402, height: 874 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    serviceWorkers: 'block',
  });

  const report = [];

  for (const route of PAGES) {
    const page = await context.newPage();
    const url = `${BASE_URL}${route}`;

    const consoleErrors = [];
    const requestFailures = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('requestfailed', (req) => {
      requestFailures.push({
        url: req.url(),
        method: req.method(),
        failure: req.failure() ? req.failure().errorText : 'unknown',
      });
    });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(600);

    const screenshotName = route.replace('/', '') || 'home';
    await page.evaluate((selector) => {
      window.scrollTo(0, 0);
      const scroller = document.querySelector(selector);
      if (scroller instanceof HTMLElement) {
        scroller.scrollTop = 0;
      }
    }, SCROLLER_SELECTOR);

    const scrollerInfo = await page.evaluate((selector) => {
      const scroller = document.querySelector(selector);
      if (!(scroller instanceof HTMLElement)) {
        return { found: false, scrollHeight: 0, clientHeight: 0, maxScrollTop: 0 };
      }
      const maxScrollTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      return {
        found: true,
        scrollHeight: scroller.scrollHeight,
        clientHeight: scroller.clientHeight,
        maxScrollTop,
      };
    }, SCROLLER_SELECTOR);

    const screenshotPath = path.join(OUTPUT_DIR, `${screenshotName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    const scrollPositions = [
      { key: 'top', value: 0 },
      { key: 'mid', value: Math.round(scrollerInfo.maxScrollTop / 2) },
      { key: 'bottom', value: scrollerInfo.maxScrollTop },
    ];
    const shots = [];

    for (const pos of scrollPositions) {
      await page.evaluate(
        ({ selector, top }) => {
          const scroller = document.querySelector(selector);
          if (scroller instanceof HTMLElement) {
            scroller.scrollTop = top;
          }
        },
        { selector: SCROLLER_SELECTOR, top: pos.value },
      );
      await page.waitForTimeout(180);
      const segmentPath = path.join(OUTPUT_DIR, `${screenshotName}-${pos.key}.png`);
      await page.screenshot({ path: segmentPath, fullPage: false });
      shots.push({ key: pos.key, scrollTop: pos.value, path: segmentPath });
    }

    report.push({
      route,
      url,
      screenshotPath,
      scrollerInfo,
      segmentScreenshots: shots,
      consoleErrors,
      requestFailures,
      title: await page.title(),
    });

    await page.close();
  }

  await browser.close();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Saved report to ${REPORT_PATH}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
