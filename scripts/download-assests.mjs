// Downloads the artwork used by the screens from Figma into ./assets
// Run with:  node scripts/download-assets.mjs
// The Figma asset links expire after 7 days. If a download fails, ask Claude to
// re-read the design from Figma and it will give you fresh links.
import { mkdir, writeFile } from 'node:fs/promises';

const base = {
  s2: 'https://www.figma.com/api/mcp/asset/40c64be4-19ae-47c8-987f-da54cb256079',
  s3: 'https://www.figma.com/api/mcp/asset/c7ab9cdc-5515-4c04-a12f-4a1949fd63af',
  s5: 'https://www.figma.com/api/mcp/asset/c45278ec-5e73-49c1-be6e-a354e9b2f9e4',
  s6: 'https://www.figma.com/api/mcp/asset/ec5953fb-1139-4214-ab03-2c26e353b41e',
};

const files = {
  'book.svg': `${base.s2}/3a9d9.svg`, // logo book
  'laptop.png': `${base.s3}/7ae59.png`, // onboarding 1 laptop
  'check.png': `${base.s3}/cea15.png`, // onboarding 1 green check
  'deadlines-sprite.png': `${base.s5}/264e4.png`, // onboarding 2 sprite sheet
  'progress-sprite.png': `${base.s6}/e8e25.png`, // onboarding 3 sprite sheet
  'progress-chart.png': `${base.s6}/a3203.png`, // onboarding 3 study overview
};

await mkdir(new URL('../assets/', import.meta.url), { recursive: true });
for (const [name, url] of Object.entries(files)) {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`FAILED ${name}: ${res.status}`);
    process.exitCode = 1;
    continue;
  }
  await writeFile(new URL(`../assets/${name}`, import.meta.url), Buffer.from(await res.arrayBuffer()));
  console.log(`saved assets/${name}`);
}
