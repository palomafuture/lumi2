export type AgeRating = 'Livre' | '+14' | '+16' | '+18';

export type StoryStatus = 'Em Andamento' | 'Concluída';

export interface InteractiveVariable {
  key: string;            // e.g. "NOME", "PAR", "SOBRENOME"
  label: string;          // e.g. "Seu Nome", "Seu Par Romântico"
  defaultValue: string;   // e.g. "Beatriz", "Rodrigo"
  placeholder?: string;   // e.g. "Ex: Maria"
  description?: string;   // e.g. "A protagonista da história"
  category?: 'protagonista' | 'par' | 'secundario' | 'detalhes';
}

export interface ChapterComment {
  id: string;
  readerName: string;
  content: string;
  createdAt: string;
  chapterNumber: number;
  rating?: number; // 1 to 5 stars
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  htmlContent: string;
  authorNote?: string;
  wordCount?: number;
  publishedAt?: string;
}

export interface Fanfic {
  id: string;
  slug: string;
  title: string;
  author: string;
  summary: string;
  fandom: string;
  genres: string[];
  rating: AgeRating;
  status: StoryStatus;
  coverImage: string;
  variables: InteractiveVariable[];
  chapters: Chapter[];
  views: number;
  likes: number;
  comments: ChapterComment[];
  updatedAt: string;
  createdAt: string;
  isCustom?: boolean;
}

export type ReaderTheme = 'alabaster' | 'sepia' | 'rose' | 'dark';
export type ReaderFont = 'serif' | 'sans' | 'display';

export interface ReaderSettings {
  theme: ReaderTheme;
  font: ReaderFont;
  fontSize: number; // in pixels: 16 to 24
  lineHeight: number; // 1.6 to 2.2
  highlightInteractive: boolean;
  maxWidth: 'prose' | 'normal' | 'wide';
}

export interface HeaderBannerConfig {
  id: string;
  isActive: boolean;
  type: 'featured_fanfic' | 'advertiser';
  title: string;
  subtitle: string;
  badge: string; // e.g. "Destaque da Semana", "Publicidade / Anunciante", "Parceiro Oficial"
  ctaText: string; // e.g. "Ler História", "Anuncie Conosco", "Saiba Mais"
  ctaUrl?: string; // external or internal URL
  fanficId?: string; // if featured_fanfic
  imageUrl?: string; // custom ad banner image or book cover
  advertiserName?: string;
  pricePerSlot?: string; // e.g. "R$ 49/mês"
}

export interface PortalUpdateItem {
  id: string;
  type: 'nova' | 'atualizacao';
  fandomCategory: string; // e.g. "Star Wars – Em Andamento", "Restritas – Cantores – Em Andamento"
  title: string;          // e.g. "A Profecia dos Amantes", "Capítulo 33 de Mason"
  author: string;         // e.g. "Lumi Virtanen", "Joy"
  storySlugOrId?: string; // e.g. "a-melhor-vinganca"
  chaptersText?: string;  // e.g. "Capítulos 7, 8 e 9 de Efeito Colateral"
}

export interface PortalUpdateComment {
  id: string;
  authorName: string;
  email?: string;
  website?: string;
  message: string;
  createdAt: string;
}

export interface PortalUpdatePost {
  id: string;
  number: string;        // e.g. "#1893"
  title: string;         // e.g. "Atualização #1893"
  adminAuthor: string;   // e.g. "Joy"
  publishedDate: string; // e.g. "12 de agosto de 2026"
  editorialText: string;
  contactNote?: string;  // e.g. "Qualquer erro nessa atualização, podem me chamar no @lumierejoy"
  newStories: PortalUpdateItem[];
  updatedStories: PortalUpdateItem[];
  announcements: string[]; // recados
  comments: PortalUpdateComment[];
}

