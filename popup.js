// 获取 DOM 元素
const extractBtn = document.getElementById('extractBtn');
const resultContent = document.getElementById('resultContent');
const copyBtn = document.getElementById('copyBtn');

// 提取按钮点击事件
extractBtn.addEventListener('click', async () => {
  try {
    // 获取当前活动标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 向 content script 发送消息执行提取
    chrome.tabs.sendMessage(tab.id, { action: 'extract' }, (response) => {
      if (chrome.runtime.lastError) {
        resultContent.textContent = '错误: ' + chrome.runtime.lastError.message;
        return;
      }

      if (response && response.data) {
        resultContent.textContent = JSON.stringify(response.data, null, 2);
        copyBtn.style.display = 'block';
      } else {
        resultContent.textContent = '未提取到信息';
      }
    });
  } catch (error) {
    resultContent.textContent = '错误: ' + error.message;
  }
});

// 复制按钮点击事件
copyBtn.addEventListener('click', () => {
  const text = resultContent.textContent;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = '已复制!';
    setTimeout(() => {
      copyBtn.textContent = '复制到剪贴板';
    }, 2000);
  }).catch(err => {
    alert('复制失败: ' + err.message);
  });
});
