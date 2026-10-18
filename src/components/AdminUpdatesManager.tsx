import React, { useState } from 'react';
import { PortalUpdatePost, PortalUpdateItem, Fanfic } from '../types/fanfic';
import { getStoredPortalUpdates, saveSinglePortalUpdate, deletePortalUpdate } from '../utils/storage';
import {
  Sparkles,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Eye,
  Megaphone,
  Share2
} from 'lucide-react';

interface AdminUpdatesManagerProps {
  fanfics: Fanfic[];
  onBackToHome: () => void;
  onUpdatePublished: (latestUpdate: PortalUpdatePost) => void;
}

export const AdminUpdatesManager: React.FC<AdminUpdatesManagerProps> = ({
  fanfics,
  onBackToHome,
  onUpdatePublished
}) => {
  const [updates, setUpdates] = useState<PortalUpdatePost[]>(() => getStoredPortalUpdates());
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form State for new update
  const [updateNumber, setUpdateNumber] = useState<string>(() => {
    const nextNum = updates.length > 0 ? parseInt(updates[0].number.replace(/\D/g, '') || '1893') + 1 : 1894;
    return `#${nextNum}`;
  });
  const [title, setTitle] = useState<string>('Atualização ' + updateNumber);
  const [adminAuthor, setAdminAuthor] = useState<string>('Joy');
  const [publishedDate, setPublishedDate] = useState<string>(() => {
    const today = new Date();
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;
  });
  const [editorialText, setEditorialText] = useState<string>(
    'Atualização da semana! Se você estava ansiosa pelos próximos capítulos das suas histórias favoritas, agora é a hora de conferir as novidades. Desejamos uma ótima leitura para todas as leitoras!'
  );
  const [contactNote, setContactNote] = useState<string>('Qualquer erro nessa atualização, podem me chamar no @lumierejoy');

  // New Stories list
  const [newStories, setNewStories] = useState<PortalUpdateItem[]>([
    {
      id: 'ns-1',
      type: 'nova',
      fandomCategory: 'Originais – Em Andamento',
      title: 'A Melhor Vingança',
      author: 'Helena Rossi',
      storySlugOrId: 'a-melhor-vinganca'
    }
  ]);

  // Updated chapters list
  const [updatedStories, setUpdatedStories] = useState<PortalUpdateItem[]>([
    {
      id: 'us-1',
      type: 'atualizacao',
      fandomCategory: 'Bandas & Música – Em Andamento',
      title: 'Capítulo 12 e 13 de Ritmo do Coração',
      author: 'Flávia Coelho',
      storySlugOrId: 'ritmo-do-coracao'
    }
  ]);

  // Announcements list
  const [announcements, setAnnouncements] = useState<string[]>([
    '– Não consegue ver a atualização? Limpe o cache (ctrl+f5 ou ⌘+f5) e tente novamente.',
    '– Participe do grupo do Lumiere.ink no Facebook: Grupo – Lumiere.ink Oficial.',
    '– Siga-nos em nossas redes sociais: Facebook | Twitter | Instagram (@lumiere.ink).',
    '– Qualquer erro nessa atualização, envie um e-mail para erros@lumiere.ink.'
  ]);

  const [newNoticeText, setNewNoticeText] = useState('');

  // Handlers for New Stories
  const handleAddNewStoryItem = () => {
    const selectedFic = fanfics[0];
    const item: PortalUpdateItem = {
      id: `ns-${Date.now()}`,
      type: 'nova',
      fandomCategory: selectedFic ? `${selectedFic.fandom} – Em Andamento` : 'Originais – Em Andamento',
      title: selectedFic ? selectedFic.title : 'Nova História Interativa',
      author: selectedFic ? selectedFic.author : 'Autora',
      storySlugOrId: selectedFic ? selectedFic.id : ''
    };
    setNewStories(prev => [...prev, item]);
  };

  const handleRemoveNewStoryItem = (id: string) => {
    setNewStories(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateNewStoryItem = (id: string, field: keyof PortalUpdateItem, value: string) => {
    setNewStories(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Handlers for Updated Stories
  const handleAddUpdatedStoryItem = () => {
    const selectedFic = fanfics[1] || fanfics[0];
    const item: PortalUpdateItem = {
      id: `us-${Date.now()}`,
      type: 'atualizacao',
      fandomCategory: selectedFic ? `${selectedFic.fandom} – Em Andamento` : 'Originais – Em Andamento',
      title: selectedFic ? `Capítulo Novo de ${selectedFic.title}` : 'Capítulos 5 e 6 da História',
      author: selectedFic ? selectedFic.author : 'Autora',
      storySlugOrId: selectedFic ? selectedFic.id : ''
    };
    setUpdatedStories(prev => [...prev, item]);
  };

  const handleRemoveUpdatedStoryItem = (id: string) => {
    setUpdatedStories(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateUpdatedStoryItem = (id: string, field: keyof PortalUpdateItem, value: string) => {
    setUpdatedStories(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Add Notice
  const handleAddNotice = () => {
    if (!newNoticeText.trim()) return;
    setAnnouncements(prev => [...prev, `– ${newNoticeText.trim()}`]);
    setNewNoticeText('');
  };

  const handleRemoveNotice = (idx: number) => {
    setAnnouncements(prev => prev.filter((_, i) => i !== idx));
  };

  // Publish
  const handlePublishUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    const newPost: PortalUpdatePost = {
      id: `update-${Date.now()}`,
      number: updateNumber.trim(),
      title: title.trim() || `Atualização ${updateNumber}`,
      adminAuthor: adminAuthor.trim() || 'Joy',
      publishedDate: publishedDate.trim(),
      editorialText: editorialText.trim(),
      contactNote: contactNote.trim(),
      newStories,
      updatedStories,
      announcements,
      comments: []
    };

    const updatedList = saveSinglePortalUpdate(newPost);
    setUpdates(updatedList);
    onUpdatePublished(newPost);

    setSuccessMessage(`Atualização ${newPost.number} publicada com sucesso no Lumiere.ink!`);
    setTimeout(() => {
      setSuccessMessage('');
      onBackToHome();
    }, 2000);
  };

  const handleDeleteExistingUpdate = (id: string, num: string) => {
    if (confirm(`Deseja realmente excluir a ${num}?`)) {
      const updatedList = deletePortalUpdate(id);
      setUpdates(updatedList);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Top Header */}
      <div className="border-b border-[#e2e6ee] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-[#486da6] hover:text-[#ce5272] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Portal</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ce5272]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#ce5272]">
              Área Exclusiva da Administradora
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-[#0e1015] mt-1">
            Painel de Publicação de Atualizações
          </h1>
          <p className="text-xs sm:text-sm text-[#2c3342] mt-1">
            Publique a nova edição do site com as histórias novas, capítulos atualizados e recados para as leitoras.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 bg-[#fdf0f4] text-[#9e2847] border border-[#eca8b8] font-bold rounded-lg">
            Admin Logada: {adminAuthor}
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>{successMessage} Redirecionando para a Home...</span>
        </div>
      )}

      {/* Main Publishing Form */}
      <form onSubmit={handlePublishUpdate} className="space-y-8">
        
        {/* Step 1: Info Geral */}
        <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#eef2f7]">
            <Calendar className="w-4 h-4 text-[#ce5272]" />
            <h2 className="text-sm font-bold text-[#0e1015] uppercase tracking-wide">
              1. Identificação da Atualização
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#152238] mb-1">
                Número da Edição (ex: #1893):
              </label>
              <input
                type="text"
                required
                value={updateNumber}
                onChange={(e) => {
                  setUpdateNumber(e.target.value);
                  setTitle(`Atualização ${e.target.value}`);
                }}
                className="w-full text-xs px-3 py-2 bg-[#f8faff] border border-[#d2dbe8] rounded-lg font-bold text-[#ce5272] outline-none focus:border-[#ce5272]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#152238] mb-1">
                Título do Post:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg font-bold text-[#0e1015] outline-none focus:border-[#ce5272]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#152238] mb-1">
                Administradora Responsável:
              </label>
              <input
                type="text"
                required
                value={adminAuthor}
                onChange={(e) => setAdminAuthor(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg font-semibold text-[#0e1015] outline-none focus:border-[#ce5272]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#152238] mb-1">
                Data de Publicação (como exibido no site):
              </label>
              <input
                type="text"
                required
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg font-medium text-[#0e1015] outline-none focus:border-[#ce5272]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#152238] mb-1">
                Contato de Erros / Redes (opcional):
              </label>
              <input
                type="text"
                value={contactNote}
                onChange={(e) => setContactNote(e.target.value)}
                placeholder="Ex: Qualquer erro nessa atualização, podem me chamar no @lumierejoy"
                className="w-full text-xs px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg font-medium text-[#0e1015] outline-none focus:border-[#ce5272]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#152238] mb-1">
              Texto Editorial de Abertura:
            </label>
            <textarea
              rows={3}
              required
              value={editorialText}
              onChange={(e) => setEditorialText(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-[#d2dbe8] rounded-lg font-medium leading-relaxed text-[#0e1015] outline-none focus:border-[#ce5272]"
            />
          </div>
        </div>

        {/* Step 2: Novas Histórias */}
        <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eef2f7]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ce5272]" />
              <h2 className="text-sm font-bold text-[#0e1015] uppercase tracking-wide">
                2. Histórias Novas (Estreias)
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddNewStoryItem}
              className="px-3 py-1.5 text-xs font-bold text-[#152238] bg-[#eef4fb] hover:bg-[#dce9f8] border border-[#b8cee8] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar História Nova</span>
            </button>
          </div>

          <div className="space-y-3">
            {newStories.map((item, idx) => (
              <div key={item.id} className="p-3.5 bg-[#f8faff] border border-[#d2dbe8] rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-[#486da6] uppercase">
                    Categoria / Fandom
                  </label>
                  <input
                    type="text"
                    value={item.fandomCategory}
                    onChange={(e) => handleUpdateNewStoryItem(item.id, 'fandomCategory', e.target.value)}
                    placeholder="Ex: Star Wars – Em Andamento"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded font-semibold text-[#0e1015]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-[#486da6] uppercase">
                    Título da Fanfic
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateNewStoryItem(item.id, 'title', e.target.value)}
                    placeholder="Ex: A Profecia dos Amantes"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded font-bold text-[#ce5272]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-[#486da6] uppercase">
                    Autora
                  </label>
                  <input
                    type="text"
                    value={item.author}
                    onChange={(e) => handleUpdateNewStoryItem(item.id, 'author', e.target.value)}
                    placeholder="Ex: Lumi Virtanen"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded font-semibold text-[#0e1015]"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveNewStoryItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-[#ce5272] transition-colors cursor-pointer"
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Capítulos Atualizados */}
        <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eef2f7]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#486da6]" />
              <h2 className="text-sm font-bold text-[#0e1015] uppercase tracking-wide">
                3. Capítulos Atualizados
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddUpdatedStoryItem}
              className="px-3 py-1.5 text-xs font-bold text-[#152238] bg-[#eef4fb] hover:bg-[#dce9f8] border border-[#b8cee8] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Atualização</span>
            </button>
          </div>

          <div className="space-y-3">
            {updatedStories.map((item) => (
              <div key={item.id} className="p-3.5 bg-[#f8faff] border border-[#d2dbe8] rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-[#486da6] uppercase">
                    Categoria / Fandom
                  </label>
                  <input
                    type="text"
                    value={item.fandomCategory}
                    onChange={(e) => handleUpdateUpdatedStoryItem(item.id, 'fandomCategory', e.target.value)}
                    placeholder="Ex: Restritas – Originais – Andamento"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded font-semibold text-[#0e1015]"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-bold text-[#486da6] uppercase">
                    Texto do Capítulo e Título
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateUpdatedStoryItem(item.id, 'title', e.target.value)}
                    placeholder="Ex: Capítulo 33 de Mason (Cave Panthers #3)"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded font-bold text-[#ce5272]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#486da6] uppercase">
                    Autora
                  </label>
                  <input
                    type="text"
                    value={item.author}
                    onChange={(e) => handleUpdateUpdatedStoryItem(item.id, 'author', e.target.value)}
                    placeholder="Ex: Mayara"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded font-semibold text-[#0e1015]"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveUpdatedStoryItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-[#ce5272] transition-colors cursor-pointer"
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Recados & Avisos */}
        <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#eef2f7]">
            <Megaphone className="w-4 h-4 text-[#ce5272]" />
            <h2 className="text-sm font-bold text-[#0e1015] uppercase tracking-wide">
              4. Seção [Recados] e Avisos para a Comunidade
            </h2>
          </div>

          <div className="space-y-2">
            {announcements.map((text, idx) => (
              <div key={idx} className="p-2.5 bg-[#f8faff] border border-[#d2dbe8] rounded-lg flex items-center justify-between gap-3 text-xs">
                <span className="text-[#2c3342] font-medium leading-relaxed">{text}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveNotice(idx)}
                  className="text-stone-400 hover:text-[#ce5272] p-1 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newNoticeText}
              onChange={(e) => setNewNoticeText(e.target.value)}
              placeholder="Digite um novo aviso (ex: 'Novas autoras VIP liberadas no catálogo')..."
              className="flex-1 text-xs px-3 py-2 bg-white border border-[#d2dbe8] rounded-lg text-[#0e1015] outline-none focus:border-[#ce5272]"
            />
            <button
              type="button"
              onClick={handleAddNotice}
              className="px-4 py-2 text-xs font-bold text-white bg-[#152238] hover:bg-[#27426e] rounded-lg transition-colors cursor-pointer"
            >
              Adicionar Recado
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border border-[#dbe2ee] rounded-xl flex items-center justify-between shadow-xs">
          <button
            type="button"
            onClick={onBackToHome}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-[#0e1015] cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-6 py-3 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Publicar {updateNumber} Agora no Lumiere.ink</span>
          </button>
        </div>

      </form>

      {/* Existing Updates Archive for Admin */}
      <div className="mt-12 pt-8 border-t border-[#e2e6ee]">
        <h3 className="text-base font-bold text-[#0e1015] mb-4">
          Histórico de Atualizações Publicadas ({updates.length})
        </h3>

        <div className="space-y-3">
          {updates.map((post) => (
            <div key={post.id} className="p-4 bg-white border border-[#dbe2ee] rounded-xl flex items-center justify-between gap-4 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#ce5272] text-sm">{post.number}</span>
                  <span className="text-stone-300">·</span>
                  <h4 className="font-bold text-[#0e1015] text-xs">{post.title}</h4>
                  <span className="text-stone-300">·</span>
                  <span className="text-[11px] text-[#486da6]">Por {post.adminAuthor} ({post.publishedDate})</span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-1 mt-1">
                  {post.newStories.length} novas histórias · {post.updatedStories.length} capítulos · {post.comments.length} comentários de leitoras
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onUpdatePublished(post);
                    onBackToHome();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-[#486da6] bg-[#eef4fb] hover:bg-[#dce9f8] rounded-lg transition-colors cursor-pointer"
                >
                  Ver no Site
                </button>
                {updates.length > 1 && (
                  <button
                    onClick={() => handleDeleteExistingUpdate(post.id, post.number)}
                    className="p-1.5 text-stone-400 hover:text-[#ce5272] transition-colors cursor-pointer"
                    title="Excluir atualização"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
