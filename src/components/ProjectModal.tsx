import { useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { ProjectItem } from '../types';
import { ResilientImage } from './ResilientImage';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#12151B] border border-slate-200 dark:border-zinc-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-zinc-900">
          <ResilientImage
            src={project.imageUrl}
            alt={project.imageAlt}
            fallbackTitle={project.title}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-950/90 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-mono-tabular">
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
            <span aria-hidden="true">·</span>
            <span>{project.stack}</span>
          </div>

          <h2
            id="project-modal-title"
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-zinc-50 text-balance-heading"
          >
            {project.title}
          </h2>

          <p className="text-base leading-relaxed text-slate-700 dark:text-zinc-300">
            {project.summary}
          </p>

          <div className="border-t border-slate-200 dark:border-zinc-800 pt-5">
            <p className="text-sm sm:text-base leading-7 text-slate-600 dark:text-zinc-400">
              {project.details}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
            <a
              href={project.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              <span>{project.linkLabel}</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
