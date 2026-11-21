import { SiteContent } from '../types';
import heroArchitectureImg from '../assets/images/hero_minimal_architecture_1795269350668.jpg';
import systemsBlueprintImg from '../assets/images/work_systems_blueprint_1795269351186.jpg';
import typographyMonographImg from '../assets/images/work_typography_monograph_1795269351984.jpg';

export const HERO_IMAGE_PATH = heroArchitectureImg;

export const DEFAULT_SITE_CONTENT: SiteContent = {
  profile: {
    wordmark: 'adikverma.github.io',
    kicker: 'Personal Site · GitHub Pages',
    headline: 'Building thoughtful software and clear digital systems.',
    bio: 'A minimalist home on the web for projects, technical writing, and small experiments. Everything on this page can be customized directly using Edit Site and deployed straight to GitHub Pages.',
    focus: 'Software & Systems',
    location: 'Worldwide / Remote',
    availability: 'Open to Collaborations',
    repository: 'adikverma/adikverma.github.io',
    email: 'hello@adikverma.github.io',
    githubUrl: 'https://github.com/adikverma',
    linkedinUrl: 'https://linkedin.com',
  },
  projects: [
    {
      id: 'proj-modular-toolkit',
      title: 'Modular Systems Starter',
      category: 'Engineering',
      year: '2026',
      summary:
        'A lightweight TypeScript architecture for fast static sites, clean routing, and zero-bloat builds.',
      details:
        'Designed as a clean foundation for personal software projects and documentation hubs. It emphasizes predictable directory structure, strict type safety, and fast incremental builds without heavy runtime overhead. Replace this entry via Edit Site to feature your own repositories.',
      stack: 'TypeScript · React · Vite',
      linkUrl: 'https://github.com/adikverma/adikverma.github.io',
      linkLabel: 'View Repository',
      imageUrl: systemsBlueprintImg,
      imageAlt:
        'Minimalist studio composition of anodized aluminum blocks and precision drafting tools on pale stone',
    },
    {
      id: 'proj-editorial-grid',
      title: 'Editorial Grid Monograph',
      category: 'Design',
      year: '2026',
      summary:
        'Typographic scale, optical spacing rules, and high-contrast reading layouts for long-form technical notes.',
      details:
        'Explores how Swiss typographic grids translate to responsive browser viewports. Focuses on comfortable line measures, balanced display headlines, tabular numerals, and dual-theme surface pairings that stay legible in both bright and dim environments.',
      stack: 'Design Systems · CSS Grid · Typography',
      linkUrl: 'https://github.com/adikverma',
      linkLabel: 'Inspect Source',
      imageUrl: typographyMonographImg,
      imageAlt:
        'Overhead view of an open minimalist architectural design monograph with grid diagrams and a cobalt bookmark ribbon',
    },
    {
      id: 'proj-local-studio',
      title: 'In-Browser Content Customizer',
      category: 'Experiments',
      year: '2026',
      summary:
        'Live client-side content editor with local storage persistence and one-click JSON export for static publishing.',
      details:
        'Built directly into this site so you can iterate on copy, reorder ideas, draft notes, and export a clean JSON snapshot without leaving the preview window. Useful for rapid prototyping before committing final content to Git.',
      stack: 'State Persistence · JSON Export · Accessibility',
      linkUrl: 'https://github.com/adikverma',
      linkLabel: 'Explore Code',
      imageUrl: heroArchitectureImg,
      imageAlt:
        'Minimalist architectural workspace with concrete walls, floor-to-ceiling glass, and morning sunlight',
    },
  ],
  notes: [
    {
      id: 'note-static-first',
      title: 'Why a clean static site still wins for personal publishing',
      topic: 'Web Architecture',
      date: 'Nov 2026',
      readTime: '3 min read',
      excerpt:
        'Fast load times, durable plain-text workflows, and simple deployment pipelines make personal sites easier to maintain over years.',
      body: [
        'A personal website works best when the maintenance burden approaches zero. Static builds paired with modern TypeScript tooling let you focus on writing, showcasing finished work, and sharing ideas rather than babysitting servers.',
        'When your site is structured around plain data objects and semantic markup, migrating or redesigning years later becomes straightforward. Every project entry and note stays portable.',
        'Use the Edit Site drawer in the top navigation bar to replace these starter notes with your own essays, project post-mortems, or reading lists.',
      ],
    },
    {
      id: 'note-restraint-ui',
      title: 'Notes on restraint in interface typography and layout',
      topic: 'Interface Design',
      date: 'Oct 2026',
      readTime: '4 min read',
      excerpt:
        'Clarity usually comes from removing visual noise—replacing boxed clutter with generous margins, clear hierarchy, and deliberate contrast.',
      body: [
        'Good editorial interfaces let the work speak first. Instead of wrapping every label in decorative capsules or adding unnecessary chrome, clear spacing and typographic contrast guide the eye naturally.',
        'Pairing a characterful geometric display face with a highly readable body sans and tabular monospace numerals establishes structure immediately, even on information-dense pages.',
        'Keeping interactive affordances plain and predictable—links that look like links, modals that dismiss with Escape, and instant feedback under 200 milliseconds—creates a calmer experience for readers.',
      ],
    },
    {
      id: 'note-github-pages-workflow',
      title: 'Shipping updates cleanly to GitHub Pages',
      topic: 'Workflow',
      date: 'Sep 2026',
      readTime: '2 min read',
      excerpt:
        'A short checklist for building with Vite, verifying TypeScript types, and publishing the production dist bundle cleanly.',
      body: [
        'This starter is configured with Vite, React, TypeScript, and Tailwind CSS v4. Running npm run build produces an optimized static bundle inside the dist directory ready for GitHub Pages.',
        'Before publishing, run npm run lint to catch type mismatches or unused references early, and verify both light and dark modes for contrast consistency.',
        'You can export your customized profile, projects, and notes at any time from Edit Site to commit your changes back into the repository.',
      ],
    },
  ],
};
