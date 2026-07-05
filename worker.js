// Cloudflare Worker — 好评文案助手 API
// 独立部署到 workers.dev，与 GitHub Pages 前端配合
//
// 部署：npx wrangler deploy
// 然后在前端 app.js 中设置 API_BASE = 'https://<你的>.workers.dev'

// ============================================================
// 店铺亮点库（每次随机选 2 条，AI 只看到被选中的）
// ============================================================

const HIGHLIGHTS = [
  { title: '免费饮品', detail: '饮料全部免费自取，不用额外花钱买水喝' },
  { title: '禁烟环境', detail: '全店禁烟，空气清新，待一下午都不会被烟味熏' },
  { title: '桌游超多', detail: '四五百款桌游可选，架子上堆得满满当当' },
  { title: '包教包会', detail: '每款游戏店员都会耐心讲解规则，新手完全不用担心学不会' },
  { title: '专业推荐', detail: '店员会根据人数和喜好，帮你挑最适合的游戏，不用自己纠结选什么' },
];

// ============================================================
// 顾客场景库（每次随机选 1 条，避免开头重复）
// ============================================================

const SCENES = [
  '你是被朋友推荐来的，工作日下班后跟几个朋友一起过来玩。',
  '你是一个人下午没事干，想找个地方消磨时间，搜到这家店就来了。',
  '你是公司团建来的，一群人热热闹闹的，第一次来这家店。',
  '你是个桌游老玩家，听说这家店桌游很多，晚上专门来探店。',
  '你是第一次玩桌游的新手，被朋友拉着来的，一开始还担心不会玩。',
  '你午饭后跟朋友临时约的，随便搜了附近找了这家店。',
  '你是跟同事下班后聚会，想找个跟吃饭唱歌不一样的活动。',
  '你是一个人闲逛时偶然发现这家店的，傍晚推门进去看看。',
  '你是被同学拉来的，之前没玩过桌游，抱着试试看的心态。',
  '你是网上看到这家店收藏了很久，终于趁放假来打卡。',
];

function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// 标签 → 亮点 选择逻辑
function selectHighlights(tags) {
  if (!tags || tags.length === 0) return pickRandom(HIGHLIGHTS, 2);
  const matching = HIGHLIGHTS.filter(h => tags.includes(h.title));
  if (matching.length === 0) return pickRandom(HIGHLIGHTS, 2);
  if (matching.length === 1) {
    const other = HIGHLIGHTS.filter(h => h.title !== matching[0].title);
    return [matching[0], ...pickRandom(other, 1)];
  }
  return pickRandom(matching, 2);
}

// ============================================================
// Prompt 构建
// ============================================================

function buildPrompt(platform, tags) {
  const hl = selectHighlights(tags);
  const scene = pickRandom(SCENES, 1)[0];

  if (platform === 'meituan') {
    return {
      system: `你是一个真人顾客，刚在一家桌游店玩完，随手写条美团好评。不要写成营销文案。

${scene}

这家店的亮点：${hl[0].detail}；另外，${hl[1].detail}。

核心规则：
- 50-100字，一个自然段落
- 用"这家店""这儿""他家"指代店铺，绝不要提店名
- 根据上面给你的场景来写开头，自然地提及"${hl[0].title}"和"${hl[1].title}"，但不要写成广告语
- 结尾不要总是"下次还来""还会再来"，有时自然收尾即可
- 加入一两个具体的小细节

禁止：
- 不要提狼人杀、不要提具体价格数字、不要提零食、不要提宠物
- 绝对不要提任何具体饮料品牌或种类（可乐、雪碧、柠檬水、冰红茶、汽水等），只能说"饮料"或"饮品"
- 不要用"环境好""服务好""性价比高"这类空洞总结词
- 不要每句结尾都加"哈哈哈"`,
      user: `写一条桌游店的美团好评，自然提到"${hl[0].title}"和"${hl[1].title}"就行。直接给文案。`
    };
  } else {
    return {
      system: `你是一个真人顾客，刚在一家桌游店玩完，认真写条大众点评好评给其他人参考。不要写成营销文案。

${scene}

这家店的亮点：${hl[0].detail}；另外，${hl[1].detail}。

核心规则：
- 80-200字，分段格式，每段用【】小标题
- 用"这家店""这儿""他家"指代店铺，绝不要提店名
- 根据上面给你的场景来写开头，自然地提及"${hl[0].title}"和"${hl[1].title}"，但不要写成广告语
- 小标题每次不一样（2-4段），根据内容自然起标题
- 结尾不要总是"下次还来""强烈推荐"，有时自然收尾即可
- 段落结构和侧重点每条都要不同

禁止：
- 不要提狼人杀、不要提具体价格数字、不要提零食、不要提宠物
- 绝对不要提任何具体饮料品牌或种类（可乐、雪碧、柠檬水、冰红茶、汽水等），只能说"饮料"或"饮品"
- 不要用"环境好""服务好""性价比高"这类空洞总结词`,
      user: `写一条桌游店的大众点评好评，自然提到"${hl[0].title}"和"${hl[1].title}"就行。直接给文案。`
    };
  }
}

// ============================================================
// 辅助
// ============================================================

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// ============================================================
// Worker 入口
// ============================================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // 健康检查
    if (url.pathname === '/' || url.pathname === '/health') {
      return json({ status: 'ok', service: '好评文案助手 API' });
    }

    // --- /api/generate ---
    if (url.pathname === '/api/generate') {
      if (request.method !== 'POST') {
        return json({ success: false, error: '请使用 POST 请求' }, 405);
      }

      let body;
      try { body = await request.json(); }
      catch { return json({ success: false, error: '请求格式错误' }, 400); }

      const { platform = 'meituan', tags } = body;
      const { system, user } = buildPrompt(platform, tags);
      const apiKey = env.DEEPSEEK_API_KEY;

      if (!apiKey) {
        return json({ success: false, error: '未配置 API Key' }, 500);
      }

      try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user }
            ],
            temperature: 0.9,
            max_tokens: 500
          })
        });

        const data = await res.json();

        if (data.choices && data.choices.length > 0) {
          return json({ success: true, review: data.choices[0].message.content.trim() });
        }

        return json({ success: false, error: data.error?.message || 'API 返回为空' }, 502);
      } catch (err) {
        return json({ success: false, error: 'AI 服务请求失败，请重试' }, 500);
      }
    }

    // 404
    return json({ error: 'Not Found' }, 404);
  }
};
