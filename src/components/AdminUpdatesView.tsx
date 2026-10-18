import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Eye,
  Edit3,
  Layers,
  Send,
  ExternalLink,
  BookOpen,
  MessageSquare,
  Shield,
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Fanfic, PortalUpdatePost, PortalUpdateItem } from '../types/fanfic';
import { getStoredPortalUpdates, saveSinglePortalUpdate, deletePortalUpdate, savePortalUpdates } from '../utils/storage';
import { INITIAL_PORTAL_UPDATES } from '../data/defaultUpdates';

interface AdminUpdatesViewProps {
  fanfics: Fanfic[];
  onBackToHome: () => void;
  onUpdatePublished?: () => void;
  onSelectStory?: (fanfic: Fanfic) => void;
}

export const AdminUpdatesView: React.FC<AdminUpdatesViewProps> = ({
  fanfics,
  onBackToHome,
  onUpdatePublished,
  onSelectStory
}) => {
  const [updatesList, setUpdatesList] = useState<PortalUpdatePost[]>(() => getStoredPortalUpdates());
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'preview'>('create');
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form states for creating or editing an update
  const getNextUpdateNumber = () => {
    const existing = updatesList.map(u => parseInt(u.number.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const max = existing.length > 0 ? Math.max(...existing) : 1893;
    return `#${max + 1}`;
  };

  const getTodayFormatted = () => {
    return new Date().toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const [updateNumber, setUpdateNumber] = useState<string>(getNextUpdateNumber());
  const [updateTitle, setUpdateTitle] = useState<string>(`Atualização ${getNextUpdateNumber()}`);
  const [adminAuthor, setAdminAuthor] = useState<string>('Joy');
  const [publishedDate, setPublishedDate] = useState<string>(getTodayFormatted());
  const [editorialText, setEditorialText] = useState<string>(
    'Atualização especial! Se você estava ansiosa pelo próximo capítulo das suas histórias favoritas, essa é a hora de correr para conferir as novidades e mergulhar em cada romance. Desejamos uma ótima leitura e esperamos que aproveitem cada momento!'
  );
  const [contactNote, setContactNote] = useState<string>(
    'Qualquer erro nessa atualização, podem mandar mensagem para a moderação no @lumiere.ink'
  );

  // New stories in this update
  const [newStories, setNewStories] = useState<PortalUpdateItem[]>([
    {
      id: 'new-' + Date.now() + '-1',
      type: 'nova',
      fandomCategory: 'Originais – Em Andamento',
      title: fanfics[0]?.title || 'Uma Nova História Romântica',
      author: fanfics[0]?.author || 'Autora Lumiere',
      storySlugOrId: fanfics[0]?.slug || 'a-melhor-vinganca'
    }
  ]);

  // Updated chapters in this update
  const [updatedStories, setUpdatedStories] = useState<PortalUpdateItem[]>([
    {
      id: 'upd-' + Date.now() + '-1',
      type: 'atualizacao',
      fandomCategory: 'Restritas – Originais – Andamento',
      title: 'Capítulo 2 de ' + (fanfics[0]?.title || 'A Melhor Vingança'),
      author: fanfics[0]?.author || 'Autora Lumiere',
      storySlugOrId: fanfics[0]?.slug || 'a-melhor-vinganca'
    }
  ]);

  // Announcements (Recados)
  const [announcements, setAnnouncements] = useState<string[]>([
    '– Não consegue ver a atualização? Limpe o cache (ctrl+f5 ou ⌘+f5) e tente novamente.',
    '– Siga o Lumiere.ink no Instagram (@lumiere.ink) para spoilers exclusivos dos próximos capítulos.',
    '– O novo leitor interativo permite trocar todos os nomes com 1 clique diretamente no navegador!',
    '– Quer betar ou publicar sua fic? Envie seu arquivo do Word no conversor que a gente publica de graça.'
  ]);

  // Auto-fill from recent library fanfics
  const handleAutoFillFromLibrary = () => {
    if (fanfics.length === 0) return;

    const suggestedNew: PortalUpdateItem[] = fanfics.slice(0, 2).map((f, i) => ({
      id: `new-auto-${Date.now()}-${i}`,
      type: 'nova',
      fandomCategory: `${f.fandom || 'Originais'} – ${f.status || 'Em Andamento'}`,
      title: f.title,
      author: f.author,
      storySlugOrId: f.slug || f.id
    }));

    const suggestedUpd: PortalUpdateItem[] = fanfics.slice(2, 4).map((f, i) => ({
      id: `upd-auto-${Date.now()}-${i}`,
      type: 'atualizacao',
      fandomCategory: `${f.fandom || 'Originais'} – ${f.status || 'Em Andamento'}`,
      title: `Capítulo ${f.chapters?.length || 2} de ${f.title}`,
      author: f.author,
      storySlugOrId: f.slug || f.id
    }));

    setNewStories(suggestedNew.length > 0 ? suggestedNew : newStories);
    setUpdatedStories(suggestedUpd.length > 0 ? suggestedUpd : updatedStories);
    setSuccessMessage('Histórias preenchidas automaticamente a partir das fanfics cadastradas no site!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Add new story row
  const handleAddNewStoryRow = () => {
    setNewStories(prev => [
      ...prev,
      {
        id: 'new-' + Date.now(),
        type: 'nova',
        fandomCategory: 'Originais – Em Andamento',
        title: '',
        author: '',
        storySlugOrId: ''
      }
    ]);
  };

  // Remove new story row
  const handleRemoveNewStoryRow = (id: string) => {
    setNewStories(prev => prev.filter(item => item.id !== id));
  };

  // Add updated story row
  const handleAddUpdatedStoryRow = () => {
    setUpdatedStories(prev => [
      ...prev,
      {
        id: 'upd-' + Date.now(),
        type: 'atualizacao',
        fandomCategory: 'Originais – Em Andamento',
        title: '',
        author: '',
        storySlugOrId: ''
      }
    ]);
  };

  // Remove updated story row
  const handleRemoveUpdatedStoryRow = (id: string) => {
    setUpdatedStories(prev => prev.filter(item => item.id !== id));
  };

  // Add announcement
  const handleAddAnnouncement = () => {
    setAnnouncements(prev => [...prev, '– Novo recado da administração...']);
  };

  // Remove announcement
  const handleRemoveAnnouncement = (idx: number) => {
    setAnnouncements(prev => prev.filter((_, i) => i !== idx));
  };

  // Edit existing update from list
  const handleStartEditing = (update: PortalUpdatePost) => {
    setEditingUpdateId(update.id);
    setUpdateNumber(update.number);
    setUpdateTitle(update.title);
    setAdminAuthor(update.adminAuthor);
    setPublishedDate(update.publishedDate);
    setEditorialText(update.editorialText);
    setContactNote(update.contactNote || '');
    setNewStories(update.newStories || []);
    setUpdatedStories(update.updatedStories || []);
    setAnnouncements(update.announcements || []);
    setActiveTab('create');
  };

  // Delete update
  const handleDeleteUpdate = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta atualização do portal?')) {
      const updated = deletePortalUpdate(id);
      setUpdatesList(updated);
      setSuccessMessage('Atualização removida do portal.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    if (confirm('Deseja restaurar as atualizações padrão do portal?')) {
      savePortalUpdates(INITIAL_PORTAL_UPDATES);
      setUpdatesList(INITIAL_PORTAL_UPDATES);
      setSuccessMessage('Atualizações restauradas para os padrões originais.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Save / Publish
  const handlePublishUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!updateTitle.trim() || !adminAuthor.trim()) {
      alert('Por favor, preencha o título da atualização e o nome da administradora.');
      return;
    }

    const newPost: PortalUpdatePost = {
      id: editingUpdateId || 'update-' + Date.now(),
      number: updateNumber.trim(),
      title: updateTitle.trim(),
      adminAuthor: adminAuthor.trim(),
      publishedDate: publishedDate.trim(),
      editorialText: editorialText.trim(),
      contactNote: contactNote.trim(),
      newStories: newStories.filter(s => s.title.trim()),
      updatedStories: updatedStories.filter(s => s.title.trim()),
      announcements: announcements.filter(a => a.trim()),
      comments: editingUpdateId ? (updatesList.find(u => u.id === editingUpdateId)?.comments || []) : []
    };

    const savedList = saveSinglePortalUpdate(newPost);
    setUpdatesList(savedList);
    setSuccessMessage(`Atualização ${newPost.number} publicada com sucesso no portal Lumiere.ink!`);
    
    // Reset or prepare next
    if (editingUpdateId) {
      setEditingUpdateId(null);
    } else {
      setUpdateNumber(getNextUpdateNumber());
      setUpdateTitle(`Atualização ${getNextUpdateNumber()}`);
    }

    if (onUpdatePublished) {
      onUpdatePublished();
    }

    setTimeout(() => {
      setSuccessMessage('');
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-16">
      
      {/* Top Banner Header */}
      <header className="border-b border-[#e2e6ee] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 text-stone-500 hover:text-[#0e1015] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Voltar para a Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase bg-[#fdf0f4] text-[#9e2847] border border-[#f5ccd7]">
                  Administração
                </span>
                <span className="text-xs text-stone-400">·</span>
                <span className="text-xs text-[#486da6] font-semibold">Lumiere.ink Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-[#0e1015] tracking-tight">
                Painel da Administradora: Postar Atualizações
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="px-4 py-2 text-xs font-bold text-[#152238] bg-[#f8faff] hover:bg-[#eef4fb] border border-[#d2dbe8] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#486da6]" />
              <span>Ver Portal ao Vivo</span>
            </button>

            <button
              onClick={handleAutoFillFromLibrary}
              className="px-3.5 py-2 text-xs font-bold text-[#ce5272] bg-[#fdf0f4] hover:bg-[#fae1e8] border border-[#f5ccd7] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Preenche o formulário com histórias recentes cadastradas na biblioteca"
            >
              <Sparkles className="w-4 h-4" />
              <span>Preencher com Fanfics Recentes</span>
            </button>
          </div>
        </div>

        {/* Tab Subnavigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 flex items-center gap-2 border-b border-[#e2e6ee] pt-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-[#ce5272] text-[#ce5272]'
                : 'border-transparent text-stone-500 hover:text-[#0e1015]'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{editingUpdateId ? 'Editar Atualização' : 'Criar Nova Atualização'}</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-[#ce5272] text-[#ce5272]'
                : 'border-transparent text-stone-500 hover:text-[#0e1015]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Edições Publicadas ({updatesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-[#ce5272] text-[#ce5272]'
                : 'border-transparent text-stone-500 hover:text-[#0e1015]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Prévia Exata do Portal</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={onBackToHome}
              className="px-3 py-1 bg-emerald-600 text-white rounded text-[11px] hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Ir para a Home
            </button>
          </div>
        )}

        {/* TAB 1: FORM TO CREATE / EDIT */}
        {activeTab === 'create' && (
          <form onSubmit={handlePublishUpdate} className="space-y-8">
            
            {/* Box 1: Informações Gerais da Edição */}
            <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#e2e6ee] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#0e1015] font-sans">
                    1. Dados Gerais da Atualização
                  </h2>
                  <p className="text-xs text-stone-500">
                    Defina o número, título e mensagem de saudação da administradora.
                  </p>
                </div>
                {editingUpdateId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUpdateId(null);
                      setUpdateNumber(getNextUpdateNumber());
                      setUpdateTitle(`Atualização ${getNextUpdateNumber()}`);
                    }}
                    className="text-xs text-stone-500 hover:text-[#ce5272] underline cursor-pointer"
                  >
                    Cancelar edição e criar nova
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#152238] mb-1">
                    Número da Edição
                  </label>
                  <input
                    type="text"
                    required
                    value={updateNumber}
                    onChange={(e) => setUpdateNumber(e.target.value)}
                    placeholder="Ex: #1894"
                    className="w-full px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg text-xs font-bold outline-none focus:border-[#ce5272] text-[#0e1015]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#152238] mb-1">
                    Título Completo da Postagem
                  </label>
                  <input
                    type="text"
                    required
                    value={updateTitle}
                    onChange={(e) => setUpdateTitle(e.target.value)}
                    placeholder="Ex: Atualização #1894"
                    className="w-full px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg text-xs font-bold outline-none focus:border-[#ce5272] text-[#0e1015]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#152238] mb-1">
                    Administradora Responsável
                  </label>
                  <input
                    type="text"
                    required
                    value={adminAuthor}
                    onChange={(e) => setAdminAuthor(e.target.value)}
                    placeholder="Ex: Joy, Paloma, Bia"
                    className="w-full px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg text-xs font-bold outline-none focus:border-[#ce5272] text-[#ce5272]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#152238] mb-1">
                    Data da Publicação
                  </label>
                  <input
                    type="text"
                    required
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    placeholder="Ex: 18 de outubro de 2026"
                    className="w-full px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg text-xs outline-none focus:border-[#ce5272] text-[#0e1015]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-[#152238] mb-1">
                    Nota de Contato / Dúvidas / Betagem
                  </label>
                  <input
                    type="text"
                    value={contactNote}
                    onChange={(e) => setContactNote(e.target.value)}
                    placeholder="Ex: Qualquer erro nessa atualização, podem me chamar no @lumierejoy"
                    className="w-full px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg text-xs outline-none focus:border-[#ce5272] text-[#0e1015]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#152238] mb-1">
                  Texto Editorial / Mensagem para os Leitores
                </label>
                <textarea
                  rows={3}
                  required
                  value={editorialText}
                  onChange={(e) => setEditorialText(e.target.value)}
                  placeholder="Texto caloroso de abertura da atualização..."
                  className="w-full px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg text-xs leading-relaxed outline-none focus:border-[#ce5272] text-[#0e1015]"
                />
              </div>
            </div>

            {/* Box 2: Novas Histórias */}
            <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="border-b border-[#e2e6ee] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#0e1015] font-sans flex items-center gap-2">
                    <span>2. Seção "Novas"</span>
                    <span className="text-xs bg-[#eef4fb] text-[#27426e] font-bold px-2 py-0.5 rounded border border-[#b8cee8]">
                      {newStories.length} histórias
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500">
                    Histórias estreantes que acabaram de entrar no portal Lumiere.ink.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewStoryRow}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Nova Fic</span>
                </button>
              </div>

              <div className="space-y-3">
                {newStories.map((story, idx) => (
                  <div
                    key={story.id}
                    className="p-3.5 bg-[#f8faff] border border-[#dbe2ee] rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Categoria / Fandom
                      </label>
                      <input
                        type="text"
                        value={story.fandomCategory}
                        onChange={(e) => {
                          const updated = [...newStories];
                          updated[idx].fandomCategory = e.target.value;
                          setNewStories(updated);
                        }}
                        placeholder="Ex: Star Wars – Em Andamento"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded text-xs outline-none focus:border-[#ce5272]"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Título da Fanfic
                      </label>
                      <input
                        type="text"
                        value={story.title}
                        onChange={(e) => {
                          const updated = [...newStories];
                          updated[idx].title = e.target.value;
                          setNewStories(updated);
                        }}
                        placeholder="Título da fic"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded text-xs font-bold text-[#0e1015] outline-none focus:border-[#ce5272]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Autora
                      </label>
                      <input
                        type="text"
                        value={story.author}
                        onChange={(e) => {
                          const updated = [...newStories];
                          updated[idx].author = e.target.value;
                          setNewStories(updated);
                        }}
                        placeholder="Nome da autora"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded text-xs outline-none focus:border-[#ce5272]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Vincular Fic Cadastrada
                      </label>
                      <select
                        value={story.storySlugOrId || ''}
                        onChange={(e) => {
                          const selectedFic = fanfics.find(f => f.id === e.target.value || f.slug === e.target.value);
                          const updated = [...newStories];
                          updated[idx].storySlugOrId = e.target.value;
                          if (selectedFic) {
                            if (!updated[idx].title) updated[idx].title = selectedFic.title;
                            if (!updated[idx].author) updated[idx].author = selectedFic.author;
                          }
                          setNewStories(updated);
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-[#d2dbe8] rounded text-[11px] text-[#27426e] outline-none"
                      >
                        <option value="">Selecionar fic...</option>
                        {fanfics.map(f => (
                          <option key={f.id} value={f.slug || f.id}>
                            {f.title} ({f.author})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveNewStoryRow(story.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 3: Histórias Atualizadas */}
            <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="border-b border-[#e2e6ee] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#0e1015] font-sans flex items-center gap-2">
                    <span>3. Seção "Atualizações"</span>
                    <span className="text-xs bg-[#eef4fb] text-[#27426e] font-bold px-2 py-0.5 rounded border border-[#b8cee8]">
                      {updatedStories.length} capítulos
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500">
                    Novos capítulos lançados para histórias em andamento.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddUpdatedStoryRow}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Capítulo</span>
                </button>
              </div>

              <div className="space-y-3">
                {updatedStories.map((story, idx) => (
                  <div
                    key={story.id}
                    className="p-3.5 bg-[#f8faff] border border-[#dbe2ee] rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Categoria / Fandom
                      </label>
                      <input
                        type="text"
                        value={story.fandomCategory}
                        onChange={(e) => {
                          const updated = [...updatedStories];
                          updated[idx].fandomCategory = e.target.value;
                          setUpdatedStories(updated);
                        }}
                        placeholder="Ex: Restritas – Originais – Andamento"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded text-xs outline-none focus:border-[#ce5272]"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Título ou Capítulo
                      </label>
                      <input
                        type="text"
                        value={story.title}
                        onChange={(e) => {
                          const updated = [...updatedStories];
                          updated[idx].title = e.target.value;
                          setUpdatedStories(updated);
                        }}
                        placeholder="Ex: Capítulo 34 de A Melhor Vingança"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded text-xs font-bold text-[#0e1015] outline-none focus:border-[#ce5272]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Autora
                      </label>
                      <input
                        type="text"
                        value={story.author}
                        onChange={(e) => {
                          const updated = [...updatedStories];
                          updated[idx].author = e.target.value;
                          setUpdatedStories(updated);
                        }}
                        placeholder="Nome da autora"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded text-xs outline-none focus:border-[#ce5272]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Vincular Fic Cadastrada
                      </label>
                      <select
                        value={story.storySlugOrId || ''}
                        onChange={(e) => {
                          const selectedFic = fanfics.find(f => f.id === e.target.value || f.slug === e.target.value);
                          const updated = [...updatedStories];
                          updated[idx].storySlugOrId = e.target.value;
                          if (selectedFic && !updated[idx].author) {
                            updated[idx].author = selectedFic.author;
                          }
                          setUpdatedStories(updated);
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-[#d2dbe8] rounded text-[11px] text-[#27426e] outline-none"
                      >
                        <option value="">Selecionar fic...</option>
                        {fanfics.map(f => (
                          <option key={f.id} value={f.slug || f.id}>
                            {f.title} ({f.author})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveUpdatedStoryRow(story.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 4: Recados da Administração */}
            <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="border-b border-[#e2e6ee] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#0e1015] font-sans">
                    4. Seção "[Recados]"
                  </h2>
                  <p className="text-xs text-stone-500">
                    Avisos institucionais, novidades do portal, orientações de cache ou links de redes sociais.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddAnnouncement}
                  className="px-3 py-1.5 text-xs font-bold text-[#27426e] bg-[#eef4fb] hover:bg-[#dce9f8] border border-[#b8cee8] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Recado</span>
                </button>
              </div>

              <div className="space-y-2">
                {announcements.map((recado, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={recado}
                      onChange={(e) => {
                        const updated = [...announcements];
                        updated[idx] = e.target.value;
                        setAnnouncements(updated);
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg text-xs outline-none focus:border-[#ce5272] text-[#0e1015]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAnnouncement(idx)}
                      className="p-2 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Excluir recado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit / Action Bar */}
            <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Shield className="w-4 h-4 text-[#ce5272]" />
                <span>Esta postagem será colocada no topo da página inicial do portal Lumiere.ink.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-[#152238] bg-[#f8faff] hover:bg-[#eef4fb] border border-[#d2dbe8] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#486da6]" />
                  <span>Ver Prévia Antes</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-6 py-2.5 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar Atualização no Portal</span>
                </button>
              </div>
            </div>

          </form>
        )}

        {/* TAB 2: LIST OF PUBLISHED UPDATES */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#0e1015]">
                  Histórico de Atualizações Publicadas
                </h2>
                <p className="text-xs text-stone-500">
                  Todas as edições publicadas no Lumiere.ink ficam disponíveis para navegação pelas leitoras.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToDefaults}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-300 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrões</span>
                </button>

                <button
                  onClick={() => {
                    setEditingUpdateId(null);
                    setUpdateNumber(getNextUpdateNumber());
                    setUpdateTitle(`Atualização ${getNextUpdateNumber()}`);
                    setActiveTab('create');
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Atualização</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {updatesList.map((update, idx) => (
                <div
                  key={update.id}
                  className="bg-white border border-[#dbe2ee] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-black bg-[#152238] text-white">
                        {update.number}
                      </span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fdf0f4] text-[#9e2847] border border-[#f5ccd7]">
                          Mais Recente (Ativa na Home)
                        </span>
                      )}
                      <span className="text-xs text-stone-400">·</span>
                      <span className="text-xs text-stone-500">{update.publishedDate}</span>
                    </div>

                    <h3 className="text-base font-black text-[#0e1015]">
                      {update.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-1 max-w-3xl">
                      {update.editorialText}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-500">
                      <span>Postado por: <strong className="text-[#ce5272]">{update.adminAuthor}</strong></span>
                      <span>·</span>
                      <span>{update.newStories?.length || 0} novas histórias</span>
                      <span>·</span>
                      <span>{update.updatedStories?.length || 0} capítulos atualizados</span>
                      <span>·</span>
                      <span>{update.comments?.length || 0} comentários</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStartEditing(update)}
                      className="px-3 py-1.5 text-xs font-bold text-[#152238] bg-[#f8faff] hover:bg-[#eef4fb] border border-[#d2dbe8] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#486da6]" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={onBackToHome}
                      className="px-3 py-1.5 text-xs font-bold text-[#486da6] hover:bg-[#eef4fb] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver na Home</span>
                    </button>

                    <button
                      onClick={() => handleDeleteUpdate(update.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EXACT PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#dbe2ee] rounded-xl p-4 flex items-center justify-between text-xs">
              <span className="font-bold text-[#152238] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#ce5272]" />
                <span>Pré-visualização de como este post aparecerá para as leitoras no Lumiere.ink:</span>
              </span>

              <button
                onClick={() => setActiveTab('create')}
                className="px-3 py-1.5 font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg transition-colors cursor-pointer"
              >
                Voltar e Publicar
              </button>
            </div>

            {/* Exact Article Mockup */}
            <article className="bg-white border border-[#dbe2ee] rounded-xl p-6 sm:p-10 shadow-xs space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-2 border-b border-[#e2e6ee] pb-6">
                <h1 className="text-3xl sm:text-4xl font-display font-black text-[#0e1015] tracking-tight">
                  {updateTitle}
                </h1>
                <p className="text-xs text-stone-500">
                  Publicado por <strong className="text-[#ce5272] font-bold">{adminAuthor}</strong> em {publishedDate}
                </p>
              </div>

              <div className="text-sm text-[#2c3342] leading-[1.75] font-sans space-y-3">
                <p>{editorialText}</p>
                {contactNote && (
                  <p className="text-xs text-[#486da6] font-medium pt-1">
                    {contactNote}
                  </p>
                )}
              </div>

              {newStories.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#f0f3f8]">
                  <h2 className="text-sm font-black text-[#0e1015] tracking-wide uppercase font-sans">
                    Novas:
                  </h2>
                  <div className="space-y-2 pl-1 text-xs">
                    {newStories.map((story) => (
                      <div key={story.id} className="flex items-start gap-1.5 leading-relaxed">
                        <strong className="text-[#0e1015] font-bold">[{story.fandomCategory}]</strong>
                        <span className="text-[#486da6] font-bold">{story.title}</span>
                        <span className="text-stone-500 font-sans">by {story.author}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {updatedStories.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#f0f3f8]">
                  <h2 className="text-sm font-black text-[#0e1015] tracking-wide uppercase font-sans">
                    Atualizações:
                  </h2>
                  <div className="space-y-2 pl-1 text-xs">
                    {updatedStories.map((story) => (
                      <div key={story.id} className="flex items-start gap-1.5 leading-relaxed">
                        <strong className="text-[#0e1015] font-bold">[{story.fandomCategory}]</strong>
                        <span className="text-[#486da6] font-bold">{story.title}</span>
                        {story.author && <span className="text-stone-500 font-sans">by {story.author}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {announcements.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#f0f3f8]">
                  <h2 className="text-sm font-black text-[#0e1015] tracking-wide uppercase font-sans">
                    [Recados]
                  </h2>
                  <div className="space-y-2 pl-1 text-xs text-[#2c3342] leading-relaxed">
                    {announcements.map((recado, i) => (
                      <p key={i} className="font-sans">{recado}</p>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
        )}

      </main>

    </div>
  );
};
