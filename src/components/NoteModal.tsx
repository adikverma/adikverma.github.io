import { useEffect, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { NoteItem } from '../types';

interface NoteModalProps {
  note: NoteItem | null;
  onClose: () => void;
}

export function NoteModal({ note, onClose }: NoteModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!note) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [note, onClose]);

  useEffect(() => {
    setCopied(false);
  }, [note]);

  if (!note) return null;

  const handleCopyMarkdown = async () => {
    const markdown = `# ${note.title}\n\n${note.topic} · ${note.date} · ${note.readTime}\n\n${note.body.join('\n\n')}`;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#12151B] border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-mono-tabular">
            <span>{note.topic}</span>
            <span aria-hidden="true">·</span>
            <span>{note.date}</span>
            <span aria-hidden="true">·</span>
            <span>{note.readTime}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close note reader"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2
          id="note-modal-title"
          className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-zinc-50 text-balance-heading"
        >
          {note.title}
        </h2>

        <div className="mt-6 space-y-5 border-t border-slate-200 dark:border-zinc-800 pt-6">
          {note.body.map((paragraph, index) => (
            <p
              key={index}
              className="text-base leading-7 text-slate-700 dark:text-zinc-300"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-zinc-800 pt-6">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                <span>Copied Markdown</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>Copy as Markdown</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-950 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-white transition-colors whitespace-nowrap shrink-0"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}
