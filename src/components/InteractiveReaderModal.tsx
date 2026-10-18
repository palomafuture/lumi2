import React, { useState, useEffect, useMemo } from 'react';
import { Fanfic, ReaderSettings, ReaderTheme, ReaderFont, ChapterComment } from '../types/fanfic';
import { renderInteractiveText, generateStandaloneHtml, triggerFileDownload } from '../utils/interactiveEngine';
import { addCommentToFanfic, toggleLikeFanfic, isFanficLiked } from '../utils/storage';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Settings,
  Sparkles,
  Heart,
  MessageSquare,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Check,
  Star
} from 'lucide-react';

interface InteractiveReaderModalProps {
  fanfic: Fanfic;
  onClose: () => void;
  onUpdateFanfic: (updated: Fanfic) => void;
}

const PRESET_NAMES: { label: string; values: Record<string, string> }[] = [
  { label: 'Padrão da Autora', values: {} },
  {
    label: 'Clássico Lumiere',
    values: { NOME: 'Marina', SOBRENOME: 'Albuquerque', PAR: 'Bernardo', AMIGA: 'Camila', EX: 'Matheus', CIDADE: 'Rio de Janeiro' }
  },
  {
    label: 'Vampire Diaries Vibe',
    values: { NOME: 'Elena', SOBRENOME: 'Gilbert', PAR: 'Damon', AMIGA: 'Caroline', EX: 'Stefan', CIDADE: 'Mystic Falls' }
  },
  {
    label: 'Pop Star AU',
    values: { NOME: 'Taylor', SOBRENOME: 'Swift', PAR: 'Travis', AMIGA: 'Selena', EX: 'Joe', CIDADE: 'Nova York' }
  }
];

export const InteractiveReaderModal: React.FC<InteractiveReaderModalProps> = ({
  fanfic,
  onClose,
  onUpdateFanfic
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [userValues, setUserValues] = useState<Record<string, string>>({});
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [liked, setLiked] = useState(() => isFanficLiked(fanfic.id));

  // Comment form state
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [commentSent, setCommentSent] = useState(false);

  // Reader typography & appearance
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    return {
      theme: (localStorage.getItem('reader_theme') as ReaderTheme) || 'alabaster',
      font: 'serif',
      fontSize: 18,
      lineHeight: 1.85,
      highlightInteractive: true,
      maxWidth: 'prose'
    };
  });

  // Load saved variables
  useEffect(() => {
    const saved = localStorage.getItem(`fic_vars_${fanfic.id}`);
    const initial: Record<string, string> = {};
    fanfic.variables?.forEach(v => {
      initial[v.key] = v.defaultValue;
    });

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserValues({ ...initial, ...parsed });
        return;
      } catch (e) {}
    }
    setUserValues(initial);
  }, [fanfic.id, fanfic.variables]);

  const handleInputChange = (key: string, val: string) => {
    const updated = { ...userValues, [key]: val };
    setUserValues(updated);
    localStorage.setItem(`fic_vars_${fanfic.id}`, JSON.stringify(updated));
  };

  const handleApplyPreset = (presetValues: Record<string, string>) => {
    const updated = { ...userValues, ...presetValues };
    setUserValues(updated);
    localStorage.setItem(`fic_vars_${fanfic.id}`, JSON.stringify(updated));
  };

  const handleResetDefaults = () => {
    const defaults: Record<string, string> = {};
    fanfic.variables?.forEach(v => {
      defaults[v.key] = v.defaultValue;
    });
    setUserValues(defaults);
    localStorage.removeItem(`fic_vars_${fanfic.id}`);
  };

  const currentChapter = fanfic.chapters?.[currentChapterIndex] || {
    id: 'default',
    number: 1,
    title: 'Capítulo 1',
    htmlContent: '<p>Nenhum capítulo cadastrado ainda.</p>',
    wordCount: 0
  };

  // Render processed HTML
  const renderedHtml = useMemo(() => {
    return renderInteractiveText(
      currentChapter.htmlContent,
      userValues,
      settings.highlightInteractive
    );
  }, [currentChapter.htmlContent, userValues, settings.highlightInteractive]);

  const handleExportHtml = () => {
    const html = generateStandaloneHtml(fanfic);
    triggerFileDownload(html, `${fanfic.slug || 'historia-interativa'}.html`, 'text/html');
  };

  const handleToggleLike = () => {
    const { isLiked, count } = toggleLikeFanfic(fanfic.id);
    setLiked(isLiked);
    onUpdateFanfic({ ...fanfic, likes: count });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    const updated = addCommentToFanfic(fanfic.id, {
      readerName: commentName.trim(),
      content: commentText.trim(),
      rating: commentRating,
      chapterNumber: currentChapter.number
    });

    const refreshed = updated.find(f => f.id === fanfic.id);
    if (refreshed) {
      onUpdateFanfic(refreshed);
    }

    setCommentText('');
    setCommentSent(true);
    setTimeout(() => setCommentSent(false), 3000);
  };

  // Theme container classes
  const themeClasses: Record<ReaderTheme, string> = {
    alabaster: 'theme-alabaster bg-[#faf8f5] text-[#262422]',
    sepia: 'theme-sepia bg-[#f4ecd8] text-[#3b2f20]',
    rose: 'theme-rose bg-[#fff1f2] text-[#3f1d24]',
    dark: 'theme-dark bg-[#17171a] text-[#e4e4e7]'
  };

  const fontClass =
    settings.font === 'serif' ? 'font-book' : settings.font === 'display' ? 'font-display' : 'font-sans';

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto flex flex-col ${themeClasses[settings.theme]}`}>
      
      {/* Top Reader Navigation Bar */}
      <header className="sticky top-0 z-40 px-4 py-3 border-b border-stone-200/40 backdrop-blur-md bg-inherit/90 flex items-center justify-between gap-4">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-stone-500/10 transition-colors shrink-0"
            title="Voltar ao portal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm font-display font-bold truncate leading-tight">
              {fanfic.title}
            </h1>
            <p className="text-[11px] opacity-70 truncate">
              Por {fanfic.author} · {fanfic.fandom}
            </p>
          </div>
        </div>

        {/* Center: Chapter Jump */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            disabled={currentChapterIndex === 0}
            onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
            className="p-1.5 rounded hover:bg-stone-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={currentChapterIndex}
            onChange={(e) => setCurrentChapterIndex(Number(e.target.value))}
            className="text-xs bg-stone-500/10 border border-stone-400/20 rounded px-2.5 py-1.5 outline-none font-medium"
          >
            {fanfic.chapters.map((chap, idx) => (
              <option key={chap.id || idx} value={idx} className="bg-white text-stone-900">
                Capítulo {chap.number}: {chap.title}
              </option>
            ))}
          </select>

          <button
            disabled={currentChapterIndex >= (fanfic.chapters.length - 1)}
            onClick={() => setCurrentChapterIndex(prev => Math.min(fanfic.chapters.length - 1, prev + 1))}
            className="p-1.5 rounded hover:bg-stone-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPanelOpen(prev => !prev)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 ${
              isPanelOpen
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-stone-500/10 border-stone-400/20 hover:bg-stone-500/20'
            }`}
            title="Abrir/Fechar formulário de interatividade"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Personalizar Nomes</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(prev => !prev)}
            className="p-2 rounded-md hover:bg-stone-500/10 transition-colors"
            title="Ajustes de visualização"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportHtml}
            className="p-2 rounded-md hover:bg-stone-500/10 transition-colors"
            title="Baixar HTML estático desta fanfic"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Settings Dropdown Bar */}
      {isSettingsOpen && (
        <div className="border-b border-stone-300/30 bg-inherit px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Themes */}
          <div className="flex items-center gap-2">
            <span className="opacity-75 font-medium">Tema:</span>
            <button
              onClick={() => {
                setSettings(s => ({ ...s, theme: 'alabaster' }));
                localStorage.setItem('reader_theme', 'alabaster');
              }}
              className={`px-2.5 py-1 rounded border text-[11px] font-medium bg-[#faf8f5] text-[#262422] ${settings.theme === 'alabaster' ? 'ring-2 ring-rose-500' : 'border-stone-300'}`}
            >
              Alabastro
            </button>
            <button
              onClick={() => {
                setSettings(s => ({ ...s, theme: 'sepia' }));
                localStorage.setItem('reader_theme', 'sepia');
              }}
              className={`px-2.5 py-1 rounded border text-[11px] font-medium bg-[#f4ecd8] text-[#3b2f20] ${settings.theme === 'sepia' ? 'ring-2 ring-rose-500' : 'border-stone-300'}`}
            >
              Sépia
            </button>
            <button
              onClick={() => {
                setSettings(s => ({ ...s, theme: 'rose' }));
                localStorage.setItem('reader_theme', 'rose');
              }}
              className={`px-2.5 py-1 rounded border text-[11px] font-medium bg-[#fff1f2] text-[#3f1d24] ${settings.theme === 'rose' ? 'ring-2 ring-rose-500' : 'border-stone-300'}`}
            >
              Romance
            </button>
            <button
              onClick={() => {
                setSettings(s => ({ ...s, theme: 'dark' }));
                localStorage.setItem('reader_theme', 'dark');
              }}
              className={`px-2.5 py-1 rounded border text-[11px] font-medium bg-[#17171a] text-[#e4e4e7] ${settings.theme === 'dark' ? 'ring-2 ring-rose-500' : 'border-stone-700'}`}
            >
              Noite
            </button>
          </div>

          {/* Font selection */}
          <div className="flex items-center gap-2">
            <span className="opacity-75 font-medium">Fonte:</span>
            <button
              onClick={() => setSettings(s => ({ ...s, font: 'serif' }))}
              className={`px-2 py-0.5 rounded font-book text-xs ${settings.font === 'serif' ? 'bg-stone-500/20 font-bold' : ''}`}
            >
              Lora Serif
            </button>
            <button
              onClick={() => setSettings(s => ({ ...s, font: 'sans' }))}
              className={`px-2 py-0.5 rounded font-sans text-xs ${settings.font === 'sans' ? 'bg-stone-500/20 font-bold' : ''}`}
            >
              Sans-Serif
            </button>
          </div>

          {/* Size controls */}
          <div className="flex items-center gap-2">
            <span className="opacity-75 font-medium">Tamanho:</span>
            <button
              onClick={() => setSettings(s => ({ ...s, fontSize: Math.max(14, s.fontSize - 1) }))}
              className="px-2 py-1 bg-stone-500/10 rounded font-semibold text-xs"
            >
              A-
            </button>
            <span className="font-mono text-xs w-6 text-center">{settings.fontSize}</span>
            <button
              onClick={() => setSettings(s => ({ ...s, fontSize: Math.min(26, s.fontSize + 1) }))}
              className="px-2 py-1 bg-stone-500/10 rounded font-semibold text-xs"
            >
              A+
            </button>
          </div>

          {/* Highlight toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={settings.highlightInteractive}
                onChange={(e) => setSettings(s => ({ ...s, highlightInteractive: e.target.checked }))}
                className="rounded accent-rose-600"
              />
              <span>Destacar termos interativos</span>
            </label>
          </div>
        </div>
      )}

      {/* Main Interactive Form Panel (Lumiere.ink) */}
      {isPanelOpen && (
        <section className="bg-stone-500/5 border-b border-stone-300/30 px-4 sm:px-6 py-5">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-display font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>Painel de Interatividade da História</span>
                </h2>
                <p className="text-xs opacity-75 mt-0.5">
                  Substitua os nomes abaixo pelos de sua preferência. Cada alteração reflete imediatamente na história!
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] opacity-60">Sugestões:</span>
                {PRESET_NAMES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(preset.values)}
                    className="text-[11px] px-2 py-1 bg-stone-500/10 hover:bg-stone-500/20 rounded transition-colors whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {fanfic.variables?.map((v) => (
                <div key={v.key} className="bg-inherit border border-stone-400/20 rounded-lg p-2.5">
                  <label className="block text-[11px] font-semibold opacity-70 mb-1">
                    {v.label} <span className="font-mono text-[10px]">[{v.key}]</span>
                  </label>
                  <input
                    type="text"
                    value={userValues[v.key] !== undefined ? userValues[v.key] : v.defaultValue}
                    onChange={(e) => handleInputChange(v.key, e.target.value)}
                    placeholder={v.placeholder || v.defaultValue}
                    className="w-full text-xs px-2.5 py-1.5 bg-stone-500/10 border border-stone-400/20 rounded outline-none focus:border-rose-500 font-medium transition-colors"
                  />
                  {v.description && (
                    <span className="block text-[10px] opacity-50 mt-1 truncate">
                      {v.description}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-stone-400/15">
              <span className="opacity-60 text-[11px]">
                As personalizações são salvas automaticamente no seu navegador.
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-1 text-[11px] opacity-75 hover:opacity-100 hover:text-rose-600"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar Valores Padrão</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Reading Canvas */}
      <main className="flex-1 py-10 px-4 sm:px-6">
        <article className="max-w-2xl mx-auto">
          
          {/* Chapter Heading */}
          <div className="text-center mb-8 border-b border-stone-400/20 pb-6">
            <span className="text-xs uppercase tracking-widest opacity-60 font-medium">
              Capítulo {currentChapter.number} de {fanfic.chapters.length}
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold mt-2 mb-2">
              {currentChapter.title}
            </h2>
            <div className="flex items-center justify-center gap-3 text-xs opacity-65">
              <span>Palavras: ~{currentChapter.wordCount || 1400}</span>
              <span aria-hidden="true">·</span>
              <span>Tempo de leitura: ~6 min</span>
            </div>
          </div>

          {/* Author's Note */}
          {currentChapter.authorNote && (
            <div className="p-4 mb-8 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs leading-relaxed">
              <strong className="block text-rose-700 font-semibold mb-1">
                Recado da Autora ({fanfic.author}):
              </strong>
              <p className="opacity-85">{currentChapter.authorNote}</p>
            </div>
          )}

          {/* Chapter Content with Interactive Replacement */}
          <div
            className={`reading-prose ${fontClass} leading-relaxed text-justify space-y-5`}
            style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />

          {/* Chapter Bottom Navigation */}
          <div className="mt-12 pt-6 border-t border-stone-400/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                disabled={currentChapterIndex === 0}
                onClick={() => {
                  setCurrentChapterIndex(prev => prev - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 text-xs font-semibold rounded-md border border-stone-400/20 hover:bg-stone-500/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Capítulo Anterior</span>
              </button>

              <button
                disabled={currentChapterIndex >= (fanfic.chapters.length - 1)}
                onClick={() => {
                  setCurrentChapterIndex(prev => prev + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span>Próximo Capítulo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Like and Share */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleLike}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors ${
                  liked
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-stone-400/20 hover:bg-stone-500/10'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span>{fanfic.likes || 0} Curtidas</span>
              </button>

              <button
                onClick={handleExportHtml}
                title="Salvar como HTML estático completo"
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-stone-400/20 hover:bg-stone-500/10 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar HTML</span>
              </button>
            </div>
          </div>

          {/* Interactive Comments / Reviews Section */}
          <section className="mt-14 pt-8 border-t border-stone-400/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-600" />
                <span>Comentários dos Leitores ({fanfic.comments?.length || 0})</span>
              </h3>
              <span className="text-xs opacity-60">Deixe seu feedback para a autora</span>
            </div>

            {/* Post comment form */}
            <form onSubmit={handleAddComment} className="bg-stone-500/5 border border-stone-400/20 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-semibold opacity-70 mb-1">
                    Seu Nome ou Pseudônimo:
                  </label>
                  <input
                    type="text"
                    required
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Ex: Leitora Apaixonada"
                    className="w-full text-xs px-3 py-2 bg-stone-500/10 border border-stone-400/20 rounded outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold opacity-70 mb-1">
                    Avaliação:
                  </label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setCommentRating(star)}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${star <= commentRating ? 'fill-amber-500' : 'stroke-amber-500'}`} />
                      </button>
                    ))}
                    <span className="text-xs opacity-70 ml-2">{commentRating} de 5 estrelas</span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-semibold opacity-70 mb-1">
                  Seu Comentário sobre o Capítulo {currentChapter.number}:
                </label>
                <textarea
                  required
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Conte o que você achou, quais reações teve com os personagens personalizados..."
                  className="w-full text-xs px-3 py-2 bg-stone-500/10 border border-stone-400/20 rounded outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between">
                {commentSent ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Comentário publicado com sucesso!
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                >
                  Enviar Comentário
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {fanfic.comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-stone-500/5 border border-stone-400/15 rounded-lg p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <strong className="font-semibold text-stone-900 dark:text-stone-100">
                        {comment.readerName}
                      </strong>
                      <span className="text-[10px] opacity-60">· Cap. {comment.chapterNumber}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: comment.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                      ))}
                      <span className="text-[10px] opacity-50 ml-1">{comment.createdAt}</span>
                    </div>
                  </div>

                  <p className="opacity-80 leading-relaxed font-sans">{comment.content}</p>
                </div>
              ))}
            </div>
          </section>

        </article>
      </main>

    </div>
  );
};
