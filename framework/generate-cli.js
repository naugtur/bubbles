import { writeFileSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const getSource = (name) =>
  `#!/usr/bin/env node
import { blowBubble } from "../framework/index.js"
import bubble from "../bubbles/${name}.js";
blowBubble(bubble)
`;

const dir = join(dirname(fileURLToPath(import.meta.url)), "../");
const bubblesDir = join(dir, "./bubbles");
const bubbles = readdirSync(bubblesDir).filter((file) => file.endsWith(".js"));
for (const file of bubbles) {
  const name = file.replace(".js", "");
  const source = getSource(name);
  writeFileSync(join(dir, "cli", `${name}.js`), source);

  const pkgPath = join(dir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.bin = pkg.bin || {};
  pkg.bin[name] = `./cli/${name}.js`;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}
