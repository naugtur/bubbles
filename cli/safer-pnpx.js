#!/usr/bin/env node
import { blowBubble } from "../framework/index.js"
import higherOrderBubble from "../bubbles/meta-bubble-cli.js"
blowBubble(higherOrderBubble('pnpx'))
