import { Fanfic, ChapterComment, PortalUpdatePost, PortalUpdateComment } from '../types/fanfic';
import { INITIAL_FANFICS } from '../data/defaultFanfics';
import { INITIAL_PORTAL_UPDATES } from '../data/defaultUpdates';

const STORAGE_KEY = 'lumiere_fanfics_library';
const BOOKMARKS_KEY = 'lumiere_fanfics_bookmarks';
const LIKES_KEY = 'lumiere_fanfics_likes';
const UPDATES_KEY = 'lumiere_portal_updates';

export function getStoredFanfics(): Fanfic[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FANFICS));
      return INITIAL_FANFICS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FANFICS;
  } catch (e) {
    console.error('Failed to load fanfics from storage:', e);
    return INITIAL_FANFICS;
  }
}

export function saveFanfics(fanfics: Fanfic[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fanfics));
  } catch (e) {
    console.error('Failed to save fanfics to storage:', e);
  }
}

export function saveSingleFanfic(fanfic: Fanfic): Fanfic[] {
  const current = getStoredFanfics();
  const index = current.findIndex(f => f.id === fanfic.id);
  let updated: Fanfic[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...fanfic, updatedAt: new Date().toISOString().split('T')[0] };
  } else {
    updated = [
      {
        ...fanfic,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isCustom: true
      },
      ...current
    ];
  }

  saveFanfics(updated);
  return updated;
}

export function deleteFanfic(id: string): Fanfic[] {
  const current = getStoredFanfics();
  const updated = current.filter(f => f.id !== id);
  saveFanfics(updated);
  return updated;
}

export function addCommentToFanfic(fanficId: string, comment: Omit<ChapterComment, 'id' | 'createdAt'>): Fanfic[] {
  const current = getStoredFanfics();
  const updated = current.map(f => {
    if (f.id === fanficId) {
      const newComment: ChapterComment = {
        ...comment,
        id: 'comm-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      return {
        ...f,
        comments: [newComment, ...(f.comments || [])]
      };
    }
    return f;
  });
  saveFanfics(updated);
  return updated;
}

export function toggleLikeFanfic(fanficId: string): { isLiked: boolean; count: number } {
  try {
    const rawLikes = localStorage.getItem(LIKES_KEY) || '{}';
    const likesMap: Record<string, boolean> = JSON.parse(rawLikes);
    const wasLiked = !!likesMap[fanficId];
    const isLiked = !wasLiked;
    likesMap[fanficId] = isLiked;
    localStorage.setItem(LIKES_KEY, JSON.stringify(likesMap));

    // Update in stored list
    const current = getStoredFanfics();
    let newCount = 0;
    const updated = current.map(f => {
      if (f.id === fanficId) {
        newCount = Math.max(0, f.likes + (isLiked ? 1 : -1));
        return { ...f, likes: newCount };
      }
      return f;
    });
    saveFanfics(updated);
    return { isLiked, count: newCount };
  } catch {
    return { isLiked: false, count: 0 };
  }
}

export function isFanficLiked(fanficId: string): boolean {
  try {
    const rawLikes = localStorage.getItem(LIKES_KEY) || '{}';
    const likesMap = JSON.parse(rawLikes);
    return !!likesMap[fanficId];
  } catch {
    return false;
  }
}

export function getBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(fanficId: string): boolean {
  const current = getBookmarks();
  const exists = current.includes(fanficId);
  const updated = exists ? current.filter(id => id !== fanficId) : [...current, fanficId];
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  return !exists;
}

// ----------------- PORTAL UPDATES STORAGE -----------------

export function getStoredPortalUpdates(): PortalUpdatePost[] {
  try {
    const raw = localStorage.getItem(UPDATES_KEY);
    if (!raw) {
      localStorage.setItem(UPDATES_KEY, JSON.stringify(INITIAL_PORTAL_UPDATES));
      return INITIAL_PORTAL_UPDATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PORTAL_UPDATES;
  } catch (e) {
    console.error('Failed to load portal updates from storage:', e);
    return INITIAL_PORTAL_UPDATES;
  }
}

export function savePortalUpdates(updates: PortalUpdatePost[]): void {
  try {
    localStorage.setItem(UPDATES_KEY, JSON.stringify(updates));
  } catch (e) {
    console.error('Failed to save portal updates:', e);
  }
}

export function saveSinglePortalUpdate(post: PortalUpdatePost): PortalUpdatePost[] {
  const current = getStoredPortalUpdates();
  const idx = current.findIndex(u => u.id === post.id);
  let updated: PortalUpdatePost[];

  if (idx >= 0) {
    updated = [...current];
    updated[idx] = post;
  } else {
    // Add new update at the very top (latest first)
    updated = [post, ...current];
  }

  savePortalUpdates(updated);
  return updated;
}

export function deletePortalUpdate(id: string): PortalUpdatePost[] {
  const current = getStoredPortalUpdates();
  const updated = current.filter(u => u.id !== id);
  savePortalUpdates(updated);
  return updated;
}

export function addCommentToPortalUpdate(
  updateId: string,
  commentData: { authorName: string; email?: string; website?: string; message: string }
): PortalUpdatePost[] {
  const current = getStoredPortalUpdates();
  const updated = current.map(u => {
    if (u.id === updateId) {
      const newComment: PortalUpdateComment = {
        id: 'comm-' + Date.now(),
        authorName: commentData.authorName,
        email: commentData.email,
        website: commentData.website,
        message: commentData.message,
        createdAt: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      return {
        ...u,
        comments: [...(u.comments || []), newComment]
      };
    }
    return u;
  });
  savePortalUpdates(updated);
  return updated;
}
