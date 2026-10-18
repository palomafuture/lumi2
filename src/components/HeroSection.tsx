import React, { useState } from 'react';
import { Sparkles, Feather, BookOpen, Download, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onExplore: () => void;
  onNewStory: () => void;
  onOpenGuide: () => void;
  onOpenConverter: () => void;
  featuredStoryTitle: string;
  onReadFeatured: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplore,
  onNewStory,
  onOpenGuide,
  onOpenConverter,
  featuredStoryTitle,
  onReadFeatured,
}) => {
  const [testName, setTestName] = useState('Helena');
  const [testCrush, setTestCrush] = useState('Gabriel');

  return (
    <section className="relative border-b border-[#e2e6ee] bg-[#f8faff] overflow-hidden">
      {/* Background with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_obsessao_reading_1792282796847.jpg"
          alt="Caderno literário com anotações e luz suave"
          className="w-full h-full object-cover object-center opacity-20 filter blur-[1px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f8faff] via-[#f8faff]/95 to-[#f8faff]/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Main Editorial Hero Text */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#ce5272] uppercase mb-3">
              <span>Lumiere.ink</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#486da6]">Portal de Histórias Interativas em HTML</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#0e1015] tracking-tight leading-[1.15] mb-5 text-balance">
              Onde você é a protagonista da sua própria história de amor e aventura.
            </h1>

            <p className="text-base sm:text-lg text-[#2c3342] leading-relaxed max-w-2xl mb-8">
              Leia e publique fanfics em HTML com personalização total. Troque o nome da mocinha pelo seu, escolha o par romântico que quiser e use nosso <strong>conversor de Word (.docx)</strong> para publicar com <strong>hospedagem estática gratuita</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#ce5272] rounded-lg hover:bg-[#9e2847] transition-colors shadow-xs cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explorar Fanfics</span>
              </button>

              <button
                onClick={onOpenConverter}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#152238] bg-white border border-[#d2dbe8] rounded-lg hover:bg-[#f0f4fa] transition-colors cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-[#ce5272]" />
                <span>Importar do Word (.docx)</span>
              </button>

              <button
                onClick={onNewStory}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#486da6] hover:text-[#152238] transition-colors cursor-pointer"
              >
                <Feather className="w-4 h-4" />
                <span>Escrever do Zero</span>
              </button>
            </div>
          </div>

          {/* Interactive Live Demo Box (Lumiere.ink Interactive Sample) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#dbe2ee] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e2e6ee]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ce5272]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0e1015]">
                    Teste a Interatividade ao Vivo
                  </span>
                </div>
                <span className="text-xs text-[#486da6] font-mono font-bold">tag: [NOME] / [PAR]</span>
              </div>

              <p className="text-xs text-[#2c3342] mb-3">
                Digite seu nome e o do seu par romântico para ver a mágica da história acontecer:
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#486da6] mb-1">
                    Seu Nome ([NOME])
                  </label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#f8faff] border border-[#d2dbe8] rounded-lg focus:border-[#ce5272] focus:bg-white outline-none transition-colors text-[#0e1015] font-medium"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#486da6] mb-1">
                    Seu Par ([PAR])
                  </label>
                  <input
                    type="text"
                    value={testCrush}
                    onChange={(e) => setTestCrush(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#f8faff] border border-[#d2dbe8] rounded-lg focus:border-[#ce5272] focus:bg-white outline-none transition-colors text-[#0e1015] font-medium"
                    placeholder="Nome do crush"
                  />
                </div>
              </div>

              {/* Dynamic Reading Snippet */}
              <div className="p-3.5 bg-[#f8faff] border border-[#d2dbe8] rounded-lg text-xs leading-relaxed font-book text-[#14171f]">
                <span className="text-[#486da6] italic block mb-1 text-[11px] font-bold">
                  Trecho de <strong>{featuredStoryTitle}</strong>:
                </span>
                <p>
                  — Quem disse que eu estou fingindo agora? — sussurrou{' '}
                  <span className="interactive-highlight">{testCrush || 'ele'}</span> com a voz rouca,
                  olhando nos olhos de{' '}
                  <span className="interactive-highlight">{testName || 'ela'}</span> enquanto a puxava pela cintura no meio do salão.
                </p>
              </div>

              <div className="mt-3.5 pt-3 border-t border-[#e2e6ee] flex items-center justify-between text-xs">
                <span className="text-stone-500 text-[11px]">Gostou? Leia a história inteira:</span>
                <button
                  onClick={onReadFeatured}
                  className="text-[#ce5272] font-bold hover:text-[#9e2847] flex items-center gap-1 text-xs cursor-pointer"
                >
                  <span>Ler {featuredStoryTitle}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Operational Utility Ribbon / Benefits */}
        <div className="mt-10 pt-6 border-t border-[#dbe2ee] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#2c3342]">
          <div>
            <span className="block font-bold text-[#0e1015]">Interatividade Clássica</span>
            <span className="text-[#486da6]">Substituição dinâmica de tags em HTML</span>
          </div>
          <div>
            <span className="block font-bold text-[#0e1015]">Hospedagem Estática 0800</span>
            <span className="text-[#486da6]">GitHub Pages, Netlify & Vercel sem custo</span>
          </div>
          <div>
            <span className="block font-bold text-[#0e1015]">Arquivo HTML Independente</span>
            <span className="text-[#486da6]">Exporte qualquer fanfic em arquivo único</span>
          </div>
          <div>
            <span className="block font-bold text-[#0e1015]">Pantone Oficial</span>
            <span className="text-[#ce5272] font-semibold">Rose Quartz & Serenity</span>
          </div>
        </div>

      </div>
    </section>
  );
};
