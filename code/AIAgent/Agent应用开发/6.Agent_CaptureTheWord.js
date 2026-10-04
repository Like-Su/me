import config from './config.js'

// ---------- 模拟 Vue 响应式数据与方法 (纯 JS) ----------
// 由于原代码依赖 import.meta.env.VITE_KIMI_API_KEY, 这里我们使用占位提示
// 真实使用时请替换为你的 API KEY

// 配置：请在此填入您的 Moonshot API Key
const KIMI_API_KEY = config.OPENAI_KEY_COMMON;  // <--- 在这里填写你的 API Key (sk-...)
// 如果没有 key，会弹出提示

// 状态变量
let word = '请上传图片';
let audio = '';           // 未使用
let sentence = '';
let detailExpand = false;
let imgPreview = 'https://res.bearbobo.com/resource/upload/W44yyxvl/upload-ih56twxirei.png'; // 默认预览图

let explainations = [];
let expReply = [];

// DOM 元素
const wordDisplay = document.getElementById('wordDisplay');
const sentenceDisplay = document.getElementById('sentenceDisplay');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('selecteImage');
const previewImg = document.getElementById('previewImg');
const expandPanel = document.getElementById('expandPanel');

// 用于存储详情按钮引用
let detailButton = null;

// 提示词 格式化
const userPrompt = `
分析图片内容，找出最能描述图片的一个英文单词，尽量选择更简单的A1~A2的词汇。

返回JSON数据：
{
"image_discription": "图片描述",
"representative_word": "图片代表的英文单词",
"example_sentence": "结合英文单词和图片描述，给出一个简单的例句",
"explaination": "结合图片解释英文单词，段落以Look at...开头，将段落分句，每一句单独一行，解释的最后给一个日常生活有关的问句",
"explaination_replys": ["根据explaination给出的回复1", "根据explaination给出的回复2"]
}
`;

// ---------- 工具函数 ----------
// 更新 UI 根据状态
function renderUI() {
  // 更新单词显示
  wordDisplay.textContent = word;

  // 更新例句
  sentenceDisplay.textContent = sentence || '';

  // 更新预览图片 (如果有)
  if (imgPreview) {
    // 显示预览图
    if (previewImg) {
      previewImg.src = imgPreview;
      previewImg.style.display = 'block';
    }
    // 同时更新展开区内的图片 (如果有)
    const expandImg = document.querySelector('#expandPanel img');
    if (expandImg) expandImg.src = imgPreview;
  }

  // 重新构建展开区 (因v-for在原生JS中需手动构建)
  buildExpandPanel();

  // 更新详情按钮文字
  if (detailButton) {
    detailButton.textContent = detailExpand ? '收起' : 'Talk about it';
  }

  // 切换 .fold 和 .expand 的显示 —— 使用 DOM 操作
  const detailsDiv = document.querySelector('.details');
  if (detailsDiv) {
    // 移除旧的fold/expand
    const oldFold = detailsDiv.querySelector('.fold');
    const oldExpand = detailsDiv.querySelector('.expand');
    if (oldFold) oldFold.remove();
    if (oldExpand) oldExpand.remove();

    if (!detailExpand) {
      // 折叠状态：加回 fold
      const foldDiv = document.createElement('div');
      foldDiv.className = 'fold';
      detailsDiv.appendChild(foldDiv);
    } else {
      // 展开状态：创建 expand 面板
      const expandDiv = document.createElement('div');
      expandDiv.className = 'expand';
      expandDiv.id = 'expandPanel';

      // 图片
      if (imgPreview) {
        const img = document.createElement('img');
        img.src = imgPreview;
        img.alt = 'preview';
        expandDiv.appendChild(img);
      }

      // explainations
      explainations.forEach(item => {
        const div = document.createElement('div');
        div.className = 'explaination';
        const p = document.createElement('p');
        p.textContent = item;
        div.appendChild(p);
        expandDiv.appendChild(div);
      });

      // replies
      expReply.forEach(item => {
        const div = document.createElement('div');
        div.className = 'reply';
        const p = document.createElement('p');
        p.textContent = item;
        div.appendChild(p);
        expandDiv.appendChild(div);
      });

      detailsDiv.appendChild(expandDiv);
    }
  }
}

// 构建展开面板内容 (仅在展开时使用, 上面renderUI已包含, 但保留函数以备独立调用)
function buildExpandPanel() {
  // 已经由 renderUI 中的逻辑处理，这里可以留空或调用 renderUI
  // 但为了避免循环调用，我们不在 renderUI 里调用 renderUI。
  // 这里只作为占位，实际由 renderUI 处理展开面板。
  // 若展开面板存在但数据变了，也可重新构建。但 renderUI 整体会重建。
  // 所以这个函数不做复杂操作。
}

// ---------- 核心更新逻辑 ----------
async function update(imageData) {
  imgPreview = imageData;
  // 立即显示图片预览
  if (previewImg) {
    previewImg.src = imageData;
    previewImg.style.display = 'block';
  }
  // 更新UI
  renderUI();

  // 检查 API Key
  if (!KIMI_API_KEY) {
    word = '缺少API Key';
    sentence = '请在代码中设置 KIMI_API_KEY';
    explainations = ['请填写 Moonshot API Key 后重试。'];
    expReply = ['你需要一个有效的 API Key 才能获取分析结果。'];
    renderUI();
    alert('请先在代码中设置 KIMI_API_KEY (Moonshot API 密钥)');
    return;
  }

  word = '分析中...';
  sentence = '';
  explainations = [];
  expReply = [];
  renderUI();

  const endpoint = `${config.OPENAI_BASE_URL_COMMON}/chat/completions`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${KIMI_API_KEY}`
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: 'Qwen/Qwen3-VL-30B-A3B-Thinking',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: "image_url",
                image_url: {
                  "url": imageData,
                },
              },
              {
                type: "text",
                text: userPrompt,
              }
            ]
          }
        ],
        stream: false,
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API 回复:', data);

    // 解析 JSON
    const content = data.choices[0].message.content;
    let replyData;
    try {
      replyData = JSON.parse(content);
    } catch (e) {
      console.error('JSON 解析失败:', content);
      throw new Error('返回内容不是有效的 JSON');
    }

    word = replyData.representative_word || '未知';
    sentence = replyData.example_sentence || '';

    // 处理 explaination 按行拆分
    if (replyData.explaination) {
      explainations = replyData.explaination.split('\n').filter(item => item.trim() !== '');
    } else {
      explainations = [];
    }

    expReply = replyData.explaination_replys || [];

  } catch (error) {
    console.error('请求失败:', error);
    word = '出错';
    sentence = `请求失败: ${error.message}`;
    explainations = ['无法获取分析，请检查网络或 API 密钥。'];
    expReply = ['抱歉，出了点问题。'];
  }

  // 更新界面
  renderUI();
}

// ---------- 事件处理 ----------
function triggerFileInput() {
  fileInput.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const imageData = e.target.result; // base64
    // 调用 update
    update(imageData);
  };
  reader.readAsDataURL(file);
  // 清空 input 以便再次选择同一文件
  fileInput.value = '';
}

function toggleDetail() {
  detailExpand = !detailExpand;
  renderUI();
}

// ---------- 初始化界面 ----------
function init() {
  // 设置默认预览图 (示例图)
  imgPreview = '';
  word = '请上传图片';
  sentence = '';
  explainations = [];
  expReply = [];
  detailExpand = false;

  // 更新预览img元素
  if (previewImg) {
    previewImg.src = imgPreview;
    previewImg.style.display = 'block';
  } 

  console.log(uploadArea)
  // 绑定事件
  if (uploadArea) {
    uploadArea.addEventListener('click', triggerFileInput);
  }
  if (fileInput) {
    fileInput.addEventListener('change', handleFileChange);
  }

  // 获取详情按钮并绑定事件 (按钮在 .details 内)
  const detailsDiv = document.querySelector('.details');
  if (detailsDiv) {
    // 移除旧的按钮 (如果存在)
    const oldBtn = detailsDiv.querySelector('button');
    if (oldBtn) oldBtn.remove();

    const btn = document.createElement('button');
    btn.textContent = 'Talk about it';
    btn.addEventListener('click', toggleDetail);
    detailsDiv.insertBefore(btn, detailsDiv.firstChild);
    detailButton = btn;
  }

  // 首次渲染
  renderUI();
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);
