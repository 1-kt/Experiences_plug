// ========== 地区数据配置 ==========

const countryData = {
  Japan: [
    { name: 'Aichi', code: 'ACH' },
    { name: 'Fukuoka', code: 'FUK' },
    { name: 'Gifu', code: 'JP9' },
    { name: 'Hiroshima', code: 'HIJ' },
    { name: 'Hokkaido', code: 'HKO' },
    { name: 'Hyogo', code: 'JPH' },
    { name: 'Ishikawa', code: 'IHK' },
    { name: 'Kanagawa', code: 'JPG' },
    { name: 'Kyoto', code: 'KIX' },
    { name: 'Mie', code: 'IE2' },
    { name: 'Nagano', code: 'JPE' },
    { name: 'Nara', code: 'JP8' },
    { name: 'Okayama', code: 'OKJ' },
    { name: 'Okinawa', code: 'AHA' },
    { name: 'Osaka', code: 'ITM' },
    { name: 'Sapporo', code: 'SPP' },
    { name: 'Tokyo', code: 'NRT' }
  ],
  Singapore: [
    { name: 'Singapore', code: 'SIN' }
  ],
  China: [
    { name: 'Beijing', code: 'PEK' },
    { name: 'Chengdu - Sichuan', code: 'CTU' },
    { name: 'Chongqing', code: 'CKG' },
    { name: 'Dali - Yunnan', code: 'DLU' },
    { name: 'Dalian - Liaoning', code: 'DLC' },
    { name: 'Datong - Shanxi', code: 'DAT' },
    { name: 'Guangzhou - Guangdong', code: 'CN1' },
    { name: 'Guilin - Guangxi', code: 'KWL' },
    { name: 'Guiyang - Guizhou', code: 'KWE' },
    { name: 'Hangzhou - Zhejiang', code: 'HGH' },
    { name: 'Huangshan - Anhui', code: 'HUG' },
    { name: 'Kunming - Yunnan', code: 'KMH' },
    { name: 'Lanzhou - Gansu', code: 'LZD' },
    { name: 'Lhasa - Tibet', code: 'LXA' },
    { name: 'Lijiang - Yunnan', code: 'LJG' },
    { name: 'Nanchang - Jiangxi', code: 'KHN' },
    { name: 'Nanjing - Jiangsu', code: 'NKG' },
    { name: 'Qingdao - Shandong', code: 'CN6' },
    { name: 'Sanya - Hainan', code: 'SYX' },
    { name: 'Shanghai', code: 'PVG' },
    { name: 'Shenzhen - Guangdong', code: 'SZX' },
    { name: 'Suzhou - Anhui', code: 'UZS' },
    { name: 'Taiyuan - Shanxi', code: 'TYN' },
    { name: 'Tianjin', code: 'TSN' },
    { name: 'Urumqi - Xinjiang', code: 'URC' },
    { name: 'Wuhan - Hubei', code: 'WUH' },
    { name: "Xi'an - Shaanxi", code: 'XIY' },
    { name: 'Xiamen - Fujian', code: 'XMN' },
    { name: "Zhangjiajie - Hu'nan", code: 'DYG' },
    { name: "Zhengzhou - He'nan", code: 'CGO' },
    { name: 'Zhuhai - Guangdong', code: 'ZUH' },
    { name: "Zhuzhou - Hu'nan", code: 'ZHU' }
  ],
  'South Korea': [
    { name: 'Busan', code: 'PUS' },
    { name: 'Gyeongju', code: 'KR3' },
    { name: 'Jeju-Do', code: 'CJU' },
    { name: 'Seoul', code: 'ICN' }
  ],
  'Hong Kong': [
    { name: 'Hong Kong', code: 'HKG' }
  ]
};

// ========== 创建浮动面板 ==========

function createFloatingPanel() {
  // 检查是否已存在
  if (document.getElementById('my-extension-panel')) {
    return;
  }

  // 创建容器
  const panel = document.createElement('div');
  panel.id = 'my-extension-panel';
  panel.innerHTML = `
    <style>
      #my-extension-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 280px;
      }
      #my-extension-panel .panel-header {
        padding: 12px 16px;
        background: #4285f4;
        color: white;
        border-radius: 8px 8px 0 0;
        font-weight: 500;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
      }
      #my-extension-panel .panel-header .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
      }
      #my-extension-panel .panel-body {
        padding: 16px;
      }
      #my-extension-panel .form-group {
        margin-bottom: 12px;
      }
      #my-extension-panel .form-group label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        color: #333;
        font-weight: 500;
      }
      #my-extension-panel .form-group select {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        cursor: pointer;
      }
      #my-extension-panel .form-group select:focus {
        outline: none;
        border-color: #4285f4;
      }
      #my-extension-panel .result-area {
        margin-top: 12px;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 6px;
        font-size: 12px;
        color: #666;
        min-height: 40px;
      }
      #my-extension-panel .apply-btn {
        width: 100%;
        margin-top: 12px;
        padding: 10px;
        background: #34a853;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        font-weight: 500;
      }
      #my-extension-panel .apply-btn:hover {
        background: #2d9247;
      }
    </style>
    <div class="panel-header">
      <span>🌍 地区选择器</span>
      <button class="close-btn" onclick="this.closest('#my-extension-panel').remove()">×</button>
    </div>
    <div class="panel-body">
      <div class="form-group">
        <label for="country-select">国家</label>
        <select id="country-select">
          <option value="">请选择国家</option>
        </select>
      </div>
      <div class="form-group">
        <label for="region-select">地区</label>
        <select id="region-select" disabled>
          <option value="">请先选择国家</option>
        </select>
      </div>
      <div class="result-area" id="result-area">
        请选择国家和地区
      </div>
      <button class="apply-btn" id="apply-btn">应用选择</button>
    </div>
  `;

  document.body.appendChild(panel);

  // 绑定事件
  const countrySelect = panel.querySelector('#country-select');
  const regionSelect = panel.querySelector('#region-select');
  const resultArea = panel.querySelector('#result-area');
  const applyBtn = panel.querySelector('#apply-btn');

  // 动态填充国家选项
  Object.keys(countryData).forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  });

  // 国家选择改变
  countrySelect.addEventListener('change', () => {
    const country = countrySelect.value;
    regionSelect.innerHTML = '<option value="">请选择地区</option>';

    if (country && countryData[country]) {
      regionSelect.disabled = false;
      countryData[country].forEach(region => {
        const option = document.createElement('option');
        option.value = region.code;
        option.textContent = `${region.name}-${region.code}`;
        regionSelect.appendChild(option);
      });
    } else {
      regionSelect.disabled = true;
      regionSelect.innerHTML = '<option value="">请先选择国家</option>';
    }
    updateResult();
  });

  // 地区选择改变
  regionSelect.addEventListener('change', updateResult);

  // 更新结果显示
  function updateResult() {
    const country = countrySelect.value;
    const regionCode = regionSelect.value;
    const regionText = regionSelect.options[regionSelect.selectedIndex]?.text || '';

    if (country && regionCode) {
      resultArea.innerHTML = `
        <strong>已选择:</strong><br>
        国家: ${country}<br>
        地区: ${regionText}<br>
        代码: ${regionCode}
      `;
    } else if (country) {
      resultArea.innerHTML = `请选择地区`;
    } else {
      resultArea.innerHTML = `请选择国家和地区`;
    }
  }

  // 应用按钮点击
  applyBtn.addEventListener('click', () => {
    const country = countrySelect.value;
    const regionCode = regionSelect.value;
    const regionText = regionSelect.options[regionSelect.selectedIndex]?.text || '';

    if (country && regionCode) {
      // 发送消息给 background
      chrome.runtime.sendMessage({
        action: 'setDestination',
        data: {
          country: country,
          regionCode: regionCode,
          regionName: regionText.split('-')[0]
        }
      }, (response) => {
        if (response && response.success) {
          resultArea.innerHTML = `✅ 已设置: ${regionText}`;
        }
      });
    } else {
      resultArea.innerHTML = `⚠️ 请先选择国家和地区`;
    }
  });

  // 拖拽功能
  makeDraggable(panel);
}

// 使面板可拖拽
function makeDraggable(element) {
  const header = element.querySelector('.panel-header');
  let isDragging = false;
  let startX, startY, initialX, initialY;

  header.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('close-btn')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = element.offsetLeft;
    initialY = element.offsetTop;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    element.style.left = (initialX + dx) + 'px';
    element.style.top = (initialY + dy) + 'px';
    element.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// 页面加载完成后创建面板
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingPanel);
} else {
  createFloatingPanel();
}

// ========== 原有功能保留 ==========

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract') {
    const extractedData = extractPageInfo();
    sendResponse({ data: extractedData });
  }
  return true;
});

/**
 * 提取页面信息
 */
function extractPageInfo() {
  return {
    pageInfo: {
      title: document.title,
      url: window.location.href,
      domain: window.location.hostname
    },
    meta: {
      description: getMetaContent('description'),
      keywords: getMetaContent('keywords'),
      author: getMetaContent('author')
    },
    content: {
      headings: getHeadings(),
      paragraphs: getParagraphs(),
      links: getLinks(),
      images: getImages()
    },
    extractedAt: new Date().toISOString()
  };
}

function getMetaContent(name) {
  const meta = document.querySelector(`meta[name="${name}"]`);
  return meta ? meta.content : '';
}

function getHeadings() {
  const headings = document.querySelectorAll('h1, h2, h3');
  return Array.from(headings).map(h => ({
    tag: h.tagName,
    text: h.textContent.trim()
  }));
}

function getParagraphs() {
  const paragraphs = document.querySelectorAll('p');
  return Array.from(paragraphs)
    .map(p => p.textContent.trim())
    .filter(text => text.length > 0)
    .slice(0, 10);
}

function getLinks() {
  const links = document.querySelectorAll('a[href]');
  return Array.from(links).map(a => ({
    text: a.textContent.trim(),
    href: a.href
  })).slice(0, 20);
}

function getImages() {
  const images = document.querySelectorAll('img');
  return Array.from(images).map(img => ({
    src: img.src,
    alt: img.alt || ''
  })).filter(img => img.src).slice(0, 10);
}
