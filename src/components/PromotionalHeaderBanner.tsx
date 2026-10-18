import React, { useState } from 'react';
import { HeaderBannerConfig, Fanfic } from '../types/fanfic';
import {
  Sparkles,
  ExternalLink,
  BookOpen,
  Sliders,
  X,
  Megaphone,
  Upload,
  Check,
  DollarSign
} from 'lucide-react';

interface PromotionalHeaderBannerProps {
  config: HeaderBannerConfig;
  fanfics: Fanfic[];
  onUpdateConfig: (updated: HeaderBannerConfig) => void;
  onSelectStory: (fanfic: Fanfic) => void;
}

export const PromotionalHeaderBanner: React.FC<PromotionalHeaderBannerProps> = ({
  config,
  fanfics,
  onUpdateConfig,
  onSelectStory
}) => {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Form states for managing the banner
  const [formType, setFormType] = useState<'featured_fanfic' | 'advertiser'>(config.type);
  const [formTitle, setFormTitle] = useState(config.title);
  const [formSubtitle, setFormSubtitle] = useState(config.subtitle);
  const [formBadge, setFormBadge] = useState(config.badge);
  const [formCtaText, setFormCtaText] = useState(config.ctaText);
  const [formCtaUrl, setFormCtaUrl] = useState(config.ctaUrl || '');
  const [formFanficId, setFormFanficId] = useState(config.fanficId || (fanfics[0]?.id || ''));
  const [formImageUrl, setFormImageUrl] = useState(config.imageUrl || '');
  const [formAdvertiser, setFormAdvertiser] = useState(config.advertiserName || '');

  if (!config.isActive || isDismissed) {
    return (
      <div className="bg-[#f8faff] border-b border-[#e2e6ee] px-4 py-1.5 flex items-center justify-between text-[11px] text-[#486da6]">
        <span>Banner de topo recolhido.</span>
        <button
          onClick={() => {
            setIsDismissed(false);
            setIsManageModalOpen(true);
          }}
          className="text-[#ce5272] hover:text-[#9e2847] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Sliders className="w-3 h-3" />
          <span>Configurar Banner / Anunciante</span>
        </button>
      </div>
    );
  }

  const selectedFic = fanfics.find(f => f.id === config.fanficId) || fanfics[0];

  const handleCtaClick = () => {
    if (config.type === 'featured_fanfic' && selectedFic) {
      onSelectStory(selectedFic);
    } else if (config.ctaUrl) {
      if (config.ctaUrl.startsWith('http')) {
        window.open(config.ctaUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = config.ctaUrl;
      }
    }
  };

  const handleSaveConfig = () => {
    const updated: HeaderBannerConfig = {
      ...config,
      type: formType,
      title: formTitle,
      subtitle: formSubtitle,
      badge: formBadge,
      ctaText: formCtaText,
      ctaUrl: formCtaUrl,
      fanficId: formFanficId,
      imageUrl: formImageUrl,
      advertiserName: formAdvertiser,
      isActive: true
    };
    onUpdateConfig(updated);
    setIsManageModalOpen(false);
  };

  const handleCustomBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Top Header Billboard Banner (Noir + Rose Quartz + Serenity) */}
      <section className="bg-[#0e1015] text-stone-100 border-b border-[#1c2230] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 min-h-[58px]">
          
          {/* Left: Badge + Thumbnail + Copy */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Tag Badge in Rose Quartz */}
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#ce5272] text-white shrink-0 shadow-2xs">
              {config.badge}
            </span>

            {/* Thumbnail Preview */}
            {config.type === 'featured_fanfic' && selectedFic ? (
              <div className="w-8 h-10 rounded overflow-hidden bg-[#181a22] shrink-0 border border-[#486da6]/50 hidden sm:block">
                <img
                  src={selectedFic.coverImage}
                  alt={selectedFic.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : config.imageUrl ? (
              <div className="w-10 h-8 rounded overflow-hidden bg-[#181a22] shrink-0 border border-[#486da6]/50 hidden sm:block">
                <img
                  src={config.imageUrl}
                  alt={config.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-[#152238] text-[#b8cee8] flex items-center justify-center shrink-0 border border-[#486da6]/40 hidden sm:flex">
                <Megaphone className="w-4 h-4 text-[#e07a94]" />
              </div>
            )}

            {/* Content */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate leading-snug">
                  {config.type === 'featured_fanfic' && selectedFic ? selectedFic.title : config.title}
                </h4>
                {config.advertiserName && (
                  <span className="text-[10px] text-[#b8cee8] hidden md:inline">
                    · Por {config.advertiserName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-300 line-clamp-1 opacity-90 font-book">
                {config.type === 'featured_fanfic' && selectedFic ? selectedFic.summary : config.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleCtaClick}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#0e1015] bg-white hover:bg-[#fdf0f4] hover:text-[#9e2847] rounded-md transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {config.type === 'featured_fanfic' ? (
                <BookOpen className="w-3.5 h-3.5 text-[#ce5272]" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5 text-[#486da6]" />
              )}
              <span>{config.ctaText}</span>
            </button>

            {/* Settings button for the portal owner */}
            <button
              onClick={() => setIsManageModalOpen(true)}
              title="Gerenciar Banner de Destaque / Espaço de Anunciantes"
              className="p-1.5 text-stone-400 hover:text-white hover:bg-[#181a22] rounded transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Dismiss button */}
            <button
              onClick={() => setIsDismissed(true)}
              title="Fechar banner"
              className="p-1.5 text-stone-400 hover:text-white rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Management Modal for Site Owner */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0e1015]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dbe2ee] rounded-xl max-w-lg w-full p-6 shadow-2xl my-auto text-[#14171f]">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e6ee] mb-5">
              <div>
                <h3 className="text-base font-display font-bold flex items-center gap-2 text-[#0e1015]">
                  <Megaphone className="w-5 h-5 text-[#ce5272]" />
                  <span>Gerenciar Banner Superior (Header)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Configure o espaço publicitário para monetizar ou destacar fanfics no topo do Lumiere.ink.
                </p>
              </div>

              <button
                onClick={() => setIsManageModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-[#152238] mb-1.5">
                  Tipo de Conteúdo do Banner
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('featured_fanfic');
                      setFormBadge('Destaque da Semana');
                      setFormCtaText('Ler História');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      formType === 'featured_fanfic'
                        ? 'border-[#ce5272] bg-[#fdf0f4] text-[#9e2847] font-semibold'
                        : 'border-[#dbe2ee] bg-white text-[#2c3342] hover:bg-[#f8faff]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-[#ce5272] mb-1" />
                    <span className="block text-xs font-bold">Fanfic em Destaque</span>
                    <span className="block text-[10px] text-stone-500">Promover história do catálogo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('advertiser');
                      setFormBadge('Publicidade');
                      setFormCtaText('Anuncie Aqui');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      formType === 'advertiser'
                        ? 'border-[#486da6] bg-[#eef4fb] text-[#27426e] font-semibold'
                        : 'border-[#dbe2ee] bg-white text-[#2c3342] hover:bg-[#f8faff]'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-[#486da6] mb-1" />
                    <span className="block text-xs font-bold">Anunciante / Publicidade</span>
                    <span className="block text-[10px] text-stone-500">Venda de espaço ou parceria</span>
                  </button>
                </div>
              </div>

              {/* Conditional Form Fields */}
              {formType === 'featured_fanfic' ? (
                <div>
                  <label className="block text-xs font-bold text-[#152238] mb-1">
                    Selecionar Fanfic para Destaque
                  </label>
                  <select
                    value={formFanficId}
                    onChange={(e) => setFormFanficId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-[#dbe2ee] rounded-lg text-xs outline-none focus:border-[#ce5272]"
                  >
                    {fanfics.map((fic) => (
                      <option key={fic.id} value={fic.id}>
                        {fic.title} — por {fic.author} ({fic.fandom})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#152238] mb-1">
                      Nome do Anunciante ou Marca
                    </label>
                    <input
                      type="text"
                      value={formAdvertiser}
                      onChange={(e) => setFormAdvertiser(e.target.value)}
                      placeholder="Ex: Livraria Literária, Clube do Livro, etc."
                      className="w-full px-3 py-2 bg-stone-50 border border-[#dbe2ee] rounded-lg text-xs outline-none focus:border-[#ce5272]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#152238] mb-1">
                      Título do Anúncio
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ex: Espaço Publicitário Disponível"
                      className="w-full px-3 py-2 bg-stone-50 border border-[#dbe2ee] rounded-lg text-xs outline-none focus:border-[#ce5272]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#152238] mb-1">
                      Texto Descritivo / Slogan
                    </label>
                    <input
                      type="text"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      placeholder="Ex: Divulgue sua história, e-book ou produto para milhares de leitoras."
                      className="w-full px-3 py-2 bg-stone-50 border border-[#dbe2ee] rounded-lg text-xs outline-none focus:border-[#ce5272]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#152238] mb-1">
                      Link de Destino do Anunciante (URL)
                    </label>
                    <input
                      type="text"
                      value={formCtaUrl}
                      onChange={(e) => setFormCtaUrl(e.target.value)}
                      placeholder="Ex: https://instagram.com/seusite ou mailto:contato@site.com"
                      className="w-full px-3 py-2 bg-stone-50 border border-[#dbe2ee] rounded-lg text-xs outline-none focus:border-[#ce5272] font-mono"
                    />
                  </div>

                  {/* Banner image upload */}
                  <div>
                    <label className="block text-xs font-bold text-[#152238] mb-1">
                      Imagem do Anúncio (Opcional)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-3 py-1.5 bg-[#eef4fb] hover:bg-[#dce9f8] text-[#27426e] rounded border border-[#b8cee8] flex items-center gap-1.5 text-xs font-medium transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Carregar Imagem de Banner</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCustomBannerImageUpload}
                          className="hidden"
                        />
                      </label>
                      {formImageUrl && (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Imagem carregada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#152238] mb-1">
                    Texto do Selo (Badge)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="Ex: Destaque, Anúncio, Novidade"
                    className="w-full px-3 py-2 bg-stone-50 border border-[#dbe2ee] rounded-lg text-xs outline-none focus:border-[#ce5272]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#152238] mb-1">
                    Texto do Botão (CTA)
                  </label>
                  <input
                    type="text"
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    placeholder="Ex: Ler Agora, Anuncie Aqui"
                    className="w-full px-3 py-2 bg-stone-50 border border-[#dbe2ee] rounded-lg text-xs outline-none focus:border-[#ce5272]"
                  />
                </div>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-[#e2e6ee] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onUpdateConfig({ ...config, isActive: false });
                  setIsManageModalOpen(false);
                }}
                className="text-xs text-[#ce5272] hover:text-[#9e2847] hover:underline"
              >
                Desativar Banner Superior
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-[#0e1015]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#ce5272] hover:bg-[#9e2847] rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Salvar Banner
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
