import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Moon,
  Sun,
} from 'lucide-react';
import { DEFAULT_SITE_CONTENT, HERO_IMAGE_PATH } from './data/siteContent';
import { NoteItem, ProjectCategory, ProjectItem, SiteContent } from './types';
import { ResilientImage } from './components/ResilientImage';
import { ProjectModal } from './components/ProjectModal';
import { NoteModal } from './components/NoteModal';
import { SiteCustomizer } from './components/SiteCustomizer';

const STORAGE_KEY = 'adikverma_site_content_v1';
const THEME_STORAGE_KEY = 'adikverma_site_theme_v1';

type FilterValue = 'All' | ProjectCategory;

const FILTER_OPTIONS: FilterValue[] = [
  'All',
  'Engineering',
  'Design',
  'Experiments',
];

function loadInitialContent(): SiteContent {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_CONTENT;
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    if (!parsed.profile || !Array.isArray(parsed.projects) || !Array.isArray(parsed.notes)) {
      return DEFAULT_SITE_CONTENT;
    }
    return {
      profile: { ...DEFAULT_SITE_CONTENT.profile, ...parsed.profile },
      projects: parsed.projects,
      notes: parsed.notes,
    };
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

function loadInitialTheme(): 'light' | 'dark' {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // ignore storage errors
  }
  return 'light';
}

export function App() {
  const [content, setContent] = useState<SiteContent>(loadInitialContent);
  const [theme, setTheme] = useState<'light' | 'dark'>(loadInitialTheme);
  const [activeFilter, setActiveFilter] = useState<FilterValue>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null
  );
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const handleUpdateContent = (next: SiteContent) => {
    setContent(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const handleResetDefaults = () => {
    setContent(DEFAULT_SITE_CONTENT);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return content.projects;
    return content.projects.filter((item) => item.category === activeFilter);
  }, [content.projects, activeFilter]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(content.profile.email);
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      setEmailCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] dark:bg-[#0B0D10] dark:text-[#F3F4F6] transition-colors duration-150">
      {/* Top Bar Contract: Single row, 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-zinc-800/80 bg-[#FAFAFA]/90 dark:bg-[#0B0D10]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          <a
            href="#overview"
            className="font-display text-lg font-semibold tracking-tight text-slate-950 dark:text-zinc-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB]"
          >
            {content.profile.wordmark}
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-zinc-400"
          >
            <a
              href="#overview"
              className="hover:text-slate-950 dark:hover:text-zinc-50 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              Overview
            </a>
            <a
              href="#work"
              className="hover:text-slate-950 dark:hover:text-zinc-50 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              Work
            </a>
            <a
              href="#notes"
              className="hover:text-slate-950 dark:hover:text-zinc-50 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              Notes
            </a>
            <a
              href="#contact"
              className="hover:text-slate-950 dark:hover:text-zinc-50 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              Contact
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="rounded-lg bg-slate-950 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            Edit Site
          </button>
        </div>
      </header>

      <main>
        {/* Hero Split */}
        <section
          id="overview"
          className="mx-auto max-w-6xl px-6 pt-12 pb-16 sm:pt-16 sm:pb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between py-2">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 font-mono-tabular">
                  {content.profile.kicker}
                </p>

                <h1
                  className="mt-5 font-display font-semibold tracking-tight text-slate-950 dark:text-zinc-50 leading-[1.08] text-balance-heading"
                  style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}
                >
                  {content.profile.headline}
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-zinc-300">
                  {content.profile.bio}
                </p>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-6">
                <a
                  href="#work"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                >
                  <span>Explore Work</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>

                <a
                  href={content.profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
                >
                  <span>GitHub Profile</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-72 sm:h-96 lg:h-full lg:min-h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900">
                <ResilientImage
                  src={HERO_IMAGE_PATH}
                  alt="Minimalist architectural concrete and glass workspace bathed in natural daylight"
                  fallbackTitle={content.profile.wordmark}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Full-width 4-column index strip below the hero split */}
          <dl className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-200 dark:border-zinc-800 pt-8">
            <div>
              <dt className="text-xs text-slate-500 dark:text-zinc-400">
                Focus
              </dt>
              <dd className="mt-1.5 text-sm font-medium text-slate-950 dark:text-zinc-100">
                {content.profile.focus}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-zinc-400">
                Location
              </dt>
              <dd className="mt-1.5 text-sm font-medium text-slate-950 dark:text-zinc-100">
                {content.profile.location}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-zinc-400">
                Availability
              </dt>
              <dd className="mt-1.5 text-sm font-medium text-slate-950 dark:text-zinc-100">
                {content.profile.availability}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-zinc-400">
                Repository
              </dt>
              <dd className="mt-1.5 text-sm font-medium text-slate-950 dark:text-zinc-100 font-mono-tabular truncate">
                {content.profile.repository}
              </dd>
            </div>
          </dl>
        </section>

        {/* Selected Work Section */}
        <section
          id="work"
          className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#101318]"
        >
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-zinc-50">
                  Selected Work
                </h2>
                <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-600 dark:text-zinc-400">
                  Featured builds, design studies, and open-source experiments.
                  Select any item to view details.
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Filter projects by discipline"
                className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-zinc-900 p-1 self-start sm:self-auto"
              >
                {FILTER_OPTIONS.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                        isActive
                          ? 'bg-white dark:bg-zinc-800 text-slate-950 dark:text-zinc-50 shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-zinc-100'
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <article
                    key={project.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#0B0D10] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="flex flex-1 flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-zinc-900">
                        <ResilientImage
                          src={project.imageUrl}
                          alt={project.imageAlt}
                          fallbackTitle={project.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-mono-tabular">
                            <span>{project.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{project.year}</span>
                          </div>

                          <h3 className="mt-2.5 text-lg font-semibold tracking-tight text-slate-950 dark:text-zinc-50 group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors">
                            {project.title}
                          </h3>

                          <p className="mt-2.5 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                            {project.summary}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-200/80 dark:border-zinc-800/80 pt-4 text-xs text-slate-500 dark:text-zinc-400">
                          <span className="truncate font-mono-tabular">
                            {project.stack}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap shrink-0 ml-3">
                            Details
                            <ArrowUpRight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-2xl border border-slate-200 dark:border-zinc-800 p-10 text-center">
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  No projects match the {activeFilter} filter yet.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveFilter('All')}
                  className="mt-4 rounded-lg border border-slate-200 dark:border-zinc-700 px-4 py-2 text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  Show All Projects
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Notes / Editorial Index */}
        <section
          id="notes"
          className="border-t border-slate-200 dark:border-zinc-800"
        >
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-zinc-50">
                  Notes & Writing
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-6 text-slate-600 dark:text-zinc-400">
                  Short essays on web engineering, tooling, and interface
                  design. Open any note to read or copy as Markdown.
                </p>
              </div>

              <div className="lg:col-span-8">
                <div className="divide-y divide-slate-200 dark:divide-zinc-800 border-t border-b border-slate-200 dark:border-zinc-800">
                  {content.notes.map((note, idx) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => setSelectedNote(note)}
                      className="group flex w-full flex-col sm:flex-row sm:items-baseline justify-between gap-4 py-6 text-left transition-colors hover:bg-slate-100/60 dark:hover:bg-zinc-900/50 px-3 -mx-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                    >
                      <div className="flex items-baseline gap-4 min-w-0">
                        <span className="text-xs font-mono-tabular text-slate-400 dark:text-zinc-500 shrink-0">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-zinc-50 group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors">
                            {note.title}
                          </h3>
                          <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-zinc-400 max-w-2xl">
                            {note.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-mono-tabular whitespace-nowrap shrink-0 pl-8 sm:pl-0">
                        <span>{note.topic}</span>
                        <span aria-hidden="true">·</span>
                        <span>{note.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{note.readTime}</span>
                      </div>
                    </button>
                  ))}

                  {content.notes.length === 0 && (
                    <div className="py-10 text-sm text-slate-500 dark:text-zinc-400">
                      No notes published yet. Open Edit Site to add your first
                      note.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#101318]"
        >
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-6">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-zinc-50 text-balance-heading">
                  Get in touch
                </h2>
                <p className="mt-3 max-w-lg text-sm sm:text-base leading-6 text-slate-600 dark:text-zinc-400">
                  Interested in collaborating on a software project, exchanging
                  ideas, or discussing engineering problems? Reach out directly.
                </p>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#0B0D10] px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Direct Email
                    </p>
                    <a
                      href={`mailto:${content.profile.email}`}
                      className="mt-0.5 block truncate text-sm sm:text-base font-medium text-slate-950 dark:text-zinc-100 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
                    >
                      {content.profile.email}
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    {emailCopied ? (
                      <>
                        <Check
                          className="h-3.5 w-3.5 text-[#2563EB]"
                          aria-hidden="true"
                        />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-700 dark:text-zinc-300">
                  <a
                    href={content.profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-slate-950 dark:hover:text-white underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>GitHub</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <a
                    href={content.profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-slate-950 dark:hover:text-white underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>LinkedIn</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsCustomizerOpen(true)}
                    className="inline-flex items-center gap-1 text-[#2563EB] dark:text-[#60A5FA] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Customize Page</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-6 py-8 text-xs text-slate-500 dark:text-zinc-400">
          <p className="font-mono-tabular">
            © {new Date().getFullYear()} {content.profile.wordmark}
          </p>

          <div className="flex items-center gap-5">
            <a
              href="#overview"
              className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0"
            >
              Back to Top
            </a>
            <button
              type="button"
              onClick={() =>
                setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
              }
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <NoteModal note={selectedNote} onClose={() => setSelectedNote(null)} />

      <SiteCustomizer
        isOpen={isCustomizerOpen}
        content={content}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
        }
        onUpdateContent={handleUpdateContent}
        onResetDefaults={handleResetDefaults}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </div>
  );
}

export default App;
