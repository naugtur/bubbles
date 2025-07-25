#!/usr/bin/env node

import {
  withArt,
  withDefaults,
  withHelp,
  withInteractive,
  withPackagesOption,
  withNpmPackagesOption,
  withOfflineOption,
  withMountpoint,
  withUser,
  withEntrypoint,
} from "../framework/index.js";

export default [
  withDefaults({
    from: "node:lts",
    name: "sandbox",
  }),
  withArt(),
  withHelp(),
  withInteractive(),
  withPackagesOption(),
  withNpmPackagesOption(),
  withOfflineOption(),
  withEntrypoint("bash"),
  withMountpoint("/mountpoint", "node"),
  withUser("node"),
];
