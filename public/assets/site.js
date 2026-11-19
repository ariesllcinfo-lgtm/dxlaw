// Shared DX Law website behavior — Notion-backed content and navigation.
    // ★プライマリエンドポイント（プロキシ設定済みの /api/cms）と、直接通信用のバックアップGAS URL
    const GAS_API_URL = '/api/cms';
    const PAPERS_API_URL = '/api/papers';

    // ローカルプレビュー・オフライン時でも画面を美しく保つフォールバックデータ
    const FALLBACK_DATA = {
      slides: [
        {
          id: 'slide-1',
          tag: 'Study Group / 記録型権利部会',
          title: '研究会セッション：有価証券振替決済制度と脱物質化の法理',
          date: '2026.10',
          image: 'https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&w=1400&q=85',
          description: '『現代企業と有価証券の法理』および『有価証券振替決済制度の研究』等の基礎文献を紐解きつつ、株券不発行制度から現代のデジタルアセットに至る「帰属点」の変遷について討議を行いました。'
        },
        {
          id: 'slide-2',
          tag: 'Monograph / 博士論文・研究叢書',
          title: '『記録型権利における帰属点の法理』草稿検討会',
          date: '2026.09',
          image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=85',
          description: '有体物（紙）の占有を前提とした古典的物権・有価証券法理を超え、台帳上の「記録」と「確定権限」を軸に財産法秩序を再定義する研究モノグラフに関する合評会を実施しました。'
        }
      ],
      news: [
        { id: 'news-1', date: '2026.10.16', category: 'Note', title: '文献ノート：『現代企業と有価証券の法理』および『有価証券振替決済制度の研究』における権利帰属構造の比較考察を公開しました', workId: 'work-4' },
        { id: 'news-2', date: '2026.10.05', category: 'Publications', title: 'モノグラフ企画『AI地政学と物理インフラの法経済学 ― 半導体・電力・データ主権の制度設計』の章立ておよび序章草稿を公開しました', workId: 'work-3' },
        { id: 'news-3', date: '2026.09.24', category: 'Publications', title: '研究叢書『記録型権利における帰属点の法理 ― 権利の脱物質化と確定権限の法的構造』のディスカッション・ドラフトを公開しました', workId: 'work-1' },
        { id: 'news-4', date: '2026.08.22', category: 'Activity', title: '医療DX・データヘルス法制部会にて「審査支払機関におけるAI審査と審査委員会（医師・歯科医師）の医学的判断の法的境界」に関する報告を行いました', workId: 'work-2' }
      ],
      works: [
        {
          id: 'work-1',
          type: '単著・モノグラフ',
          category: 'monograph',
          title: '記録型権利における帰属点の法理',
          subtitle: '― 権利の脱物質化と確定権限の法的構造 ―',
          author: '安藤 和樹 [著]',
          publisher: 'DX法研究会 研究叢書 第1巻',
          date: '2026年9月',
          pages: '全142,000字 / 340頁相当',
          coverStyle: 'navy',
          abstract: '有価証券のペーパーレス化、不動産登記のデジタル化、電子記録債権、さらには暗号資産やトークン化証券に至るまで、現代の財産権は「紙（有体物）」から「電磁的記録」へと急速に脱物質化（Dematerialization）を遂げている。本研究は、台帳・システム上の「記録」がいかなる法的メカニズムによって権利の帰属を決定づけるのかを体系的に解明する。',
          toc: ['序章 問題の所在 ― 「紙」の喪失と法学の遅滞', '第1章 有価証券法理の歴史的展開と『有価証券振替決済制度』の到達点', '第2章 権利の脱物質化における比較法研究', '第3章 記録型権利における「帰属点」の概念規定', '第4章 システム管理者の「確定権限」と公信力の再構成', '終章 情報法秩序における財産権のゆくえ']
        },
        {
          id: 'work-2',
          type: '研究論文',
          category: 'article',
          title: '確定権限論と診療報酬請求権の構造',
          subtitle: '― 審査支払機関におけるAI審査と医学的判断の法的限界 ―',
          author: '安藤 和樹 [著]',
          publisher: '法情報学研究 紀要 Vol.4',
          date: '2026年8月',
          pages: '48頁',
          coverStyle: 'crimson',
          abstract: '医療DXの推進に伴い、診療報酬請求（レセプト）の審査業務におけるコンピュータチェックおよびAI技術の導入が加速している。本稿では、アルゴリズムによる自動判定と、審査委員会（医師・歯科医師）による専門的・医学的裁量判断との権限配分および法的責任の所在を明らかにする。',
          toc: ['1. はじめに ― 医療情報基盤の再編と審査支払DX', '2. 診療報酬請求権の法的性質と「審査」の位置づけ', '3. コンピュータチェックの高度化と「確定権限」の所在', '4. AIによる異常検知リスクと審査委員（医師・歯科医師）の最終審査権', '5. 結びに代えて']
        },
        {
          id: 'work-3',
          type: '単著（刊行準備中）',
          category: 'monograph',
          title: 'AI地政学と物理インフラの法経済学',
          subtitle: '― 半導体サプライチェーン・電力・フィジカルAIの制度設計 ―',
          author: '安藤 和樹 [著]',
          publisher: 'DX法研究会 出版プロジェクト',
          date: '2026年10月',
          pages: '全6章構成',
          coverStyle: 'slate',
          abstract: '生成AIの覇権争いは、サイバー空間のアルゴリズム競争から、半導体製造装置（ナノインプリント・光電融合）、データセンターの電力確保、そして工場や医療現場を制御する「フィジカルAI」という物理インフラの争奪戦へと移行した。日本の産業・医療データが採るべき法経済学的生存戦略を提示する。',
          toc: ['第1章 計算資源の物理的限界と「グリーン半導体」の地政学', '第2章 露光装置・材料サプライチェーンにおけるチョークポイント', '第3章 フィジカルAI時代のデータ戦略 ― 製造業の「秘匿」と医療データの「標準化」', '第4章 自動測量・スマートインフラと業務独占資格の再定義']
        },
        {
          id: 'work-4',
          type: '研究ノート・書評',
          category: 'note',
          title: '有価証券振替決済制度と権利の脱物質化',
          subtitle: '― 古典的文献から紐解く「証券なき権利」の系譜 ―',
          author: '安藤 和樹 [著]',
          publisher: 'Readings & Thoughts No.12',
          date: '2026年10月',
          pages: '24頁',
          coverStyle: 'forest',
          abstract: '『現代企業と有価証券の法理』および『有価証券振替決済制度の研究』という重要文献を精読し、株券等の保管振替制度から完全ペーパーレス化への移行期に議論された「混蔵寄託法理」と「口座簿の法的効力」の相克を振り返る。',
          toc: ['1. 問題意識 ― なぜ今、振替決済制度の古典的議論を再訪するのか', '2. 『現代企業と有価証券の法理』に見る有価証券概念の変容', '3. 『有価証券振替決済制度の研究』における混蔵寄託構成の限界', '4. 振替口座簿の「記録」に付与された法的効力と「帰属点法理」への接続']
        }
      ]
    };

    let slides = [];
    let newsItems = [];
    let worksData = [];
    let cmsWorksData = [];
    let paperSyncError = false;
    let paperRefreshInFlight = false;
    let currentSlide = 0;
    let slideTimer = null;

    function toggleMobileMenu() {
      const menu = document.getElementById('mobile-menu');
      menu.classList.toggle('hidden');
    }

    async function fetchCMSWithFallback() {
      const res = await fetch(GAS_API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }

    async function loadFromNotion() {
      const dot = document.getElementById('cms-status-dot');
      const ping = document.getElementById('cms-status-ping');
      const text = document.getElementById('cms-status-text');
      const updatedEl = document.getElementById('cms-updated-at');

      dot.className = 'relative inline-flex rounded-full h-2 w-2 bg-amber-400';
      ping.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75';
      text.textContent = 'Syncing with Notion CMS...';

      try {
        const data = await fetchCMSWithFallback();

        slides = (data.slides && data.slides.length) ? data.slides : FALLBACK_DATA.slides;
        newsItems = (data.news && data.news.length) ? data.news : FALLBACK_DATA.news;
        cmsWorksData = (data.works && data.works.length) ? data.works : FALLBACK_DATA.works;

        if (Array.isArray(data.profile) && data.profile[0]) {
          const p = data.profile[0];
          for (const [key, id] of Object.entries({
            name: 'profile-name',
            nameEn: 'profile-name-en',
            description: 'profile-description',
            themesHeading: 'profile-heading',
            themes: 'profile-themes'
          })) {
            if (p[key] !== undefined && p[key] !== null && String(p[key]).trim() !== '') {
              const element = document.getElementById(id);
              if (element) element.textContent = String(p[key]).replace(/<br\s*\/?>/gi, '\n');
            }
          }

          // Pillar text is editable in the profile sheet; keep the existing text as fallback.
          for (let i = 1; i <= 3; i++) {
            for (const [suffix, elementSuffix] of [['Title', 'title'], ['Description', 'description']]) {
              const value = p['pillar' + i + suffix];
              if (value !== undefined && value !== null && String(value).trim() !== '') {
                const element = document.getElementById('pillar-' + i + '-' + elementSuffix);
                if (element) element.textContent = String(value);
              }
            }
          }

          let destinationCount = 0;
          for (const [key, id] of Object.entries({
            creativeUrl: 'destination-creative',
            jazzUrl: 'destination-jazz',
            cafeUrl: 'destination-cafe'
          })) {
            const link = document.getElementById(id);
            try {
              const url = new URL(String(p[key] || '').trim());
              if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported URL');
              link.href = url.href;
              link.hidden = false;
              destinationCount++;
            } catch (_) {
              link.hidden = true;
              link.removeAttribute('href');
            }
          }
          document.getElementById('side-destinations').hidden = destinationCount === 0;
          document.body.classList.toggle('has-destinations', destinationCount > 0);
          const contact = document.getElementById('contact-link');
          const email = String(p.contactEmail || '').trim();
          if (/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(email)) {
            contact.href = 'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent('DX法研究会へのお問い合わせ');
            contact.hidden = false;
          } else {
            contact.hidden = true;
            contact.removeAttribute('href');
          }
          if (Object.prototype.hasOwnProperty.call(p, 'keywords')) {
            const values = Array.isArray(p.keywords) ? p.keywords : String(p.keywords ?? '').replace(/<br\s*\/?>/gi, '\n').split(/[\n\r、,，]+/);
            const target = document.getElementById('profile-keywords');
            if (target) {
              target.replaceChildren();
              values.map(value => String(value).trim()).filter(Boolean).forEach(value => {
                const tag = document.createElement('span');
                tag.className = 'keyword-tag';
                tag.textContent = value;
                target.appendChild(tag);
              });
            }
          }
        }

        currentSlide = 0;
        renderSlide();
        renderNews('all');
        startSlideAutoPlay();

        dot.className = 'relative inline-flex rounded-full h-2 w-2 bg-emerald-400';
        ping.className = 'hidden';
        text.textContent = 'Connected to Notion CMS';
        if (data.updatedAt) {
          const d = new Date(data.updatedAt);
          updatedEl.textContent = `Last Synced: ${d.toLocaleTimeString('ja-JP')}`;
        }
      } catch (err) {
        console.warn('CMS Fetch Fallback Activated:', err);
        slides = FALLBACK_DATA.slides;
        newsItems = FALLBACK_DATA.news;
        cmsWorksData = FALLBACK_DATA.works;
        renderSlide();
        renderNews('all');

        dot.className = 'relative inline-flex rounded-full h-2 w-2 bg-amber-500';
        ping.className = 'hidden';
        text.textContent = 'Archive Mode (Local Fallback Data)';
      }
    }


    // Separate read-only live feed from the actual Notion 論文リポジトリ.
    // Never substitute hard-coded works when the paper feed fails.
    async function loadPapersFromNotion() {
      if (!document.getElementById('works-grid') || paperRefreshInFlight) return;
      paperRefreshInFlight = true;
      const status = document.getElementById('paper-sync-status');
      try {
        const response = await fetch(PAPERS_API_URL, {cache:'no-cache'});
        if (!response.ok) throw new Error('Papers API HTTP ' + response.status);
        const data = await response.json();
        if (!Array.isArray(data.works)) throw new Error('Invalid papers payload');
        worksData = data.works.filter(w => {
          if (w.type !== '論文' || !String(w.title || '').trim()) return false;
          try {
            const url = new URL(w.url);
            return url.protocol === 'https:' && (
              url.hostname === 'notion.so' || url.hostname.endsWith('.notion.so') ||
              url.hostname === 'app.notion.com' || url.hostname.endsWith('.notion.site')
            );
          } catch (_) {
            return false;
          }
        });
        paperSyncError = false;
        renderWorks();
        status.textContent = 'Notion自動同期：' + worksData.length + '件';
      } catch (error) {
        console.warn('Notion papers could not be loaded:', error);
        paperSyncError = true;
        worksData = [];
        renderWorks();
        status.textContent = 'Notion論文同期エラー';
      } finally {
        paperRefreshInFlight = false;
      }
    }

    function startSlideAutoPlay() {
      if (!document.getElementById('slide-image')) return;
      if (slideTimer) clearInterval(slideTimer);
      slideTimer = setInterval(() => {
        if (slides.length > 1) nextSlide();
      }, 7000);
    }

    function renderSlide() {
      if (!slides.length || !document.getElementById('slide-image')) return;
      const s = slides[currentSlide];
      document.getElementById('slide-image').src = s.image || '';
      document.getElementById('slide-tag').textContent = s.tag || '';
      document.getElementById('slide-date').textContent = s.date || '';
      document.getElementById('slide-title').textContent = s.title || '';
      document.getElementById('slide-desc').textContent = s.description || '';
      document.getElementById('slide-counter').textContent = `0${currentSlide + 1} / 0${slides.length}`;

      const dotsContainer = document.getElementById('slide-dots');
      dotsContainer.innerHTML = slides.map((_, idx) => `
        <button onclick="goToSlide(${idx})" class="h-1.5 transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-academic-gold' : 'w-2 bg-stone-300 hover:bg-stone-400'}" aria-label="スライド ${idx + 1}"></button>
      `).join('');
    }

    function nextSlide() {
      if (!slides.length) return;
      currentSlide = (currentSlide + 1) % slides.length;
      renderSlide();
    }

    function prevSlide() {
      if (!slides.length) return;
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      renderSlide();
    }

    function goToSlide(idx) {
      currentSlide = idx;
      renderSlide();
      startSlideAutoPlay();
    }

    function renderNews(filterCategory = 'all') {
      const list = document.getElementById('news-list');
      if (!list) return;
      // Division-related announcements remain in the CMS but are not shown while study groups are inactive.
      const visibleNews = newsItems.filter(item => !String(item.title || '').includes('医療DX・データヘルス法制部会にて'));
      const filtered = filterCategory === 'all'
        ? visibleNews
        : visibleNews.filter(item => item.category === filterCategory);

      if (!filtered.length) {
        list.innerHTML = `<div class="py-8 text-sm text-stone-400 font-serif text-center">該当する新着情報はありません。</div>`;
        return;
      }

      const badgeStyles = {
        Publications: 'bg-academic-navy text-white border-academic-navy',
        Activity: 'bg-academic-stone text-academic-navy border-academic-line',
        Note: 'bg-amber-900/10 text-academic-gold border-academic-gold/30'
      };

      list.innerHTML = filtered.map(item => {
        const rawDate = String(item.date || '');
        return `
        <div class="py-4.5 sm:py-5 flex flex-col sm:flex-row sm:items-baseline gap-2.5 sm:gap-6 group border-l-2 border-transparent hover:border-academic-gold pl-0 hover:pl-3 transition-all duration-200">
          <div class="flex items-center gap-3 shrink-0">
            <span class="font-mono text-xs text-stone-400 w-22">${rawDate}</span>
            <span class="font-mono text-[10px] uppercase tracking-wider font-medium px-2.5 py-0.5 border ${badgeStyles[item.category] || 'bg-stone-100 text-stone-700'} w-26 text-center">
              ${item.category}
            </span>
          </div>
          <div class="flex-1">
            ${item.workId ? `
              <button onclick="openWorkModal('${item.workId}')" class="text-left text-sm font-serif text-stone-800 group-hover:text-academic-navy transition leading-relaxed flex items-baseline justify-between gap-2 w-full">
                <span class="group-hover:underline decoration-academic-gold underline-offset-4">${item.title}</span>
                <span class="text-academic-gold opacity-0 group-hover:opacity-100 transition-opacity text-xs shrink-0">閲覧 →</span>
              </button>
            ` : `
              <p class="text-sm font-serif text-stone-800 leading-relaxed">${item.title}</p>
            `}
          </div>
        </div>
      `}).join('');
    }

    function filterNews(category) {
      document.querySelectorAll('.news-filter-btn').forEach(btn => {
        if (btn.dataset.filter === category) {
          btn.className = 'news-filter-btn px-3 py-1 bg-academic-navy text-white font-mono text-[11px] transition';
        } else {
          btn.className = 'news-filter-btn px-3 py-1 bg-academic-stone text-stone-700 hover:bg-stone-300/70 font-mono text-[11px] transition';
        }
      });
      renderNews(category);
    }

    // Notionの「分野」「専門領域」「主学問分野」を優先順位付きで判定します。
    // 書籍種別＝論文という本棚掲載条件には影響しません。
    const PAPER_FAMILY_RULES = [
      {key: 'admin', label: '行政法系', terms: ['行政法', '行政救済法', '補助金法', '財政法', '公共政策学']},
      {key: 'finance', label: '金融法系', terms: ['金融法', '金融商品取引法', '有価証券法', '決済法', '信託法', '保険法', '通貨法', 'デジタル資産法']},
      {key: 'medical', label: '医事・社会保障法系', terms: ['医事法', '社会保障法']},
      {key: 'maritime', label: '海商・国際取引法系', terms: ['海商法', '国際取引法']},
      {key: 'labor', label: '労働法系', terms: ['労働法']},
      {key: 'civil', label: '民事・不動産法系', terms: ['民法', '物権法', '不動産法', '消費者法']},
      {key: 'info', label: '情報法・AI系', terms: ['法情報学', '情報法', 'AIガバナンス', '数理社会科学']},
      {key: 'history', label: '比較法・法制史系', terms: ['比較法', '法制史', '比較法史', 'イスラーム法']},
      {key: 'economy', label: '経済・経営学系', terms: ['経済学', '経営学', '金融機関経営', '制度経済学', '経営戦略論', '政治経済学', '貨幣経済学', '金融政策論', '金融経済学']},
      {key: 'literature', label: '文学系', terms: ['文学', '比較文学', '日本古典文学', '中国古典文学', '物語論', '神話研究', '宗教文学']}
    ];
    const PAPER_DEFAULT_FAMILY = {key: 'other', label: 'その他'};

    function paperColorFamily(work) {
      const field = String(work.field || '').trim();
      const terms = new Set([
        ...(Array.isArray(work.specialties) ? work.specialties : []),
        work.subfield || ''
      ].map(item => String(item).trim()).filter(Boolean));
      // 主学問分野が明示的に文学・経済・経営なら、個々の隣接専門領域より優先する。
      if (field === '文学') return {key: 'literature', label: '文学系'};
      if (field === '経済学' || field === '経営学') return {key: 'economy', label: '経済・経営学系'};
      for (const group of PAPER_FAMILY_RULES) {
        if (group.terms.some(term => terms.has(term))) return {key: group.key, label: group.label};
      }
      return PAPER_DEFAULT_FAMILY;
    }

    // Fixed color order. Other sorts change book order without creating separate shelves.
    const PAPER_GROUP_ORDER = [
      'admin', 'finance', 'medical', 'info', 'civil', 'economy',
      'literature', 'maritime', 'labor', 'history', 'other'
    ];
    // Research series are Notion-managed, orthogonal to discipline-based cover colors.
    const RESEARCH_SERIES = [
      {value: 'Ⅰ 制度的確定と損失帰属', description: '権利・給付の確定、誤記録、訂正、最終的な損失負担'},
      {value: 'Ⅱ AIによる行為帰属と責任', description: 'AI・情報システムが実行する行為の帰属と責任'},
      {value: 'Ⅲ 財産拘束と比較財産法', description: 'ワクフ・登記・信託を横断する財産拘束と処分権限'},
      {value: 'Ⅳ 法的責任と経済的リスク', description: '契約上の責任と実質的な経済リスクの分離'},
      {value: 'Ⅴ 公的配分と係数統治（育成）', description: '公的資金の配分係数と実際の負担帰着を検証する育成系列'}
    ];
    const PAPER_SORT_MODES = ['series', 'color', 'id', 'title', 'updated'];
    let paperSortMode = 'series';
    let paperSeriesFilter = 'all';

    function setPaperSeriesFilter(value) {
      if (value !== 'all' && value !== 'unclassified' && !RESEARCH_SERIES.some(s => s.value === value)) return;
      paperSeriesFilter = value;
      renderWorks();
    }

    function renderResearchSeries() {
      const container = document.getElementById('research-series-list');
      if (!container) return;
      container.replaceChildren();
      const selections = [
        {value: 'all', label: 'すべての論文', description: '登録済み論文をすべて表示'},
        ...RESEARCH_SERIES.map(s => ({value: s.value, label: s.value, description: s.description})),
        {value: 'unclassified', label: 'その他・未分類', description: '現時点で独立系列に割り当てていない論文'}
      ];
      for (const entry of selections) {
        const count = entry.value === 'all' ? worksData.length
          : worksData.filter(w => entry.value === 'unclassified'
            ? !w.researchSeries : w.researchSeries === entry.value).length;
        const selected = paperSeriesFilter === entry.value;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'text-left bg-white border p-4 sm:p-5 transition hover:border-academic-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-academic-gold ' +
          (selected ? 'border-academic-navy shadow-md ring-1 ring-academic-navy' : 'border-academic-line');
        button.setAttribute('aria-pressed', String(selected));
        button.setAttribute('aria-label', entry.label + 'の論文を表示');
        const heading = document.createElement('span');
        heading.className = 'block font-serif font-bold text-sm text-academic-navy leading-relaxed';
        heading.textContent = entry.label;
        const desc = document.createElement('span');
        desc.className = 'block text-xs text-stone-600 font-serif leading-relaxed mt-2';
        desc.textContent = entry.description;
        const amount = document.createElement('span');
        amount.className = 'block mt-3 text-xs font-mono text-academic-gold';
        amount.textContent = paperSyncError ? '同期未完了' : count + '件';
        button.append(heading, desc, amount);
        button.addEventListener('click', () => {
          setPaperSeriesFilter(entry.value);
          const shelf = document.getElementById('works');
          if (shelf) shelf.scrollIntoView({behavior: 'smooth', block: 'start'});
        });
        container.append(button);
      }
    }

    function comparePaperIds(a, b) {
      const left = String(a.paperId || '').trim();
      const right = String(b.paperId || '').trim();
      if (left && !right) return -1;
      if (!left && right) return 1;
      return left.localeCompare(right, 'ja', {numeric: true}) || String(a.title || '').localeCompare(String(b.title || ''), 'ja');
    }

    function sortedPapers() {
      const sorted = worksData.filter(w => paperSeriesFilter === 'all'
        || (paperSeriesFilter === 'unclassified' ? !w.researchSeries : w.researchSeries === paperSeriesFilter));
      sorted.sort((a, b) => {
        if (paperSortMode === 'series') {
          const aRank = RESEARCH_SERIES.findIndex(s => s.value === a.researchSeries);
          const bRank = RESEARCH_SERIES.findIndex(s => s.value === b.researchSeries);
          if (aRank !== bRank) return (aRank < 0 ? 999 : aRank) - (bRank < 0 ? 999 : bRank);
          const roleRank = role => role === '中核' || role === '育成中' ? 0 : 1;
          return roleRank(a.seriesRole) - roleRank(b.seriesRole) || comparePaperIds(a, b);
        }
        if (paperSortMode === 'color') {
          const aRank = PAPER_GROUP_ORDER.indexOf(paperColorFamily(a).key);
          const bRank = PAPER_GROUP_ORDER.indexOf(paperColorFamily(b).key);
          return aRank - bRank || comparePaperIds(a, b);
        }
        if (paperSortMode === 'title') {
          return String(a.title || '').localeCompare(String(b.title || ''), 'ja') || comparePaperIds(a, b);
        }
        if (paperSortMode === 'updated') {
          return String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')) || comparePaperIds(a, b);
        }
        return comparePaperIds(a, b);
      });
      return sorted;
    }

    function setPaperSort(mode) {
      if (!PAPER_SORT_MODES.includes(mode)) return;
      paperSortMode = mode;
      renderWorks();
    }

    function renderWorks() {
      const shelf = document.getElementById('works-grid');
      if (!shelf) return;
      renderResearchSeries();
      shelf.replaceChildren();
      if (!worksData.length) {
        const message = document.createElement('p');
        message.className = 'shelf-empty';
        message.textContent = paperSyncError
          ? '論文リポジトリを取得できませんでした。Notion連携の設定を確認してください。'
          : '「書籍種別：論文」に設定された論文はまだありません。';
        shelf.append(message);
        return;
      }

      const visiblePapers = sortedPapers();
      if (!visiblePapers.length) {
        const message = document.createElement('p');
        message.className = 'shelf-empty';
        message.textContent = 'この研究系列に登録された論文はありません。';
        shelf.append(message);
        return;
      }

      const textEl = (tag, cls, value) => {
        const el = document.createElement(tag);
        el.className = cls;
        el.textContent = value || '';
        return el;
      };
      for (const work of visiblePapers) {
        const family = paperColorFamily(work);
        const slot = document.createElement('div');
        slot.className = 'shelf-slot';

        const card = document.createElement('a');
        card.className = 'shelf-book cover-' + family.key;
        card.setAttribute('data-discipline', family.label);
        card.title = (work.researchSeries ? work.researchSeries + '｜' : '') +
          family.label + '｜' + work.title;
        card.href = work.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.setAttribute('aria-label', (work.title || '論文') + 'をNotionで開く');
        card.append(
          textEl('span', 'shelf-series', work.paperId || work.field || '研究論文'),
          textEl('span', 'shelf-rule', ''),
          textEl('span', 'shelf-title', work.title),
          textEl('span', 'shelf-subtitle', work.subtitle),
          textEl('span', 'shelf-author', work.maturity ? '研究段階：' + work.maturity : '論文'),
          textEl('span', 'shelf-open', 'Notionで開く ↗')
        );
        slot.append(card);
        shelf.append(slot);
      }
    }

    function openWorkModal(workId) {
      const w = worksData.find(item => item.id === workId) || cmsWorksData.find(item => item.id === workId);
      if (!w) return;
      const tocList = Array.isArray(w.toc) ? w.toc : String(w.toc || '').split('\n').filter(Boolean);

      const content = document.getElementById('modal-content');
      content.innerHTML = `
        <div class="border-b border-academic-line pb-5 mb-6">
          <div class="flex flex-wrap items-center gap-2.5 mb-3">
            <span class="text-xs font-serif px-3 py-0.5 bg-academic-navy text-white">${w.type}</span>
            <span class="font-mono text-xs text-academic-gold">${w.date}</span>
            <span class="text-stone-300">|</span>
            <span class="font-mono text-xs text-stone-500">${w.pages}</span>
          </div>
          <h3 class="font-serif text-xl sm:text-2xl font-bold text-academic-navy leading-snug">${w.title}</h3>
          <p class="font-serif text-sm sm:text-base text-stone-600 mt-1.5">${w.subtitle}</p>
          <p class="text-xs font-serif text-stone-500 mt-3">${w.author} &mdash; <span class="text-stone-700">${w.publisher}</span></p>
        </div>

        <div class="mb-7">
          <div class="flex items-center gap-2 mb-2.5">
            <span class="w-1.5 h-1.5 bg-academic-gold"></span>
            <h4 class="font-en text-xs font-bold uppercase tracking-[0.2em] text-academic-navy">Abstract / 要旨</h4>
          </div>
          <p class="text-xs sm:text-sm text-stone-700 leading-loose bg-white p-5 border border-academic-line font-serif">${w.abstract}</p>
        </div>

        <div class="mb-7">
          <div class="flex items-center gap-2 mb-2.5">
            <span class="w-1.5 h-1.5 bg-academic-gold"></span>
            <h4 class="font-en text-xs font-bold uppercase tracking-[0.2em] text-academic-navy">Table of Contents / 構成・目次</h4>
          </div>
          <ul class="bg-white border border-academic-line divide-y divide-stone-100 text-xs sm:text-sm text-stone-700">
            ${tocList.map((line, i) => `
              <li class="px-5 py-3 font-serif flex items-baseline gap-3 hover:bg-academic-stone/40 transition">
                <span class="font-mono text-[11px] text-academic-gold shrink-0">0${i + 1}</span>
                <span>${line}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        ${w.bodyText ? `
        <div class="mb-7">
          <div class="flex items-center gap-2 mb-2.5">
            <span class="w-1.5 h-1.5 bg-academic-gold"></span>
            <h4 class="font-en text-xs font-bold uppercase tracking-[0.2em] text-academic-navy">Full Text / 本文（Googleドキュメント連携）</h4>
          </div>
          <div class="text-sm text-stone-800 leading-loose bg-white p-6 border border-academic-line whitespace-pre-wrap font-serif max-h-96 overflow-y-auto">${w.bodyText}</div>
        </div>
        ` : ''}

        <div class="flex justify-end pt-2">
          <button onclick="closeModal()" class="px-6 py-2.5 text-xs font-serif font-medium bg-academic-navy text-white hover:bg-academic-deep transition">閉じる (Close)</button>
        </div>
      `;
      document.getElementById('work-modal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('work-modal').classList.add('hidden');
    }

    function handleModalBackdropClick(e) {
      if (e.target.id === 'work-modal') closeModal();
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    document.addEventListener('DOMContentLoaded', () => {
      loadFromNotion();  // homepage news/slides and author profile (if present)
      if (document.getElementById('works-grid')) {
        loadPapersFromNotion();  // repository: ONLY Notion book type 論文
        setInterval(() => {
          if (!document.hidden) loadPapersFromNotion();
        }, 5 * 60 * 1000);
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) loadPapersFromNotion();
        });
      }
    });
