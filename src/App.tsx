import React, { useState, useEffect } from 'react';
import { HeaderBannerConfig, Fanfic } from './types/fanfic';
import { getStoredFanfics, saveSingleFanfic, deleteFanfic } from './utils/storage';
import { TopNavigation, NavigationTab } from './components/TopNavigation';
import { HomePortalView } from './components/HomePortalView';
import { ClassicStoryReaderView } from './components/ClassicStoryReaderView';
import { ExploreView } from './components/ExploreView';
import { AlphabeticalIndex } from './components/AlphabeticalIndex';
import { StoryEditorModal } from './components/StoryEditorModal';
import { StaticHostingGuide } from './components/StaticHostingGuide';
import { WordToHtmlConverter } from './components/WordToHtmlConverter';
import { PromotionalHeaderBanner } from './components/PromotionalHeaderBanner';
import { AdminUpdatesView } from './components/AdminUpdatesView';

const DEFAULT_HEADER_BANNER: HeaderBannerConfig = {
  id: 'banner-1',
  isActive: true,
  type: 'featured_fanfic',
  title: 'A Melhor Vingança',
  subtitle: 'Romance enemies-to-lovers com personalização total de personagens.',
  badge: 'Destaque Lumiere',
  ctaText: 'Ler Fanfic Interativa',
  fanficId: 'a-melhor-vinganca',
  advertiserName: 'Lumiere.ink Editorial'
};

export default function App() {
  const [fanfics, setFanfics] = useState<Fanfic[]>([]);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [activeReadingFanfic, setActiveReadingFanfic] = useState<Fanfic | null>(null);
  const [editingFanfic, setEditingFanfic] = useState<Fanfic | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [headerBanner, setHeaderBanner] = useState<HeaderBannerConfig>(() => {
    try {
      const saved = localStorage.getItem('lumiere_header_banner');
      return saved ? JSON.parse(saved) : DEFAULT_HEADER_BANNER;
    } catch {
      return DEFAULT_HEADER_BANNER;
    }
  });

  const handleUpdateHeaderBanner = (newConfig: HeaderBannerConfig) => {
    setHeaderBanner(newConfig);
    localStorage.setItem('lumiere_header_banner', JSON.stringify(newConfig));
  };

  // Load fanfics from storage on mount
  useEffect(() => {
    const loaded = getStoredFanfics();
    setFanfics(loaded);
  }, []);

  const handleSaveFanfic = (fanfic: Fanfic) => {
    const updated = saveSingleFanfic(fanfic);
    setFanfics(updated);
    setIsEditorOpen(false);
    setEditingFanfic(null);
  };

  const handleDeleteFanfic = (id: string) => {
    const updated = deleteFanfic(id);
    setFanfics(updated);
  };

  const handleSendFromConverterToEditor = (initialData: Partial<Fanfic>) => {
    const newFanfic: Fanfic = {
      id: `fic-${Date.now()}`,
      slug: (initialData.title || 'nova-historia').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: initialData.title || 'História Importada do Word',
      author: initialData.author || 'Autora',
      summary: initialData.summary || 'História interativa importada e convertida do Microsoft Word.',
      fandom: initialData.fandom || 'Originais',
      genres: ['Romance', 'Drama'],
      rating: '+14',
      status: 'Em Andamento',
      coverImage: initialData.coverImage || '/src/assets/images/cover_a_melhor_vinganca_1792282797969.jpg',
      variables: initialData.variables || [
        { key: 'NOME', label: 'Seu Nome', defaultValue: 'Beatriz', placeholder: 'Seu nome' },
        { key: 'PAR', label: 'Seu Par', defaultValue: 'Rodrigo', placeholder: 'Seu crush' }
      ],
      chapters: initialData.chapters || [],
      views: 1,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isCustom: true
    };

    setEditingFanfic(newFanfic);
    setIsEditorOpen(true);
  };

  // If a user is actively reading a fanfic, render the full ClassicStoryReaderView
  if (activeReadingFanfic) {
    return (
      <div className="min-h-screen bg-white text-[#14171f] font-sans">
        <PromotionalHeaderBanner
          config={headerBanner}
          fanfics={fanfics}
          onUpdateConfig={handleUpdateHeaderBanner}
          onSelectStory={(f) => setActiveReadingFanfic(f)}
        />
        <ClassicStoryReaderView
          fanfic={activeReadingFanfic}
          onBackToHome={() => setActiveReadingFanfic(null)}
          onUpdateFanfic={(updated) => {
            saveSingleFanfic(updated);
            setFanfics(prev => prev.map(f => f.id === updated.id ? updated : f));
            setActiveReadingFanfic(updated);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#14171f] flex flex-col font-sans">
      
      {/* Top Promotional / Advertiser Banner */}
      <PromotionalHeaderBanner
        config={headerBanner}
        fanfics={fanfics}
        onUpdateConfig={handleUpdateHeaderBanner}
        onSelectStory={(f) => setActiveReadingFanfic(f)}
      />

      {/* Main Navigation (Rose Quartz, Serenity & Noir) */}
      <TopNavigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'new-story') {
            setEditingFanfic(null);
            setIsEditorOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenNewStory={() => {
          setEditingFanfic(null);
          setIsEditorOpen(true);
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePortalView
            fanfics={fanfics}
            onSelectStory={(f) => setActiveReadingFanfic(f)}
            onOpenNewStory={() => {
              setEditingFanfic(null);
              setIsEditorOpen(true);
            }}
            onOpenWordConverter={() => setCurrentTab('converter')}
            onOpenHostingGuide={() => setCurrentTab('hosting-guide')}
            onOpenAdminPanel={() => setCurrentTab('admin-updates')}
          />
        )}

        {currentTab === 'converter' && (
          <WordToHtmlConverter
            onSendToEditor={handleSendFromConverterToEditor}
            onClose={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'admin-updates' && (
          <AdminUpdatesView
            fanfics={fanfics}
            onBackToHome={() => setCurrentTab('home')}
            onUpdatePublished={() => setCurrentTab('home')}
            onSelectStory={(f) => setActiveReadingFanfic(f)}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreView
            fanfics={fanfics}
            onRead={(f) => setActiveReadingFanfic(f)}
            onEdit={(f) => {
              setEditingFanfic(f);
              setIsEditorOpen(true);
            }}
            onDelete={handleDeleteFanfic}
            onToggleLike={() => {
              // handled inside storage & card
            }}
            onNewStory={() => {
              setEditingFanfic(null);
              setIsEditorOpen(true);
            }}
          />
        )}

        {currentTab === 'index' && (
          <AlphabeticalIndex
            fanfics={fanfics}
            onSelectStory={(f) => setActiveReadingFanfic(f)}
          />
        )}

        {currentTab === 'hosting-guide' && (
          <StaticHostingGuide
            fanfics={fanfics}
            onBackToHome={() => setCurrentTab('home')}
          />
        )}
      </main>

      {/* Story Editor Modal (Active when creating or editing) */}
      {isEditorOpen && (
        <StoryEditorModal
          initialFanfic={editingFanfic}
          onSave={handleSaveFanfic}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingFanfic(null);
          }}
        />
      )}

      {/* Portal Footer when not in Home (Home has its own classic footer) */}
      {currentTab !== 'home' && (
        <footer className="border-t border-[#1c2230] bg-[#0e1015] text-white py-8 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-sm">Lumiere.ink</span>
              <span className="text-[#ce5272] font-serif italic text-base">Histórias Interativas</span>
              <span className="text-[#b8cee8]">· Pantone Rose Quartz & Serenity</span>
            </div>

            <div className="flex items-center gap-4 text-stone-300">
              <button
                onClick={() => setCurrentTab('converter')}
                className="hover:text-[#ce5272] transition-colors cursor-pointer"
              >
                Conversor Word
              </button>
              <button
                onClick={() => setCurrentTab('admin-updates')}
                className="hover:text-[#ce5272] transition-colors cursor-pointer text-[#f5ccd7]"
              >
                Postar Atualização (Admin)
              </button>
              <button
                onClick={() => setCurrentTab('hosting-guide')}
                className="hover:text-[#ce5272] transition-colors cursor-pointer"
              >
                Como Hospedar Grátis
              </button>
              <button
                onClick={() => setCurrentTab('index')}
                className="hover:text-[#ce5272] transition-colors cursor-pointer"
              >
                Arquivo A-Z
              </button>
              <button
                onClick={() => {
                  setEditingFanfic(null);
                  setIsEditorOpen(true);
                }}
                className="hover:text-[#ce5272] transition-colors cursor-pointer"
              >
                Postar História
              </button>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
