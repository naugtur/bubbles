#!/usr/bin/env node
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { writeFile, mkdir } from "fs/promises";
import { basename, join } from "path";
import { start, kipuka } from "../framework/index.js";
import {
  globalConfigDir,
  readGlobalConfig,
  consumeHeadArg,
  promptUser,
} from "../framework/internal.js";
import higherOrderKipuka from "../framework/meta-kipuka-cli.js";

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

async function runKipuka(name) {
  if (!name) {
    return start(kipuka);
  }
  const location = new URL(
    join(globalConfigDir, basename(name + ".js")),
    "file:///"
  ).href;
  let choice;
  try {
    choice = (await import(location)).default;
  } catch (e) {
    throw Error(`No kipuka definition under '${location}`, { cause: e });
  }
  if (!choice || !Array.isArray(choice)) {
    throw Error(`Failed to get a kipuka from ${location}`);
  }
  start(choice);
}

const commands = {
  async cleanup() {
    // Stop and remove containers
    const containerList = spawnSync("docker", [
      "ps",
      "-a",
      "--filter",
      "name=kipuka-",
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
          `Found ${containers.length} kipuka containers: ${containers.join(
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
        console.log("No kipuka containers found");
      }
    } else {
      console.log("Empty output from docker ps.");
    }

    // Remove images
    const imageList = spawnSync("docker", [
      "images",
      "--filter",
      "reference=kipuka-*",
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
          `Found ${images.length} kipuka images: ${images.join(", ")}`
        );
        for (const image of images) {
          await executeDockerCommand(["rmi", image], `Remove image ${image}`);
        }
      } else {
        console.log("No kipuka images found");
      }
    } else {
      console.log("Empty output from docker images.");
    }
  },
  async init() {
    const configPath = join(globalConfigDir, "kipuka.config.js");
    const packagePath = join(globalConfigDir, "package.json");
    const examplePath = join(globalConfigDir, "example.js");

    if (!existsSync(globalConfigDir)) {
      await mkdir(globalConfigDir, { recursive: true });
      const configTemplate = `
/** @type {KipukasGlobalConfig} */
export default {
  extensions: {
    // extensions to all kipukas inheriting from kipuka
    // if you want a single custom kipuka, create a file next to this instead. see: example.js
    // root: [withPackages(['vim','ssh'])]
    // user: 
    // cli:
  },
  // clis to run in a kipuka after 'kipuka alias'
  aliases: ['npm','npx','pnpm','pnpx','yarn','yarnpkg']
};`;
      const packageTemplate = `{
  "name": "kipuka-config",
  "type": "module",
  "private": true
}`;
      const exampleKipuka = `import { kipuka, without, withDefaults, withPackages } from '@naugtur/kipuka';
export default [
 ...without(kipuka, ["withDefaults"]),
  withDefaults({
    name: "mykipuka",
  }),
  withPackages(['vim','ssh'])
]`;

      await writeFile(configPath, configTemplate);
      await writeFile(packagePath, packageTemplate);
      await writeFile(examplePath, exampleKipuka);
      console.log(`Created global config at ${globalConfigDir}`);
      console.log(
        `Linking @naugtur/kipuka to ${globalConfigDir} as a dependency`
      );

      const linkResult = spawnSync("npm", ["link", "@naugtur/kipuka"], {
        cwd: globalConfigDir,
        stdio: "inherit",
      });

      if (linkResult.status !== 0) {
        console.error(
          "Failed to link kipuka package. You may need to do it manually."
        );
      }
    } else {
      console.log("~/.kipuka directory already exists");
    }
  },
  async alias() {
    const config = await readGlobalConfig();
    const aliases = config.aliases || [];

    if (aliases.length === 0) {
      console.log("No aliases in config", config);
    }

    // Set up aliases in current shell
    for (const alias of aliases) {
      console.log(`alias ${alias}='kipuka cli ${alias}'`);
      const result = spawnSync("alias", [`${alias}='kipuka cli ${alias}'`], {
        stdio: "inherit",
        shell: true,
      });
    }
  },
  async cli() {
    const name = consumeHeadArg();
    start(higherOrderKipuka(name));
  },
  async run() {
    const name = consumeHeadArg();
    runKipuka(name);
  },
  async help() {
    console.error("Usage:");
    console.error("kipuka - run the default kipuka");
    console.error(
      "kipuka run <name> - run one from a file in ~/.kipuka/name.js"
    );
    console.error("kipuka <command> - execute one of the commands");
    console.error("Available commands:", Object.keys(commands).join(", "));
    process.exit(1);
  },
};

let command = consumeHeadArg();
if (!command || command == "--") {
  runKipuka();
} else {
  await commands[command || "help"]();
}
