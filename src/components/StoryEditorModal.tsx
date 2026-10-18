import React, { useState, useRef } from 'react';
import mammoth from 'mammoth';
import { Fanfic, InteractiveVariable, Chapter } from '../types/fanfic';
import { generateStandaloneHtml, triggerFileDownload } from '../utils/interactiveEngine';
import {
  X,
  Plus,
  Trash2,
  Download,
  Sparkles,
  FileCode,
  BookOpen,
  Check,
  Eye,
  Sliders,
  HelpCircle,
  Upload,
  FileText
} from 'lucide-react';

interface StoryEditorModalProps {
  initialFanfic?: Fanfic | null;
  onSave: (fanfic: Fanfic) => void;
  onClose: () => void;
}

const DEFAULT_VARIABLES: InteractiveVariable[] = [
  { key: 'NOME', label: 'Seu Nome', defaultValue: 'Beatriz', placeholder: 'Ex: Marina', description: 'Nome da protagonista' },
  { key: 'SOBRENOME', label: 'Seu Sobrenome', defaultValue: 'Valente', placeholder: 'Ex: Silveira', description: 'Sobrenome da protagonista' },
  { key: 'PAR', label: 'Seu Par Romântico / Crush', defaultValue: 'Rodrigo', placeholder: 'Ex: Bernardo, Damon', description: 'O par romântico da história' },
  { key: 'AMIGA', label: 'Melhor Amiga', defaultValue: 'Camila', placeholder: 'Ex: Sofia', description: 'A confidente principal' },
  { key: 'CIDADE', label: 'Cidade', defaultValue: 'São Paulo', placeholder: 'Ex: Rio de Janeiro', description: 'Onde se passa o enredo' }
];

const PRESET_COVERS = [
  { label: 'Romance Urbano / Chuva', path: '/src/assets/images/cover_a_melhor_vinganca_1792282797969.jpg' },
  { label: 'Bandas & Música Romântica', path: '/src/assets/images/cover_ritmo_do_coracao_1792282799906.jpg' },
  { label: 'Dark Academia & Mistério', path: '/src/assets/images/cover_herdeira_sombria_1792282798714.jpg' },
  { label: 'Caderno Literário', path: '/src/assets/images/hero_obsessao_reading_1792282796847.jpg' }
];

export const StoryEditorModal: React.FC<StoryEditorModalProps> = ({
  initialFanfic,
  onSave,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'variables' | 'chapters' | 'preview'>('info');

  // Form State
  const [title, setTitle] = useState(initialFanfic?.title || '');
  const [author, setAuthor] = useState(initialFanfic?.author || 'Autora Anônima');
  const [summary, setSummary] = useState(initialFanfic?.summary || '');
  const [fandom, setFandom] = useState(initialFanfic?.fandom || 'Originais');
  const [genres, setGenres] = useState(initialFanfic?.genres?.join(', ') || 'Romance, Drama');
  const [rating, setRating] = useState<'Livre' | '+14' | '+16' | '+18'>(initialFanfic?.rating || '+14');
  const [status, setStatus] = useState<'Em Andamento' | 'Concluída'>(initialFanfic?.status || 'Em Andamento');
  const [coverImage, setCoverImage] = useState(initialFanfic?.coverImage || PRESET_COVERS[0].path);

  // Variables
  const [variables, setVariables] = useState<InteractiveVariable[]>(
    initialFanfic?.variables && initialFanfic.variables.length > 0
      ? initialFanfic.variables
      : DEFAULT_VARIABLES
  );

  // Chapters
  const [chapters, setChapters] = useState<Chapter[]>(
    initialFanfic?.chapters && initialFanfic.chapters.length > 0
      ? initialFanfic.chapters
      : [
          {
            id: 'cap-1',
            number: 1,
            title: 'Capítulo 1: O Começo de Tudo',
            publishedAt: new Date().toISOString().split('T')[0],
            wordCount: 850,
            authorNote: 'Preencha os campos interativos acima para começar a leitura!',
            htmlContent: `<p>A brisa suave da tarde soprava pelas ruas de [CIDADE]. [NOME] [SOBRENOME] ajeitou a mochila nos ombros enquanto atravessava os portões do colégio.</p>\n\n<p>De repente, uma voz conhecida a chamou:</p>\n\n<p>— Ei, [NOME]! Espere por mim! — gritou [AMIGA], correndo para alcançá-la.</p>\n\n<p>Mal sabiam as duas que, a poucos metros dali, [PAR] observava cada passo delas com um sorriso enigmático nos lábios.</p>`
          }
        ]
  );

  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);

  // Live preview test inputs
  const [previewInputs, setPreviewInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    variables.forEach(v => { init[v.key] = v.defaultValue; });
    return init;
  });

  // Handle variable modifications
  const handleAddVariable = (presetKey?: string) => {
    const key = presetKey || `VAR_${variables.length + 1}`;
    if (variables.some(v => v.key.toUpperCase() === key.toUpperCase())) return;

    const newVar: InteractiveVariable = {
      key: key.toUpperCase(),
      label: key === 'CRUSH' ? 'Seu Crush' : `Tag [${key}]`,
      defaultValue: 'Valor Padrão',
      placeholder: 'Ex: Nome'
    };
    setVariables([...variables, newVar]);
    setPreviewInputs(prev => ({ ...prev, [newVar.key]: newVar.defaultValue }));
  };

  const handleUpdateVariable = (index: number, field: keyof InteractiveVariable, value: string) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  // Chapter handling
  const handleAddChapter = () => {
    const newNum = chapters.length + 1;
    const newChap: Chapter = {
      id: `cap-${Date.now()}`,
      number: newNum,
      title: `Capítulo ${newNum}: Novo Capítulo`,
      publishedAt: new Date().toISOString().split('T')[0],
      wordCount: 0,
      htmlContent: `<p>Escreva seu capítulo aqui ou cole o código HTML da sua história. Você pode usar as tags interativas como [NOME], [PAR], etc.</p>`
    };
    setChapters([...chapters, newChap]);
    setSelectedChapterIdx(chapters.length);
  };

  const handleUpdateCurrentChapter = (field: keyof Chapter, value: any) => {
    const updated = [...chapters];
    updated[selectedChapterIdx] = {
      ...updated[selectedChapterIdx],
      [field]: value
    };
    setChapters(updated);
  };

  const handleRemoveChapter = (index: number) => {
    if (chapters.length <= 1) {
      alert('A história precisa ter pelo menos 1 capítulo.');
      return;
    }
    const updated = chapters.filter((_, i) => i !== index);
    setChapters(updated);
    setSelectedChapterIdx(Math.max(0, index - 1));
  };

  const docxFileInputRef = useRef<HTMLInputElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadDocxToChapter = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await mammoth.convertToHtml({ arrayBuffer });
      let html = res.value
        .replace(/<span[^>]*>/gi, '')
        .replace(/<\/span>/gi, '')
        .replace(/<font[^>]*>/gi, '')
        .replace(/<\/font>/gi, '')
        .replace(/<p>\s*[-–]\s*/gi, '<p>— ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/<p>\s*<\/p>/gi, '');

      handleUpdateCurrentChapter('htmlContent', html);
      alert(`Capítulo importado com sucesso do arquivo "${file.name}"!`);
    } catch (err) {
      alert('Erro ao importar arquivo do Word. Verifique se é um arquivo .docx válido.');
    }
  };

  // Insert helper text into active chapter HTML textarea
  const insertTextIntoChapter = (textToInsert: string) => {
    const textarea = document.getElementById('chapterHtmlEditor') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = chapters[selectedChapterIdx].htmlContent;
    const newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);

    handleUpdateCurrentChapter('htmlContent', newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  // Construct complete fanfic object
  const buildFanficObject = (): Fanfic => {
    const slug = initialFanfic?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `fic-${Date.now()}`;
    return {
      id: initialFanfic?.id || `fic-${Date.now()}`,
      slug,
      title: title || 'História Sem Título',
      author: author || 'Autora Anônima',
      summary: summary || 'Uma história interativa fascinante.',
      fandom: fandom || 'Originais',
      genres: genres.split(',').map(g => g.trim()).filter(Boolean),
      rating,
      status,
      coverImage: coverImage || PRESET_COVERS[0].path,
      variables,
      chapters,
      views: initialFanfic?.views || 1,
      likes: initialFanfic?.likes || 0,
      comments: initialFanfic?.comments || [],
      createdAt: initialFanfic?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isCustom: true
    };
  };

  const handleSaveFanfic = () => {
    if (!title.trim()) {
      alert('Por favor, informe o título da história.');
      setActiveTab('info');
      return;
    }
    const fanfic = buildFanficObject();
    onSave(fanfic);
    onClose();
  };

  const handleExportHtmlDirectly = () => {
    if (!title.trim()) {
      alert('Por favor, informe o título da história antes de exportar.');
      setActiveTab('info');
      return;
    }
    const fanfic = buildFanficObject();
    const html = generateStandaloneHtml(fanfic);
    triggerFileDownload(html, `${fanfic.slug}.html`, 'text/html');
  };

  const currentChap = chapters[selectedChapterIdx] || chapters[0];

  // Helper for live preview
  const getPreviewHtml = () => {
    if (!currentChap) return '';
    let html = currentChap.htmlContent;
    variables.forEach(v => {
      const val = previewInputs[v.key] || v.defaultValue;
      const regex = new RegExp(`\\[${v.key}\\]|\\{${v.key}\\}`, 'gi');
      html = html.replace(regex, `<mark class="interactive-highlight">${val}</mark>`);
    });
    return html;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Top Bar */}
        <header className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-lg font-display font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-600" />
              <span>{initialFanfic ? 'Editar Fanfic Interativa' : 'Postar Nova História Interativa (em HTML)'}</span>
            </h2>
            <p className="text-xs text-stone-500">
              Formato interativo clássico Lumiere.ink, pronto para hospedagem estática gratuita.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Tab Navigation (Segmented Filter Bar) */}
        <div className="flex border-b border-[#e2e6ee] bg-[#f8faff] px-5 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#ce5272] text-[#9e2847] bg-white rounded-t-lg'
                : 'border-transparent text-[#2c3342] hover:text-[#0e1015]'
            }`}
          >
            1. Informações Básicas
          </button>

          <button
            onClick={() => setActiveTab('variables')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'variables'
                ? 'border-[#ce5272] text-[#9e2847] bg-white rounded-t-lg'
                : 'border-transparent text-[#2c3342] hover:text-[#0e1015]'
            }`}
          >
            <span>2. Tags Interativas</span>
            <span className="text-[10px] bg-[#eef4fb] text-[#27426e] border border-[#b8cee8] px-1.5 py-0.2 rounded font-mono font-bold">
              {variables.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chapters'
                ? 'border-[#ce5272] text-[#9e2847] bg-white rounded-t-lg'
                : 'border-transparent text-[#2c3342] hover:text-[#0e1015]'
            }`}
          >
            <span>3. Capítulos em HTML</span>
            <span className="text-[10px] bg-[#eef4fb] text-[#27426e] border border-[#b8cee8] px-1.5 py-0.2 rounded font-mono font-bold">
              {chapters.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'border-[#ce5272] text-[#9e2847] bg-white rounded-t-lg'
                : 'border-transparent text-[#2c3342] hover:text-[#0e1015]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>4. Teste ao Vivo</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Título da História <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: A Melhor Vingança, O Contrato Perfeito..."
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Nome da Autora (Pseudônimo)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Seu nome ou apelido"
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Fandom ou Categoria
                  </label>
                  <input
                    type="text"
                    value={fandom}
                    onChange={(e) => setFandom(e.target.value)}
                    placeholder="Ex: Originais, Vampire Diaries, BTS, Harry Potter..."
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Sinopse
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Resuma a história e conte por que o leitor vai se apaixonar por ela..."
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Classificação Indicativa
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:border-rose-500 focus:outline-none font-medium"
                  >
                    <option value="Livre">Livre (Todas as Idades)</option>
                    <option value="+14">+14 Anos</option>
                    <option value="+16">+16 Anos</option>
                    <option value="+18">+18 Anos (Adulto)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Status da História
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:border-rose-500 focus:outline-none font-medium"
                  >
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Gêneros (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                    placeholder="Romance, Drama, Comédia"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover selector & upload */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  Imagem de Capa da Fanfic
                </label>

                {/* Upload or Preview Box */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl mb-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    
                    {/* Live Thumbnail Preview */}
                    <div className="w-24 h-32 bg-stone-200 rounded-lg overflow-hidden shrink-0 border border-stone-300 relative shadow-sm">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt="Prévia da capa"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-stone-400 text-center">
                          <BookOpen className="w-6 h-6 mb-1" />
                          <span className="text-[10px]">Sem capa</span>
                        </div>
                      )}
                    </div>

                    {/* Upload actions */}
                    <div className="flex-1 space-y-2.5 text-xs w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          ref={coverFileInputRef}
                          accept="image/png, image/jpeg, image/webp, image/jpg"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Importar Capa do seu Computador</span>
                        </button>

                        {coverImage && (
                          <button
                            type="button"
                            onClick={() => setCoverImage('')}
                            className="px-3 py-2 text-stone-600 hover:text-rose-600 font-medium"
                          >
                            Remover Capa
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-500">
                        Formatos suportados: PNG, JPG ou WEBP. A imagem será salva diretamente na fanfic.
                      </p>

                      <div className="pt-2 border-t border-stone-200">
                        <label className="block text-[10px] font-semibold text-stone-600 mb-1">
                          Ou digite o link direto da imagem (URL externa):
                        </label>
                        <input
                          type="text"
                          value={coverImage.startsWith('data:') ? '' : coverImage}
                          onChange={(e) => setCoverImage(e.target.value)}
                          placeholder="https://exemplo.com/minha-capa.jpg"
                          className="w-full px-2.5 py-1 text-xs bg-white border border-stone-300 rounded outline-none focus:border-rose-500 font-mono"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Preset covers fallback */}
                <div>
                  <span className="block text-[11px] font-semibold text-stone-600 mb-2">
                    Ou selecione uma das nossas capas artísticas pré-definidas:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PRESET_COVERS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCoverImage(preset.path)}
                        className={`cursor-pointer rounded-lg border overflow-hidden p-1 transition-all ${
                          coverImage === preset.path ? 'ring-2 ring-rose-600 border-rose-600 shadow-sm' : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <div className="aspect-[3/4] bg-stone-100 rounded overflow-hidden">
                          <img
                            src={preset.path}
                            alt={preset.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="block text-[11px] font-medium text-stone-700 mt-1 truncate">
                          {preset.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VARIABLES */}
          {activeTab === 'variables' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs">
                <div>
                  <strong className="text-rose-900 block font-semibold">Como funcionam as tags interativas?</strong>
                  <p className="text-rose-800">
                    Sempre que você escrever <code className="font-mono bg-white px-1 py-0.5 rounded text-rose-700">[NOME]</code> ou <code className="font-mono bg-white px-1 py-0.5 rounded text-rose-700">[PAR]</code> nos capítulos, o leitor verá o nome que ele mesmo preencheu no formulário!
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddVariable('CRUSH')}
                    className="px-2.5 py-1 text-xs font-medium bg-white text-rose-700 border border-rose-300 rounded hover:bg-rose-100 whitespace-nowrap"
                  >
                    + Adicionar [CRUSH]
                  </button>
                  <button
                    onClick={() => handleAddVariable('CIDADE')}
                    className="px-2.5 py-1 text-xs font-medium bg-white text-rose-700 border border-rose-300 rounded hover:bg-rose-100 whitespace-nowrap"
                  >
                    + Adicionar [CIDADE]
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {variables.map((v, idx) => (
                  <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">
                        Tag no HTML
                      </label>
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-rose-700">
                        <span>[</span>
                        <input
                          type="text"
                          value={v.key}
                          onChange={(e) => handleUpdateVariable(idx, 'key', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                          className="w-full bg-white border border-stone-300 rounded px-2 py-1 text-xs outline-none uppercase font-mono"
                        />
                        <span>]</span>
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">
                        Rótulo Exibido ao Leitor
                      </label>
                      <input
                        type="text"
                        value={v.label}
                        onChange={(e) => handleUpdateVariable(idx, 'label', e.target.value)}
                        placeholder="Ex: Seu Par Romântico"
                        className="w-full bg-white border border-stone-300 rounded px-2.5 py-1 text-xs outline-none"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">
                        Valor Padrão (Sugestão Inicial)
                      </label>
                      <input
                        type="text"
                        value={v.defaultValue}
                        onChange={(e) => handleUpdateVariable(idx, 'defaultValue', e.target.value)}
                        placeholder="Ex: Beatriz"
                        className="w-full bg-white border border-stone-300 rounded px-2.5 py-1 text-xs outline-none"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        onClick={() => handleRemoveVariable(idx)}
                        title="Remover esta tag"
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddVariable()}
                className="w-full py-2.5 border-2 border-dashed border-stone-300 hover:border-rose-500 text-stone-600 hover:text-rose-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Nova Tag Interativa Personalizada</span>
              </button>
            </div>
          )}

          {/* TAB 3: CHAPTERS */}
          {activeTab === 'chapters' && (
            <div className="space-y-4">
              {/* Chapter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200">
                {chapters.map((chap, idx) => (
                  <button
                    key={chap.id || idx}
                    onClick={() => setSelectedChapterIdx(idx)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                      selectedChapterIdx === idx
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Cap. {chap.number}
                  </button>
                ))}

                <button
                  onClick={handleAddChapter}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Capítulo</span>
                </button>
              </div>

              {/* Current Chapter Edit Details */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Título do Capítulo {currentChap.number}
                    </label>
                    <input
                      type="text"
                      value={currentChap.title}
                      onChange={(e) => handleUpdateCurrentChapter('title', e.target.value)}
                      placeholder="Ex: Capítulo 1: O Encontro"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-4 flex justify-end">
                    <button
                      onClick={() => handleRemoveChapter(selectedChapterIdx)}
                      className="text-xs text-stone-500 hover:text-rose-600 flex items-center gap-1 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Capítulo</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Nota da Autora (Opcional - exibida antes do capítulo)
                  </label>
                  <input
                    type="text"
                    value={currentChap.authorNote || ''}
                    onChange={(e) => handleUpdateCurrentChapter('authorNote', e.target.value)}
                    placeholder="Ex: Deixem seus comentários com o que acharam!"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:border-rose-500 focus:outline-none"
                  />
                </div>

                {/* Insertion Tool Ribbon */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-800">
                      Conteúdo em HTML do Capítulo
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Você pode colar HTML puro ou usar os botões abaixo:
                    </span>
                  </div>

                  {/* Fast insertion buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-100 rounded-t-lg border border-b-0 border-stone-300 text-xs">
                    <span className="text-[11px] font-semibold text-stone-600 mr-1">Inserir:</span>
                    
                    {variables.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => insertTextIntoChapter(`[${v.key}]`)}
                        className="px-2 py-0.5 bg-white border border-stone-300 rounded text-rose-700 hover:bg-rose-50 font-mono text-[11px] font-semibold"
                        title={`Inserir tag [${v.key}]`}
                      >
                        [{v.key}]
                      </button>
                    ))}

                    <span className="text-stone-300 mx-1">|</span>

                    <button
                      type="button"
                      onClick={() => insertTextIntoChapter('<p></p>')}
                      className="px-2 py-0.5 bg-white border border-stone-300 rounded hover:bg-stone-50 text-[11px]"
                    >
                      &lt;p&gt; Parágrafo
                    </button>

                    <button
                      type="button"
                      onClick={() => insertTextIntoChapter('<strong></strong>')}
                      className="px-2 py-0.5 bg-white border border-stone-300 rounded hover:bg-stone-50 text-[11px] font-bold"
                    >
                      Negrito
                    </button>

                    <button
                      type="button"
                      onClick={() => insertTextIntoChapter('<em></em>')}
                      className="px-2 py-0.5 bg-white border border-stone-300 rounded hover:bg-stone-50 text-[11px] italic"
                    >
                      Itálico
                    </button>

                    <button
                      type="button"
                      onClick={() => insertTextIntoChapter('— ')}
                      className="px-2 py-0.5 bg-white border border-stone-300 rounded hover:bg-stone-50 text-[11px]"
                    >
                      — Travessão
                    </button>

                    <span className="text-stone-300 mx-1">|</span>

                    <input
                      type="file"
                      ref={docxFileInputRef}
                      accept=".docx"
                      onChange={handleUploadDocxToChapter}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => docxFileInputRef.current?.click()}
                      className="px-2.5 py-0.5 bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold flex items-center gap-1 ml-auto"
                      title="Importar arquivo .docx do Word diretamente para este capítulo"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Carregar Word (.docx)</span>
                    </button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    id="chapterHtmlEditor"
                    rows={12}
                    value={currentChap.htmlContent}
                    onChange={(e) => handleUpdateCurrentChapter('htmlContent', e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-b-lg focus:border-rose-500 focus:outline-none leading-relaxed"
                    placeholder="<p>Escreva os parágrafos aqui. Use as tags [NOME], [PAR] etc...</p>"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-100 rounded-lg border border-stone-200">
                <span className="block text-xs font-bold text-stone-800 mb-2">
                  Teste o Capítulo {currentChap.number} com Nomes Personalizados:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {variables.map((v) => (
                    <div key={v.key}>
                      <label className="block text-[10px] font-semibold text-stone-500">
                        {v.label} [{v.key}]
                      </label>
                      <input
                        type="text"
                        value={previewInputs[v.key] || ''}
                        onChange={(e) => setPreviewInputs({ ...previewInputs, [v.key]: e.target.value })}
                        className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Story Rendering */}
              <div className="p-6 bg-stone-50 border border-stone-200 rounded-xl font-book text-sm leading-relaxed max-w-2xl mx-auto space-y-4">
                <div className="text-center pb-4 border-b border-stone-200">
                  <h3 className="font-display font-bold text-lg text-stone-900">{currentChap.title}</h3>
                  <span className="text-xs text-stone-500">Por {author || 'Autora'}</span>
                </div>
                <div
                  className="space-y-3 text-justify"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <footer className="px-5 py-3.5 border-t border-[#e2e6ee] bg-[#f8faff] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExportHtmlDirectly}
            className="px-3.5 py-2 text-xs font-bold text-[#152238] bg-white border border-[#d2dbe8] rounded-lg hover:bg-[#eef4fb] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#486da6]" />
            <span>Baixar HTML Estático Avulso</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-[#0e1015] rounded-lg cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveFanfic}
              className="px-5 py-2 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Fanfic no Portal</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};
