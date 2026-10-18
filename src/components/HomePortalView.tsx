import React, { useState } from 'react';
import { Fanfic, PortalUpdatePost, PortalUpdateComment } from '../types/fanfic';
import { getStoredPortalUpdates, addCommentToPortalUpdate } from '../utils/storage';
import {
  Search,
  BookOpen,
  Headphones,
  Film,
  Trophy,
  Shield,
  Disc,
  Feather,
  Lock,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageSquare,
  Star,
  ExternalLink,
  Sparkles,
  Users,
  Compass,
  FileText,
  Upload,
  Share2,
  Send,
  Check,
  Settings,
  Music,
  Tv,
  Sparkle,
  Radio,
  Calendar
} from 'lucide-react';

interface HomePortalViewProps {
  fanfics: Fanfic[];
  onSelectStory: (fanfic: Fanfic) => void;
  onOpenNewStory: () => void;
  onOpenWordConverter: () => void;
  onOpenHostingGuide: () => void;
  onOpenAdminPanel: () => void;
}

export const HomePortalView: React.FC<HomePortalViewProps> = ({
  fanfics,
  onSelectStory,
  onOpenNewStory,
  onOpenWordConverter,
  onOpenHostingGuide,
  onOpenAdminPanel
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);

  // Updates list from storage
  const [allUpdates, setAllUpdates] = useState<PortalUpdatePost[]>(() => getStoredPortalUpdates());
  const [selectedUpdateIdx, setSelectedUpdateIdx] = useState(0);

  const activePost = allUpdates[selectedUpdateIdx] || allUpdates[0];

  // Comment form states for the active update post (as seen in image.png)
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentWebsite, setCommentWebsite] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Categories row from image.png: Atores, Bandas, Cantores, Especiais, Ficstape, Music Vídeo, Esportes, Heróis
  const categories = [
    { label: 'Atores', icon: Users },
    { label: 'Bandas', icon: Radio },
    { label: 'Cantores', icon: Headphones },
    { label: 'Especiais', icon: Sparkles },
    { label: 'Ficstape', icon: Disc },
    { label: 'Music Vídeo', icon: Film },
    { label: 'Esportes', icon: Trophy },
    { label: 'Heróis', icon: Shield }
  ];

  // Most Read from image.png
  const top10Stories = [
    { rank: 1, title: 'Dancing With The Devil II', author: 'Bella Nottrix', ficId: 'a-melhor-vinganca' },
    { rank: 2, title: 'Um Passo de Cada Vez', author: 'Flávia Coelho', ficId: 'ritmo-do-coracao' },
    { rank: 3, title: 'The Fall', author: 'Soldada', ficId: 'a-herdeira-sombria' },
    { rank: 4, title: '16 Dias', author: 'Triz', ficId: 'a-melhor-vinganca' },
    { rank: 5, title: '1940', author: 'Bianca Ferreira', ficId: 'a-herdeira-sombria' },
    { rank: 6, title: 'Declínios de Uma Adolescente Rica', author: 'Hellem Lima', ficId: 'a-melhor-vinganca' },
    { rank: 7, title: 'Inimigos com Benefícios', author: 'Vivian Darkbloom', ficId: 'a-melhor-vinganca' },
    { rank: 8, title: 'Onde Nascem os Grandes', author: 'Rafa Oliveira', ficId: 'ritmo-do-coracao' },
    { rank: 9, title: 'The Sirens', author: 'Gi Giovannetti', ficId: 'a-herdeira-sombria' },
    { rank: 10, title: 'Whisper Of The Devil', author: 'Joy', ficId: 'a-melhor-vinganca' }
  ];

  const ficstapes = [
    { rank: '06', title: 'Love me Love Me', author: 'Andressa Carter' },
    { rank: '14', title: 'Lolita', author: 'Flowers' },
    { rank: '01', title: 'Runaway', author: 'Luba' },
    { rank: '07', title: 'Corrupted', author: 'Mayara Gondim' },
    { rank: '06', title: 'Aleyuh', author: 'Kels' }
  ];

  const recentComments = [
    {
      user: 'mari 🎀',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60',
      text: 'meu deus, tenho TANTOS sentimentos! A primeira...',
      fic: 'Lumiere - Dancing With The Devil II',
      time: '5 dias atrás'
    },
    {
      user: 'A Di Giovannetti',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=60',
      text: 'Estou ótima agora, muito obrigadaaaa. Fico...',
      fic: 'Lumiere - The Sirens, por Gi Giovannetti',
      time: '1 semana atrás'
    },
    {
      user: 'Vitória de Andrade',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=60',
      text: 'Conheci a história recentemente e estou LOUCA...',
      fic: 'Lumiere - Avallon - The Decision, por Mi',
      time: '2 semanas atrás'
    }
  ];

  const handlePostUpdateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentMessage.trim() || !activePost) return;

    const updated = addCommentToPortalUpdate(activePost.id, {
      authorName: commentName.trim(),
      email: commentEmail.trim(),
      website: commentWebsite.trim(),
      message: commentMessage.trim()
    });

    setAllUpdates(updated);
    setCommentMessage('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 3500);
  };

  const handleFindOrOpenStory = (query: string) => {
    const match = fanfics.find(f =>
      f.title.toLowerCase().includes(query.toLowerCase()) ||
      f.fandom.toLowerCase().includes(query.toLowerCase())
    ) || fanfics[0];
    if (match) onSelectStory(match);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#14171f] font-sans">
      
      {/* 1. TOP CONCERT HERO BANNER (Replica of image.png branded Lumiere.ink) */}
      <div className="relative bg-[#0e1015] w-full overflow-hidden border-b border-[#1c2230]">
        <div className="relative h-48 sm:h-64 md:h-72 w-full">
          <img
            src="/src/assets/images/hero_ffobs_concert_1792284693264.jpg"
            alt="Lumiere.ink Concert Header"
            className="w-full h-full object-cover object-center brightness-90"
          />

          {/* Top text strip inside banner (exact replica from image.png) */}
          <div className="absolute top-0 inset-x-0 p-3 sm:px-6 flex items-center justify-between text-[11px] sm:text-xs text-white font-medium drop-shadow bg-gradient-to-b from-[#0e1015]/90 to-transparent">
            <span className="tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ce5272] animate-pulse" />
              <span>O SEU MAIOR E MELHOR SITE DE FANFICS INTERATIVAS!</span>
            </span>

            <div className="flex items-center gap-3">
              <span className="text-[#b8cee8] font-semibold">@LUMIERE.INK</span>
              <div className="flex items-center gap-1.5 opacity-90">
                <span className="w-5 h-5 rounded-full border border-white/60 hover:border-[#ce5272] hover:text-[#ce5272] flex items-center justify-center text-[10px] cursor-pointer transition-colors">f</span>
                <span className="w-5 h-5 rounded-full border border-white/60 hover:border-[#486da6] hover:text-[#b8cee8] flex items-center justify-center text-[10px] cursor-pointer transition-colors">t</span>
                <span className="w-5 h-5 rounded-full border border-white/60 hover:border-[#ce5272] hover:text-[#ce5272] flex items-center justify-center text-[10px] cursor-pointer transition-colors">in</span>
              </div>
            </div>
          </div>

          {/* Centered Large Stylized Logo (image.png style) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center drop-shadow-2xl">
              <span className="block text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight text-white uppercase drop-shadow-[0_4px_12px_rgba(14,16,21,0.95)]">
                LUMIERE <span className="font-serif italic font-normal text-[#e07a94]">.ink</span>
              </span>
              <div className="inline-flex items-center gap-2 mt-1 px-3 py-0.5 rounded-full bg-[#0e1015]/80 backdrop-blur-xs border border-[#486da6]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ce5272]" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-[#d5e2f3] uppercase">
                  Entre na história. Seja a protagonista.
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#486da6]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR (Exact replica of image.png) */}
      <nav className="bg-white border-b border-[#e2e6ee] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 group shrink-0 text-left cursor-pointer"
          >
            <span className="font-serif font-black text-2xl tracking-tight text-[#0e1015]">
              Lumiere
            </span>
            <span className="font-serif italic text-2xl text-[#ce5272] -ml-1 font-semibold group-hover:text-[#9e2847] transition-colors">
              .ink
            </span>
          </button>

          {/* Nav Links from image.png: INÍCIO, ENVIE SUA FIC ▾, DESTAQUES ▾, COMUNIDADE ▾ */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-wider text-[#2d323f]">
            <button className="text-[#ce5272] border-b-2 border-[#ce5272] pb-0.5 font-bold cursor-pointer">
              INÍCIO
            </button>
            <button onClick={onOpenNewStory} className="hover:text-[#ce5272] transition-colors flex items-center gap-1 cursor-pointer">
              <span>ENVIE SUA FIC</span>
              <span className="text-[10px] text-[#486da6]">▾</span>
            </button>
            <button onClick={onOpenHostingGuide} className="hover:text-[#ce5272] transition-colors flex items-center gap-1 cursor-pointer">
              <span>DESTAQUES</span>
              <span className="text-[10px] text-[#486da6]">▾</span>
            </button>
            <button onClick={onOpenHostingGuide} className="hover:text-[#ce5272] transition-colors flex items-center gap-1 cursor-pointer">
              <span>COMUNIDADE</span>
              <span className="text-[10px] text-[#486da6]">▾</span>
            </button>
            <button onClick={onOpenWordConverter} className="hover:text-[#ce5272] transition-colors flex items-center gap-1 text-[#486da6] cursor-pointer">
              <Sparkles className="w-3.5 h-3.5 text-[#ce5272]" />
              <span>CONVERSOR WORD</span>
            </button>
          </div>

          {/* Social Icons & Actions from image.png */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-[#486da6]">
              <span className="w-6 h-6 rounded-full border border-[#d2dbe8] flex items-center justify-center text-[10px] font-bold hover:text-[#ce5272] hover:border-[#ce5272] cursor-pointer">f</span>
              <span className="w-6 h-6 rounded-full border border-[#d2dbe8] flex items-center justify-center text-[10px] font-bold hover:text-[#ce5272] hover:border-[#ce5272] cursor-pointer">t</span>
              <span className="w-6 h-6 rounded-full border border-[#d2dbe8] flex items-center justify-center text-[10px] font-bold hover:text-[#ce5272] hover:border-[#ce5272] cursor-pointer">in</span>
              <span className="w-6 h-6 rounded-full border border-[#d2dbe8] flex items-center justify-center text-[10px] font-bold hover:text-[#ce5272] hover:border-[#ce5272] cursor-pointer">yt</span>
            </div>

            {/* Administradora Button */}
            <button
              onClick={onOpenAdminPanel}
              className="px-3 py-1.5 text-xs font-bold bg-[#ce5272] hover:bg-[#9e2847] text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Postar nova atualização de fanfics (Área da Administradora)"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Painel Admin</span>
            </button>
          </div>

        </div>
      </nav>

      {/* 3. CATEGORY ICON RIBBON (Exact 8 items from image.png: Atores, Bandas, Cantores, Especiais, Ficstape, Music Vídeo, Esportes, Heróis) */}
      <section className="bg-white border-b border-[#e2e6ee] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
          
          <button
            onClick={() => setCategoryIndex(prev => Math.max(0, prev - 1))}
            className="p-1 text-stone-400 hover:text-[#486da6] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-around flex-1 overflow-x-auto gap-4 sm:gap-6 py-1">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleFindOrOpenStory(cat.label)}
                  className="flex flex-col items-center gap-1.5 group shrink-0 min-w-[64px] cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full border border-[#d2dbe8] bg-[#f8faff] flex items-center justify-center text-[#35527d] group-hover:border-[#ce5272] group-hover:bg-[#fdf0f4] group-hover:text-[#9e2847] transition-all shadow-2xs">
                    <IconComp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[11px] text-[#333a4a] group-hover:text-[#ce5272] font-semibold transition-colors">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCategoryIndex(prev => prev + 1)}
            className="p-1 text-stone-400 hover:text-[#486da6] cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>
      </section>

      {/* 4. SITE MANIFESTO / NEW SITE DESCRIPTION (Requested explicitly by User) */}
      <section className="bg-gradient-to-r from-[#fdf0f4] via-[#ffffff] to-[#eef4fb] border-b border-[#e2e6ee] py-6 sm:py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-black text-[#0e1015] tracking-tight">
              Entre na história. Seja a protagonista.
            </h2>
            <p className="text-sm sm:text-base font-semibold text-[#ce5272]">
              Leia fanfics interativas e transforme cada história na sua.
            </p>
            <p className="text-xs sm:text-sm text-[#2c3342] leading-relaxed font-sans max-w-2xl mx-auto">
              Troque o nome da mocinha pelo seu, escolha o par romântico que mais te faz suspirar e viva o romance do seu jeito.
            </p>
            
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
              <span className="text-[#486da6] font-bold">Quer publicar a sua também?</span>
              <span className="hidden sm:inline text-stone-300">·</span>
              <span className="text-[#14171f]">É só enviar o arquivo do Word. A gente deixa tudo bonito e publica de graça.</span>
            </div>

            <div className="inline-flex items-center gap-2 pt-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#152238] bg-white px-3 py-1 rounded-full border border-[#d2dbe8] shadow-2xs">
                Seu nome. Sua escolha. Sua história.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MAIN CONTENT LAYOUT: UPDATES POST (LEFT) vs SIDEBAR WIDGETS (RIGHT) — EXACTLY AS IN image.png */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Edition selector bar & Admin action */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#dbe2ee] rounded-xl p-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="font-bold text-[#152238] flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-4 h-4 text-[#ce5272]" />
              <span>Edições do Portal:</span>
            </span>

            <div className="flex items-center gap-1.5">
              {allUpdates.map((up, idx) => (
                <button
                  key={up.id}
                  onClick={() => setSelectedUpdateIdx(idx)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedUpdateIdx === idx
                      ? 'bg-[#152238] text-white shadow-2xs'
                      : 'bg-[#f8faff] text-[#486da6] hover:bg-[#eef4fb] border border-[#d2dbe8]'
                  }`}
                >
                  {up.number}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenAdminPanel}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            title="Postar nova edição de atualização de fanfics"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Postar Atualização (Admin)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT MAIN ARTICLE: EXACT REPLICA OF image.png */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Article container */}
            <article className="bg-white border border-[#dbe2ee] rounded-xl p-6 sm:p-10 shadow-xs space-y-6">
              
              {/* Centered Title */}
              <div className="text-center space-y-2 border-b border-[#e2e6ee] pb-6">
                <h1 className="text-3xl sm:text-4xl font-display font-black text-[#0e1015] tracking-tight">
                  {activePost.title}
                </h1>
                <p className="text-xs text-stone-500">
                  Publicado por <strong className="text-[#ce5272] font-bold">{activePost.adminAuthor}</strong> em {activePost.publishedDate}
                </p>
              </div>

              {/* Editorial Opening */}
              <div className="text-sm text-[#2c3342] leading-[1.75] font-sans space-y-3">
                <p>
                  {activePost.editorialText}
                </p>
                {activePost.contactNote && (
                  <p className="text-xs text-[#486da6] font-medium pt-1">
                    {activePost.contactNote}
                  </p>
                )}
              </div>

              {/* Section: Novas */}
              {activePost.newStories && activePost.newStories.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#f0f3f8]">
                  <h2 className="text-sm font-black text-[#0e1015] tracking-wide uppercase font-sans">
                    Novas:
                  </h2>
                  <div className="space-y-2 pl-1 text-xs">
                    {activePost.newStories.map((story) => (
                      <div key={story.id} className="flex items-start gap-1.5 leading-relaxed">
                        <strong className="text-[#0e1015] font-bold">[{story.fandomCategory}]</strong>
                        <button
                          onClick={() => handleFindOrOpenStory(story.title)}
                          className="text-[#486da6] hover:text-[#ce5272] font-bold hover:underline transition-colors text-left cursor-pointer"
                        >
                          {story.title}
                        </button>
                        <span className="text-stone-500 font-sans">by {story.author}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Atualizações */}
              {activePost.updatedStories && activePost.updatedStories.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#f0f3f8]">
                  <h2 className="text-sm font-black text-[#0e1015] tracking-wide uppercase font-sans">
                    Atualizações:
                  </h2>
                  <div className="space-y-2 pl-1 text-xs">
                    {activePost.updatedStories.map((story) => (
                      <div key={story.id} className="flex items-start gap-1.5 leading-relaxed">
                        <strong className="text-[#0e1015] font-bold">[{story.fandomCategory}]</strong>
                        <button
                          onClick={() => handleFindOrOpenStory(story.title)}
                          className="text-[#486da6] hover:text-[#ce5272] font-bold hover:underline transition-colors text-left cursor-pointer"
                        >
                          {story.title}
                        </button>
                        {story.author && <span className="text-stone-500 font-sans">by {story.author}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Recados */}
              {activePost.announcements && activePost.announcements.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#f0f3f8]">
                  <h2 className="text-sm font-black text-[#0e1015] tracking-wide uppercase font-sans">
                    [Recados]
                  </h2>
                  <div className="space-y-2 pl-1 text-xs text-[#2c3342] leading-relaxed">
                    {activePost.announcements.map((recado, i) => (
                      <p key={i} className="font-sans">
                        {recado}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Share Buttons (as in image.png) */}
              <div className="pt-6 border-t border-[#e2e6ee] flex items-center justify-center gap-3">
                <button
                  onClick={() => alert('Link copiado para compartilhar no Twitter!')}
                  className="w-8 h-8 rounded-full border border-[#d2dbe8] flex items-center justify-center text-xs text-[#486da6] hover:bg-[#eef4fb] cursor-pointer transition-colors"
                  title="Compartilhar no Twitter"
                >
                  t
                </button>
                <button
                  onClick={() => alert('Link copiado para compartilhar no Facebook!')}
                  className="w-8 h-8 rounded-full border border-[#d2dbe8] flex items-center justify-center text-xs text-[#486da6] hover:bg-[#eef4fb] cursor-pointer transition-colors"
                  title="Compartilhar no Facebook"
                >
                  f
                </button>
                <button
                  onClick={() => alert('Link copiado para compartilhar no WhatsApp!')}
                  className="w-8 h-8 rounded-full border border-[#d2dbe8] flex items-center justify-center text-xs text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors"
                  title="Compartilhar no WhatsApp"
                >
                  w
                </button>
              </div>

            </article>

            {/* DEIXE SEU COMENTÁRIO SECTION (EXACT REPLICA FROM image.png) */}
            <section className="bg-white border border-[#dbe2ee] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
              
              <div className="border-b-2 border-[#152238] pb-2">
                <h3 className="text-sm font-black text-[#0e1015] uppercase tracking-wider font-sans">
                  DEIXE SEU COMENTÁRIO
                </h3>
              </div>

              {/* Comment Form */}
              <form onSubmit={handlePostUpdateComment} className="space-y-4 text-xs">
                
                {/* Row 1: Nome, Email, Website */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Nome"
                      className="w-full px-3 py-2 bg-white border border-[#d2dbe8] rounded outline-none focus:border-[#ce5272] text-[#0e1015]"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      placeholder="E-mail"
                      className="w-full px-3 py-2 bg-white border border-[#d2dbe8] rounded outline-none focus:border-[#ce5272] text-[#0e1015]"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={commentWebsite}
                      onChange={(e) => setCommentWebsite(e.target.value)}
                      placeholder="Seu site, blog, facebook, etc"
                      className="w-full px-3 py-2 bg-white border border-[#d2dbe8] rounded outline-none focus:border-[#ce5272] text-[#0e1015]"
                    />
                  </div>
                </div>

                {/* Row 2: Sua Mensagem */}
                <div>
                  <textarea
                    rows={4}
                    required
                    value={commentMessage}
                    onChange={(e) => setCommentMessage(e.target.value)}
                    placeholder="Sua Mensagem"
                    className="w-full p-3 bg-white border border-[#d2dbe8] rounded outline-none focus:border-[#ce5272] text-[#0e1015] leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between">
                  {commentSuccess ? (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Comentário publicado nesta edição!
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#152238] hover:bg-[#ce5272] rounded transition-colors shadow-2xs cursor-pointer"
                  >
                    Enviar Comentário
                  </button>
                </div>

              </form>

              {/* Comments Status / List */}
              <div className="pt-4 border-t border-[#f0f3f8]">
                {(!activePost.comments || activePost.comments.length === 0) ? (
                  <p className="text-xs text-stone-500 font-sans italic">
                    Este artigo não possui comentários. Seja a primeira a comentar!
                  </p>
                ) : (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[#152238] block mb-2">
                      Comentários das Leitoras ({activePost.comments.length}):
                    </span>
                    {activePost.comments.map((comm) => (
                      <div key={comm.id} className="p-3.5 bg-[#f8faff] border border-[#d2dbe8] rounded-lg space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <strong className="text-[#0e1015] font-bold">{comm.authorName}</strong>
                          <span className="text-[10px] text-stone-400">{comm.createdAt}</span>
                        </div>
                        <p className="text-[#2c3342] leading-relaxed font-sans">{comm.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </section>

          </main>

          {/* RIGHT SIDEBAR: EXACT REPLICA OF image.png */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* WIDGET 1: MAIS LIDAS (Navy header with star icon as in image.png) */}
            <div className="bg-white border border-[#dbe2ee] rounded-lg overflow-hidden shadow-2xs">
              <div className="bg-[#152238] text-white px-4 py-2.5 flex items-center gap-2">
                <Star className="w-4 h-4 fill-white text-white" />
                <h3 className="text-xs font-bold tracking-wider uppercase">MAIS LIDAS</h3>
              </div>

              <div className="p-3 divide-y divide-[#f0f3f8] text-xs">
                {top10Stories.map((story) => (
                  <div
                    key={story.rank}
                    onClick={() => handleFindOrOpenStory(story.title)}
                    className="py-2 px-1 flex items-center justify-between gap-2 hover:bg-[#fdf6f8] cursor-pointer transition-colors group rounded"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-stone-500 text-xs w-4">
                        {story.rank}.
                      </span>
                      <span className="font-semibold text-stone-800 group-hover:text-[#ce5272] truncate text-xs transition-colors">
                        {story.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0 italic">
                      by {story.author}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 2: FICSTAPES (as in image.png) */}
            <div className="bg-white border border-[#dbe2ee] rounded-lg overflow-hidden shadow-2xs">
              <div className="bg-[#152238] text-white px-4 py-2.5 flex items-center gap-2">
                <Star className="w-4 h-4 fill-white text-white" />
                <h3 className="text-xs font-bold tracking-wider uppercase">FICSTAPES 🎶</h3>
              </div>

              <div className="p-3 divide-y divide-[#f0f3f8] text-xs">
                {ficstapes.map((tape, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleFindOrOpenStory(tape.title)}
                    className="py-2 px-1 flex items-center justify-between gap-2 hover:bg-[#fdf6f8] cursor-pointer transition-colors group rounded"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-stone-500 text-xs w-4">
                        {idx + 1}.
                      </span>
                      <span className="font-semibold text-stone-800 group-hover:text-[#ce5272] truncate text-xs transition-colors">
                        {tape.rank}. {tape.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0 italic">
                      por {tape.author}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 3: COMENTÁRIOS (as in image.png) */}
            <div className="bg-white border border-[#dbe2ee] rounded-lg overflow-hidden shadow-2xs">
              <div className="bg-[#152238] text-white px-4 py-2.5 flex items-center gap-2">
                <Star className="w-4 h-4 fill-white text-white" />
                <h3 className="text-xs font-bold tracking-wider uppercase">COMENTÁRIOS</h3>
              </div>

              <div className="p-3 divide-y divide-[#f0f3f8] text-xs space-y-2">
                {recentComments.map((comm, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleFindOrOpenStory('A Melhor Vingança')}
                    className="pt-2 pb-1 flex items-start gap-2.5 hover:bg-[#fdf6f8] cursor-pointer rounded p-1 transition-colors"
                  >
                    <img
                      src={comm.avatar}
                      alt={comm.user}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#eca8b8]"
                    />
                    <div className="min-w-0 text-[11px] leading-tight">
                      <div className="flex items-center gap-1">
                        <strong className="text-[#0e1015]">{comm.user}</strong>
                      </div>
                      <p className="text-stone-600 line-clamp-1 mt-0.5 font-book">
                        "{comm.text}"
                      </p>
                      <span className="text-[10px] text-[#486da6] block mt-0.5 truncate">
                        {comm.fic} · {comm.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 4: ENCONTRE AQUI (as in image.png) */}
            <div className="bg-white border border-[#dbe2ee] rounded-lg overflow-hidden shadow-2xs">
              <div className="bg-[#152238] text-white px-4 py-2.5 flex items-center gap-2">
                <Star className="w-4 h-4 fill-white text-white" />
                <h3 className="text-xs font-bold tracking-wider uppercase">ENCONTRE AQUI</h3>
              </div>

              <div className="p-4 text-xs">
                <label className="block text-stone-600 mb-2 font-medium">
                  Utilize o campo abaixo para encontrar sua fanfic:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite sua fanfic..."
                    className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-[#dbe2ee] rounded outline-none focus:border-[#ce5272] text-[#0e1015]"
                  />
                  <button
                    onClick={() => {
                      if (searchQuery.trim()) {
                        handleFindOrOpenStory(searchQuery.trim());
                      }
                    }}
                    className="px-3.5 py-1.5 bg-[#152238] hover:bg-[#ce5272] text-white text-xs font-bold rounded transition-colors shadow-2xs cursor-pointer"
                  >
                    Pesquisar
                  </button>
                </div>
              </div>
            </div>

            {/* WIDGET 5: STATUS (as in image.png) */}
            <div className="bg-white border border-[#dbe2ee] rounded-lg overflow-hidden shadow-2xs">
              <div className="bg-[#152238] text-white px-4 py-2.5 flex items-center gap-2">
                <Star className="w-4 h-4 fill-white text-white" />
                <h3 className="text-xs font-bold tracking-wider uppercase">STATUS</h3>
              </div>

              <div className="p-4 text-xs space-y-1.5 text-stone-600 leading-relaxed font-sans">
                <div><strong>No ar desde:</strong> 05/12/2009</div>
                <div><strong>URL:</strong> www.lumiere.ink</div>
                <div><strong>Nome:</strong> Lumiere.ink</div>
                <div className="flex items-center gap-1.5">
                  <strong>Online:</strong>
                  <span className="bg-[#486da6] text-white font-bold text-[10px] px-2 py-0.5 rounded">
                    ● 2 Online
                  </span>
                </div>
                <div><strong>Visitas:</strong> 59.349.142</div>
                <div><strong>Contato:</strong> contato@lumiere.ink</div>
                <div className="pt-1.5 border-t border-stone-100 text-stone-500">
                  Você já nos visitou: <strong className="text-[#ce5272]">9 vezes</strong>.
                </div>
              </div>
            </div>

          </aside>

        </div>

      </div>

      {/* 6. FOOTER (Exact replica of bottom of image.png branded Lumiere.ink) */}
      <footer className="border-t border-[#e2e6ee] bg-white py-10 text-center text-xs text-stone-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-3">
          
          {/* Logo in footer */}
          <div className="flex items-center gap-1 text-[#0e1015]">
            <span className="font-serif font-black text-2xl tracking-tight">Lumiere</span>
            <span className="font-serif italic text-2xl text-[#ce5272] -ml-1 font-semibold">.ink</span>
          </div>

          <p className="text-[11px] text-stone-400">
            2026 © TODOS OS DIREITOS RESERVADOS | INOVALIZE · LUMIERE.INK
          </p>

          <div className="flex items-center gap-3 text-stone-600 mt-1">
            <span className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center text-xs font-bold hover:bg-[#fdf0f4] hover:text-[#ce5272] hover:border-[#ce5272] cursor-pointer transition-colors">f</span>
            <span className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center text-xs font-bold hover:bg-[#eef4fb] hover:text-[#486da6] hover:border-[#486da6] cursor-pointer transition-colors">t</span>
            <span className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center text-xs font-bold hover:bg-[#fdf0f4] hover:text-[#ce5272] hover:border-[#ce5272] cursor-pointer transition-colors">in</span>
            <span className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center text-xs font-bold hover:bg-[#eef4fb] hover:text-[#486da6] hover:border-[#486da6] cursor-pointer transition-colors">yt</span>
          </div>

        </div>
      </footer>

    </div>
  );
};
