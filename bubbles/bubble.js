#!/usr/bin/env node

import {
  withDefaults,
  withHelp,
  withInteractive,
  withPackagesOption,
  withNpmPackagesOption,
  withOfflineOption,
  withMountpoint,
  withUser,
} from "../framework/index.js";

export default [
  withDefaults({
    from: "node:lts",
    name: "sandbox",
  }),
  withHelp(),
  withInteractive(),
  withPackagesOption(),
  withNpmPackagesOption(),
  withOfflineOption(),
  withMountpoint("/mountpoint", "node"),
  withUser("node"),
];
