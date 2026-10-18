import React from 'react';
import {
  Globe,
  Github,
  Cloud,
  FileCode,
  Download,
  FolderTree,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Server
} from 'lucide-react';
import { Fanfic } from '../types/fanfic';
import { generateStandaloneHtml, triggerFileDownload } from '../utils/interactiveEngine';

interface StaticHostingGuideProps {
  fanfics: Fanfic[];
  onBackToHome: () => void;
}

export const StaticHostingGuide: React.FC<StaticHostingGuideProps> = ({
  fanfics,
  onBackToHome
}) => {
  const handleExportAllStories = () => {
    fanfics.forEach((fic, i) => {
      setTimeout(() => {
        const html = generateStandaloneHtml(fic);
        triggerFileDownload(html, `${fic.slug || 'fanfic'}.html`, 'text/html');
      }, i * 300);
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Header */}
      <div className="border-b border-[#e2e6ee] pb-6 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#ce5272] uppercase">
          <Globe className="w-4 h-4 text-[#486da6]" />
          <span>Guia Completo de Hospedagem Estática Gratuita · Lumiere.ink</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-[#0e1015] mt-2">
          Como Hospedar Seu Site e Suas Fanfics Sem Pagar Nada
        </h1>
        <p className="text-sm text-[#2c3342] mt-2 leading-relaxed max-w-3xl">
          No <strong>Lumiere.ink</strong>, suas histórias interativas em HTML são acessadas diretamente no navegador, permitindo hospedar todo o seu acervo com <strong>custo zero</strong>, alta velocidade e certificado SSL incluso.
        </p>

        {/* Action button */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleExportAllStories}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Todas as Histórias em HTML Autônomo ({fanfics.length})</span>
          </button>

          <button
            onClick={onBackToHome}
            className="px-4 py-2 text-xs font-bold text-[#152238] bg-[#f0f4fa] hover:bg-[#e2ecf8] border border-[#d2dbe8] rounded-lg transition-colors cursor-pointer"
          >
            Voltar ao Início
          </button>
        </div>
      </div>

      {/* 3 Main Hosting Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* GitHub Pages */}
        <div className="bg-white border border-[#dbe2ee] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#0e1015] text-white flex items-center justify-center mb-4">
              <Github className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0e1015] mb-1">GitHub Pages</h3>
            <span className="text-[11px] font-bold text-[#27426e] bg-[#eef4fb] border border-[#b8cee8] px-2 py-0.5 rounded inline-block mb-3">
              100% Gratuito Para Sempre
            </span>
            <p className="text-xs text-[#2c3342] leading-relaxed">
              O padrão da indústria. Permite ter um site como <code className="bg-[#f0f4fa] px-1 py-0.5 rounded font-mono text-[#152238]">seunome.github.io</code> com suporte a domínio próprio gratuito (ex: <code className="bg-[#f0f4fa] px-1 py-0.5 rounded font-mono text-[#152238]">suasfanfics.com.br</code>).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0f3f8] text-xs text-stone-500">
            <strong className="text-[#152238]">Melhor para:</strong> Controle de versão, organização por pastas e estabilidade máxima.
          </div>
        </div>

        {/* Netlify Drop */}
        <div className="bg-white border border-[#dbe2ee] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#486da6] text-white flex items-center justify-center mb-4">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0e1015] mb-1">Netlify Drop</h3>
            <span className="text-[11px] font-bold text-[#9e2847] bg-[#fdf0f4] border border-[#eca8b8] px-2 py-0.5 rounded inline-block mb-3">
              Sem Linha de Comando (Arrastar & Soltar)
            </span>
            <p className="text-xs text-[#2c3342] leading-relaxed">
              A maneira mais rápida do mundo. Basta arrastar a pasta com seus arquivos <code className="bg-[#f0f4fa] px-1 py-0.5 rounded font-mono text-[#152238]">.html</code> para o site do Netlify e sua fanfic já está online em 10 segundos.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0f3f8] text-xs text-stone-500">
            <strong className="text-[#152238]">Melhor para:</strong> Autores que não querem mexer com Git e preferem arrastar pastas prontas.
          </div>
        </div>

        {/* Vercel */}
        <div className="bg-white border border-[#dbe2ee] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#152238] text-white flex items-center justify-center mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0e1015] mb-1">Vercel</h3>
            <span className="text-[11px] font-bold text-[#27426e] bg-[#eef4fb] border border-[#b8cee8] px-2 py-0.5 rounded inline-block mb-3">
              Ultra Rápido com CDN Global
            </span>
            <p className="text-xs text-[#2c3342] leading-relaxed">
              Hospeda tanto este portal completo (React/Vite) quanto arquivos HTML estáticos com carregamento instantâneo no Brasil e no mundo.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0f3f8] text-xs text-stone-500">
            <strong className="text-[#152238]">Melhor para:</strong> Publicação contínua sincronizada com repositórios Git.
          </div>
        </div>

      </div>

      {/* Structure Guide: How Lumiere.ink organizes files */}
      <div className="bg-white border border-[#dbe2ee] rounded-xl p-6 sm:p-8 mb-10 shadow-xs">
        <h2 className="text-xl font-display font-bold text-[#0e1015] mb-2 flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-[#ce5272]" />
          <span>Estrutura de Pastas e Arquivos Estáticos</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#2c3342] mb-6 leading-relaxed">
          As histórias podem ser organizadas por pastas ou ordem alfabética (<code className="font-mono bg-[#fdf0f4] text-[#9e2847] border border-[#eca8b8] px-1.5 py-0.5 rounded">lumiere.ink/fanfics/a/amelhorvinganca.html</code>). Veja como estruturar a sua pasta:
        </p>

        {/* Code representation */}
        <div className="bg-[#0e1015] text-stone-100 rounded-xl p-5 font-mono text-xs overflow-x-auto leading-relaxed mb-6 border border-[#1c2230]">
          <p className="text-stone-400"># Sua pasta de hospedagem estática gratuita:</p>
          <p className="text-[#e07a94] font-bold">meu-site-de-fanfics/</p>
          <p>├── index.html <span className="text-stone-400">← Portal principal com a lista de fanfics</span></p>
          <p>└── fanfics/</p>
          <p>    ├── a/</p>
          <p>    │   └── amelhorvinganca.html <span className="text-[#b8cee8]">← Arquivo HTML interativo autônomo!</span></p>
          <p>    ├── r/</p>
          <p>    │   └── ritmodocoracao.html</p>
          <p>    └── h/</p>
          <p>        └── herdeirasombria.html</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#f8faff] border border-[#d2dbe8] rounded-xl">
            <h4 className="font-bold text-[#0e1015] mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#ce5272]" />
              <span>Por que o HTML do Lumiere.ink funciona sozinho?</span>
            </h4>
            <p className="text-stone-600 leading-relaxed">
              O botão <strong>"Baixar HTML"</strong> deste site gera um arquivo completo com todo o código JavaScript embutido, CSS refinado e os formulários interativos. Ele roda mesmo offline e não depende de nenhum banco de dados ou servidor backend!
            </p>
          </div>

          <div className="p-4 bg-[#f8faff] border border-[#d2dbe8] rounded-xl">
            <h4 className="font-bold text-[#0e1015] mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#486da6]" />
              <span>Como as leitoras salvam os nomes?</span>
            </h4>
            <p className="text-stone-600 leading-relaxed">
              O arquivo HTML gravado utiliza o <code className="font-mono bg-white border border-[#d2dbe8] px-1 rounded">localStorage</code> do navegador da própria leitora. Quando ela fecha a aba e volta amanhã, o nome dela e do par continuam preenchidos certinho!
            </p>
          </div>
        </div>
      </div>

      {/* Step by Step on GitHub Pages */}
      <div className="bg-[#f8faff] border border-[#dbe2ee] rounded-xl p-6 sm:p-8">
        <h3 className="text-lg font-display font-bold text-[#0e1015] mb-4">
          Passo a Passo Rápido: Publicando no GitHub Pages em 5 Minutos
        </h3>

        <ol className="space-y-4 text-xs sm:text-sm text-[#2c3342]">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#ce5272] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              1
            </span>
            <div>
              <strong>Crie uma conta gratuita no GitHub:</strong>
              <p className="text-xs text-stone-600 mt-0.5">Acesse github.com e crie um novo repositório público chamado <code className="font-mono bg-white border border-[#d2dbe8] px-1 rounded">fanfics-interativas</code>.</p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#ce5272] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              2
            </span>
            <div>
              <strong>Faça o upload dos seus arquivos HTML:</strong>
              <p className="text-xs text-stone-600 mt-0.5">Você pode clicar em <em>"Add file" → "Upload files"</em> e arrastar o <code className="font-mono bg-white border border-[#d2dbe8] px-1 rounded">index.html</code> e a pasta <code className="font-mono bg-white border border-[#d2dbe8] px-1 rounded">fanfics/</code> gerada aqui.</p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#ce5272] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              3
            </span>
            <div>
              <strong>Ative o GitHub Pages nas configurações:</strong>
              <p className="text-xs text-stone-600 mt-0.5">No repositório, clique em <strong>Settings</strong> → <strong>Pages</strong> → Em <em>Branch</em> selecione <strong>main</strong> e clique em <strong>Save</strong>.</p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#486da6] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              ✓
            </span>
            <div>
              <strong>Pronto! Seu site estará no ar:</strong>
              <p className="text-xs text-stone-600 mt-0.5">Qualquer leitora poderá acessar seus links interativos em <code className="font-mono bg-white border border-[#d2dbe8] px-1 rounded">https://seu-usuario.github.io/fanfics/a/amelhorvinganca.html</code>!</p>
            </div>
          </li>
        </ol>
      </div>

    </div>
  );
};
