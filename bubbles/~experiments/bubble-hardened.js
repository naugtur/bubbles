import bubble from "./bubble.js";
import {
  withEnv,
  withDefaults,
  withFile,
  withInteractive,
  withNpmPackages,
} from "../framework/index.js";

export default [
  ...bubble,
  withDefaults({
    from: "node:24",
    name: "hardened",
  }),
  withFile(
    "~/.npmrc",
    `allow-scripts=false
git=~/.nogit`
  ),
  withFile(
    "~/.nogit",
    `#!/bin/sh
read -p "Do you want to run git? $0 $1 $2 $3 " -n 1 -r
echo 
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git "$@"
fi
    `
  ),
  withNpmPackages(["@lavamoat/allow-scripts"]),
  withEnv({
    "NODE_OPTIONS": "--permissions --allow-fs-read=* allow-fs-write=./",
  }),
];
