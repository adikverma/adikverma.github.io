export type ProjectCategory = 'Engineering' | 'Design' | 'Experiments';

export interface ProjectItem {
  id: string;
  title: string;
  category: ProjectCategory;
  year: string;
  summary: string;
  details: string;
  stack: string;
  linkUrl: string;
  linkLabel: string;
  imageUrl: string;
  imageAlt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  topic: string;
  date: string;
  readTime: string;
  excerpt: string;
  body: string[];
}

export interface SiteProfile {
  wordmark: string;
  kicker: string;
  headline: string;
  bio: string;
  focus: string;
  location: string;
  availability: string;
  repository: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface SiteContent {
  profile: SiteProfile;
  projects: ProjectItem[];
  notes: NoteItem[];
}
