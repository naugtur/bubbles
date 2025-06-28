import { writeFileSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const getSource = (file) =>
  `#!/usr/bin/env node
import { blowBubble } from "../framework/index.js"
import bubble from "../bubbles/${file}";
blowBubble(bubble)
`;

const getCommand = (cmd) =>   
  `#!/usr/bin/env node
import { blowBubble } from "../framework/index.js"
import higherOrderBubble from "../bubbles/meta-bubble-cli.js"
blowBubble(higherOrderBubble('${cmd}'))
`

const createCli = (file, source) => {
  const name = file.replace(".js", "");
  writeFileSync(join(dir, "cli", `${name}.js`), source);
  const pkgPath = join(dir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.bin = pkg.bin || {};
  pkg.bin[name] = `./cli/${name}.js`;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

const dir = join(dirname(fileURLToPath(import.meta.url)), "../");
const bubblesDir = join(dir, "./bubbles");
const bubbles = readdirSync(bubblesDir).filter((file) => file.endsWith(".js") && file.startsWith('bubble'));
for (const file of bubbles) {
  const source = getSource(file);
  createCli(file, source)
}

const commandsToCover = ['npm', 'npx', 'yarn', 'pnpm', 'pnpx']

commandsToCover.forEach(cmd => {
  const source = getCommand(cmd)
  // I could also name them the cmd names and use the fact that dumb npm overrides shit
  createCli(`safer-${cmd}.js`, source)
})