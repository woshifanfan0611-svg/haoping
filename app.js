/* 好评文案助手 · 火星桌游吧 */

// ============================================================
// API 配置
// ============================================================

const API_BASE = 'https://huoxinghp.top';

// ============================================================
// 常量
// ============================================================

const PLATFORMS = [
  { id: 'meituan',  name: '美团',     icon: '🛵', themeColor: '#FFD100' },
  { id: 'dianping', name: '大众点评', icon: '⭐', themeColor: '#FF6633' }
];

// ============================================================
// Mock 数据（API 不可用时的客户端降级）
// ============================================================

const HIGHLIGHTS = [
  { title: '免费饮品', detail: '饮料全部免费自取' },
  { title: '禁烟环境', detail: '全店禁烟，空气清新' },
  { title: '桌游超多', detail: '四五百款桌游可选' },
  { title: '包教包会', detail: '店员耐心讲解规则' },
  { title: '专业推荐', detail: '根据人数喜好推荐游戏' },
];

const MEITUAN_TEMPLATES = [
  (hl) => `朋友推荐来的这家店，第一次体验桌游，真的挺惊喜的！${hl[0].title}这点很加分，${hl[1].detail}。店员态度也特别好，玩了一下午都不觉得累，下次还会约朋友来。`,
  (hl) => `周末跟朋友来这儿玩了一下午，整体感觉很舒服。${hl[0].detail}，而且${hl[1].title}，对新手特别友好。是个消磨时间的好地方，推荐！`,
  (hl) => `发现了一家宝藏桌游店！环境干净，${hl[0].title}很到位，${hl[1].detail}。游戏种类多到选不过来，店员会帮忙推荐，体验感很好～`,
  (hl) => `下班跟同事过来放松的，比吃饭唱歌有意思多了。${hl[0].title}让人很舒服，${hl[1].title}这点也很赞。第一次来就爱上了，性价比也高。`,
  (hl) => `一个人闲逛发现的小店，进去待了一下午。${hl[0].title}真的很贴心，而且${hl[1].detail}。氛围轻松，一个人来也不会尴尬，真心不错。`,
  (hl) => `被同学拉来玩桌游，本来还担心不会玩，结果体验超预期！${hl[0].title}，${hl[1].detail}。玩了好几个游戏，每个都有人教，太适合我这种小白了。`,
  (hl) => `团建选在这里太明智了！${hl[0].detail}，${hl[1].title}也让人惊喜。一群人玩得特别嗨，比去KTV有意思，以后团建就认准这儿了。`,
  (hl) => `收藏了很久终于来打卡了，果然没让我失望。${hl[0].title}很加分，而且${hl[1].detail}。桌游品类丰富，店员专业，一下午根本玩不够。`,
];

const DIANPING_TEMPLATES = [
  (hl) => `【环境】店铺位置好找，空间宽敞不拥挤。${hl[0].detail}，这个细节很加分。

【服务】店员态度热情，${hl[1].detail}。每款游戏都会耐心讲解，新手也不用担心上手慢。

【体验】玩了三个多小时，氛围轻松愉快。整体来说是一家很值得来的桌游店。`,
  (hl) => `【交通】位置方便，到了直接就能找到。店内环境干净整洁，${hl[0].detail}。

【游戏】桌游品类真的很丰富，${hl[1].title}，完全不用担心选择困难。

【感受】跟朋友来得很值，大家都说下次还要聚在这里，体验感很好。`,
  (hl) => `【第一印象】进门就感觉氛围很好，${hl[0].detail}，这点特别满意。

【亮点】${hl[1].title}做得很好，店员专业又耐心。游戏过程中有问题随时问，讲解得很清楚。

【总结】无论是朋友聚会还是一个人消磨时间都很合适，性价比和体验都超出预期。`,
  (hl) => `【为什么选这家】网上搜到的，冲着${hl[0].title}来的，确实名不虚传。

【实际感受】${hl[1].detail}，而且整体环境很舒服，不会嘈杂。游戏过程中店员还会适时给建议。

【回头率】已经跟朋友约好了下次再来，这种体验在桌游店里算很不错的了。`,
  (hl) => `【到店】下午去的，人不是很多，正好有位置。${hl[0].title}这一点很贴心，${hl[1].detail}。

【游戏过程】店里的桌游种类多到让人选择困难，但店员会根据我们的人数和喜好来推荐，很专业。几个人玩得特别开心。

【推荐理由】适合各种人群，不管是老玩家还是小白都能找到乐趣，是一家用心经营的店。`,
  (hl) => `【初体验】被朋友带来的，一开始还有点紧张怕不会玩。结果${hl[1].title}，很快就上手了。

【亮点细节】${hl[0].detail}，这个对体验感提升很大。店里整体氛围轻松，不会觉得有压力。

【总结评价】非常满意的一次体验，打破了我对桌游店的刻板印象，会推荐给其他朋友。`,
];

function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function mockGenerate(platform) {
  const hl = pickRandom(HIGHLIGHTS, 2);
  const templates = platform === 'meituan' ? MEITUAN_TEMPLATES : DIANPING_TEMPLATES;
  const template = pickRandom(templates, 1)[0];
  return template(hl);
}

// ============================================================
// 状态
// ============================================================

const state = {
  platform: 'meituan',
  review: '',
  loading: false,
  copied: false,
  images: [],
  isMock: false
};

// ============================================================
// DOM 引用
// ============================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  page:          $('#app'),
  reviewCard:    $('#review-card'),
  imageList:     $('#image-list'),
  copyBtn:       $('#copy-btn'),
  guideOverlay:  $('#guide-overlay'),
  toast:         $('#toast'),
  platformTabs:  $$('.platform-tab')
};

// ============================================================
// App 方法
// ============================================================

const App = {

  // ---- 初始化 ----
  init() {
    this.loadImages();
  },

  // ---- 平台切换 ----
  switchPlatform(platform) {
    if (platform === state.platform) return;

    state.platform = platform;
    state.copied = false;

    dom.page.className = `page platform-${platform}`;

    dom.platformTabs.forEach(tab => {
      const isActive = tab.dataset.platform === platform;
      tab.classList.toggle('active', isActive);
    });
  },

  // ---- 生成文案 ----
  async generate() {
    const { platform } = state;

    state.loading = true;
    state.isMock = false;
    this.renderReviewCard('loading');

    let apiSuccess = false;

    try {
      const apiUrl = API_BASE ? `${API_BASE}/api/generate` : '/api/generate';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });

      const data = await res.json();

      if (data.success) {
        state.review = data.review;
        state.isMock = false;
        apiSuccess = true;
      }
    } catch (err) {
      console.warn('[api] 远程 API 不可用，使用本地 Mock:', err.message);
    }

    if (!apiSuccess) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
      state.review = mockGenerate(platform);
      state.isMock = true;
    }

    state.loading = false;
    state.copied = false;
    this.renderReviewCard('content');
    dom.page.classList.add('generated');
    dom.copyBtn.disabled = false;
    dom.copyBtn.textContent = '📋 复制文案';
    dom.copyBtn.classList.remove('copied');
  },

  // ---- 渲染文案卡片 ----
  renderReviewCard(mode) {
    const { platform, review, isMock } = state;

    if (mode === 'loading') {
      dom.reviewCard.innerHTML = `
        <div class="loading-container">
          <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <div class="loading-text">AI 正在生成文案...</div>
        </div>`;
    } else if (mode === 'content' && review) {
      const styleClass = platform === 'meituan' ? 'meituan-style' : 'dianping-style';
      const mockBadge = isMock
        ? '<div class="mock-badge">📱 演示文案（部署 API 后可 AI 生成）</div>'
        : '';
      dom.reviewCard.innerHTML = `
        <div class="review-content">
          ${mockBadge}
          <div class="review-text ${styleClass}">${this.escapeHtml(review)}</div>
        </div>`;
    } else {
      dom.reviewCard.innerHTML = `
        <div class="review-empty">
          <div class="empty-icon">✨</div>
          <div class="empty-text">点击上方按钮，AI 帮你写好评</div>
        </div>`;
    }
  },

  // ---- 复制文案 ----
  async copy() {
    if (!state.review || state.copied) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(state.review);
      } else {
        this.fallbackCopy(state.review);
      }

      state.copied = true;
      dom.copyBtn.textContent = '✅ 已复制';
      dom.copyBtn.classList.add('copied');
      dom.guideOverlay.classList.remove('hidden');
    } catch (err) {
      try {
        this.fallbackCopy(state.review);
        state.copied = true;
        dom.copyBtn.textContent = '✅ 已复制';
        dom.copyBtn.classList.add('copied');
        dom.guideOverlay.classList.remove('hidden');
      } catch (e2) {
        this.showToast('复制失败，请手动长按文案复制');
      }
    }
  },

  // 降级复制
  fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (!ok) throw new Error('execCommand failed');
  },

  // ---- 关闭引导弹窗 ----
  closeGuide() {
    dom.guideOverlay.classList.add('hidden');
  },

  // ---- 加载环境图 ----
  loadImages() {
    const IMAGE_URLS = [
      'https://img.imgdd.com/40d938dc-14c7-4a44-868f-3771fdaf61ed.jpg',
      'https://img.imgdd.com/a11f73f0-f07c-4531-87b3-e26ff9735e2d.jpg',
      'https://img.imgdd.com/840356e3-8017-4dfd-a6d3-63219326507e.jpg',
      'https://img.imgdd.com/098ba841-46a8-49e8-ba9c-03ac17b2df5d.jpg',
      'https://img.imgdd.com/46e0936d-e78a-4f5a-a482-c84f71a5ed25.jpg',
      'https://img.imgdd.com/99447ade-0aa3-494a-9c01-5421f9013cb6.jpg',
      'https://img.imgdd.com/ea5a2404-049d-4d30-9e33-21fdf03eabb1.jpg',
      'https://img.imgdd.com/432638c8-2ba6-4718-9568-5243cbee9759.jpg',
      'https://img.imgdd.com/43f2eaf1-0999-4358-8173-0d852248a187.jpg',
      'https://img.imgdd.com/5b52b079-eecd-4cde-98f2-e8a5d6022b0f.jpg',
      'https://img.imgdd.com/b919470b-546e-4dfd-ab94-0a447c5e86f4.jpg',
      'https://img.imgdd.com/15e4e4e7-f28a-406c-abe4-5bccac223bae.jpg',
      'https://img.imgdd.com/4dfdede0-ddd7-4fa2-8724-11075eb2e887.jpg',
      'https://img.imgdd.com/e2b76600-560e-4250-a34d-d88a7d2c7267.jpg',
      'https://img.imgdd.com/1a10b9da-0c17-495e-9502-6f6fbfa65203.jpg'
    ];
    const shuffled = IMAGE_URLS.sort(() => Math.random() - 0.5);
    state.images = shuffled.slice(0, 3).map((url, i) => ({
      id: i, src: url, label: '店内实拍'
    }));
    this.renderImages();
  },

  // ---- 渲染环境图 ----
  renderImages() {
    dom.imageList.innerHTML = state.images.map(img => `
      <div class="image-item" onclick="App.onTapImage()">
        <img class="env-image" src="${img.src}" alt="${img.label}" loading="lazy" />
        <div class="image-label">${img.label}</div>
      </div>
    `).join('');
  },

  // ---- 点击环境图 ----
  onTapImage() {
    this.showToast('长按图片即可保存到相册');
  },

  // ---- Toast ----
  toastTimer: null,
  showToast(msg) {
    clearTimeout(this.toastTimer);
    dom.toast.textContent = msg;
    dom.toast.classList.remove('hidden');
    this.toastTimer = setTimeout(() => {
      dom.toast.classList.add('hidden');
    }, 2000);
  },

  // ---- HTML 转义 ----
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// ============================================================
// 启动
// ============================================================

document.addEventListener('DOMContentLoaded', () => App.init());
