/* 好评文案助手 · H5 版逻辑 */

// ============================================================
// 常量
// ============================================================

const PLATFORMS = [
  { id: 'meituan',  name: '美团',     icon: '🛵', themeColor: '#FFD100' },
  { id: 'dianping', name: '大众点评', icon: '⭐', themeColor: '#FF6633' }
];

// ============================================================
// 状态
// ============================================================

const state = {
  platform: 'meituan',
  review: '',
  loading: false,
  copied: false,
  images: []
};

// ============================================================
// DOM 引用
// ============================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  page:        $('#app'),
  reviewCard:  $('#review-card'),
  imageList:   $('#image-list'),
  copyBtn:     $('#copy-btn'),
  guideOverlay:$('#guide-overlay'),
  toast:       $('#toast'),
  platformTabs:$$('.platform-tab')
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

    // 更新 page class
    dom.page.className = `page platform-${platform}`;

    // 更新平台标签 active
    dom.platformTabs.forEach(tab => {
      const isActive = tab.dataset.platform === platform;
      tab.classList.toggle('active', isActive);
    });
  },

  // ---- 生成文案 ----
  async generate() {
    const { platform } = state;

    state.loading = true;
    this.renderReviewCard('loading');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });

      const data = await res.json();

      if (data.success) {
        state.review = data.review;
        state.loading = false;
        state.copied = false;
        this.renderReviewCard('content');
        dom.page.classList.add('generated');
        dom.copyBtn.disabled = false;
        dom.copyBtn.textContent = '📋 复制文案';
        dom.copyBtn.classList.remove('copied');
      } else {
        throw new Error(data.error || '生成失败');
      }
    } catch (err) {
      state.loading = false;
      // 如果之前有文案，保留旧文案不丢失
      if (state.review) {
        this.renderReviewCard('content');
        dom.page.classList.add('generated');
        dom.copyBtn.disabled = false;
      } else {
        this.renderReviewCard('empty');
      }
      this.showToast('生成失败，请重试');
      console.error('[generate]', err);
    }
  },

  // ---- 渲染文案卡片 ----
  renderReviewCard(mode) {
    const { platform, review } = state;

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
      dom.reviewCard.innerHTML = `
        <div class="review-content">
          <div class="review-text ${styleClass}">${this.escapeHtml(review)}</div>
        </div>`;
    } else {
      // empty
      dom.reviewCard.innerHTML = `
        <div class="review-empty">
          <div class="empty-icon">✨</div>
          <div class="empty-text">选好标签，点击上方按钮生成好评</div>
        </div>`;
      dom.refreshBtn.classList.add('hidden');
    }
  },

  // ---- 复制文案 ----
  async copy() {
    if (!state.review || state.copied) return;

    try {
      // 优先使用 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(state.review);
      } else {
        // 降级：execCommand
        this.fallbackCopy(state.review);
      }

      state.copied = true;
      dom.copyBtn.textContent = '✅ 已复制';
      dom.copyBtn.classList.add('copied');
      dom.guideOverlay.classList.remove('hidden');
    } catch (err) {
      // Clipboard API 失败，尝试降级
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

  // 降级复制方案（execCommand）
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
        <img class="env-image" src="${img.src}" alt="${img.label}" />
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
