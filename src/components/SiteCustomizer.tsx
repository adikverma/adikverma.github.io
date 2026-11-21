import { useEffect, useState } from 'react';
import { Check, Copy, Download, Moon, Plus, RotateCcw, Sun, Trash2, X } from 'lucide-react';
import { NoteItem, ProjectCategory, ProjectItem, SiteContent } from '../types';
import { HERO_IMAGE_PATH } from '../data/siteContent';

interface SiteCustomizerProps {
  isOpen: boolean;
  content: SiteContent;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUpdateContent: (next: SiteContent) => void;
  onResetDefaults: () => void;
  onClose: () => void;
}

type EditorTab = 'profile' | 'projects' | 'notes';

export function SiteCustomizer({
  isOpen,
  content,
  theme,
  onToggleTheme,
  onUpdateContent,
  onResetDefaults,
  onClose,
}: SiteCustomizerProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('profile');
  const [copiedJson, setCopiedJson] = useState(false);

  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectCategory, setNewProjectCategory] =
    useState<ProjectCategory>('Engineering');
  const [newProjectStack, setNewProjectStack] = useState('TypeScript · React');
  const [newProjectSummary, setNewProjectSummary] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('https://github.com/adikverma');

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteTopic, setNewNoteTopic] = useState('Engineering');
  const [newNoteExcerpt, setNewNoteExcerpt] = useState('');
  const [newNoteBody, setNewNoteBody] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateProfileField = <K extends keyof SiteContent['profile']>(
    field: K,
    value: SiteContent['profile'][K]
  ) => {
    onUpdateContent({
      ...content,
      profile: {
        ...content.profile,
        [field]: value,
      },
    });
  };

  const handleAddProject = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newProjectTitle.trim() || !newProjectSummary.trim()) return;

    const item: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newProjectTitle.trim(),
      category: newProjectCategory,
      year: String(new Date().getFullYear()),
      summary: newProjectSummary.trim(),
      details: newProjectSummary.trim(),
      stack: newProjectStack.trim() || 'Web',
      linkUrl: newProjectUrl.trim() || content.profile.githubUrl,
      linkLabel: 'View Project',
      imageUrl: HERO_IMAGE_PATH,
      imageAlt: `${newProjectTitle.trim()} project preview`,
    };

    onUpdateContent({
      ...content,
      projects: [item, ...content.projects],
    });

    setNewProjectTitle('');
    setNewProjectSummary('');
  };

  const handleDeleteProject = (id: string) => {
    onUpdateContent({
      ...content,
      projects: content.projects.filter((project) => project.id !== id),
    });
  };

  const handleAddNote = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newNoteTitle.trim() || !newNoteExcerpt.trim()) return;

    const paragraphs = newNoteBody
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const item: NoteItem = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      topic: newNoteTopic.trim() || 'Notes',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      readTime: `${Math.max(1, Math.ceil((newNoteBody.split(/\s+/).length || 80) / 180))} min read`,
      excerpt: newNoteExcerpt.trim(),
      body: paragraphs.length > 0 ? paragraphs : [newNoteExcerpt.trim()],
    };

    onUpdateContent({
      ...content,
      notes: [item, ...content.notes],
    });

    setNewNoteTitle('');
    setNewNoteExcerpt('');
    setNewNoteBody('');
  };

  const handleDeleteNote = (id: string) => {
    onUpdateContent({
      ...content,
      notes: content.notes.filter((note) => note.id !== id),
    });
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(content, null, 2));
      setCopiedJson(true);
      window.setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      setCopiedJson(false);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'site-content.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0B0D10] px-3.5 py-2 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-[#2563EB] focus:outline-none';

  const labelClass =
    'block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customizer-title"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-lg flex-col bg-[#FAFAFA] dark:bg-[#12151B] border-l border-slate-200 dark:border-zinc-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 px-6 py-5">
          <div>
            <h2
              id="customizer-title"
              className="text-lg font-semibold tracking-tight text-slate-950 dark:text-zinc-50"
            >
              Edit Site Content
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Changes save automatically in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 px-6 py-3">
          <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 dark:bg-zinc-900 p-1">
            {(['profile', 'projects', 'notes'] as EditorTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab
                    ? 'bg-white dark:bg-zinc-800 text-slate-950 dark:text-zinc-50 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-zinc-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="field-wordmark" className={labelClass}>
                  Site Wordmark
                </label>
                <input
                  id="field-wordmark"
                  type="text"
                  value={content.profile.wordmark}
                  onChange={(e) => updateProfileField('wordmark', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="field-headline" className={labelClass}>
                  Hero Headline
                </label>
                <input
                  id="field-headline"
                  type="text"
                  value={content.profile.headline}
                  onChange={(e) => updateProfileField('headline', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="field-bio" className={labelClass}>
                  Short Bio
                </label>
                <textarea
                  id="field-bio"
                  rows={4}
                  value={content.profile.bio}
                  onChange={(e) => updateProfileField('bio', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-focus" className={labelClass}>
                    Focus Area
                  </label>
                  <input
                    id="field-focus"
                    type="text"
                    value={content.profile.focus}
                    onChange={(e) => updateProfileField('focus', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="field-location" className={labelClass}>
                    Location
                  </label>
                  <input
                    id="field-location"
                    type="text"
                    value={content.profile.location}
                    onChange={(e) => updateProfileField('location', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-availability" className={labelClass}>
                    Availability
                  </label>
                  <input
                    id="field-availability"
                    type="text"
                    value={content.profile.availability}
                    onChange={(e) =>
                      updateProfileField('availability', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="field-email" className={labelClass}>
                    Contact Email
                  </label>
                  <input
                    id="field-email"
                    type="email"
                    value={content.profile.email}
                    onChange={(e) => updateProfileField('email', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="field-github" className={labelClass}>
                  GitHub URL
                </label>
                <input
                  id="field-github"
                  type="url"
                  value={content.profile.githubUrl}
                  onChange={(e) => updateProfileField('githubUrl', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <form
                onSubmit={handleAddProject}
                className="space-y-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0B0D10] p-4"
              >
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Add Project
                </h3>
                <input
                  type="text"
                  placeholder="Project title"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className={inputClass}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newProjectCategory}
                    onChange={(e) =>
                      setNewProjectCategory(e.target.value as ProjectCategory)
                    }
                    className={inputClass}
                    aria-label="Project category"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Experiments">Experiments</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Stack (e.g. Go · React)"
                    value={newProjectStack}
                    onChange={(e) => setNewProjectStack(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Concise project summary"
                  value={newProjectSummary}
                  onChange={(e) => setNewProjectSummary(e.target.value)}
                  className={inputClass}
                  required
                />
                <input
                  type="url"
                  placeholder="Repository or live URL"
                  value={newProjectUrl}
                  onChange={(e) => setNewProjectUrl(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add Project</span>
                </button>
              </form>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  Published Projects ({content.projects.length})
                </h3>
                <div className="divide-y divide-slate-200 dark:divide-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0B0D10]">
                  {content.projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-zinc-100">
                          {project.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono-tabular">
                          {project.category} · {project.year}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.id)}
                        aria-label={`Remove ${project.title}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {content.projects.length === 0 && (
                    <p className="px-4 py-5 text-sm text-slate-500 dark:text-zinc-400">
                      No projects yet. Add one above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <form
                onSubmit={handleAddNote}
                className="space-y-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0B0D10] p-4"
              >
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Add Note
                </h3>
                <input
                  type="text"
                  placeholder="Note title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  placeholder="Topic (e.g. Architecture)"
                  value={newNoteTopic}
                  onChange={(e) => setNewNoteTopic(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Short one-line excerpt"
                  value={newNoteExcerpt}
                  onChange={(e) => setNewNoteExcerpt(e.target.value)}
                  className={inputClass}
                  required
                />
                <textarea
                  rows={4}
                  placeholder="Full note text (separate paragraphs with a blank line)"
                  value={newNoteBody}
                  onChange={(e) => setNewNoteBody(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-medium text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Publish Note</span>
                </button>
              </form>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  Published Notes ({content.notes.length})
                </h3>
                <div className="divide-y divide-slate-200 dark:divide-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0B0D10]">
                  {content.notes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-zinc-100">
                          {note.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono-tabular">
                          {note.topic} · {note.date}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        aria-label={`Remove ${note.title}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {content.notes.length === 0 && (
                    <p className="px-4 py-5 text-sm text-slate-500 dark:text-zinc-400">
                      No notes yet. Publish one above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-zinc-800 px-6 py-4 bg-white dark:bg-[#0B0D10]">
          <button
            type="button"
            onClick={onResetDefaults}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0"
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 dark:bg-zinc-100 px-3.5 py-2 text-xs font-medium text-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-white transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
