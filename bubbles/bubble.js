#!/usr/bin/env node

import { 
  withDefaults,
  withHelp,
  withInteractive,
  withPackagesOption,
  withOfflineOption,
  withMountpoint,
 } from "@bubble-run/bubble-run";

export default [
  withDefaults({
    from: "node:lts",
    name: "sandbox",
    user: "node",
  }),
  withHelp(),
  withInteractive(),
  withPackagesOption(),
  withOfflineOption(),
  withMountpoint("/mountpoint"),
]