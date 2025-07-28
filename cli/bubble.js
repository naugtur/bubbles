#!/usr/bin/env node
import { basename, join } from "path";
import { blowBubble, bubble } from "../framework/index.js";
import { consumeHeadArg, globalConfigDir } from "../framework/internal.js";

async function run() {
  const name = consumeHeadArg();
  const location = new URL(join(globalConfigDir, basename(name + ".js"))).href;
  let bubbleChoice;
  try {
    bubbleChoice = await import(location);
  } catch (e) {
    // allow for the default bubble to work without init
    if (name !== "here") {
      throw Error(`No bubble definition under '${location}`, { cause: e });
    }
    blowBubble(bubble);
  }
  blowBubble(bubbleChoice);
}
run();
