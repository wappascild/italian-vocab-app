
    const STORAGE_KEY = 'italian_vocab_story_app_v1';
    const intervals = [0, 1, 2, 4, 7, 15, 30, 60, 90];
    let state = loadState();
    let session = { queue: [], index: 0, done: 0, mode: null };
    let latestStory = '';
    let translationVisible = true;

    function todayStr(offset = 0) {
      const d = new Date();
      d.setHours(0,0,0,0);
      d.setDate(d.getDate() + offset);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    function addDays(dateStr, days) {
      const d = new Date(dateStr + 'T00:00:00');
      d.setDate(d.getDate() + days);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    function uid() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      return 'w_' + Date.now() + '_' + Math.random().toString(16).slice(2);
    }

    function defaultState() {
      return {
        settings: { dailyNew: 20, maxReview: 80 },
        words: [],
        createdAt: todayStr()
      };
    }

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          const s = defaultState();
          s.words = sampleWords();
          saveState(s);
          return s;
        }
        const parsed = JSON.parse(raw);
        parsed.settings = parsed.settings || { dailyNew: 20, maxReview: 80 };
        parsed.words = (parsed.words || []).map(normalizeWord);
        return parsed;
      } catch (e) {
        console.error(e);
        return defaultState();
      }
    }

    function saveState(s = state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    }

    function normalizeWord(w) {
      return {
        id: w.id || uid(),
        it: (w.it || w.italian || '').trim(),
        zh: (w.zh || w.chinese || '').trim(),
        pos: (w.pos || '名词').trim(),
        topic: (w.topic || '日常').trim(),
        example: (w.example || '').trim(),
        status: w.status || 'new',
        stage: Number.isFinite(+w.stage) ? +w.stage : 0,
        nextReview: w.nextReview || todayStr(),
        firstSeen: w.firstSeen || null,
        lastReviewed: w.lastReviewed || null,
        reviewCount: Number.isFinite(+w.reviewCount) ? +w.reviewCount : 0,
        correctCount: Number.isFinite(+w.correctCount) ? +w.correctCount : 0,
        lastResult: w.lastResult || null,
        createdAt: w.createdAt || todayStr()
      };
    }

    function sampleWords() {
      const rows = [
        ['ciao','你好 / 再见','短语','日常','Ciao, come stai?'],
        ['grazie','谢谢','短语','日常','Grazie per il tuo aiuto.'],
        ['prego','不客气 / 请','短语','日常','Prego, entra pure.'],
        ['bella','美丽的','形容词','外貌','Questa città è molto bella.'],
        ['buono','好的 / 好吃的','形容词','日常','Il caffè è molto buono.'],
        ['oggi','今天','副词','日常','Oggi studio italiano.'],
        ['domani','明天','副词','日常','Domani vado al lavoro.'],
        ['comprare','购买','动词','购物','Voglio comprare qualcosa di utile.'],
        ['negozio','商店','名词','购物','Entro in un negozio vicino a casa.'],
        ['prezzo','价格','名词','购物','Il prezzo è molto buono.'],
        ['economico','便宜的','形容词','购物','Questo prodotto è economico.'],
        ['scegliere','选择','动词','购物','Devo scegliere un colore.'],
        ['provare','试用 / 尝试','动词','购物','Posso provare questo prodotto?'],
        ['colore','颜色','名词','美妆','Mi piace questo colore.'],
        ['rosso','红色的','形容词','颜色','Il rossetto rosso è elegante.'],
        ['rosa','粉色 / 粉色的','名词','颜色','Il colore rosa è dolce.'],
        ['rossetto','口红','名词','美妆','Il rossetto rosso è molto bello.'],
        ['trucco','化妆 / 妆容','名词','美妆','Il trucco è naturale.'],
        ['crema','面霜 / 乳霜','名词','护肤','Uso una crema ogni mattina.'],
        ['profumo','香水','名词','美妆','Questo profumo è dolce e fresco.'],
        ['viso','脸','名词','美妆','Lavo il viso con cura.'],
        ['pelle','皮肤','名词','护肤','La mia pelle è morbida.'],
        ['capelli','头发','名词','美发','I capelli sono lucidi.'],
        ['borsa','包','名词','购物','Metto il rossetto nella borsa.'],
        ['amica','朋友，女性','名词','日常','La mia amica studia con me.'],
        ['ragazza','女孩','名词','日常','La ragazza è felice.'],
        ['felice','开心的','形容词','情绪','Sono felice oggi.'],
        ['facile','简单的','形容词','学习','Questa frase è facile.'],
        ['difficile','困难的','形容词','学习','Questa parola è difficile.'],
        ['ricordare','记住','动词','学习','Voglio ricordare queste parole.'],
        ['ripetere','重复','动词','学习','Devo ripetere la frase.'],
        ['parlare','说话','动词','学习','Provo a parlare italiano.'],
        ['leggere','阅读','动词','学习','Mi piace leggere una storia breve.'],
        ['scrivere','写','动词','学习','Scrivo una frase in italiano.'],
        ['viaggio','旅行','名词','旅行','Il viaggio in Italia è speciale.'],
        ['stazione','车站','名词','旅行','La stazione è vicino al centro.'],
        ['albergo','酒店','名词','旅行','L\'albergo è pulito.'],
        ['mangiare','吃','动词','饮食','Voglio mangiare una pizza.'],
        ['acqua','水','名词','饮食','Bevo acqua ogni giorno.'],
        ['caffè','咖啡','名词','饮食','Prendo un caffè al bar.']
      ];
      return rows.map(r => normalizeWord({ it: r[0], zh: r[1], pos: r[2], topic: r[3], example: r[4] }));
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 1800);
    }

    function isDue(w, day = todayStr()) {
      return w.firstSeen && w.nextReview <= day;
    }

    function getNewWords(limit = state.settings.dailyNew) {
      return state.words
        .filter(w => !w.firstSeen)
        .sort((a,b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
        .slice(0, limit);
    }

    function getDueWords(limit = state.settings.maxReview) {
      const priority = { unknown: 0, fuzzy: 1, known: 2, new: 3 };
      return state.words
        .filter(w => isDue(w))
        .sort((a,b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9) || (a.nextReview || '').localeCompare(b.nextReview || ''))
        .slice(0, limit);
    }

    function getTodayWords() {
      const due = getDueWords(state.settings.maxReview);
      const remaining = Math.max(0, state.settings.dailyNew);
      const fresh = getNewWords(remaining);
      return [...due, ...fresh];
    }

    function switchTab(tab) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + tab).classList.add('active');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
      if (tab === 'home') renderHome();
      if (tab === 'library') renderLibrary();
      if (tab === 'plan') renderPlan();
    }

    function renderAll() {
      document.getElementById('todayLabel').textContent = todayStr();
      document.getElementById('dailyNewInput').value = state.settings.dailyNew;
      document.getElementById('maxReviewInput').value = state.settings.maxReview;
      renderHome();
      renderLibrary();
      renderPlan();
    }

    function renderHome() {
      const total = state.words.length;
      const newCount = state.words.filter(w => !w.firstSeen).length;
      const dueCount = state.words.filter(w => isDue(w)).length;
      const fuzzyCount = state.words.filter(w => w.status === 'fuzzy').length;
      const unknownCount = state.words.filter(w => w.status === 'unknown').length;
      const knownCount = state.words.filter(w => w.status === 'known').length;
      const todayWords = getTodayWords();
      document.getElementById('metrics').innerHTML = `
        <div class="metric"><div class="num">${total}</div><div class="label">总词库</div></div>
        <div class="metric"><div class="num">${todayWords.length}</div><div class="label">今日任务</div></div>
        <div class="metric"><div class="num">${dueCount}</div><div class="label">到期复习</div></div>
        <div class="metric"><div class="num">${newCount}</div><div class="label">未学新词</div></div>
        <div class="metric"><div class="num">${knownCount}</div><div class="label">已记住</div></div>
        <div class="metric"><div class="num">${fuzzyCount + unknownCount}</div><div class="label">模糊 / 困难</div></div>
      `;
      document.getElementById('todaySummary').textContent = `今天建议学习 ${Math.min(state.settings.dailyNew, newCount)} 个新词，复习 ${Math.min(state.settings.maxReview, dueCount)} 个旧词。优先处理未记住和有点模糊的词。`;
    }

    function startSession(mode) {
      switchTab('learn');
      let queue = [];
      if (mode === 'today') queue = getTodayWords();
      if (mode === 'review') queue = getDueWords(state.settings.maxReview);
      if (mode === 'new') queue = getNewWords(state.settings.dailyNew);
      if (mode === 'difficult') queue = state.words.filter(w => w.status === 'unknown' || w.status === 'fuzzy').sort((a,b) => (a.nextReview || '').localeCompare(b.nextReview || ''));
      session = { queue, index: 0, done: 0, mode };
      renderCurrentCard();
    }

    function renderCurrentCard() {
      const area = document.getElementById('cardArea');
      const btns = document.getElementById('reviewButtons');
      const total = session.queue.length;
      const current = session.queue[session.index];
      const pct = total ? Math.round((session.done / total) * 100) : 0;
      document.getElementById('sessionProgress').style.width = pct + '%';
      document.getElementById('sessionCount').textContent = total ? `进度：${session.done}/${total}` : '当前没有需要学习的词';
      if (!current) {
        btns.classList.add('hidden');
        area.innerHTML = `<div class="empty"><strong>完成啦！</strong><br>当前队列已经结束。可以去“短文”页面生成今日背诵段落。</div>`;
        renderHome();
        return;
      }
      btns.classList.remove('hidden');
      area.innerHTML = `
        <div>
          <div class="chip-row">
            <span class="chip">${escapeHTML(current.pos || '词')}</span>
            <span class="chip">${escapeHTML(current.topic || '日常')}</span>
            <span class="chip">第 ${current.stage + 1} 阶段</span>
          </div>
          <div class="word-main">${escapeHTML(current.it)}</div>
          <div class="word-zh">${escapeHTML(current.zh)}</div>
          ${current.example ? `<div class="sentence">${escapeHTML(current.example)}</div>` : ''}
          <p class="tiny muted">下次复习：${escapeHTML(current.nextReview || todayStr())}</p>
        </div>
      `;
    }

    function reviewCurrent(result) {
      const w = session.queue[session.index];
      if (!w) return;
      const today = todayStr();
      if (!w.firstSeen) w.firstSeen = today;
      w.reviewCount += 1;
      w.lastReviewed = today;
      w.lastResult = result;

      if (result === 'known') {
        w.status = 'known';
        w.correctCount += 1;
        w.stage = Math.min((w.stage || 0) + 1, intervals.length - 1);
        w.nextReview = addDays(today, intervals[w.stage]);
        showToast(`已记住：${w.it}，${intervals[w.stage]} 天后复习`);
      }
      if (result === 'fuzzy') {
        w.status = 'fuzzy';
        w.stage = Math.max(0, Math.min(w.stage || 0, 2));
        w.nextReview = addDays(today, 1);
        showToast(`有点模糊：${w.it}，明天再复习`);
      }
      if (result === 'unknown') {
        w.status = 'unknown';
        w.stage = 0;
        w.nextReview = today;
        showToast(`未记住：${w.it}，已放入困难词库`);
      }
      saveState();
      session.done += 1;
      session.index += 1;
      renderCurrentCard();
    }

    function generateStory() {
      const words = uniqueById(getTodayWords().concat(
        state.words.filter(w => w.status === 'unknown' || w.status === 'fuzzy').slice(0, 10)
      )).slice(0, 28);
      const area = document.getElementById('storyArea');
      if (!words.length) {
        area.innerHTML = `<div class="empty">目前没有可生成短文的单词，请先添加或导入词库。</div>`;
        return;
      }
      const nouns = words.filter(w => /名词|noun/i.test(w.pos)).slice(0, 8);
      const verbs = words.filter(w => /动词|verb/i.test(w.pos)).slice(0, 6);
      const adjs = words.filter(w => /形容词|adj/i.test(w.pos)).slice(0, 6);
      const others = words.filter(w => !nouns.includes(w) && !verbs.includes(w) && !adjs.includes(w)).slice(0, 6);
      const topicText = detectScene(words);

      const nounList = nouns.map(w => `<strong>${escapeHTML(w.it)}</strong>`).join(', ');
      const verbList = verbs.map(w => `<strong>${escapeHTML(w.it)}</strong>`).join(', ');
      const adjList = adjs.map(w => `<strong>${escapeHTML(w.it)}</strong>`).join(', ');
      const otherList = others.map(w => `<strong>${escapeHTML(w.it)}</strong>`).join(', ');

      const itSentences = [];
      itSentences.push(`Oggi immagino una piccola scena: ${topicText}.`);
      if (nounList) itSentences.push(`Davanti a me vedo alcune cose importanti: ${nounList}.`);
      if (verbList) itSentences.push(`Per raccontare meglio la storia, provo a usare questi verbi: ${verbList}.`);
      if (adjList) itSentences.push(`Descrivo ogni cosa con parole semplici come ${adjList}.`);
      if (otherList) itSentences.push(`Poi ripeto anche queste parole utili: ${otherList}.`);
      itSentences.push(`Alla fine leggo la storia ad alta voce e cerco di ricordare ogni parola senza guardare la traduzione.`);

      const zhList = words.map(w => `${w.it}=${w.zh}`).join('；');
      latestStory = stripHTML(itSentences.join(' '));
      const exampleBlock = words.filter(w => w.example).slice(0, 5).map(w => `<li><strong>${escapeHTML(w.it)}</strong>: ${escapeHTML(w.example)}</li>`).join('');
      area.innerHTML = `
        <div class="story-italian">${itSentences.join(' ')}</div>
        <div id="storyTranslation" style="margin-top:14px;">
          <h3>中文辅助</h3>
          <p class="small muted">今天重点词：${escapeHTML(zhList)}</p>
          ${exampleBlock ? `<h3>可背例句</h3><ul class="small">${exampleBlock}</ul>` : ''}
        </div>
      `;
      translationVisible = true;
    }

    function detectScene(words) {
      const topics = words.map(w => (w.topic || '').toLowerCase()).join(' ');
      const all = words.map(w => (w.it + ' ' + w.zh).toLowerCase()).join(' ');
      if (/美妆|护肤|beauty|makeup|cosmetic|rossetto|profumo|pelle|viso/.test(topics + all)) {
        return 'entro in un negozio di cosmetici e scelgo un prodotto per me';
      }
      if (/购物|shop|negozio|comprare|prezzo|economico/.test(topics + all)) {
        return 'entro in un negozio, guardo il prezzo e scelgo con calma';
      }
      if (/旅行|travel|viaggio|stazione|albergo/.test(topics + all)) {
        return 'faccio un viaggio in Italia, arrivo alla stazione e cerco il mio albergo';
      }
      if (/饮食|food|caffè|acqua|mangiare/.test(topics + all)) {
        return 'sono in un piccolo bar italiano, bevo un caffè e mangio qualcosa di buono';
      }
      return 'vivo una giornata semplice e provo a parlare italiano';
    }

    function toggleTranslation() {
      const el = document.getElementById('storyTranslation');
      if (!el) return;
      translationVisible = !translationVisible;
      el.style.display = translationVisible ? 'block' : 'none';
    }

    async function copyStory() {
      if (!latestStory) generateStory();
      try {
        await navigator.clipboard.writeText(latestStory);
        showToast('已复制今日短文');
      } catch (e) {
        showToast('复制失败，请手动选择文本');
      }
    }

    function renderLibrary() {
      const list = document.getElementById('libraryList');
      if (!list) return;
      const status = document.getElementById('filterStatus')?.value || 'all';
      const q = (document.getElementById('searchBox')?.value || '').toLowerCase().trim();
      let words = [...state.words];
      if (status !== 'all') {
        if (status === 'due') words = words.filter(w => isDue(w));
        else words = words.filter(w => (w.status || 'new') === status);
      }
      if (q) {
        words = words.filter(w => [w.it, w.zh, w.pos, w.topic, w.example].join(' ').toLowerCase().includes(q));
      }
      words.sort((a,b) => (a.nextReview || '').localeCompare(b.nextReview || '') || a.it.localeCompare(b.it));
      if (!words.length) {
        list.innerHTML = `<div class="empty">没有找到符合条件的单词。</div>`;
        return;
      }
      list.innerHTML = words.slice(0, 250).map(w => `
        <div class="word-item">
          <div>
            <strong>${escapeHTML(w.it)}</strong> <span class="muted">${escapeHTML(w.zh)}</span>
            <div class="chip-row" style="margin-top:6px;">
              <span class="chip">${statusLabel(w.status)}</span>
              <span class="chip">${escapeHTML(w.pos)}</span>
              <span class="chip">${escapeHTML(w.topic)}</span>
              <span class="chip">下次：${escapeHTML(w.nextReview || todayStr())}</span>
            </div>
            ${w.example ? `<p class="tiny muted">${escapeHTML(w.example)}</p>` : ''}
          </div>
          <div class="word-actions">
            <button onclick="editWord('${w.id}')">改</button>
            <button onclick="deleteWord('${w.id}')">删</button>
          </div>
        </div>
      `).join('');
    }

    function statusLabel(s) {
      return ({ new: '新词', known: '已记住', fuzzy: '有点模糊', unknown: '未记住' })[s] || s;
    }

    function addWordFromForm() {
      const it = document.getElementById('newIt').value.trim();
      const zh = document.getElementById('newZh').value.trim();
      const pos = document.getElementById('newPos').value.trim();
      const topic = document.getElementById('newTopic').value.trim() || '日常';
      const example = document.getElementById('newExample').value.trim();
      if (!it || !zh) {
        showToast('请填写意大利语和中文意思');
        return;
      }
      state.words.push(normalizeWord({ it, zh, pos, topic, example }));
      saveState();
      ['newIt','newZh','newTopic','newExample'].forEach(id => document.getElementById(id).value = '');
      renderAll();
      showToast('已添加单词');
    }

    function editWord(id) {
      const w = state.words.find(x => x.id === id);
      if (!w) return;
      const it = prompt('意大利语', w.it);
      if (it === null) return;
      const zh = prompt('中文意思', w.zh);
      if (zh === null) return;
      const pos = prompt('词性', w.pos);
      if (pos === null) return;
      const topic = prompt('主题', w.topic);
      if (topic === null) return;
      const example = prompt('例句', w.example || '');
      if (example === null) return;
      Object.assign(w, { it: it.trim(), zh: zh.trim(), pos: pos.trim() || '名词', topic: topic.trim() || '日常', example: example.trim() });
      saveState();
      renderAll();
      showToast('已修改');
    }

    function deleteWord(id) {
      const w = state.words.find(x => x.id === id);
      if (!w) return;
      if (!confirm(`确认删除 ${w.it} 吗？`)) return;
      state.words = state.words.filter(x => x.id !== id);
      saveState();
      renderAll();
      showToast('已删除');
    }

    function saveSettings() {
      const dailyNew = Math.max(0, Math.min(100, parseInt(document.getElementById('dailyNewInput').value || '20', 10)));
      const maxReview = Math.max(10, Math.min(500, parseInt(document.getElementById('maxReviewInput').value || '80', 10)));
      state.settings.dailyNew = dailyNew;
      state.settings.maxReview = maxReview;
      saveState();
      renderAll();
      showToast('计划已保存');
    }

    function renderPlan() {
      const holder = document.getElementById('planTable');
      if (!holder) return;
      let remainingNew = state.words.filter(w => !w.firstSeen).length;
      const rows = [];
      for (let i = 0; i < 30; i++) {
        const day = todayStr(i);
        const due = state.words.filter(w => w.firstSeen && w.nextReview === day).length;
        const newCount = Math.min(state.settings.dailyNew, remainingNew);
        remainingNew -= newCount;
        rows.push({ day, newCount, due, total: newCount + due });
      }
      holder.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr><th>日期</th><th>新词</th><th>到期复习</th><th>预计总量</th></tr></thead>
            <tbody>${rows.map(r => `<tr><td>${r.day}</td><td>${r.newCount}</td><td>${r.due}</td><td>${r.total}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      `;
    }

    function exportCSV() {
      const header = ['意大利语','中文','词性','主题','例句','状态','阶段','下次复习','已复习次数'];
      const rows = state.words.map(w => [w.it,w.zh,w.pos,w.topic,w.example,w.status,w.stage,w.nextReview,w.reviewCount]);
      const csv = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\n');
      downloadText(csv, 'italian_words_export.csv', 'text/csv;charset=utf-8');
    }

    function exportJSON() {
      downloadText(JSON.stringify(state, null, 2), 'italian_vocab_backup.json', 'application/json;charset=utf-8');
    }

    function csvEscape(v) {
      const s = String(v ?? '');
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }

    function downloadText(text, filename, type) {
      const blob = new Blob([text], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function importCSV(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        const rows = parseCSV(text).filter(r => r.some(x => x.trim()));
        if (!rows.length) return showToast('CSV 为空');
        let start = 0;
        let map = { it:0, zh:1, pos:2, topic:3, example:4 };
        const head = rows[0].map(x => x.trim().toLowerCase());
        const joined = head.join('|');
        if (/意大利|italian|it/.test(joined) && /中文|chinese|zh/.test(joined)) {
          start = 1;
          map.it = findHeader(head, ['意大利语','italian','it','word'], 0);
          map.zh = findHeader(head, ['中文','chinese','zh','meaning'], 1);
          map.pos = findHeader(head, ['词性','pos','part of speech'], 2);
          map.topic = findHeader(head, ['主题','topic','category'], 3);
          map.example = findHeader(head, ['例句','example','sentence'], 4);
        }
        let added = 0;
        for (let i = start; i < rows.length; i++) {
          const r = rows[i];
          const it = (r[map.it] || '').trim();
          const zh = (r[map.zh] || '').trim();
          if (!it || !zh) continue;
          const exists = state.words.some(w => w.it.toLowerCase() === it.toLowerCase() && w.zh === zh);
          if (exists) continue;
          state.words.push(normalizeWord({ it, zh, pos: r[map.pos] || '名词', topic: r[map.topic] || '日常', example: r[map.example] || '' }));
          added++;
        }
        saveState();
        renderAll();
        event.target.value = '';
        showToast(`导入完成：新增 ${added} 个词`);
      };
      reader.readAsText(file, 'utf-8');
    }

    function findHeader(head, names, fallback) {
      const idx = head.findIndex(h => names.some(n => h.includes(n)));
      return idx >= 0 ? idx : fallback;
    }

    function parseCSV(text) {
      const rows = [];
      let row = [], cur = '', quote = false;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i+1];
        if (ch === '"') {
          if (quote && next === '"') { cur += '"'; i++; }
          else quote = !quote;
        } else if (ch === ',' && !quote) {
          row.push(cur); cur = '';
        } else if ((ch === '\n' || ch === '\r') && !quote) {
          if (ch === '\r' && next === '\n') i++;
          row.push(cur); rows.push(row); row = []; cur = '';
        } else {
          cur += ch;
        }
      }
      row.push(cur); rows.push(row);
      return rows;
    }

    function loadSampleWords(append = false) {
      const samples = sampleWords();
      let added = 0;
      for (const sw of samples) {
        const exists = state.words.some(w => w.it.toLowerCase() === sw.it.toLowerCase());
        if (!exists || append) { state.words.push(normalizeWord(sw)); added++; }
      }
      saveState();
      renderAll();
      showToast(`已加入 ${added} 个示例词`);
    }

    function resetAll() {
      if (!confirm('确认清空所有词库和学习记录吗？此操作不可恢复。')) return;
      state = defaultState();
      saveState();
      renderAll();
      showToast('已清空数据');
    }

    function uniqueById(arr) {
      const seen = new Set();
      const out = [];
      for (const x of arr) {
        if (!seen.has(x.id)) { seen.add(x.id); out.push(x); }
      }
      return out;
    }

    function escapeHTML(str) {
      return String(str ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
    }
    function stripHTML(str) {
      const div = document.createElement('div');
      div.innerHTML = str;
      return div.textContent || div.innerText || '';
    }

    renderAll();

    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  