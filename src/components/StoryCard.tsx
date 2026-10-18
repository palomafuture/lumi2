import React, { useState } from 'react';
import { Fanfic } from '../types/fanfic';
import { BookOpen, Download, Heart, MessageSquare, Edit3, Trash2, Eye } from 'lucide-react';
import { triggerFileDownload, generateStandaloneHtml } from '../utils/interactiveEngine';

interface StoryCardProps {
  fanfic: Fanfic;
  onRead: (fanfic: Fanfic) => void;
  onEdit?: (fanfic: Fanfic) => void;
  onDelete?: (id: string) => void;
  onToggleLike?: (id: string) => void;
  isLiked?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  fanfic,
  onRead,
  onEdit,
  onDelete,
  onToggleLike,
  isLiked = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const totalChapters = fanfic.chapters?.length || 0;
  const totalComments = fanfic.comments?.length || 0;

  const handleExportHtml = (e: React.MouseEvent) => {
    e.stopPropagation();
    const html = generateStandaloneHtml(fanfic);
    const safeSlug = fanfic.slug || fanfic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    triggerFileDownload(html, `${safeSlug}.html`, 'text/html');
  };

  return (
    <article className="group bg-white border border-[#dbe2ee] hover:border-[#ce5272] rounded-xl overflow-hidden flex flex-col transition-all hover:shadow-md">
      
      {/* Visual cover presentation */}
      <div className="relative aspect-[3/4] w-full bg-[#f0f4fa] overflow-hidden cursor-pointer" onClick={() => onRead(fanfic)}>
        {!imgError && fanfic.coverImage ? (
          <img
            src={fanfic.coverImage}
            alt={`Capa da fanfic ${fanfic.title}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#f8faff] to-[#eef4fb] text-[#152238] text-center">
            <BookOpen className="w-10 h-10 mb-2 text-[#486da6]" />
            <span className="font-display font-bold text-base line-clamp-2">{fanfic.title}</span>
            <span className="text-xs text-stone-500 mt-1">Por {fanfic.author}</span>
          </div>
        )}

        {/* Rating and status overlay with subtle measured scrim */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[11px] font-bold text-white drop-shadow">
          <span className="bg-[#0e1015]/85 backdrop-blur-xs px-2 py-0.5 rounded text-white">{fanfic.rating}</span>
          <span className="bg-[#152238]/85 backdrop-blur-xs px-2 py-0.5 rounded text-[#b8cee8]">{fanfic.status}</span>
        </div>

        {fanfic.isCustom && (
          <div className="absolute top-2 right-2 bg-[#ce5272] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
            Minha História
          </div>
        )}
      </div>

      {/* Card Content (Zero-Pill Discipline) */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata line with typographic separators */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 truncate">
            <span className="font-semibold text-[#486da6]">{fanfic.fandom}</span>
            <span aria-hidden="true">·</span>
            <span>{totalChapters} {totalChapters === 1 ? 'capítulo' : 'capítulos'}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-stone-400" />
              <span>{fanfic.views?.toLocaleString('pt-BR') || 0}</span>
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onRead(fanfic)}
            className="text-lg font-display font-bold text-[#0e1015] group-hover:text-[#ce5272] transition-colors line-clamp-1 cursor-pointer"
          >
            {fanfic.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-stone-600 mb-2">
            Por <span className="font-semibold text-[#14171f]">{fanfic.author}</span>
          </p>

          {/* Summary */}
          <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-3 font-book">
            {fanfic.summary}
          </p>

          {/* Interactive variables list (unboxed clean text) */}
          {fanfic.variables && fanfic.variables.length > 0 && (
            <div className="pt-2 border-t border-[#f0f3f8] text-[11px] text-stone-500 mb-3">
              <span className="font-bold text-[#486da6]">Tags interativas: </span>
              <span className="text-[#9e2847] font-medium">
                {fanfic.variables.slice(0, 4).map(v => `[${v.key}]`).join(', ')}
                {fanfic.variables.length > 4 ? ` e mais +${fanfic.variables.length - 4}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-[#f0f3f8] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRead(fanfic)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#152238] rounded-lg hover:bg-[#ce5272] transition-colors cursor-pointer shadow-xs"
            >
              Ler & Personalizar
            </button>

            <button
              onClick={handleExportHtml}
              title="Baixar arquivo HTML independente para hospedagem estática"
              className="p-1.5 text-stone-500 hover:text-[#ce5272] hover:bg-[#fdf0f4] rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-stone-500 text-xs">
            {onToggleLike && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike(fanfic.id);
                }}
                className={`flex items-center gap-1 hover:text-[#ce5272] transition-colors cursor-pointer ${
                  isLiked ? 'text-[#ce5272] font-semibold' : ''
                }`}
                title="Curtir fanfic"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#ce5272] text-[#ce5272]' : ''}`} />
                <span>{fanfic.likes || 0}</span>
              </button>
            )}

            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#486da6]" />
              <span>{totalComments}</span>
            </span>

            {fanfic.isCustom && (
              <div className="flex items-center gap-1 ml-1 pl-1 border-l border-stone-200">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(fanfic);
                    }}
                    title="Editar história"
                    className="p-1 text-stone-500 hover:text-[#486da6] rounded cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Deseja excluir "${fanfic.title}"?`)) {
                        onDelete(fanfic.id);
                      }
                    }}
                    title="Excluir história"
                    className="p-1 text-stone-400 hover:text-[#ce5272] rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </article>
  );
};
