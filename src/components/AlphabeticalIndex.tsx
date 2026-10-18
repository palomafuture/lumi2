import React, { useState, useMemo } from 'react';
import { Fanfic } from '../types/fanfic';
import { BookOpen, Search, ArrowRight, Download } from 'lucide-react';
import { generateStandaloneHtml, triggerFileDownload } from '../utils/interactiveEngine';

interface AlphabeticalIndexProps {
  fanfics: Fanfic[];
  onSelectStory: (fanfic: Fanfic) => void;
}

const ALPHABET = ['Todos', '0-9', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

export const AlphabeticalIndex: React.FC<AlphabeticalIndexProps> = ({
  fanfics,
  onSelectStory,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Group stories by first letter
  const filteredStories = useMemo(() => {
    return fanfics.filter(fic => {
      const matchSearch =
        fic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fic.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fic.fandom.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (selectedLetter === 'Todos') return true;

      const firstChar = fic.title.trim()[0].toUpperCase();
      if (selectedLetter === '0-9') {
        return /[0-9]/.test(firstChar);
      }
      return firstChar === selectedLetter;
    });
  }, [fanfics, selectedLetter, searchQuery]);

  // Counts per letter
  const countsPerLetter = useMemo(() => {
    const counts: Record<string, number> = { Todos: fanfics.length, '0-9': 0 };
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => { counts[l] = 0; });

    fanfics.forEach(fic => {
      const firstChar = fic.title.trim()[0].toUpperCase();
      if (/[0-9]/.test(firstChar)) {
        counts['0-9'] = (counts['0-9'] || 0) + 1;
      } else if (counts[firstChar] !== undefined) {
        counts[firstChar] = (counts[firstChar] || 0) + 1;
      }
    });

    return counts;
  }, [fanfics]);

  const handleDownload = (e: React.MouseEvent, fic: Fanfic) => {
    e.stopPropagation();
    const html = generateStandaloneHtml(fic);
    triggerFileDownload(html, `${fic.slug}.html`, 'text/html');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Editorial Header */}
      <div className="border-b border-[#e2e6ee] pb-6 mb-8">
        <span className="text-xs font-bold tracking-wider text-[#ce5272] uppercase">
          Arquivo e Catálogo Geral · Lumiere.ink
        </span>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0e1015] mt-1">
          Índice Alfabético de Fanfics (A - Z)
        </h2>
        <p className="text-sm text-[#2c3342] mt-1 max-w-2xl">
          Navegue pela coleção de histórias interativas por letra inicial em todo o acervo do Lumiere.ink.
        </p>

        {/* Search Bar */}
        <div className="mt-5 max-w-md relative">
          <Search className="w-4 h-4 text-[#486da6] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, autor ou fandom..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-[#d2dbe8] rounded-lg focus:border-[#ce5272] focus:outline-none transition-colors text-[#0e1015]"
          />
        </div>
      </div>

      {/* Alphabetical Bar (Segmented Controls) */}
      <div className="flex flex-wrap gap-1.5 p-2 bg-[#f8faff] rounded-xl border border-[#d2dbe8] mb-8">
        {ALPHABET.map((char) => {
          const count = countsPerLetter[char] || 0;
          const isActive = selectedLetter === char;
          const hasStories = count > 0;

          return (
            <button
              key={char}
              onClick={() => setSelectedLetter(char)}
              disabled={!hasStories && char !== 'Todos'}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                isActive
                  ? 'bg-[#152238] text-white shadow-xs'
                  : hasStories
                  ? 'bg-white text-[#2c3342] hover:text-[#ce5272] hover:border-[#ce5272] border border-[#dbe2ee]'
                  : 'bg-transparent text-stone-300 opacity-40 cursor-not-allowed'
              }`}
            >
              <span>{char}</span>
              {count > 0 && char !== 'Todos' && (
                <span className={`text-[10px] ${isActive ? 'text-[#b8cee8]' : 'text-[#486da6]'}`}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stories Listing */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#dbe2ee] rounded-xl p-8">
          <BookOpen className="w-10 h-10 text-[#b8cee8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0e1015]">
            Nenhuma história encontrada com a letra "{selectedLetter}"
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Tente selecionar outra letra ou digite um termo diferente na barra de busca.
          </p>
          <button
            onClick={() => { setSelectedLetter('Todos'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 text-xs font-bold text-[#152238] bg-[#eef4fb] hover:bg-[#dce9f8] rounded-lg transition-colors cursor-pointer"
          >
            Ver Todas as Histórias
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStories.map((fic) => (
            <div
              key={fic.id}
              onClick={() => onSelectStory(fic)}
              className="group bg-white border border-[#dbe2ee] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#ce5272] hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Mini cover thumbnail */}
                <div className="w-12 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0 hidden sm:block border border-[#eca8b8]">
                  <img
                    src={fic.coverImage}
                    alt={fic.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <span className="font-bold text-[#486da6]">{fic.fandom}</span>
                    <span aria-hidden="true">·</span>
                    <span className="bg-[#f0f4fa] px-1.5 py-0.2 rounded text-[11px] font-semibold text-[#152238]">{fic.rating}</span>
                    <span aria-hidden="true">·</span>
                    <span>{fic.status}</span>
                    <span aria-hidden="true">·</span>
                    <span>{fic.chapters?.length || 0} caps</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-display font-bold text-[#0e1015] group-hover:text-[#ce5272] transition-colors">
                    {fic.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-1 mt-0.5 font-book">
                    {fic.summary}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-2">
                    <span>Autor: <strong className="text-[#0e1015]">{fic.author}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#9e2847] font-medium">Tags: {fic.variables?.map(v => `[${v.key}]`).slice(0, 3).join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <button
                  onClick={(e) => handleDownload(e, fic)}
                  title="Exportar HTML estático independente"
                  className="p-2 text-stone-500 hover:text-[#ce5272] hover:bg-[#fdf0f4] rounded-lg border border-[#dbe2ee] transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectStory(fic)}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#152238] group-hover:bg-[#ce5272] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Ler História</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
