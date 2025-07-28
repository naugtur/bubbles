import { spawnSync } from 'child_process';
import { parseArgs } from "node:util";
import { createInterface } from 'readline';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Prompts user for confirmation
 * @param {string} message 
 * @returns {Promise<boolean>}
 */
const promptUser = (message) => {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question(`${message} (y/N): `, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
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
        const result = spawnSync('docker', args, { stdio: 'inherit' });
        if (result.status !== 0) {
            console.error(`Failed to execute: docker ${args.join(' ')}`, result.stderr.toString());
        }
    } else {
        console.log(`Skipped: docker ${args.join(' ')}`);
    }
};

const commands = {
  async burst() {
    // Stop and remove containers
    const containerList = spawnSync('docker', ['ps', '-a', '--filter', 'name=bubble-', '--format', '{{.Names}}']);
    if (containerList.stdout) {
      const containers = containerList.stdout.toString().trim().split('\n').filter(Boolean);
      if (containers.length > 0) {
        console.log(`Found ${containers.length} bubble containers: ${containers.join(', ')}`);
        for (const container of containers) {
          await executeDockerCommand(['stop', container], `Stop container ${container}`);
          await executeDockerCommand(['rm', container], `Remove container ${container}`);
        }
      } else {
        console.log('No bubble containers found');
      }
    }

    // Remove images
    const imageList = spawnSync('docker', ['images', '--filter', 'reference=bubble-*', '--format', '{{.Repository}}']);
    if (imageList.stdout) {
      const images = imageList.stdout.toString().trim().split('\n').filter(Boolean);
      if (images.length > 0) {
        console.log(`Found ${images.length} bubble images: ${images.join(', ')}`);
        for (const image of images) {
          await executeDockerCommand(['rmi', image], `Remove image ${image}`);
        }
      } else {
        console.log('No bubble images found');
      }
    }
  },
  async init() {
    const globalConfigPath = join(homedir(), '.bubbles.js');
    
    if (!existsSync(globalConfigPath)) {
      const template = `module.exports = (b)=>{
  mybubble: []
  extensions: {
  }
}`;
      await writeFile(globalConfigPath, template);
      console.log(`Created global config at ${globalConfigPath}`);
    } else {
      console.log('~/.bubbles.js file already exists');
    }
  },
  async alias(name, command) {
    if (!name || !command) {
      console.error('Usage: bubbles alias <name> <command>');
      process.exit(1);
    }
    const configPath = '.bubbles.js';
    if (!existsSync(configPath)) {
      console.error('No .bubbles.js found. Run init first');
      process.exit(1);
    }
    const config = require(join(process.cwd(), configPath));
    config.extensions = config.extensions || {};
    config.extensions.aliases = config.extensions.aliases || {};
    config.extensions.aliases[name] = command;
    await writeFile(configPath, `module.exports = ${JSON.stringify(config, null, 2)}`);
    console.log(`Alias '${name}' created for command: ${command}`);
  }
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
  console.error('Usage: bubbles <command>');
  console.error('Available commands:', Object.keys(commands).join(', '));
  process.exit(1);
}

await commands[command](...args);