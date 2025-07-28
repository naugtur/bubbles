import { spawnSync } from "child_process";
import { parseArgs } from "node:util";
import { createInterface } from "readline";
import { existsSync } from "fs";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

/**
 * Prompts user for confirmation
 * @param {string} message
 * @returns {Promise<boolean>}
 */
const promptUser = (message) => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
};

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
    const globalConfigDir = join(homedir(), ".bubbles");
    const configPath = join(globalConfigDir, "config.js");
    const packagePath = join(globalConfigDir, "package.json");

    if (!existsSync(globalConfigDir)) {
      await mkdir(globalConfigDir, { recursive: true });
      const configTemplate = `import { bubble } from 'bubbles';
      
module.exports = {
  mybubble: [],
  extensions: {},
  // 
  aliases: []
}`;
      const packageTemplate = `{
  "name": "bubbles-config",
  "type": "module",
  "private": true
}`;

      await writeFile(configPath, configTemplate);
      await writeFile(packagePath, packageTemplate);

      const linkResult = spawnSync("npm", ["link", "bubbles"], {
        cwd: globalConfigDir,
        stdio: "inherit",
      });

      if (linkResult.status !== 0) {
        console.error("Failed to link bubbles package");
        process.exit(1);
      }

      console.log(`Created global config at ${globalConfigDir}`);
    } else {
      console.log("~/.bubbles directory already exists");
    }
  },
  async alias() {
    const globalConfigDir = join(homedir(), ".bubbles");
    const configPath = join(globalConfigDir, "config.js");

    if (!existsSync(configPath)) {
      console.error('Config file not found. Run "bubbles init" first.');
      process.exit(1);
    }

    try {
      // Read current config
      const configContent = await import(`file://${configPath}`);
      const config = configContent.default || configContent;
      const aliases = config.aliases || [];

      if (aliases.length === 0) {
        return;
      }

      // Set up aliases in current shell
      for (const alias of aliases) {
        const result = spawnSync(
          "alias",
          [`${alias.name}=bubbles bubble-alias ${alias.name}`],
          {
            stdio: "inherit",
            shell: true,
          }
        );
      }
    } catch (error) {
      console.error("Failed to set up aliases:", error.message);
      process.exit(1);
    }
  },
};

const allOptions = [];
const { values, positionals } = parseArgs({
  options: Object.fromEntries(
    allOptions.map(({ name, type, description }) => [
      name,
      { type, description },
    ])
  ),
  allowPositionals: true,
  strict: true,
});

const [command, ...args] = positionals;
if (!command || !commands[command]) {
  console.error("Usage: bubbles <command>");
  console.error("Available commands:", Object.keys(commands).join(", "));
  process.exit(1);
}

await commands[command](...args);
