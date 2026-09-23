import { copyFile, mkdir } from "node:fs/promises";

const assets = [
  "index.html",
  "app.js",
  "unified.css",
  "writercut-logo.svg",
  "writercut-piano-logo.webp",
];

await mkdir("dist", { recursive: true });
await Promise.all(assets.map((asset) => copyFile(asset, `dist/${asset}`)));
console.log(`Built ${assets.length} static WriterCut files in dist/`);
