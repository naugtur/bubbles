import bubble from "../framework/bubble.js";
import {
  withCMD,
  withDefaults,
  withEntrypoint,
  withFile,
  without,
} from "../framework/index.js";

export default [
  ...without(bubble, ["withEntrypoint"]),
  withDefaults({
    name: "npm-hardened",
  }),
  // withOfflineButNpm(),
  // withEntrypoint("npm"),
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
];
