import { initModeToggle } from './mode.js';
import { initRevealAndRoute } from './reveal.js';
import { initWindField } from './wind.js';
import { initHonors } from './honors.js';
import { initMailto } from './mailto.js';

const tasks = [
  initModeToggle,
  initRevealAndRoute,
  initMailto,
  initHonors,
  initWindField,
];

for (const run of tasks) {
  try {
    run();
  } catch {
    // Isolate failures so one enhancement cannot break the page
  }
}
