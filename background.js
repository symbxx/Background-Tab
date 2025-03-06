chrome.runtime.onInstalled.addListener(() => {
  console.log("Background Tab Extension Installed.");
});

// 监听来自content.js的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 处理在后台标签页中打开链接的请求
  if (message.action === 'openInBackgroundTab' && message.url) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const currentTab = tabs[0];

        // 创建新标签页并把它放在当前标签页的右侧
        chrome.tabs.create({
          url: message.url,
          active: false,
          index: currentTab.index + 1 // 在右侧位置创建新标签
        }, (newTab) => {
          // 获取所有标签页并确保新标签页排在当前标签的右侧
          chrome.tabs.query({}, (allTabs) => {
            // 确保标签的顺序：当前标签 -> 新标签 -> 之前的标签
            allTabs.forEach((tab) => {
              if (tab.index > currentTab.index && tab.id !== newTab.id) {
                chrome.tabs.move(tab.id, { index: tab.index + 1 });
              }
            });
          });
        });
      }
    });
  }
  return true; // 表示异步响应
});

// 保留扩展图标点击功能，但简化为显示popup
chrome.action.onClicked.addListener((tab) => {
  // 不再注入脚本，因为content.js已经处理了链接点击
  console.log("Extension icon clicked");
});
