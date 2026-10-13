/*
 * Home page entry point.
 *
 * 1. Loads the shared page behaviour (site.js: smooth scrolling, reveals).
 * 2. Sets up the three interactive figures (hover effects).
 * 3. Starts the scroll-driven story timeline (story.js), which reveals the
 *    figures step by step as you scroll.
 */
import { reduceMotion } from "./site.js";
import { initAngiogram } from "./angiogram.js";
import { initMosaic } from "./mosaic.js";
import { initExplain } from "./explain.js";
import { buildStory } from "./story.js";

initAngiogram(document.getElementById("angio"), { reduceMotion });
initMosaic(document.getElementById("mosaic"), { reduceMotion });
initExplain(document.getElementById("explain"), { reduceMotion });

buildStory();
