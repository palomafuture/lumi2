import React, { useState, useRef } from 'react';
import mammoth from 'mammoth';
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Download,
  Eye,
  Code2,
  RefreshCw,
  Wand2,
  SplitSquareVertical,
  Plus,
  Trash2,
  FileCheck,
  CheckCircle2,
  Play,
  Settings,
  HelpCircle,
  FileCode,
  Sliders
} from 'lucide-react';
import { InteractiveVariable, Chapter, Fanfic } from '../types/fanfic';
import { generateStandaloneHtml, triggerFileDownload } from '../utils/interactiveEngine';

interface WordToHtmlConverterProps {
  onSendToEditor: (initialData: Partial<Fanfic>) => void;
  onClose?: () => void;
}

interface ReplacementRule {
  originalText: string;
  tagKey: string;
  label: string;
  count: number;
  detectedRole?: string;
}

interface DetectedNameSuggestion {
  name: string;
  occurrences: number;
  suggestedTag: string;
  suggestedLabel: string;
  contextSnippet: string;
}

// Portuguese stop words to avoid mistaking common sentence starters or verbs for character names
const PORTUGUESE_STOP_WORDS = new Set([
  'Depois', 'Quando', 'Assim', 'Então', 'Hoje', 'Ontem', 'Amanhã', 'Sempre', 'Nunca',
  'Tudo', 'Nada', 'Você', 'Vocês', 'Eles', 'Elas', 'Nós', 'Capítulo', 'Não', 'Sim',
  'Mas', 'Porém', 'Contudo', 'Todavia', 'Embora', 'Enquanto', 'Durante', 'Segundo',
  'Primeiro', 'Muito', 'Pouco', 'Mais', 'Menos', 'Deus', 'Senhor', 'Senhora',
  'Ele', 'Ela', 'Meu', 'Minha', 'Seu', 'Sua', 'Nosso', 'Nossa', 'Aqui', 'Ali',
  'Lá', 'Onde', 'Quem', 'Qual', 'Como', 'Porque', 'Por', 'Para', 'Com', 'Sem',
  'Sob', 'Sobre', 'Entre', 'Ainda', 'Mesmo', 'Mesma', 'Algum', 'Alguma', 'Nenhum',
  'Nenhuma', 'Todo', 'Toda', 'Todos', 'Todas', 'Outro', 'Outra', 'Outros', 'Outras',
  'Aquele', 'Aquela', 'Aqueles', 'Aquelas', 'Esse', 'Essa', 'Esses', 'Essas',
  'Este', 'Esta', 'Estes', 'Estas', 'Logo', 'Já', 'Bem', 'Mal', 'Melhor', 'Pior',
  'Agora', 'Talvez', 'Caso', 'Pois', 'Ora', 'Quer', 'Ou', 'Nem', 'Tanto', 'Quanto',
  'Disse', 'Falou', 'Respondeu', 'Perguntou', 'Gritou', 'Olhou', 'Sorriu', 'Suspirou',
  'Passou', 'Entrou', 'Saiu', 'Voltou', 'Chegou', 'Ficou', 'Estava', 'Havia', 'Tinha',
  'Sua', 'Seus', 'Suas', 'Nossos', 'Nossas', 'Meus', 'Minhas'
]);

export const WordToHtmlConverter: React.FC<WordToHtmlConverterProps> = ({
  onSendToEditor,
  onClose,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [rawPastedText, setRawPastedText] = useState<string>('');
  const [convertedHtml, setConvertedHtml] = useState<string>('');
  const [suggestedInteractiveHtml, setSuggestedInteractiveHtml] = useState<string>('');
  const [storyTitle, setStoryTitle] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [converterCoverImage, setConverterCoverImage] = useState<string>('/src/assets/images/cover_a_melhor_vinganca_1792282797969.jpg');
  const [detectedChapters, setDetectedChapters] = useState<Chapter[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'preview' | 'html' | 'test'>('suggestions');

  // Test customizer state for live preview
  const [testNames, setTestNames] = useState<Record<string, string>>({
    NOME: 'Gabriela',
    PAR: 'Lucas',
    AMIGA: 'Juliana',
    CIDADE: 'Rio de Janeiro'
  });

  // Detected suggestions report
  const [detectedReport, setDetectedReport] = useState<DetectedNameSuggestion[]>([]);
  const [autoDetectionNotice, setAutoDetectionNotice] = useState<string>('');

  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Interactive replacement rules
  const [rules, setRules] = useState<ReplacementRule[]>([
    { originalText: '', tagKey: 'NOME', label: 'Seu Nome (Protagonista)', count: 0, detectedRole: 'Protagonista' },
    { originalText: '', tagKey: 'PAR', label: 'Seu Par Romântico / Crush', count: 0, detectedRole: 'Par Romântico' },
    { originalText: '', tagKey: 'AMIGA', label: 'Melhor Amiga / Aliada', count: 0, detectedRole: 'Amiga' },
    { originalText: '', tagKey: 'CIDADE', label: 'Cidade / Local', count: 0, detectedRole: 'Lugar' },
  ]);

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Intelligent Character and Name Reader in Portuguese text
  const analyzeAndSuggestNames = (cleanHtml: string) => {
    const plainText = cleanHtml.replace(/<[^>]+>/g, ' ');
    const suggestions: DetectedNameSuggestion[] = [];
    const frequencyMap: Record<string, { count: number; snippets: string[]; explicitTag?: string }> = {};

    // 1. Check for explicit fanfic tokens like (s/n), [Seu Nome], (nome), [par], etc.
    const explicitTokenRegexes = [
      { regex: /(?:\(|\[)\s*(?:s\/n|seu\s+nome|nome)\s*(?:\)|\])/gi, tag: 'NOME', label: 'Seu Nome (Protagonista)' },
      { regex: /(?:\(|\[)\s*(?:s\/p|seu\s+par|par|crush|par\s+rom[âa]ntico)\s*(?:\)|\])/gi, tag: 'PAR', label: 'Seu Par Romântico / Crush' },
      { regex: /(?:\(|\[)\s*(?:s\/a|sua\s+amiga|amiga|melhor\s+amiga)\s*(?:\)|\])/gi, tag: 'AMIGA', label: 'Melhor Amiga / Aliada' },
      { regex: /(?:\(|\[)\s*(?:sua\s+cidade|cidade)\s*(?:\)|\])/gi, tag: 'CIDADE', label: 'Cidade / Local' },
    ];

    explicitTokenRegexes.forEach(pattern => {
      const matches = plainText.match(pattern.regex);
      if (matches && matches.length > 0) {
        const tokenFound = matches[0];
        if (!frequencyMap[tokenFound]) {
          frequencyMap[tokenFound] = { count: 0, snippets: [], explicitTag: pattern.tag };
        }
        frequencyMap[tokenFound].count += matches.length;
      }
    });

    // 2. Portuguese character dialogue and interaction patterns
    // e.g., "disse Lucas", "perguntou Rodrigo", "falou Beatriz"
    const dialogueVerbRegex = /(?:disse|falou|perguntou|respondeu|gritou|sussurrou|murmurou|exclamou)\s+([A-ZÁÉÍÓÚÂÊÔÃÕ][a-záéíóúâêôãõç]+)/g;
    let match: RegExpExecArray | null;
    while ((match = dialogueVerbRegex.exec(plainText)) !== null) {
      const candidate = match[1];
      if (candidate.length > 2 && !PORTUGUESE_STOP_WORDS.has(candidate)) {
        if (!frequencyMap[candidate]) {
          frequencyMap[candidate] = { count: 0, snippets: [] };
        }
        frequencyMap[candidate].count += 3; // higher weight for speech tag
        if (frequencyMap[candidate].snippets.length < 2) {
          const start = Math.max(0, match.index - 20);
          const end = Math.min(plainText.length, match.index + 50);
          frequencyMap[candidate].snippets.push(plainText.substring(start, end).trim());
        }
      }
    }

    // e.g., "Lucas disse", "Rodrigo sorriu", "Beatriz olhou", "Camila suspirou"
    const subjectActionRegex = /([A-ZÁÉÍÓÚÂÊÔÃÕ][a-záéíóúâêôãõç]+)\s+(?:disse|sorriu|olhou|suspirou|abraçou|beijou|segurou|gritou|perguntou|respondeu|acenou|puxou|encarou|caminhou|levantou|sentou)/g;
    while ((match = subjectActionRegex.exec(plainText)) !== null) {
      const candidate = match[1];
      if (candidate.length > 2 && !PORTUGUESE_STOP_WORDS.has(candidate)) {
        if (!frequencyMap[candidate]) {
          frequencyMap[candidate] = { count: 0, snippets: [] };
        }
        frequencyMap[candidate].count += 3;
        if (frequencyMap[candidate].snippets.length < 2) {
          const start = Math.max(0, match.index - 20);
          const end = Math.min(plainText.length, match.index + 50);
          frequencyMap[candidate].snippets.push(plainText.substring(start, end).trim());
        }
      }
    }

    // e.g., "olhar de Rodrigo", "mãos de Beatriz", "abraço de Lucas"
    const possessiveRegex = /(?:olhar|mãos|beijo|abraço|voz|sorriso|toque|presença|cheiro)\s+de\s+([A-ZÁÉÍÓÚÂÊÔÃÕ][a-záéíóúâêôãõç]+)/g;
    while ((match = possessiveRegex.exec(plainText)) !== null) {
      const candidate = match[1];
      if (candidate.length > 2 && !PORTUGUESE_STOP_WORDS.has(candidate)) {
        if (!frequencyMap[candidate]) {
          frequencyMap[candidate] = { count: 0, snippets: [] };
        }
        frequencyMap[candidate].count += 2;
      }
    }

    // Also count total occurrences of each candidate across the entire document
    const candidateList = Object.keys(frequencyMap);
    candidateList.forEach(cand => {
      const allRegex = new RegExp(`\\b${escapeRegExp(cand)}\\b`, 'gi');
      const allOccurrences = (plainText.match(allRegex) || []).length;
      frequencyMap[cand].count = Math.max(frequencyMap[cand].count, allOccurrences);
    });

    // Sort by frequency descending
    const sorted = Object.entries(frequencyMap)
      .sort((a, b) => b[1].count - a[1].count)
      .filter(([name, data]) => data.count >= 2);

    // Build smart rules
    const newRules: ReplacementRule[] = [];
    const roles = [
      { tag: 'NOME', label: 'Seu Nome (Protagonista)', role: 'Protagonista' },
      { tag: 'PAR', label: 'Seu Par Romântico / Crush', role: 'Par Romântico' },
      { tag: 'AMIGA', label: 'Melhor Amiga / Aliada', role: 'Amiga' },
      { tag: 'CIDADE', label: 'Cidade / Local', role: 'Lugar' }
    ];

    sorted.slice(0, 4).forEach(([name, data], idx) => {
      const roleDef = roles[idx] || {
        tag: `PERSONAGEM_${idx + 1}`,
        label: `Personagem ${idx + 1}`,
        role: `Secundário`
      };

      suggestions.push({
        name,
        occurrences: data.count,
        suggestedTag: data.explicitTag || roleDef.tag,
        suggestedLabel: roleDef.label,
        contextSnippet: data.snippets[0] || `Encontrado ${data.count} vezes no texto.`
      });

      newRules.push({
        originalText: name,
        tagKey: data.explicitTag || roleDef.tag,
        label: roleDef.label,
        count: data.count,
        detectedRole: roleDef.role
      });
    });

    // If less than 4 were found, maintain empty slots
    while (newRules.length < 4) {
      const emptyRole = roles[newRules.length];
      newRules.push({
        originalText: '',
        tagKey: emptyRole.tag,
        label: emptyRole.label,
        count: 0,
        detectedRole: emptyRole.role
      });
    }

    setRules(newRules);
    setDetectedReport(suggestions);

    // Generate immediate suggested interactive HTML
    const transformed = generateInteractiveHtmlFromRules(cleanHtml, newRules);
    setSuggestedInteractiveHtml(transformed);

    if (suggestions.length > 0) {
      const summary = suggestions
        .slice(0, 2)
        .map(s => `"${s.name}" (${s.occurrences}x) sugerido como [${s.suggestedTag}]`)
        .join(' e ');
      setAutoDetectionNotice(`Nomes lidos com sucesso no arquivo! Identificamos ${summary}. O HTML interativo sugerido já foi gerado.`);
    } else {
      setAutoDetectionNotice('Arquivo lido. Nenhum nome óbvio detectado automaticamente; você pode preencher os nomes manualmente abaixo.');
    }
  };

  // Generate Interactive HTML with replacements
  const generateInteractiveHtmlFromRules = (html: string, currentRules: ReplacementRule[]): string => {
    let result = html;
    currentRules.forEach(rule => {
      if (rule.originalText.trim()) {
        const regex = new RegExp(`\\b${escapeRegExp(rule.originalText.trim())}\\b`, 'gi');
        result = result.replace(regex, `[${rule.tagKey.toUpperCase()}]`);
      }
    });
    return result;
  };

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
        setConverterCoverImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Parse .docx file using mammoth
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);
    const inferredTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    if (!storyTitle) setStoryTitle(inferredTitle);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      let html = result.value;

      html = cleanWordHtml(html);
      setConvertedHtml(html);
      splitIntoChapters(html);
      analyzeAndSuggestNames(html);
    } catch (err) {
      console.error('Erro ao ler arquivo Word:', err);
      alert('Não foi possível ler o arquivo .docx. Tente colar o texto diretamente na aba de colagem.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert pasted plain text or formatted text into clean HTML
  const handleConvertPastedText = () => {
    if (!rawPastedText.trim()) return;

    setIsProcessing(true);
    let html = rawPastedText
      .replace(/\r\n/g, '\n')
      .replace(/^[-–—]\s*/gm, '— ')
      .split(/\n\s*\n/)
      .map(p => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        if (/^#+\s*(.+)/.test(trimmed)) {
          const title = trimmed.replace(/^#+\s*/, '');
          return `<h2>${title}</h2>`;
        }
        return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
      })
      .filter(Boolean)
      .join('\n\n');

    html = cleanWordHtml(html);
    setConvertedHtml(html);
    setFileName('Texto Inserido');
    if (!storyTitle) setStoryTitle('Minha História');
    splitIntoChapters(html);
    analyzeAndSuggestNames(html);
    setIsProcessing(false);
  };

  // Clean HTML from Word artifacts
  const cleanWordHtml = (html: string): string => {
    return html
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')
      .replace(/<font[^>]*>/gi, '')
      .replace(/<\/font>/gi, '')
      .replace(/<p>\s*[-–]\s*/gi, '<p>— ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/<p>\s*<\/p>/gi, '')
      .replace(/<p><br\s*\/?><\/p>/gi, '');
  };

  // Split HTML into chapters
  const splitIntoChapters = (html: string) => {
    const chapterRegex = /(?:<h[1-3][^>]*>(.*?)<\/h[1-3]>|<p><strong>\s*(Cap[íi]tulo\s*\d+[^<]*)\s*<\/strong><\/p>|<p>\s*(Cap[íi]tulo\s*\d+[^<]*)\s*<\/p>)/gi;
    const pieces = html.split(chapterRegex);

    if (pieces.length > 2) {
      const chaptersList: Chapter[] = [];
      let chapNum = 1;

      for (let i = 1; i < pieces.length; i += 2) {
        const title = (pieces[i] || `Capítulo ${chapNum}`).trim();
        const content = pieces[i + 1] ? pieces[i + 1].trim() : '';

        if (content) {
          chaptersList.push({
            id: `cap-${chapNum}`,
            number: chapNum,
            title: title.startsWith('Capítulo') ? title : `Capítulo ${chapNum}: ${title}`,
            htmlContent: content,
            wordCount: content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
            publishedAt: new Date().toISOString().split('T')[0]
          });
          chapNum++;
        }
      }

      if (chaptersList.length > 0) {
        setDetectedChapters(chaptersList);
        return;
      }
    }

    setDetectedChapters([
      {
        id: 'cap-1',
        number: 1,
        title: 'Capítulo 1: Início',
        htmlContent: html,
        wordCount: html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
        publishedAt: new Date().toISOString().split('T')[0]
      }
    ]);
  };

  // Manual update of a rule
  const handleUpdateRuleOriginal = (index: number, val: string) => {
    const updated = [...rules];
    updated[index].originalText = val;
    if (val.trim() && convertedHtml) {
      const regex = new RegExp(`\\b${escapeRegExp(val.trim())}\\b`, 'gi');
      const matches = convertedHtml.match(regex);
      updated[index].count = matches ? matches.length : 0;
    } else {
      updated[index].count = 0;
    }
    setRules(updated);

    // Re-generate suggested HTML
    const newHtml = generateInteractiveHtmlFromRules(convertedHtml, updated);
    setSuggestedInteractiveHtml(newHtml);
  };

  const handleAddCustomRule = () => {
    const nextNum = rules.length + 1;
    setRules([
      ...rules,
      {
        originalText: '',
        tagKey: `VAR_${nextNum}`,
        label: `Tag [VAR_${nextNum}]`,
        count: 0,
        detectedRole: 'Personalizado'
      }
    ]);
  };

  const handleRemoveRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    setRules(updated);
    if (convertedHtml) {
      setSuggestedInteractiveHtml(generateInteractiveHtmlFromRules(convertedHtml, updated));
    }
  };

  // Apply all replacements explicitly
  const handleApplyTransformations = () => {
    if (!convertedHtml) return;
    const updated = generateInteractiveHtmlFromRules(convertedHtml, rules);
    setSuggestedInteractiveHtml(updated);
    splitIntoChapters(updated);
    setActiveTab('html');
    alert('Transformação concluída! Os nomes foram substituídos e o HTML interativo foi gerado abaixo.');
  };

  // Send directly to the full Story Editor
  const handleExportToEditor = () => {
    const variables: InteractiveVariable[] = rules
      .filter(r => r.originalText.trim())
      .map(r => ({
        key: r.tagKey.toUpperCase(),
        label: r.label,
        defaultValue: r.originalText.trim(),
        placeholder: `Ex: ${r.originalText.trim()}`,
        description: `Substituto para ${r.originalText.trim()}`
      }));

    if (variables.length === 0) {
      variables.push(
        { key: 'NOME', label: 'Seu Nome', defaultValue: 'Beatriz', placeholder: 'Seu nome' },
        { key: 'PAR', label: 'Seu Par', defaultValue: 'Rodrigo', placeholder: 'Seu crush' }
      );
    }

    onSendToEditor({
      title: storyTitle || 'História Importada do Word',
      author: authorName || 'Autora',
      summary: 'História interativa convertida com sucesso do Word para HTML no Lumiere.ink.',
      fandom: 'Originais',
      coverImage: converterCoverImage,
      variables,
      chapters: detectedChapters.length > 0 ? detectedChapters : [
        {
          id: 'cap-1',
          number: 1,
          title: 'Capítulo 1',
          htmlContent: suggestedInteractiveHtml || convertedHtml,
          wordCount: (suggestedInteractiveHtml || convertedHtml).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
        }
      ]
    });
  };

  // Download standalone HTML package
  const handleDownloadStandaloneHtml = () => {
    const content = suggestedInteractiveHtml || convertedHtml;
    if (!content) return;

    const mockFanfic: Fanfic = {
      id: 'fic-export-' + Date.now(),
      slug: (storyTitle || 'minha-fanfic').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: storyTitle || 'Minha Fanfic Interativa',
      author: authorName || 'Autora',
      summary: 'História interativa exportada pelo Lumiere.ink com personalização completa de personagens.',
      fandom: 'Originais',
      genres: ['Romance', 'Drama'],
      rating: 'Livre',
      status: 'Concluída',
      coverImage: converterCoverImage,
      variables: rules.filter(r => r.originalText.trim()).map(r => ({
        key: r.tagKey.toUpperCase(),
        label: r.label,
        defaultValue: r.originalText.trim(),
        placeholder: r.originalText.trim()
      })),
      chapters: detectedChapters.length > 0 ? detectedChapters : [
        {
          id: 'cap-1',
          number: 1,
          title: 'Capítulo 1',
          htmlContent: content,
          wordCount: content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
        }
      ],
      views: 1,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    const standalone = generateStandaloneHtml(mockFanfic);
    triggerFileDownload(standalone, `${mockFanfic.slug}-interativa.html`, 'text/html');
  };

  // Test live render with replacement
  const getTestRenderedContent = () => {
    let content = suggestedInteractiveHtml || convertedHtml;
    if (!content) return '<p class="text-stone-400 italic">Nenhum texto carregado ainda.</p>';

    rules.forEach(rule => {
      const key = rule.tagKey.toUpperCase();
      const userVal = testNames[key] || rule.originalText || key;
      const tagRegex = new RegExp(`\\[${escapeRegExp(key)}\\]`, 'gi');
      content = content.replace(
        tagRegex,
        `<span class="bg-[#fdf0f4] text-[#9e2847] px-1.5 py-0.5 rounded font-bold border border-[#f5ccd7]">${userVal}</span>`
      );
    });

    return content;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Editorial Header */}
      <div className="border-b border-[#e2e6ee] pb-6 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#ce5272] mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Assistente de Publicação Lumiere.ink</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-[#0e1015] tracking-tight">
          Conversor Word (.docx) para HTML Interativo
        </h1>
        <p className="mt-2 text-sm text-[#333a4a] max-w-3xl leading-relaxed">
          Envie o arquivo da sua história do Word. Nosso motor <strong>lê os nomes dos personagens automaticamente</strong>, detecta protagonista e par romântico, e gera o HTML interativo pronto para ser publicado ou baixado de graça.
        </p>
      </div>

      {/* Auto-Detection Banner Alert */}
      {autoDetectionNotice && (
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-[#fdf0f4] to-[#eef4fb] border border-[#f5ccd7] flex items-start justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ce5272] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#9e2847] uppercase tracking-wide">
                Leitura Automática de Nomes Concluída
              </h4>
              <p className="text-xs text-[#152238] mt-0.5 leading-relaxed">
                {autoDetectionNotice}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('html')}
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            Ver HTML Pronto
          </button>
        </div>
      )}

      {/* Upload & Basic Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Box 1: File Uploader */}
        <div className="lg:col-span-2 space-y-5">
          
          <div className="bg-white border-2 border-dashed border-[#b8cee8] hover:border-[#ce5272] transition-colors rounded-2xl p-8 text-center bg-[#f8faff]/50">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white border border-[#d2dbe8] shadow-2xs flex items-center justify-center text-[#ce5272]">
              <FileText className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-[#0e1015]">
              {fileName ? fileName : 'Arraste ou selecione seu arquivo do Word (.docx)'}
            </h3>
            <p className="text-xs text-[#486da6] mt-1">
              O sistema lê os capítulos, detecta nomes e gera as tags interativas instantaneamente
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{isProcessing ? 'Lendo Arquivo e Detectando Nomes...' : 'Escolher Arquivo Word (.docx)'}</span>
              </button>
            </div>
          </div>

          {/* Alternative: Paste Plain Text */}
          <div className="bg-white border border-[#dbe2ee] rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#152238] flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-[#486da6]" />
                <span>Ou Cole o Texto Diretamente:</span>
              </span>
              <span className="text-[11px] text-stone-500">Aceita formatação e travessões</span>
            </div>

            <textarea
              rows={3}
              value={rawPastedText}
              onChange={(e) => setRawPastedText(e.target.value)}
              placeholder="Cole aqui o texto da sua história caso não tenha o arquivo .docx..."
              className="w-full px-3 py-2 bg-stone-50 border border-[#d2dbe8] rounded-lg text-xs outline-none focus:border-[#ce5272] text-[#0e1015]"
            />

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleConvertPastedText}
                disabled={!rawPastedText.trim() || isProcessing}
                className="px-4 py-1.5 text-xs font-bold text-[#27426e] bg-[#eef4fb] hover:bg-[#dce9f8] border border-[#b8cee8] rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Converter e Ler Nomes</span>
              </button>
            </div>
          </div>

        </div>

        {/* Box 2: Story Metadata & Cover */}
        <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-[#152238] uppercase tracking-wider border-b border-[#e2e6ee] pb-2">
            Dados da Fanfic
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#152238] mb-1">
              Título da História
            </label>
            <input
              type="text"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="Ex: A Melhor Vingança"
              className="w-full px-3 py-2 bg-stone-50 border border-[#d2dbe8] rounded-lg text-xs outline-none focus:border-[#ce5272] font-semibold text-[#0e1015]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#152238] mb-1">
              Autora / Pseudônimo
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Ex: Joy, Mayara, Beatriz"
              className="w-full px-3 py-2 bg-stone-50 border border-[#d2dbe8] rounded-lg text-xs outline-none focus:border-[#ce5272] text-[#0e1015]"
            />
          </div>

          {/* Cover upload */}
          <div>
            <label className="block text-xs font-bold text-[#152238] mb-1">
              Capa da Fanfic
            </label>
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <div className="w-14 h-18 rounded-lg overflow-hidden border border-[#d2dbe8] bg-stone-100 shrink-0">
                <img
                  src={converterCoverImage}
                  alt="Capa"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs text-[#27426e] bg-[#eef4fb] hover:bg-[#dce9f8] border border-[#b8cee8] rounded-lg font-bold transition-colors cursor-pointer"
              >
                Trocar Capa
              </button>
            </div>
          </div>

          {/* Quick summary of detected chapters */}
          <div className="pt-2 border-t border-[#e2e6ee] text-xs text-stone-500 space-y-1">
            <div className="flex justify-between">
              <span>Capítulos detectados:</span>
              <strong className="text-[#0e1015]">{detectedChapters.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Total de palavras:</span>
              <strong className="text-[#0e1015]">
                {detectedChapters.reduce((acc, c) => acc + (c.wordCount || 0), 0).toLocaleString()}
              </strong>
            </div>
          </div>

        </div>

      </div>

      {/* Main Tabs: Suggestions vs Preview vs HTML vs Test */}
      {convertedHtml && (
        <div className="space-y-6">
          
          {/* Navigation Bar */}
          <div className="flex items-center justify-between border-b border-[#e2e6ee] bg-white rounded-t-xl px-4 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'suggestions'
                    ? 'border-[#ce5272] text-[#ce5272]'
                    : 'border-transparent text-stone-500 hover:text-[#0e1015]'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Nomes Detectados & Regras ({rules.filter(r => r.originalText.trim()).length})</span>
              </button>

              <button
                onClick={() => setActiveTab('html')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'html'
                    ? 'border-[#ce5272] text-[#ce5272]'
                    : 'border-transparent text-stone-500 hover:text-[#0e1015]'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>HTML Interativo Sugerido</span>
              </button>

              <button
                onClick={() => setActiveTab('test')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'test'
                    ? 'border-[#ce5272] text-[#ce5272]'
                    : 'border-transparent text-stone-500 hover:text-[#0e1015]'
                }`}
              >
                <Play className="w-4 h-4 text-[#486da6]" />
                <span>Testar Personalização Ao Vivo</span>
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
                <span>Visualizar Texto Limpo</span>
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 pb-2">
              <button
                onClick={handleDownloadStandaloneHtml}
                className="px-3 py-1.5 text-xs font-bold text-[#152238] bg-[#f8faff] hover:bg-[#eef4fb] border border-[#d2dbe8] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Baixar pacote HTML autônomo para hospedagem gratuita no GitHub Pages ou Vercel"
              >
                <Download className="w-3.5 h-3.5 text-[#486da6]" />
                <span>Baixar .html</span>
              </button>

              <button
                onClick={handleExportToEditor}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Publicar no Lumiere.ink</span>
              </button>
            </div>
          </div>

          {/* TAB 1: SUGGESTED NAMES & RULES */}
          {activeTab === 'suggestions' && (
            <div className="bg-white border border-[#dbe2ee] rounded-b-xl p-6 sm:p-8 shadow-xs space-y-6">
              
              <div>
                <h3 className="text-base font-black text-[#0e1015] font-sans">
                  Sugestão Automática de Nomes e Tags Interativas
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  O sistema identificou os seguintes nomes no seu documento. Você pode ajustar ou trocar qualquer um deles:
                </p>
              </div>

              {/* Detected Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#dbe2ee] bg-[#f8faff] space-y-3 relative hover:border-[#ce5272] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#fdf0f4] text-[#9e2847] border border-[#f5ccd7]">
                        [{rule.tagKey}]
                      </span>
                      {rule.count > 0 && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {rule.count} ocorrências
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        {rule.label}
                      </label>
                      <input
                        type="text"
                        value={rule.originalText}
                        onChange={(e) => handleUpdateRuleOriginal(idx, e.target.value)}
                        placeholder={`Nome original no texto`}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded-lg text-xs font-bold text-[#0e1015] outline-none focus:border-[#ce5272]"
                      />
                    </div>

                    <p className="text-[11px] text-stone-400">
                      Substituirá todas as vezes que o nome acima aparecer por <strong className="text-[#ce5272]">[{rule.tagKey}]</strong>.
                    </p>

                    {idx >= 4 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(idx)}
                        className="absolute top-2 right-2 p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Tag & Apply Buttons */}
              <div className="pt-4 border-t border-[#e2e6ee] flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleAddCustomRule}
                  className="px-3.5 py-2 text-xs font-bold text-[#27426e] bg-[#eef4fb] hover:bg-[#dce9f8] border border-[#b8cee8] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Mais uma Tag de Personagem</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleApplyTransformations}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aplicar e Gerar HTML Interativo</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SUGGESTED INTERACTIVE HTML (Ready to Publish / Embed) */}
          {activeTab === 'html' && (
            <div className="bg-white border border-[#dbe2ee] rounded-b-xl p-6 sm:p-8 shadow-xs space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e6ee] pb-4">
                <div>
                  <h3 className="text-base font-black text-[#0e1015] flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#ce5272]" />
                    <span>Código HTML Interativo Pronto</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Este é o HTML formatado com as tags interativas substituídas. Pode ser copiado ou baixado para rodar em qualquer hospedagem estática gratuita.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(suggestedInteractiveHtml || convertedHtml);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-[#152238] bg-[#f8faff] hover:bg-[#eef4fb] border border-[#d2dbe8] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar HTML'}</span>
                  </button>

                  <button
                    onClick={handleDownloadStandaloneHtml}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#152238] hover:bg-[#203456] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Arquivo .html</span>
                  </button>
                </div>
              </div>

              {/* Code viewer */}
              <div className="relative">
                <textarea
                  readOnly
                  rows={14}
                  value={suggestedInteractiveHtml || convertedHtml}
                  className="w-full p-4 font-mono text-xs bg-stone-900 text-stone-100 rounded-xl leading-relaxed outline-none border border-stone-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                <span>Dica: As tags como <strong className="text-[#ce5272]">[NOME]</strong> e <strong className="text-[#ce5272]">[PAR]</strong> são substituídas automaticamente quando o leitor entra com o nome dele no Lumiere.ink.</span>
                <button
                  onClick={handleExportToEditor}
                  className="font-bold text-[#ce5272] hover:underline cursor-pointer"
                >
                  Abrir no Estúdio Completo &rarr;
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: LIVE PERSONALIZATION TESTER */}
          {activeTab === 'test' && (
            <div className="bg-white border border-[#dbe2ee] rounded-b-xl p-6 sm:p-8 shadow-xs space-y-6">
              
              <div className="border-b border-[#e2e6ee] pb-4">
                <h3 className="text-base font-black text-[#0e1015]">
                  Teste a Leitura Interativa com Nomes Personalizados
                </h3>
                <p className="text-xs text-stone-500">
                  Digite nomes de teste abaixo e veja em tempo real como o texto da sua história se adapta para as leitoras:
                </p>
              </div>

              {/* Simulator inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8faff] p-4 rounded-xl border border-[#dbe2ee]">
                {rules.filter(r => r.originalText.trim()).map((rule) => {
                  const key = rule.tagKey.toUpperCase();
                  return (
                    <div key={key}>
                      <label className="block text-[11px] font-bold text-[#152238] mb-1">
                        {rule.label}
                      </label>
                      <input
                        type="text"
                        value={testNames[key] || ''}
                        onChange={(e) => setTestNames(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={rule.originalText}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#d2dbe8] rounded text-xs font-bold text-[#ce5272] outline-none focus:border-[#ce5272]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Rendered Preview */}
              <div className="border border-[#e2e6ee] rounded-xl p-6 bg-white min-h-[250px]">
                <div
                  className="prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed text-[#14171f]"
                  dangerouslySetInnerHTML={{ __html: getTestRenderedContent() }}
                />
              </div>

            </div>
          )}

          {/* TAB 4: ORIGINAL CLEANED PREVIEW */}
          {activeTab === 'preview' && (
            <div className="bg-white border border-[#dbe2ee] rounded-b-xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="border-b border-[#e2e6ee] pb-3">
                <h3 className="text-sm font-bold text-[#0e1015]">
                  Visualização do Texto Original Formatado
                </h3>
              </div>

              <div
                className="prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed text-[#14171f] p-4 bg-stone-50 rounded-xl max-h-[400px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: convertedHtml }}
              />
            </div>
          )}

        </div>
      )}

    </div>
  );
};
