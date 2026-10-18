import React from 'react';
import { BookOpen, Feather, Globe, Sparkles, Shield, Megaphone } from 'lucide-react';

export type NavigationTab = 'home' | 'explore' | 'index' | 'new-story' | 'hosting-guide' | 'converter' | 'admin-updates';

interface TopNavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenNewStory: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewStory
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e2e6ee] shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 py-3">
        
        {/* Zone 1: Brand wordmark in Rose Quartz, Noir & Serenity */}
        <button
          onClick={() => onSelectTab('home')}
          className="text-xl font-bold tracking-tight text-[#0e1015] font-display hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 text-left flex items-center gap-1.5 cursor-pointer"
        >
          <span className="text-[#ce5272] font-serif italic text-2xl font-black leading-none">L.</span>
          <span className="font-display font-extrabold text-[#0e1015]">Lumiere</span>
          <span className="font-mono text-sm font-bold text-[#486da6]">.ink</span>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-[#2c3342] tracking-wide">
          <button
            onClick={() => onSelectTab('home')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#ce5272] pb-0.5 cursor-pointer ${
              currentTab === 'home' ? 'text-[#ce5272] border-b-2 border-[#ce5272]' : ''
            }`}
          >
            Início
          </button>

          <button
            onClick={() => onSelectTab('explore')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#ce5272] pb-0.5 cursor-pointer ${
              currentTab === 'explore' ? 'text-[#ce5272] border-b-2 border-[#ce5272]' : ''
            }`}
          >
            Explorar Fanfics
          </button>

          <button
            onClick={() => onSelectTab('index')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#ce5272] pb-0.5 cursor-pointer ${
              currentTab === 'index' ? 'text-[#ce5272] border-b-2 border-[#ce5272]' : ''
            }`}
          >
            Arquivo A-Z
          </button>

          <button
            onClick={() => onSelectTab('converter')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#ce5272] pb-0.5 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'converter' ? 'text-[#ce5272] border-b-2 border-[#ce5272]' : 'text-[#486da6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ce5272]" />
            <span>Conversor Word</span>
          </button>

          <button
            onClick={() => onSelectTab('hosting-guide')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#ce5272] pb-0.5 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'hosting-guide' ? 'text-[#ce5272] border-b-2 border-[#ce5272]' : ''
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#486da6]" />
            <span>Hospedagem Estática</span>
          </button>

          <button
            onClick={() => onSelectTab('admin-updates')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#ce5272] pb-0.5 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'admin-updates' ? 'text-[#ce5272] border-b-2 border-[#ce5272]' : 'text-stone-600'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-[#ce5272]" />
            <span>Postar Atualização</span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onSelectTab('admin-updates')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              currentTab === 'admin-updates'
                ? 'bg-[#fdf0f4] text-[#9e2847] border-[#f5ccd7]'
                : 'bg-white text-[#27426e] border-[#b8cee8] hover:bg-[#eef4fb]'
            }`}
            title="Área da Administradora para postar novas atualizações"
          >
            <Shield className="w-3.5 h-3.5 text-[#ce5272]" />
            <span>Painel Admin</span>
          </button>

          <button
            onClick={onOpenNewStory}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-[#ce5272] rounded-lg hover:bg-[#9e2847] transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Escrever Fanfic</span>
          </button>
        </div>

      </div>

      {/* Mobile nav rail */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-t border-[#e2e6ee] overflow-x-auto text-xs text-[#2c3342] font-semibold bg-[#f8faff]">
        <button
          onClick={() => onSelectTab('home')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'home' ? 'bg-[#ce5272] text-white' : ''}`}
        >
          Início
        </button>
        <button
          onClick={() => onSelectTab('explore')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'explore' ? 'bg-[#ce5272] text-white' : ''}`}
        >
          Explorar
        </button>
        <button
          onClick={() => onSelectTab('index')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'index' ? 'bg-[#ce5272] text-white' : ''}`}
        >
          A-Z
        </button>
        <button
          onClick={() => onSelectTab('converter')}
          className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${currentTab === 'converter' ? 'bg-[#ce5272] text-white' : 'text-[#486da6]'}`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Word</span>
        </button>
        <button
          onClick={() => onSelectTab('hosting-guide')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'hosting-guide' ? 'bg-[#ce5272] text-white' : ''}`}
        >
          Hospedagem
        </button>
        <button
          onClick={() => onSelectTab('admin-updates')}
          className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${currentTab === 'admin-updates' ? 'bg-[#ce5272] text-white' : 'text-[#9e2847]'}`}
        >
          <Shield className="w-3 h-3" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};
