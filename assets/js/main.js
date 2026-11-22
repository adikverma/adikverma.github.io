import { createState } from './state.js';
import { initMode } from './mode.js';
import { initMailto } from './mailto.js';
import { createInfoController } from './info.js';
import { createCourseController } from './course.js';
import { createRenderLoop } from './render-loop.js';
import { initInput } from './input.js';

const guard = (fn) => { try { return fn(); } catch { return null; } };
document.documentElement.classList.add('is-app');
guard(initMode);
guard(initMailto);

guard(() => {
  const $ = (id) => document.getElementById(id);
  const leftScroll = $('left-scroll'), rightPanel = $('panel-right'), stageCards = $('stage-cards'), courseLayer = $('course-layer');
  if (!leftScroll || !rightPanel || !stageCards || !courseLayer) return;

  const sections = [...leftScroll.querySelectorAll('.section-article')].map((article, index) => {
    const d = article.dataset;
    return { index, id: article.id, category: d.category || '', title: d.title || '', edge: d.edge || '', focus: d.focus || '50% 50%', tone: d.tone || '#19241a', article, media: article.querySelector('.section-media') };
  });
  if (!sections.length) return;

  const live = $('live-announcer');
  const announce = (msg) => { if (live) { live.textContent = ''; requestAnimationFrame(() => { live.textContent = msg; }); } };

  const store = createState(sections);
  const info = createInfoController(sections, leftScroll, announce);
  const course = createCourseController(courseLayer, sections);
  const renderer = createRenderLoop({ store, rightPanel, stageCards, leftScroll, courseLayer, course, info, announce });
  initInput({ rightPanel, leftScroll, store, shell: $('main'), compactBar: $('compact-bar'), onCompactChange: renderer.remeasure });
});
