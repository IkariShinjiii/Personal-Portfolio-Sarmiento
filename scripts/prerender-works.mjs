// After `vite build`: write one HTML page per multimedia work (dist/multimedia/<slug>/index.html) so a shared link
// gets that work's own title, description and preview image. Messenger, Facebook and Discord do not run JavaScript,
// so without this every link would show the home page's preview. Also adds the work URLs to dist/sitemap.xml.
// The React app still takes over in the browser; these pages just carry the right <head> and skip the home page's
// static hero and intro screen, so a work page does not flash the home page while it loads.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://sarmiento-portfolio-multimedia.vercel.app";
const { course, works } = JSON.parse(readFileSync(join(root, "src/data/multimedia.json"), "utf8"));
const template = readFileSync(join(root, "dist/index.html"), "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const abs = (src) => (src.startsWith("http") ? src : `${SITE}${src}`);

function coverOf(w) {
  for (const m of w.media ?? []) {
    if (m.kind === "video" && m.poster) return m.poster;
    if (m.kind === "frames" && m.frames[0]) return m.frames[0].src;
    if (m.kind === "image") return m.src;
  }
  return "/profile.jpg";
}

function page(w) {
  const url = `${SITE}/multimedia/${w.slug}`;
  const title = `${w.title} - ${course.name} - Kervin Sarmiento`;
  let html = template;
  const swap = (re, to) => {
    if (!re.test(html)) throw new Error(`prerender: marker not found: ${re}`);
    html = html.replace(re, to);
  };
  swap(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  swap(/(<meta name="description" content=")[^"]*(")/, `$1${esc(w.summary)}$2`);
  swap(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`);
  swap(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(w.summary)}$2`);
  swap(/(<meta property="og:image" content=")[^"]*(")/, `$1${esc(abs(coverOf(w)))}$2`);
  swap(/<meta property="og:type" content="website" \/>/, `<meta property="og:type" content="article" />\n    <meta property="og:url" content="${url}" />\n    <link rel="canonical" href="${url}" />\n    <meta name="twitter:card" content="summary_large_image" />`);
  // Drop the home page's intro screen and static hero: this page is not the home page.
  const a = html.indexOf('<div id="preloader"');
  const b = html.indexOf('<script src="/preloader.js"');
  if (a < 0 || b < 0 || b < a) throw new Error("prerender: preloader/root markers not found");
  html = html.slice(0, a) + '<div id="root"></div>\n    ' + html.slice(b);
  html = html.replace('<script src="/preloader.js" defer></script>', "").replace('<script src="/preload-init.js"></script>', "");
  return html;
}

for (const w of works) {
  const dir = join(root, "dist/multimedia", w.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page(w));
}

const smPath = join(root, "dist/sitemap.xml");
const sm = readFileSync(smPath, "utf8");
const urls = works.map((w) => `  <url><loc>${SITE}/multimedia/${w.slug}</loc></url>`).join("\n");
writeFileSync(smPath, sm.replace("</urlset>", `${urls}\n</urlset>`));
console.log(`prerendered ${works.length} work pages`);
