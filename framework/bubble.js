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
  requireExtensions,
} from "./index.js";

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
  ...requireExtensions("root"),
  withEntrypoint("bash"),
  withMountpoint("/here", "node"),
  withUser("node"),
  ...requireExtensions("user"),

];
