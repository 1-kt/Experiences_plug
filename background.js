// ========== chrome.debugger 网络请求拦截与修改 ==========

// 存储已附加的标签页
const attachedTabs = new Set();

// 存储用户选择的目的地代码
let selectedDestinationCode = null;

// 存储请求拦截规则（可动态修改）
const interceptionRules = {
  // 是否启用拦截
  enabled: true,
  // 需要拦截的 URL 模式（通配符）
  patterns: ['*'],
  // 需要拦截的请求阶段（必须是单个字符串）
  requestStage: 'Request'
};

// ========== 工具函数 ==========

// 获取当前活动标签页
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/**
 * 检查 URL 是否可以附加 debugger
 * @param {string} url - 要检查的 URL
 * @returns {boolean} 是否可以附加
 */
function canAttachToUrl(url) {
  if (!url) return false;

  // 不允许附加的 URL 协议
  const forbiddenProtocols = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'about:',
    'data:',
    'file:///',
    'moz-extension://',
    'chrome-search://',
    'devtools://'
  ];

  // 检查是否以禁止的协议开头
  for (const protocol of forbiddenProtocols) {
    if (url.startsWith(protocol)) {
      return false;
    }
  }

  return true;
}

/**
 * 获取标签页信息并检查是否可以附加
 * @param {number} tabId - 标签页 ID
 * @returns {Promise<boolean>} 是否可以附加
 */
async function canAttachToTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    return canAttachToUrl(tab.url);
  } catch (error) {
    return false;
  }
}

// 附加 debugger 到标签页
async function attachDebugger(tabId) {
  if (attachedTabs.has(tabId)) {
    console.log(`[Debugger] 标签页 ${tabId} 已附加`);
    return;
  }

  // 检查是否可以附加到该标签页
  const canAttach = await canAttachToTab(tabId);
  if (!canAttach) {
    console.log(`[Debugger] 跳过标签页 ${tabId}: 不支持附加的 URL`);
    return;
  }

  try {
    // 获取标签页信息用于日志
    const tab = await chrome.tabs.get(tabId);
    console.log(`[Debugger] 正在附加到标签页 ${tabId}: ${tab.url}`);

    await chrome.debugger.attach({ tabId }, '1.3');
    attachedTabs.add(tabId);
    console.log(`[Debugger] 成功附加到标签页 ${tabId}`);

    // 启用 Network 域
    await chrome.debugger.sendCommand({ tabId }, 'Network.enable');
    console.log(`[Debugger] Network.enable 已启用`);

    // 启用 Fetch 域（用于拦截和修改请求）
    await chrome.debugger.sendCommand(
      { tabId },
      'Fetch.enable',
      {
        patterns: [
          {
            urlPattern: interceptionRules.patterns.join('|'),
            requestStage: interceptionRules.requestStage
          }
        ]
      }
    );
    console.log(`[Debugger] Fetch.enable 已启用，拦截模式:`, interceptionRules.patterns);

  } catch (error) {
    console.error(`[Debugger] 附加失败 (${tabId}):`, error.message);
  }
}

// 分离 debugger
async function detachDebugger(tabId) {
  try {
    await chrome.debugger.detach({ tabId });
    attachedTabs.delete(tabId);
    console.log(`[Debugger] 已从标签页 ${tabId} 分离`);
  } catch (error) {
    console.error(`[Debugger] 分离失败:`, error);
  }
}

// ========== 请求拦截与修改 ==========

/**
 * 修改请求体
 * @param {Object} request - 请求对象
 * @param {string} postData - 原始请求体数据
 * @returns {Object} 修改后的请求参数
 */
function modifyRequest(request, postData = '') {
  const modification = {};

  // 如果用户选择了目的地代码，修改请求体中的 destinationCode
  if (postData && selectedDestinationCode) {
    try {
      const postDataJson = JSON.parse(postData);
      const originalValue = postDataJson.destinationCode;

      // 使用用户选择的目的地代码
      postDataJson.destinationCode = selectedDestinationCode;

      console.log(`║ [修改] destinationCode: ${originalValue} → ${selectedDestinationCode}`);

      // 转换为 base64 编码
      const jsonStr = JSON.stringify(postDataJson);
      modification.postData = btoa(unescape(encodeURIComponent(jsonStr)));
    } catch (e) {
      console.log('║ [修改] JSON 解析失败:', e.message);
    }
  } else if (postData) {
    console.log('║ [跳过] 未设置目的地代码');
  }

  return modification;
}

// ========== Debugger 事件监听 ==========

// 监听 Fetch 事件（请求拦截）
chrome.debugger.onEvent.addListener((source, method, params) => {
  const tabId = source.tabId;

  if (method === 'Fetch.requestPaused') {
    handleRequestPaused(tabId, params);
  } else if (method === 'Network.requestWillBeSent') {
    logRequestWillBeSent(params);
  } else if (method === 'Network.responseReceived') {
    logResponseReceived(params);
  } else if (method === 'Network.loadingFailed') {
    logLoadingFailed(params);
  }
});

// 处理请求暂停事件（可以修改请求）
async function handleRequestPaused(tabId, params) {
  const { requestId, request, resourceType } = params;

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║ [请求拦截]', request.method, request.url);
  console.log('║ ─────────────────────────────────────────────────────────────');
  console.log('║ 资源类型:', resourceType);
  console.log('║ 请求ID:', requestId);

  // 打印请求头
  if (request.headers && request.headers.length > 0) {
    const headersObj = {};
    request.headers.forEach(h => {
      headersObj[h.name] = h.value;
    });
    console.log('║ [请求头]:', JSON.stringify(headersObj, null, 2));
  }

  // 获取请求体
  let postData = request.postData || '';

  // 如果 request.postData 不存在，尝试从 stream 获取
  if (!postData && request.hasPostData) {
    console.log('║ [请求体] 使用 stream 获取...');
    try {
      const streamResult = await chrome.debugger.sendCommand(
        { tabId },
        'Fetch.takeRequestBodyAsStream',
        { requestId }
      );

      // 读取 stream 内容
      let bodyData = '';
      let offset = 0;
      const chunkSize = 10000000;

      while (true) {
        const readResult = await chrome.debugger.sendCommand(
          { tabId },
          'IO.read',
          { handle: streamResult.streamHandle, offset, size: chunkSize }
        );

        if (readResult.data) {
          const binaryString = atob(readResult.data);
          bodyData += binaryString;
          offset += binaryString.length;
        }

        if (readResult.eof) break;
      }

      await chrome.debugger.sendCommand(
        { tabId },
        'IO.close',
        { handle: streamResult.streamHandle }
      );

      postData = bodyData;
      console.log('║ [请求体 Stream] 成功获取');
    } catch (error) {
      console.error('║ [请求体 Stream] 获取失败:', error.message);
    }
  }

  // 打印请求体
  if (postData) {
    console.log('║ [原始请求体]:', postData);
    try {
      const postDataJson = JSON.parse(postData);
      console.log('║ [请求体 JSON]:', JSON.stringify(postDataJson, null, 2));
    } catch (e) {}
  }

  // 获取修改参数（传入原始请求体）
  const modification = modifyRequest(request, postData);

  // 继续请求
  try {
    await chrome.debugger.sendCommand(
      { tabId },
      'Fetch.continueRequest',
      {
        requestId,
        ...modification
      }
    );
    console.log('║ [继续请求] 成功');
  } catch (error) {
    console.error('║ [继续请求] 失败:', error.message);
    await chrome.debugger.sendCommand(
      { tabId },
      'Fetch.failRequest',
      { requestId, errorReason: 'BlockedByClient' }
    );
  }

  console.log('╚════════════════════════════════════════════════════════════════╝');
}

// 打印请求即将发送
function logRequestWillBeSent(params) {
  const { request, requestId, timestamp } = params;
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║ [请求发送]', request.method, request.url);
  console.log('║ ─────────────────────────────────────────────────────────────');
  console.log('║ 请求ID:', requestId);
  console.log('║ 时间戳:', new Date(timestamp * 1000).toISOString());
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

// 打印响应接收
function logResponseReceived(params) {
  const { request, response, requestId, timestamp, type } = params;
  // 安全访问 request 属性
  const method = request?.method || 'UNKNOWN';
  const url = request?.url || 'UNKNOWN';
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║ [响应接收]', method, url);
  console.log('║ ─────────────────────────────────────────────────────────────');
  console.log('║ 状态码:', response?.status, response?.statusText);
  console.log('║ 类型:', type);
  console.log('║ 请求ID:', requestId);
  console.log('║ 响应头:', response?.headers);
  console.log('║ 时间戳:', new Date(timestamp * 1000).toISOString());
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

// 打印加载失败
function logLoadingFailed(params) {
  const { request, errorText, requestId, timestamp, type, resourceType } = params;
  // 安全访问 request 属性
  const method = request?.method || 'UNKNOWN';
  const url = request?.url || 'UNKNOWN';
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║ [请求失败]', method, url);
  console.log('║ ─────────────────────────────────────────────────────────────');
  console.log('║ 错误:', errorText);
  console.log('║ 类型:', type || resourceType || 'UNKNOWN');
  console.log('║ 请求ID:', requestId);
  console.log('║ 时间戳:', new Date(timestamp * 1000).toISOString());
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

// ========== 标签页生命周期 ==========

// 当标签页更新时附加 debugger
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 检查 URL 是否可以附加
    if (canAttachToUrl(tab.url)) {
      await attachDebugger(tabId);
    } else {
      console.log(`[Debugger] 跳过标签页 ${tabId}: ${tab.url}`);
    }
  }
});

// 当标签页激活时确保 debugger 已附加
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  // 检查 URL 是否可以附加
  const canAttach = await canAttachToTab(tabId);
  if (canAttach) {
    await attachDebugger(tabId);
  }
});

// 当标签页关闭时分离 debugger
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (attachedTabs.has(tabId)) {
    await detachDebugger(tabId);
  }
});

// ========== 消息处理 ==========

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startIntercept') {
    // 开始拦截当前标签页
    getActiveTab().then(tab => {
      if (tab) attachDebugger(tab.id);
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'stopIntercept') {
    // 停止拦截当前标签页
    getActiveTab().then(tab => {
      if (tab) detachDebugger(tab.id);
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'updateRules') {
    // 更新拦截规则
    Object.assign(interceptionRules, request.rules);
    // 重新附加所有标签页以应用新规则
    attachedTabs.forEach(tabId => {
      detachDebugger(tabId).then(() => attachDebugger(tabId));
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'setDestination') {
    // 设置目的地代码
    selectedDestinationCode = request.data.regionCode;
    console.log(`[设置目的地] ${request.data.country} - ${request.data.regionName} (${request.data.regionCode})`);
    sendResponse({ success: true });
    return true;
  }
});

// ========== 插件安装/更新 ==========

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  if (details.reason === 'install') {
    console.log('║ [插件] 插件已安装');
  } else if (details.reason === 'update') {
    console.log('║ [插件] 插件已更新');
  }
  console.log('║ [插件] 使用 chrome.debugger 进行网络请求拦截');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  // 附加到当前活动标签页
  const tab = await getActiveTab();
  if (tab) {
    await attachDebugger(tab.id);
  }
});

// 启动时附加到当前标签页
getActiveTab().then(tab => {
  if (tab) attachDebugger(tab.id);
});

console.log('✅ chrome.debugger 网络拦截已加载');
