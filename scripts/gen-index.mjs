import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const manifestPath = join(rootDir, "dist", "assets", "manifest.json");
const indexPath = join(rootDir, "dist", "index.html");

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const entry = manifest.entrypoints.browser;

const stylesheets = (entry.assets.css ?? [])
  .map((href) => `<link rel="stylesheet" href="${href}" />`)
  .join("\n  ");

const scripts = (entry.assets.js ?? [])
  .map(
    (src) => `<script type="module" src="${src}" defer></script>`,
  )
  .join("\n  ");

const preloads = [
  ...new Set([
    ...(entry.preload?.js ?? []),
    ...(entry.preload?.css ?? []),
  ]),
]
  .map((href) =>
    href.endsWith(".css")
      ? `<link rel="preload" href="${href}" as="style" />`
      : `<link rel="modulepreload" href="${href}" />`,
  )
  .join("\n  ");

const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <title>PulseType</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script>
${bootScript()}
  </script>
  ${preloads}
  ${stylesheets}
  ${scripts}
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;

await writeFile(indexPath, html);
console.log(`Wrote ${indexPath}`);

function bootScript() {
  return `    // This is a local, offline desktop application.
    // There is no server, so all page data is provided here.
    (function () {
      var pre = null;
      function showFatal(msg) {
        try {
          var root = document.getElementById("root");
          if (root == null) {
            return;
          }
          if (pre == null || pre.parentNode == null) {
            pre = document.createElement("pre");
            pre.style.cssText =
              "white-space:pre-wrap;word-break:break-all;padding:16px;" +
              "font:12px/1.5 Consolas,monospace;color:#c00;background:#fff;";
            root.appendChild(pre);
          }
          pre.textContent = msg;
        } catch (err) {
          // Ignore.
        }
      }
      function describe(err, fallback) {
        if (err != null) {
          return String(err.stack || err.message || err);
        }
        if (fallback != null && fallback !== "") {
          return String(fallback);
        }
        return "unknown error";
      }
      var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      function vlq(text) {
        var out = [];
        var value = 0;
        var shift = 0;
        for (var i = 0; i < text.length; i += 1) {
          var d = B64.indexOf(text.charAt(i));
          if (d < 0) {
            return [];
          }
          value += (d & 31) << shift;
          if ((d & 32) !== 0) {
            shift += 5;
          } else {
            var neg = value & 1;
            value = value >> 1;
            out.push(neg ? -value : value);
            value = 0;
            shift = 0;
          }
        }
        return out;
      }
      var cache = {};
      function loadMap(base) {
        if (cache[base] === undefined) {
          cache[base] = fetch(base + ".map")
            .then(function (r) {
              return r.ok ? r.json() : null;
            })
            .catch(function () {
              return null;
            });
        }
        return cache[base];
      }
      function parseFrame(line) {
        var i = line.indexOf("http");
        if (i < 0) {
          return null;
        }
        var end = line.length;
        while (end > i && "() ".indexOf(line.charAt(end - 1)) >= 0) {
          end -= 1;
        }
        var url = line.substring(i, end);
        var c1 = url.lastIndexOf(":");
        var c2 = c1 > 0 ? url.lastIndexOf(":", c1 - 1) : -1;
        if (c2 < 0 || c1 === c2 + 1) {
          return null;
        }
        return {
          base: url.substring(0, c2),
          line: parseInt(url.substring(c2 + 1, c1), 10),
          col: parseInt(url.substring(c1 + 1), 10),
        };
      }
      function originalPos(map, aLine, aCol) {
        try {
          var gl = aLine - 1;
          var lines = map.mappings.split(";");
          if (gl < 0 || gl >= lines.length) {
            return null;
          }
          var srcIdx = 0;
          var srcLine = 0;
          var srcCol = 0;
          var nameIdx = 0;
          var best = null;
          var bestGenCol = -1;
          for (var li = 0; li <= gl; li += 1) {
            var segs = lines[li] === "" ? [] : lines[li].split(",");
            var genCol = 0;
            for (var si = 0; si < segs.length; si += 1) {
              if (segs[si] === "") {
                continue;
              }
              var f = vlq(segs[si]);
              if (f.length === 0) {
                continue;
              }
              genCol += f[0];
              if (f.length >= 4) {
                srcIdx += f[1];
                srcLine += f[2];
                srcCol += f[3];
                var nm = f.length >= 5 ? nameIdx : -1;
                if (f.length >= 5) {
                  nameIdx += f[4];
                }
                if (li === gl && genCol <= aCol && genCol >= bestGenCol) {
                  bestGenCol = genCol;
                  best = [srcIdx, srcLine, nm];
                }
              }
            }
          }
          if (best == null) {
            return null;
          }
          var src = String(map.sources[best[0]] || "?");
          while (src.substring(0, 3) === "../") {
            src = src.substring(3);
          }
          var out = src + ":" + (best[1] + 1);
          if (best[2] >= 0 && map.names != null && map.names[best[2]] != null) {
            out += " (" + map.names[best[2]] + ")";
          }
          var content =
            map.sourcesContent != null ? map.sourcesContent[best[0]] : null;
          if (typeof content === "string") {
            var cl = content.split("\\n")[best[1]];
            if (typeof cl === "string") {
              cl = cl.trim();
              if (cl !== "") {
                out += "\\n    > " + cl.substring(0, 200);
              }
            }
          }
          return out;
        } catch (err) {
          return null;
        }
      }
      function annotate(stack) {
        var lines = stack.split("\\n");
        var jobs = [];
        var collect = function (k) {
          var frame = parseFrame(lines[k]);
          if (frame != null && frame.base !== "" && frame.line > 0) {
            jobs.push(
              loadMap(frame.base).then(function (map) {
                return [
                  k,
                  map == null ? null : originalPos(map, frame.line, frame.col),
                ];
              })
            );
          }
        };
        for (var k = 0; k < lines.length; k += 1) {
          collect(k);
        }
        return Promise.all(jobs).then(function (results) {
          var byLine = {};
          for (var r = 0; r < results.length; r += 1) {
            if (results[r][1] != null) {
              byLine[results[r][0]] = results[r][1];
            }
          }
          var out = [];
          for (var k2 = 0; k2 < lines.length; k2 += 1) {
            out.push(lines[k2]);
            if (byLine[k2] != null) {
              out.push("    => " + byLine[k2]);
            }
          }
          return out.join("\\n");
        });
      }
      window.addEventListener(
        "error",
        function (e) {
          var s = describe(
            e.error,
            (e.message || "Error") +
              "\\n    at " + (e.filename || "?") + ":" +
              (e.lineno || "?") + ":" + (e.colno || "?")
          );
          showFatal(s);
          annotate(s).then(showFatal, function () {});
        },
        true
      );
      window.addEventListener("unhandledrejection", function (e) {
        var s = "Unhandled rejection: " + describe(e.reason, null);
        showFatal(s);
        annotate(s).then(showFatal, function () {});
      });
    })();
    var prefs = null;
    try {
      var m = document.cookie.match(/(?:^|;\\s*)prefs=([^;]*)/);
      prefs = JSON.parse(m ? m[1] : null);
    } catch (err) {
      // Ignore.
    }
    var locale = "en";
    try {
      locale = localStorage.getItem("pulsetype.locale") || locale;
    } catch (err) {
      // Ignore.
    }
    document.documentElement.setAttribute("data-color", (prefs && typeof prefs.color === "string") ? prefs.color : "system");
    document.documentElement.setAttribute("data-font", (prefs && typeof prefs.font === "string") ? prefs.font : "open-sans");
    window.__PAGE_DATA__ = {
      base: "/",
      locale: locale,
      user: null,
      publicUser: { id: null, name: "Anonymous", imageUrl: null },
      settings: null,
    };`;
}
