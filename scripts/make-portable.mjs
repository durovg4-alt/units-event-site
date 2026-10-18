import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const builtHtmlPath = resolve(dist, "src", "page.html");
const builtHtml = await readFile(builtHtmlPath, "utf8");

const asClassicScript = (html) => html
  .replace(/<script type="module" crossorigin src=/g, "<script defer src=")
  .replace(/ crossorigin(?= href=)/g, "");

const distPortable = asClassicScript(builtHtml)
  .replaceAll('src="/assets/', 'src="./assets/')
  .replaceAll('href="/assets/', 'href="./assets/');

const rootPortable = asClassicScript(builtHtml)
  .replaceAll('src="/assets/', 'src="./dist/assets/')
  .replaceAll('href="/assets/', 'href="./dist/assets/');

await writeFile(resolve(dist, "index.html"), distPortable);
await writeFile(resolve(dist, "app.html"), distPortable);
await writeFile(resolve(root, "index.html"), rootPortable);
await writeFile(resolve(root, "app.html"), rootPortable);

const assetFiles = await readdir(resolve(dist, "assets"));
const cssFile = assetFiles.find((file) => file.endsWith(".css"));
if (!cssFile) throw new Error("Built CSS asset was not found");

const cssPath = resolve(dist, "assets", cssFile);
const css = await readFile(cssPath, "utf8");
await writeFile(cssPath, css.replaceAll("url(/fonts/", "url(../fonts/"));

console.log("Portable file:// entry points created: index.html, app.html and their dist copies");
