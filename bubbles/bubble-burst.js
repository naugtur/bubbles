import { spawnSync } from 'child_process';
import { createInterface } from 'readline';

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