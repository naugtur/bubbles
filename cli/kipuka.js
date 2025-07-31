#!/usr/bin/env node
import { basename, join } from "path";
import { blowKipuka, kipuka } from "../framework/index.js";
import { consumeHeadArg, globalConfigDir } from "../framework/internal.js";

async function run() {
  const name = consumeHeadArg();
  const location = new URL(
    join(globalConfigDir, basename(name + ".js")),
    "file:///"
  ).href;
  let bubbleChoice;
  try {
    bubbleChoice = (await import(location)).default;
  } catch (e) {
    // allow for the default bubble to work without init
    if (name !== "here") {
      throw Error(`No bubble definition under '${location}`, { cause: e });
    }
    return blowKipuka(kipuka);
  }
  if (!bubbleChoice || !Array.isArray(bubbleChoice)) {
    console.error(bubbleChoice);
    throw Error(
      `Failed to get a kipuka from ${location} despite the file existing`
    );
  }
  blowKipuka(bubbleChoice);
}
run();
