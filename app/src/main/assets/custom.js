// ====== 强制桌面模式 ======
// 锁定桌面版UA
Object.defineProperty(navigator, 'userAgent', {
  value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
  writable: false
});

// 强制桌面视图（通用解决方案）
localStorage.setItem('force_desktop', 'true');
sessionStorage.setItem('desktop_view', '1');
document.cookie = "desktop_view=1; path=/; max-age=31536000";

// 针对特定网站的优化
if(window.location.hostname.includes('zhihu.com')) {
  document.cookie = "os=pc; path=/";
} else if(window.location.hostname.includes('weibo.com')) {
  document.cookie = "SUB=_2AkMTWkF9f8NxqwFRmP8Rz2PiaIVyyQDEieKkqXgZJRMxHRl-yT9kqnAetRB6OeS8w8YvYSQp7jJZxVHdS6yK6qV4a1Ug";
}
// ====== 优化后的复制按钮 ======
// 创建复制按钮
function createCopyButton() {
  // 移除旧按钮
  const oldBtn = document.getElementById('pake-copy-btn');
  if(oldBtn) oldBtn.remove();
  
  // 创建新按钮
  const btn = document.createElement('button');
  btn.id = 'pake-copy-btn';
  btn.innerHTML = '📋 复制网址';
  
  // 优化后的位置设置（上移70px）
  btn.style.cssText = `
    position: fixed;
    bottom: 70px;    /* 上移70px */
    right: 25px;
    z-index: 9999;
    padding: 10px 20px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 15px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
    transition: all 0.3s ease;
  `;
  
  // 添加点击事件
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showNotification('✅ 网址已复制到剪贴板');
    } catch (err) {
      fallbackCopy();
    }
  });
  
  document.body.appendChild(btn);
  
  // 添加智能避让功能
  setTimeout(() => {
    detectElementConflicts(btn);
  }, 1000);
}

// 智能避让网页元素
function detectElementConflicts(btn) {
  const btnRect = btn.getBoundingClientRect();
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(el => {
    if(el === btn) return;
    
    const elRect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    
    // 检查元素是否与按钮重叠
    if (
      elRect.bottom > btnRect.top &&
      elRect.top < btnRect.bottom &&
      elRect.right > btnRect.left &&
      elRect.left < btnRect.right
    ) {
      // 如果元素是交互元素且可见
      if (
        (el.tagName === 'BUTTON' || 
        el.tagName === 'A' || 
        el.onclick) && 
        styles.display !== 'none' && 
        styles.visibility !== 'hidden'
      ) {
        // 智能调整位置
        const newPosition = calculateBestPosition(btn, el);
        btn.style.bottom = `${newPosition.bottom}px`;
        btn.style.right = `${newPosition.right}px`;
      }
    }
  });
}

// 计算最佳位置
function calculateBestPosition(btn, conflictElement) {
  const conflictRect = conflictElement.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  
  // 尝试向上移动
  const moveUpPosition = conflictRect.bottom + 20;
  if(moveUpPosition < window.innerHeight - 100) {
    return { bottom: moveUpPosition, right: parseInt(btn.style.right) };
  }
  
  // 尝试向左移动
  const moveLeftPosition = window.innerWidth - conflictRect.left + 20;
  if(moveLeftPosition > 150) {
    return { bottom: parseInt(btn.style.bottom), right: moveLeftPosition };
  }
  
  // 默认向上移动更多
  return { bottom: parseInt(btn.style.bottom) + 50, right: parseInt(btn.style.right) };
}

// 兼容旧设备的复制方法
function fallbackCopy() {
  const textarea = document.createElement('textarea');
  textarea.value = window.location.href;
  textarea.style.position = 'fixed';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    const success = document.execCommand('copy');
    showNotification(success ? '✅ 网址已复制' : '❌ 复制失败，请长按网址手动复制');
  } catch (err) {
    showNotification('❌ 复制失败: ' + err);
  }
  
  document.body.removeChild(textarea);
}

// 显示操作提示
function showNotification(message) {
  let notification = document.getElementById('pake-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'pake-notification';
    notification.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.85);
      color: white;
      padding: 12px 25px;
      border-radius: 30px;
      z-index: 10000;
      font-size: 15px;
      transition: opacity 0.4s;
      opacity: 0;
      white-space: nowrap;
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
    `;
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.style.opacity = 1;
  
  setTimeout(() => {
    notification.style.opacity = 0;
  }, 2500);
}

// 页面加载完成后添加按钮
if (document.readyState === 'complete') {
  createCopyButton();
} else {
  window.addEventListener('load', createCopyButton);
}

// 防止SPA应用按钮消失
setInterval(() => {
  if(!document.getElementById('pake-copy-btn')) {
    createCopyButton();
  }
}, 3000);