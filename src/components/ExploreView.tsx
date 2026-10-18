import React, { useState, useMemo } from 'react';
import { Fanfic } from '../types/fanfic';
import { StoryCard } from './StoryCard';
import { Search, SlidersHorizontal, BookOpen, Plus } from 'lucide-react';

interface ExploreViewProps {
  fanfics: Fanfic[];
  onRead: (fanfic: Fanfic) => void;
  onEdit: (fanfic: Fanfic) => void;
  onDelete: (id: string) => void;
  onToggleLike: (id: string) => void;
  onNewStory: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  fanfics,
  onRead,
  onEdit,
  onDelete,
  onToggleLike,
  onNewStory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFandom, setSelectedFandom] = useState<string>('Todos');
  const [selectedRating, setSelectedRating] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'recent'>('views');

  // Extract distinct fandoms
  const availableFandoms = useMemo(() => {
    const list = new Set<string>();
    fanfics.forEach(f => {
      if (f.fandom) list.add(f.fandom.split('/')[0].trim());
    });
    return ['Todos', ...Array.from(list)];
  }, [fanfics]);

  // Filter and sort
  const filteredFanfics = useMemo(() => {
    return fanfics
      .filter((fic) => {
        const matchesQuery =
          fic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fic.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fic.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fic.fandom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fic.genres?.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesQuery) return false;

        if (selectedFandom !== 'Todos') {
          if (!fic.fandom.toLowerCase().includes(selectedFandom.toLowerCase())) return false;
        }

        if (selectedRating !== 'Todos' && fic.rating !== selectedRating) {
          return false;
        }

        if (selectedStatus !== 'Todos' && fic.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
        if (sortBy === 'recent') return (b.updatedAt || '').localeCompare(a.updatedAt || '');
        return (b.views || 0) - (a.views || 0);
      });
  }, [fanfics, searchQuery, selectedFandom, selectedRating, selectedStatus, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Title & Search Bar */}
      <div className="border-b border-[#e2e6ee] pb-6 mb-8">
        <span className="text-xs font-bold tracking-wider text-[#ce5272] uppercase">
          Catálogo Interativo · Lumiere.ink
        </span>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0e1015] mt-1">
          Explore Todas as Fanfics Interativas
        </h2>
        <p className="text-sm text-[#2c3342] mt-1 max-w-2xl">
          Filtre por fandom, classificação indicativa ou ordem de popularidade. Cada história possui formulário para personalizar os personagens.
        </p>

        {/* Search & Sort Row */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#486da6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, autor, par romântico..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-[#d2dbe8] rounded-lg focus:border-[#ce5272] focus:outline-none transition-colors text-[#0e1015]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-semibold">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs bg-white border border-[#d2dbe8] rounded-lg font-semibold text-[#152238] outline-none focus:border-[#ce5272]"
            >
              <option value="views">Mais Lidas</option>
              <option value="likes">Mais Curtidas</option>
              <option value="recent">Atualizadas Recentemente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Segmented Filter Buttons */}
      <div className="space-y-3 mb-8">
        {/* Fandom filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-[#486da6] mr-1 shrink-0">Fandom:</span>
          {availableFandoms.map((fandom) => (
            <button
              key={fandom}
              onClick={() => setSelectedFandom(fandom)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedFandom === fandom
                  ? 'bg-[#152238] text-white shadow-xs'
                  : 'bg-white border border-[#d2dbe8] text-[#2c3342] hover:border-[#ce5272] hover:text-[#ce5272]'
              }`}
            >
              {fandom}
            </button>
          ))}
        </div>

        {/* Rating & Status filters */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#486da6]">Classificação:</span>
            {['Todos', 'Livre', '+14', '+16', '+18'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRating(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  selectedRating === r
                    ? 'bg-[#ce5272] text-white shadow-2xs'
                    : 'bg-[#f0f4fa] text-[#27426e] hover:bg-[#e2ecf8]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#486da6]">Status:</span>
            {['Todos', 'Concluída', 'Em Andamento'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  selectedStatus === s
                    ? 'bg-[#152238] text-white'
                    : 'bg-[#f0f4fa] text-[#27426e] hover:bg-[#e2ecf8]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {(selectedFandom !== 'Todos' || selectedRating !== 'Todos' || selectedStatus !== 'Todos' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedFandom('Todos');
                setSelectedRating('Todos');
                setSelectedStatus('Todos');
                setSearchQuery('');
              }}
              className="text-xs text-[#ce5272] hover:text-[#9e2847] font-bold underline underline-offset-2 ml-auto cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid of Fanfics */}
      {filteredFanfics.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#dbe2ee] rounded-xl p-8">
          <BookOpen className="w-10 h-10 text-[#b8cee8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0e1015]">
            Nenhuma história encontrada com estes critérios
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Você pode ajustar os filtros acima ou ser a primeira a postar uma fanfic nesta categoria!
          </p>
          <button
            onClick={onNewStory}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Postar Minha Fanfic Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredFanfics.map((fic) => (
            <StoryCard
              key={fic.id}
              fanfic={fic}
              onRead={onRead}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      )}

    </div>
  );
};
