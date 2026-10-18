import { Fanfic } from '../types/fanfic';

/**
 * Replaces interactive placeholders (e.g. [NOME], [PAR], {AMIGA}) with user-provided values.
 */
export function renderInteractiveText(
  htmlContent: string,
  userValues: Record<string, string>,
  highlight: boolean = false
): string {
  if (!htmlContent) return '';

  let result = htmlContent;

  for (const [key, val] of Object.entries(userValues)) {
    const safeVal = val && val.trim() !== '' ? val.trim() : key;
    const replacement = highlight
      ? `<mark class="interactive-highlight" title="Interativo: ${key}">${safeVal}</mark>`
      : safeVal;

    // Matches [KEY], [key], {KEY}, {key}, <KEY>, %KEY%
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\[${escapedKey}\\]|\\{${escapedKey}\\}|%${escapedKey}%`, 'gi');
    result = result.replace(regex, replacement);
  }

  return result;
}

/**
 * Generates a production-ready, self-contained standalone .html file that runs
 * entirely in the browser with 0 dependencies.
 * Perfect for free static hosting (GitHub Pages, Netlify Drop, Vercel, Neocities).
 */
export function generateStandaloneHtml(fanfic: Fanfic): string {
  const variablesJson = JSON.stringify(fanfic.variables);
  const chaptersJson = JSON.stringify(fanfic.chapters);
  const titleEscaped = fanfic.title.replace(/"/g, '&quot;');
  const authorEscaped = fanfic.author.replace(/"/g, '&quot;');
  const fandomEscaped = fanfic.fandom.replace(/"/g, '&quot;');
  const summaryEscaped = fanfic.summary.replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleEscaped} - Fanfic Interativa</title>
  <meta name="description" content="${summaryEscaped}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #faf8f5;
      --card-bg: #ffffff;
      --text-main: #262422;
      --text-muted: #78716c;
      --border-color: #e7e5e4;
      --accent-color: #e11d48;
      --accent-bg: #fff1f2;
      --highlight-bg: rgba(244, 63, 94, 0.15);
      --highlight-color: #9f1239;
    }

    body.theme-sepia {
      --bg-color: #f5eedc;
      --card-bg: #faf4e6;
      --text-main: #3d3224;
      --text-muted: #82725e;
      --border-color: #ded1ba;
      --accent-color: #c2410c;
      --accent-bg: #ffedd5;
      --highlight-bg: rgba(194, 65, 12, 0.18);
      --highlight-color: #7c2d12;
    }

    body.theme-dark {
      --bg-color: #121214;
      --card-bg: #1c1c20;
      --text-main: #e4e4e7;
      --text-muted: #a1a1aa;
      --border-color: #27272a;
      --accent-color: #fb7185;
      --accent-bg: #2b1720;
      --highlight-bg: rgba(251, 113, 133, 0.22);
      --highlight-color: #ffe4e6;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-color);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      transition: background-color 0.2s ease, color 0.2s ease;
      line-height: 1.6;
    }

    header.story-header {
      background: var(--card-bg);
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem 1rem;
      text-align: center;
    }
    .header-content {
      max-width: 800px;
      margin: 0 auto;
    }
    .badge {
      display: inline-block;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--accent-color);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    h1.story-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .story-meta {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .story-summary {
      font-style: italic;
      color: var(--text-muted);
      max-width: 650px;
      margin: 1rem auto 0;
      font-size: 0.95rem;
    }

    /* Interactive Form Box (Lumiere.ink) */
    .interactive-panel {
      max-width: 800px;
      margin: 1.5rem auto;
      padding: 1.25rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }
    .interactive-panel h2 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .interactive-panel p.sub {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    .inputs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .input-group label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .input-group input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 0.9rem;
      background: var(--bg-color);
      color: var(--text-main);
      outline: none;
      transition: border-color 0.15s;
    }
    .input-group input:focus {
      border-color: var(--accent-color);
    }
    .panel-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      justify-content: space-between;
    }
    .btn {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }
    .btn-primary {
      background: var(--accent-color);
      color: white;
    }
    .btn-primary:hover {
      opacity: 0.9;
    }
    .btn-secondary {
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      color: var(--text-main);
    }
    .btn-secondary:hover {
      background: var(--border-color);
    }

    /* Toolbar for Reading Settings */
    .reader-toolbar {
      max-width: 800px;
      margin: 0 auto 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-color);
    }
    .toolbar-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .theme-chip {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      cursor: pointer;
      border: 1px solid var(--border-color);
    }

    /* Story Reading Area */
    main.story-content {
      max-width: 720px;
      margin: 0 auto;
      padding: 0 1rem 4rem;
      font-family: 'Lora', Georgia, serif;
      font-size: 1.15rem;
      line-height: 1.85;
    }
    .chapter-heading {
      text-align: center;
      margin-bottom: 2rem;
    }
    .chapter-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .chapter-note {
      background: var(--accent-bg);
      border-left: 3px solid var(--accent-color);
      padding: 0.75rem 1rem;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      font-size: 0.85rem;
      margin-bottom: 2rem;
      color: var(--text-main);
      border-radius: 0 4px 4px 0;
    }
    .story-body p {
      margin-bottom: 1.4rem;
      text-align: justify;
    }
    .story-body p:first-of-type::first-letter {
      font-size: 3.2rem;
      float: left;
      line-height: 0.8;
      margin-right: 0.5rem;
      font-family: 'Playfair Display', Georgia, serif;
      color: var(--accent-color);
    }
    mark.interactive-highlight {
      background-color: var(--highlight-bg);
      color: var(--highlight-color);
      border-bottom: 1.5px dashed var(--accent-color);
      padding: 0 3px;
      border-radius: 2px;
      font-weight: 600;
    }

    /* Chapter Navigation Buttons */
    .chapter-nav {
      max-width: 720px;
      margin: 2rem auto;
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    footer {
      border-top: 1px solid var(--border-color);
      padding: 2rem 1rem;
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
  </style>
</head>
<body class="theme-alabaster">

  <header class="story-header">
    <div class="header-content">
      <span class="badge">${fandomEscaped} · ${fanfic.rating} · ${fanfic.status}</span>
      <h1 class="story-title">${titleEscaped}</h1>
      <div class="story-meta">
        Escrito por <strong>${authorEscaped}</strong> · Fanfic Interativa em HTML
      </div>
      <p class="story-summary">"${summaryEscaped}"</p>
    </div>
  </header>

  <!-- FORMULÁRIO DE INTERATIVIDADE LUMIERE.INK -->
  <div class="interactive-panel">
    <h2>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      Personalizar Personagens (Interatividade)
    </h2>
    <p class="sub">Preencha os campos abaixo com os nomes de sua preferência. A história será atualizada instantaneamente!</p>

    <div class="inputs-grid" id="variablesInputs">
      <!-- Generated via JS -->
    </div>

    <div class="panel-actions">
      <div>
        <label style="font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
          <input type="checkbox" id="toggleHighlight" checked>
          Destacar nomes interativos
        </label>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary" onclick="resetDefaultValues()">Restaurar Padrão</button>
        <button class="btn btn-primary" onclick="applyInteractiveValues()">Atualizar Leitura</button>
      </div>
    </div>
  </div>

  <!-- TOOLBAR DE LEITURA -->
  <div class="reader-toolbar">
    <div class="toolbar-group">
      <span>Capítulo:</span>
      <select id="chapterSelect" onchange="changeChapter(this.value)" style="padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main);">
      </select>
    </div>

    <div class="toolbar-group">
      <div class="theme-chip" style="background: #faf8f5;" title="Clássico / Alabastro" onclick="setTheme('alabaster')"></div>
      <div class="theme-chip" style="background: #f5eedc;" title="Sépia" onclick="setTheme('sepia')"></div>
      <div class="theme-chip" style="background: #121214;" title="Escuro" onclick="setTheme('dark')"></div>
      <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem;" onclick="changeFontSize(-1)">A-</button>
      <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem;" onclick="changeFontSize(1)">A+</button>
    </div>
  </div>

  <!-- CONTEÚDO DO CAPÍTULO -->
  <main class="story-content" id="storyContent">
    <div class="chapter-heading">
      <h2 class="chapter-title" id="chapterTitle"></h2>
      <div class="story-meta" id="chapterInfo"></div>
    </div>
    <div class="chapter-note" id="chapterNote" style="display: none;"></div>
    <div class="story-body" id="storyBody"></div>

    <div class="chapter-nav">
      <button class="btn btn-secondary" id="btnPrevChapter" onclick="navigateChapter(-1)">← Capítulo Anterior</button>
      <button class="btn btn-primary" id="btnNextChapter" onclick="navigateChapter(1)">Próximo Capítulo →</button>
    </div>
  </main>

  <footer>
    <p>História Interativa exportada pelo <strong>Lumiere.ink</strong>.</p>
    <p style="margin-top: 0.25rem;">Hospedado gratuitamente em formato HTML estático independente.</p>
  </footer>

  <script>
    const fanficVariables = ${variablesJson};
    const chapters = ${chaptersJson};
    let currentChapterIndex = 0;
    let userValues = {};
    let currentFontSize = 18;

    // Load saved inputs or defaults
    function initVariables() {
      const saved = localStorage.getItem('fic_vars_${fanfic.id}');
      if (saved) {
        try { userValues = JSON.parse(saved); } catch(e) {}
      }

      fanficVariables.forEach(v => {
        if (!userValues[v.key]) {
          userValues[v.key] = v.defaultValue;
        }
      });

      renderInputs();
      populateChapterSelect();
      renderCurrentChapter();
    }

    function renderInputs() {
      const container = document.getElementById('variablesInputs');
      container.innerHTML = '';
      fanficVariables.forEach(v => {
        const div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = \`
          <label for="var_\${v.key}">\${v.label} (\${v.key})</label>
          <input type="text" id="var_\${v.key}" value="\${userValues[v.key] || v.defaultValue}" placeholder="\${v.placeholder || ''}" oninput="onInputChange('\${v.key}', this.value)">
        \`;
        container.appendChild(div);
      });
    }

    function onInputChange(key, val) {
      userValues[key] = val;
      localStorage.setItem('fic_vars_${fanfic.id}', JSON.stringify(userValues));
    }

    function applyInteractiveValues() {
      renderCurrentChapter();
    }

    function resetDefaultValues() {
      fanficVariables.forEach(v => {
        userValues[v.key] = v.defaultValue;
      });
      localStorage.removeItem('fic_vars_${fanfic.id}');
      renderInputs();
      renderCurrentChapter();
    }

    function populateChapterSelect() {
      const select = document.getElementById('chapterSelect');
      select.innerHTML = '';
      chapters.forEach((chap, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = 'Capítulo ' + chap.number + ': ' + chap.title;
        select.appendChild(opt);
      });
    }

    function changeChapter(index) {
      currentChapterIndex = parseInt(index, 10);
      renderCurrentChapter();
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }

    function navigateChapter(delta) {
      const nextIdx = currentChapterIndex + delta;
      if (nextIdx >= 0 && nextIdx < chapters.length) {
        changeChapter(nextIdx);
        document.getElementById('chapterSelect').value = nextIdx;
      }
    }

    function renderCurrentChapter() {
      const chap = chapters[currentChapterIndex];
      if (!chap) return;

      document.getElementById('chapterTitle').textContent = chap.title;
      document.getElementById('chapterInfo').textContent = 'Palavras: ' + (chap.wordCount || 1200) + ' · Publicado em: ' + (chap.publishedAt || 'Recente');

      const noteBox = document.getElementById('chapterNote');
      if (chap.authorNote) {
        noteBox.style.display = 'block';
        noteBox.innerHTML = '<strong>Nota do Autor:</strong> ' + chap.authorNote;
      } else {
        noteBox.style.display = 'none';
      }

      const highlight = document.getElementById('toggleHighlight').checked;
      let html = chap.htmlContent;

      for (const [key, val] of Object.entries(userValues)) {
        const replacement = highlight
          ? '<mark class="interactive-highlight">' + (val || key) + '</mark>'
          : (val || key);
        const regex = new RegExp('\\\\[' + key + '\\\\]|\\\\{' + key + '\\\\}|%' + key + '%', 'gi');
        html = html.replace(regex, replacement);
      }

      document.getElementById('storyBody').innerHTML = html;

      // Update nav buttons
      document.getElementById('btnPrevChapter').style.visibility = currentChapterIndex > 0 ? 'visible' : 'hidden';
      document.getElementById('btnNextChapter').style.visibility = currentChapterIndex < chapters.length - 1 ? 'visible' : 'hidden';
    }

    function setTheme(theme) {
      document.body.className = 'theme-' + theme;
      localStorage.setItem('reader_theme', theme);
    }

    function changeFontSize(delta) {
      currentFontSize = Math.min(26, Math.max(14, currentFontSize + delta));
      document.getElementById('storyContent').style.fontSize = currentFontSize + 'px';
    }

    document.getElementById('toggleHighlight').addEventListener('change', renderCurrentChapter);

    window.onload = function() {
      const savedTheme = localStorage.getItem('reader_theme');
      if (savedTheme) setTheme(savedTheme);
      initVariables();
    };
  </script>
</body>
</html>`;
}

/**
 * Downloads a string content as a file directly in the browser.
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string = 'text/html'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
