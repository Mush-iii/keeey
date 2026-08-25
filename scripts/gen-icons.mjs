// Generates all Tauri app icons from a procedurally drawn pulse-wave logo.
// Uses only Node built-ins (no canvas library required).

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src-tauri",
  "icons",
);

mkdirSync(outDir, { recursive: true });

// ---------------------------------------------------------------- png encoder

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // raw scanlines with filter byte 0
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------------ the icon

const BG_TOP = [34, 32, 58]; // dark indigo
const BG_BOTTOM = [22, 21, 38]; // darker
const LINE_COLOR = [96, 215, 136]; // green pulse
const GLOW_COLOR = [102, 153, 255]; // blue glow

/**
 * The signed distance to the pulse polyline at normalized coords (x, y)
 * in [0, 1]. Returns distance in normalized units.
 */
function distToWaveform(x, y) {
  // Pulse waveform control points.
  const pts = [
    [0.06, 0.52],
    [0.28, 0.52],
    [0.36, 0.30],
    [0.45, 0.74],
    [0.53, 0.44],
    [0.60, 0.56],
    [0.70, 0.52],
    [0.94, 0.52],
  ];
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = segDist(x, y, pts[i], pts[i + 1]);
    if (d < best) {
      best = d;
    }
  }
  return best;
}

function segDist(px, py, a, b) {
  const abx = b[0] - a[0];
  const aby = b[1] - a[1];
  const apx = px - a[0];
  const apy = py - a[1];
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / (abx * abx + aby * aby)));
  const dx = apx - abx * t;
  const dy = apy - aby * t;
  return Math.sqrt(dx * dx + dy * dy);
}

function drawIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const ss = 3; // supersampling factor
  const radiusRatio = 0.18; // rounded corner radius

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const x = (px + (sx + 0.5) / ss) / size;
          const y = (py + (sy + 0.5) / ss) / size;

          // Rounded rectangle coverage.
          const rad = radiusRatio;
          const cx = Math.max(rad, Math.min(x, 1 - rad));
          const cy = Math.max(rad, Math.min(y, 1 - rad));
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let bgA = dist <= rad ? 255 : Math.max(0, 255 - (dist - rad) * size * 2);
          if (bgA > 255) bgA = 255;

          if (bgA > 0) {
            // Vertical gradient background.
            const t = y;
            let br = BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t;
            let bg = BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t;
            let bb = BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t;

            // Subtle diagonal highlight.
            const hl = Math.max(0, 1 - Math.abs(x - y + 0.25) * 1.6) * 10;
            br += hl;
            bg += hl;
            bb += hl;

            // Waveform with soft glow.
            const d = distToWaveform(x, y); // in normalized units
            const lw = 0.035; // line half-width
            const core = clamp01((lw - d) / (lw * 0.5));
            const glow = clamp01((0.14 - d) / 0.14) ** 2 * 0.55;

            br += GLOW_COLOR[0] * glow;
            bg += GLOW_COLOR[1] * glow;
            bb += GLOW_COLOR[2] * glow;

            br = br * (1 - core) + LINE_COLOR[0] * core;
            bg = bg * (1 - core) + LINE_COLOR[1] * core;
            bb = bb * (1 - core) + LINE_COLOR[2] * core;

            r += br * bgA;
            g += bg * bgA;
            b += bb * bgA;
            a += bgA;
          }
        }
      }
      const n = ss * ss;
      const o = (py * size + px) * 4;
      if (n > 0 && a > 0) {
        rgba[o] = Math.round(r / a);
        rgba[o + 1] = Math.round(g / a);
        rgba[o + 2] = Math.round(b / a);
        rgba[o + 3] = Math.round(a / n);
      } else {
        rgba[o] = 0;
        rgba[o + 1] = 0;
        rgba[o + 2] = 0;
        rgba[o + 3] = 0;
      }
    }
  }
  return rgba;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function renderPng(size) {
  return encodePng(size, size, drawIcon(size));
}

function makeIco(sizes) {
  const pngs = sizes.map((s) => ({ s, png: renderPng(s) }));
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type icon
  header.writeUInt16LE(count, 4);
  const entries = [];
  let offset = 6 + 16 * count;
  for (const { s, png } of pngs) {
    const e = Buffer.alloc(16);
    e[0] = s >= 256 ? 0 : s;
    e[1] = s >= 256 ? 0 : s;
    e[2] = 0;
    e[3] = 0;
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map(({ png }) => png)]);
}

function makeIcns(sizes) {
  // types: icp4=16 icp5=32 ic11=32 ic12=64 ic07=128 ic08=256 ic09=512 ic10=1024
  const typeMap = [
    ["icp4", 16],
    ["icp5", 32],
    ["ic07", 128],
    ["ic08", 256],
    ["ic09", 512],
    ["ic10", 1024],
  ];
  const chunks = [];
  for (const [type, s] of typeMap) {
    const png = renderPng(s);
    const head = Buffer.alloc(8);
    head.write(type, 0, "ascii");
    head.writeUInt32BE(png.length + 8, 4);
    chunks.push(Buffer.concat([head, png]));
  }
  const total = chunks.reduce((a, c) => a + c.length, 8);
  const magic = Buffer.alloc(8);
  magic.write("icns", 0, "ascii");
  magic.writeUInt32BE(total, 4);
  return Buffer.concat([magic, ...chunks]);
}

console.log("Generating icons...");

writeFileSync(join(outDir, "icon.png"), renderPng(1024));
writeFileSync(join(outDir, "32x32.png"), renderPng(32));
writeFileSync(join(outDir, "128x128.png"), renderPng(128));
writeFileSync(join(outDir, "128x128@2x.png"), renderPng(256));
writeFileSync(join(outDir, "icon.ico"), makeIco([16, 24, 32, 48, 64, 128, 256]));
writeFileSync(join(outDir, "icon.icns"), makeIcns());

console.log(`Icons written to ${outDir}`);
