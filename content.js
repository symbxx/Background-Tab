/**
 * 解析和解码重定向链接
 * 支持常见的重定向链接格式和Base64编码
 * @param {string} url - 原始URL
 * @returns {string} - 解码后的真实URL
 */
function decodeRedirectUrl(url) {
  try {
    // 解析URL对象
    const urlObj = new URL(url);
    
    // 检查是否是重定向链接
    if (urlObj.pathname.includes('/go/') || urlObj.pathname.includes('/url/') || 
        urlObj.pathname.includes('/redirect/') || urlObj.search.includes('url=') || 
        urlObj.search.includes('target=') || urlObj.search.includes('to=')) {
      
      // 提取可能的编码参数
      const params = new URLSearchParams(urlObj.search);
      let encodedUrl = null;
      
      // 检查常见的重定向参数名
      for (const param of ['url', 'target', 'to', 'link', 'goto', 'redirect']) {
        if (params.has(param)) {
          encodedUrl = params.get(param);
          break;
        }
      }
      
      if (encodedUrl) {
        // 先进行URL解码
        encodedUrl = decodeURIComponent(encodedUrl);
        
        // 检查是否是Base64编码
        if (/^[A-Za-z0-9+/=]+$/.test(encodedUrl)) {
          try {
            // 尝试Base64解码
            const decodedUrl = atob(encodedUrl);
            
            // 验证解码结果是否是有效URL
            if (decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) {
              console.log('解码后的URL:', decodedUrl);
              return decodedUrl;
            }
          } catch (e) {
            // Base64解码失败，继续使用原始URL
            console.log('Base64解码失败:', e);
          }
        }
        
        // 如果解码后的URL看起来像一个有效URL，则返回它
        if (encodedUrl.startsWith('http://') || encodedUrl.startsWith('https://')) {
          return encodedUrl;
        }
      }
    }
    
    // 如果没有识别为重定向链接或解码失败，返回原始URL
    return url;
  } catch (e) {
    console.error('URL解析错误:', e);
    return url; // 出错时返回原始URL
  }
}

document.addEventListener('click', function (event) {
  // 检查是否点击的是链接元素
  let linkElement = event.target;
  
  // 如果点击的不是直接的A标签，检查其父元素
  if (linkElement.tagName !== 'A') {
    linkElement = event.target.closest('a');
    if (!linkElement) return; // 如果没有找到链接元素，直接返回
  }
  
  // 确保链接有href属性
  if (!linkElement.href || linkElement.href.trim() === '' || linkElement.href.startsWith('javascript:')) {
    return; // 忽略没有href或javascript:协议的链接
  }
  
  // 阻止默认行为，避免页面跳转
  event.preventDefault();
  
  // 解码URL，获取真实目标地址
  const decodedUrl = decodeRedirectUrl(linkElement.href);
  
  // 使用chrome.runtime.sendMessage发送消息给background.js处理
  chrome.runtime.sendMessage({
    action: 'openInBackgroundTab',
    url: decodedUrl
  });
}, true); // 使用捕获阶段
