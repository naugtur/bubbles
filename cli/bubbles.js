import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { blowBubble } from "../framework/index.js";
import {
  globalConfigDir,
  readGlobalConfig,
  consumeHeadArg,
  promptUser,
} from "../framework/internal.js";
import higherOrderBubble from "../framework/meta-bubble-cli.js";

/**
 * Execute Docker command with user confirmation
 * @param {string[]} args
 * @param {string} description
 */
const executeDockerCommand = async (args, description) => {
  const confirmed = await promptUser(`${description}?`);
  if (confirmed) {
    const result = spawnSync("docker", args, { stdio: "inherit" });
    if (result.status !== 0) {
      console.error(
        `Failed to execute: docker ${args.join(" ")}`,
        result.stderr.toString()
      );
    }
  } else {
    console.log(`Skipped: docker ${args.join(" ")}`);
  }
};

const commands = {
  async burst() {
    // Stop and remove containers
    const containerList = spawnSync("docker", [
      "ps",
      "-a",
      "--filter",
      "name=bubble-",
      "--format",
      "{{.Names}}",
    ]);
    if (containerList.stdout) {
      const containers = containerList.stdout
        .toString()
        .trim()
        .split("\n")
        .filter(Boolean);
      if (containers.length > 0) {
        console.log(
          `Found ${containers.length} bubble containers: ${containers.join(
            ", "
          )}`
        );
        for (const container of containers) {
          await executeDockerCommand(
            ["stop", container],
            `Stop container ${container}`
          );
          await executeDockerCommand(
            ["rm", container],
            `Remove container ${container}`
          );
        }
      } else {
        console.log("No bubble containers found");
      }
    }

    // Remove images
    const imageList = spawnSync("docker", [
      "images",
      "--filter",
      "reference=bubble-*",
      "--format",
      "{{.Repository}}",
    ]);
    if (imageList.stdout) {
      const images = imageList.stdout
        .toString()
        .trim()
        .split("\n")
        .filter(Boolean);
      if (images.length > 0) {
        console.log(
          `Found ${images.length} bubble images: ${images.join(", ")}`
        );
        for (const image of images) {
          await executeDockerCommand(["rmi", image], `Remove image ${image}`);
        }
      } else {
        console.log("No bubble images found");
      }
    }
  },
  async init() {
    const configPath = join(globalConfigDir, "bubbles.config.js");
    const packagePath = join(globalConfigDir, "package.json");
    const defaultPath = join(globalConfigDir, "here.js");
    const examplePath = join(globalConfigDir, "example.js");

    if (!existsSync(globalConfigDir)) {
      await mkdir(globalConfigDir, { recursive: true });
      const configTemplate = `
/** @type {BubblesGlobalConfig} */
export default const config = {
  extensions: {
    // extensions to all bubbles inheriting from bubble
    // if you want a single custom bubble, create a file next to this instead. see: example.js
    // root: [withPackages(['vim','ssh'])]
    // user: 
    // cli:
  },
  // clis to run in a bubble after 'bubbles alias'
  aliases: ['npm','npx']
};`;
      const packageTemplate = `{
  "name": "bubbles-config",
  "type": "module",
  "private": true
}`;
      const defaultBubble = `export { bubble as default } from 'bubbles';`;
      const exampleBubble = `import { bubble, without, withDefaults, withPackages } from 'bubbles';
export default const myBubble = [
 ...without(bubble, ["withDefaults"]),
  withDefaults({
    name: "mybubble",
  }),
  withPackages(['vim','ssh']
]`;

      await writeFile(configPath, configTemplate);
      await writeFile(packagePath, packageTemplate);
      await writeFile(defaultPath, defaultBubble);
      await writeFile(examplePath, exampleBubble);
      console.log(`Created global config at ${globalConfigDir}`);
      console.log(`Linking bubbles to ${globalConfigDir} as a dependency`);

      const linkResult = spawnSync("npm", ["link", "bubbles"], {
        cwd: globalConfigDir,
        stdio: "inherit",
      });

      if (linkResult.status !== 0) {
        console.error(
          "Failed to link bubbles package. You may need to do it manually."
        );
      }

    } else {
      console.log("~/.bubbles directory already exists");
    }
  },
  async alias() {
    const config = await readGlobalConfig();
    const aliases = config.aliases || [];

    if (aliases.length === 0) {
      return;
    }

    // Set up aliases in current shell
    for (const alias of aliases) {
      const result = spawnSync("alias", [`${alias}=bubbles cli ${alias}`], {
        stdio: "inherit",
        shell: true,
      });
    }
  },
  async cli() {
    const name = consumeHeadArg();
    blowBubble(higherOrderBubble(name));
  },
  async help() {
    console.error("Usage: bubbles <command>");
    console.error("Available commands:", Object.keys(commands).join(", "));
    process.exit(1);
  },
};

let command = consumeHeadArg();
if (!command || !commands[command]) {
  command = "help";
}

await commands[command]();
