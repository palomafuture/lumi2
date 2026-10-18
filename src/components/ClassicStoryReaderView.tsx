import React, { useState, useMemo } from 'react';
import { Fanfic, ChapterComment } from '../types/fanfic';
import { renderInteractiveText, generateStandaloneHtml, triggerFileDownload } from '../utils/interactiveEngine';
import { addCommentToFanfic } from '../utils/storage';
import {
  ArrowLeft,
  Sparkles,
  Download,
  MessageSquare,
  Star,
  Send,
  RotateCcw,
  Check,
  Share2,
  Sliders,
  Bookmark,
  Heart
} from 'lucide-react';

interface ClassicStoryReaderViewProps {
  fanfic: Fanfic;
  onBackToHome: () => void;
  onUpdateFanfic: (updated: Fanfic) => void;
}

export const ClassicStoryReaderView: React.FC<ClassicStoryReaderViewProps> = ({
  fanfic,
  onBackToHome,
  onUpdateFanfic
}) => {
  const [userValues, setUserValues] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(`fic_vars_${fanfic.id}`);
    const initial: Record<string, string> = {};
    fanfic.variables?.forEach(v => {
      initial[v.key] = v.defaultValue;
    });

    if (saved) {
      try {
        return { ...initial, ...JSON.parse(saved) };
      } catch (e) {}
    }
    return initial;
  });

  const [isInteractiveBarOpen, setIsInteractiveBarOpen] = useState(false);
  const [highlightInteractive, setHighlightInteractive] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Comment Form States
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [commentSent, setCommentSent] = useState(false);

  const handleInputChange = (key: string, val: string) => {
    const updated = { ...userValues, [key]: val };
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

  const currentChapter = fanfic.chapters?.[0] || {
    id: 'cap-1',
    number: 1,
    title: fanfic.title,
    htmlContent: '<p>História sem conteúdo.</p>'
  };

  const renderedContent = useMemo(() => {
    return renderInteractiveText(
      currentChapter.htmlContent,
      userValues,
      highlightInteractive
    );
  }, [currentChapter.htmlContent, userValues, highlightInteractive]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    const updated = addCommentToFanfic(fanfic.id, {
      readerName: commentName.trim(),
      content: commentText.trim(),
      rating: commentRating,
      chapterNumber: 1
    });

    const refreshed = updated.find(f => f.id === fanfic.id);
    if (refreshed) {
      onUpdateFanfic(refreshed);
    }

    setCommentText('');
    setCommentSent(true);
    setTimeout(() => setCommentSent(false), 3500);
  };

  const handleExportHtml = () => {
    const html = generateStandaloneHtml(fanfic);
    triggerFileDownload(html, `${fanfic.slug || 'fanfic'}.html`, 'text/html');
  };

  return (
    <div className="min-h-screen bg-white text-[#14171f] font-sans">
      
      {/* Top Utility Nav for the Reader */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e2e6ee] px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-[#2c3342] shadow-2xs">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 font-bold text-[#152238] hover:text-[#ce5272] transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Home</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-1.5 rounded transition-colors ${isLiked ? 'text-[#ce5272]' : 'text-stone-500 hover:text-[#ce5272]'}`}
            title="Curtir fanfic"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#ce5272]' : ''}`} />
          </button>

          <button
            onClick={() => setIsInteractiveBarOpen(!isInteractiveBarOpen)}
            className={`px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 text-xs shadow-xs ${
              isInteractiveBarOpen
                ? 'bg-[#ce5272] text-white'
                : 'bg-[#fdf0f4] hover:bg-[#f9e2e8] text-[#9e2847] border border-[#eca8b8]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalizar Personagens</span>
          </button>

          <button
            onClick={handleExportHtml}
            className="px-3 py-1.5 rounded font-semibold bg-[#152238] hover:bg-[#27426e] text-white flex items-center gap-1.5 transition-colors shadow-xs"
            title="Baixar arquivo HTML desta fanfic autônoma"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baixar HTML</span>
          </button>
        </div>
      </nav>

      {/* Interactive Customization Drawer (Rose Quartz & Serenity) */}
      {isInteractiveBarOpen && (
        <section className="bg-[#f8faff] border-b border-[#b8cee8] px-4 sm:px-6 py-5 transition-all shadow-inner">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ce5272]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#152238] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#ce5272]" />
                    <span>Personalize os personagens da sua história</span>
                  </h3>
                </div>
                <p className="text-[11px] text-[#486da6] mt-0.5">
                  Substitua os nomes abaixo pelos de sua preferência. A leitura atualiza instantaneamente no texto!
                </p>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-xs text-[#2c3342] flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={highlightInteractive}
                    onChange={(e) => setHighlightInteractive(e.target.checked)}
                    className="accent-[#ce5272] rounded cursor-pointer"
                  />
                  <span>Destacar tags no texto</span>
                </label>
                <button
                  onClick={handleResetDefaults}
                  className="text-xs text-stone-500 hover:text-[#ce5272] flex items-center gap-1 font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar Padrão</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {fanfic.variables?.map((v) => (
                <div key={v.key} className="bg-white p-2.5 rounded-lg border border-[#d2dbe8] shadow-2xs focus-within:border-[#ce5272] transition-colors">
                  <label className="block text-[10px] font-bold text-[#486da6] uppercase tracking-tight">
                    {v.label} [{v.key}]
                  </label>
                  <input
                    type="text"
                    value={userValues[v.key] !== undefined ? userValues[v.key] : v.defaultValue}
                    onChange={(e) => handleInputChange(v.key, e.target.value)}
                    placeholder={v.placeholder || v.defaultValue}
                    className="w-full text-xs px-2 py-1 bg-[#f8faff] border border-[#e2e6ee] rounded mt-1 outline-none focus:border-[#ce5272] focus:bg-white font-medium text-[#0e1015]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Fanfic Layout - EXACTLY AS IN "pagina fanfic.png" */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        
        {/* Title Block (Styled with Serenity and Rose Quartz) */}
        <header className="text-center mb-8 border-b border-[#e2e6ee] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fdf0f4] text-[#9e2847] border border-[#eca8b8] text-[11px] font-bold uppercase tracking-wider mb-3">
            <span>Fanfic Interativa</span>
            <span>·</span>
            <span>{fanfic.fandom}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#152238] tracking-tight mb-3">
            {fanfic.title}
          </h1>

          <div className="text-xs text-stone-600 flex items-center justify-center flex-wrap gap-1.5">
            <span>História por </span>
            <span className="text-[#ce5272] font-bold hover:underline cursor-pointer">
              {fanfic.author.includes('(') ? fanfic.author.split('(')[0].trim() : fanfic.author}
            </span>
            {fanfic.author.includes('Revisão por') && (
              <>
                <span className="mx-1 text-stone-300">|</span>
                <span>Revisão por </span>
                <span className="text-[#486da6] font-bold">
                  {fanfic.author.split('Revisão por')[1]?.replace(')', '').trim() || 'Equipe Lumiere'}
                </span>
              </>
            )}
            <span className="mx-1 text-stone-300">|</span>
            <span className="text-stone-500 font-medium">{fanfic.status}</span>
          </div>
        </header>

        {/* Story Body Prose (Authentic Georgia classic typography from pagina fanfic.png) */}
        <article
          className="text-base sm:text-[17px] text-[#14171f] leading-[1.75] space-y-5 text-justify"
          style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {/* Author and Beta Notes (Exact replica of pagina fanfic.png) */}
        <section className="mt-12 pt-6 border-t border-[#e2e6ee] text-xs text-stone-800 space-y-4 font-sans">
          
          {fanfic.chapters?.[0]?.authorNote && (
            <div className="space-y-2 bg-[#f8faff] p-4 rounded-lg border border-[#d2dbe8]">
              <div
                className="whitespace-pre-line leading-relaxed text-[#2c3342]"
                dangerouslySetInnerHTML={{
                  __html: fanfic.chapters[0].authorNote
                    .replace(/Nota da Autora:/g, '<strong class="text-[#0e1015] font-bold">Nota da Autora:</strong>')
                    .replace(/Nota da Beta1:/g, '<br /><strong class="text-[#486da6] font-bold">Nota da Beta1:</strong>')
                    .replace(/Nota da Beta2:/g, '<br /><strong class="text-[#ce5272] font-bold">Nota da Beta2:</strong>')
                }}
              />
            </div>
          )}

          {/* Disqus attribution text (as in pagina fanfic.png) */}
          <div className="pt-4 border-t border-[#e2e6ee] text-[11px] text-stone-600 flex items-center justify-between">
            <span className="text-stone-500 font-medium">
              comentários gerenciados por <span className="font-bold text-[#486da6]">Disqus / Lumiere.ink</span>
            </span>
            <span className="text-[11px] font-bold text-[#ce5272]">
              {fanfic.comments?.length || 0} comentários registrados
            </span>
          </div>

        </section>

        {/* COMMENTS SECTION - Requested explicitly: "só que com a opção de comentários" */}
        <section className="mt-8 pt-6 border-t-2 border-[#152238]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#0e1015] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#ce5272]" />
              <span>Deixe seu Comentário para a Autora</span>
            </h3>
            <span className="text-xs text-[#486da6] font-semibold">Lumiere.ink Interatividade</span>
          </div>

          {/* New Comment Form */}
          <form onSubmit={handlePostComment} className="bg-[#f8faff] border border-[#d2dbe8] rounded-xl p-5 mb-8 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-bold text-[#152238] mb-1">
                  Seu Nome ou Apelido de Leitora:
                </label>
                <input
                  type="text"
                  required
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Ex: Leitora Apaixonada"
                  className="w-full text-xs px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg outline-none focus:border-[#ce5272] font-medium text-[#0e1015]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#152238] mb-1">
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
                      <Star className={`w-4 h-4 ${star <= commentRating ? 'fill-amber-500' : 'stroke-amber-400'}`} />
                    </button>
                  ))}
                  <span className="text-xs text-stone-600 ml-2 font-medium">{commentRating} de 5 estrelas</span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-bold text-[#152238] mb-1">
                Seu Comentário:
              </label>
              <textarea
                required
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="O que achou da história? Quais reações teve com os nomes e a narrativa?"
                className="w-full text-xs p-3 bg-white border border-[#d2dbe8] rounded-lg outline-none focus:border-[#ce5272] font-medium leading-relaxed text-[#0e1015]"
              />
            </div>

            <div className="flex items-center justify-between">
              {commentSent ? (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Comentário publicado com sucesso!
                </span>
              ) : <span />}

              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publicar Comentário</span>
              </button>
            </div>
          </form>

          {/* List of comments */}
          <div className="space-y-3">
            {(!fanfic.comments || fanfic.comments.length === 0) ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                Seja a primeira a comentar nesta história!
              </div>
            ) : (
              fanfic.comments.map((comm) => (
                <div key={comm.id} className="p-4 bg-white border border-[#e2e6ee] rounded-xl text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#fdf0f4] text-[#9e2847] border border-[#eca8b8] font-bold flex items-center justify-center text-[10px]">
                        {comm.readerName[0]?.toUpperCase() || 'L'}
                      </div>
                      <strong className="font-bold text-[#0e1015]">{comm.readerName}</strong>
                      <span className="text-[10px] text-[#486da6]">· {comm.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: comm.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-[#2c3342] leading-relaxed font-sans pl-8">
                    {comm.content}
                  </p>
                </div>
              ))
            )}
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1c2230] bg-[#0e1015] text-white py-10 text-center text-xs mt-16">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-serif font-black text-lg text-white">
            <span className="text-[#ce5272] italic font-normal text-xl">L.</span> Lumiere<span className="text-[#b8cee8] font-mono">.ink</span>
          </p>
          <p className="text-[11px] mt-1 text-[#b8cee8]">Página renderizada exatamente no modelo clássico autônomo em HTML.</p>
          <p className="text-[10px] text-stone-400 mt-2">Paleta Pantone Rose Quartz (13-1520) & Serenity (15-3919) com contraste Obsidian Noir.</p>
        </div>
      </footer>

    </div>
  );
};
