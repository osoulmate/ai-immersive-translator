// options.js - 处理选项页面的设置

document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveButton');
    const status = document.getElementById('status');
    
    // 加载保存的设置
    loadSettings();
    
    // 保存设置按钮点击事件
    saveButton.addEventListener('click', saveSettings);
});

// 加载设置
function loadSettings() {
    chrome.storage.local.get([
        'apiKey',
        'targetLang',
        'minLength',
        'maxLength',
        'batchSize',
        'delayMs',
        'translationStyle',
        'showProgress',
        'showNotifications',
        'targetSelectors',
        'excludeSelectors'
    ], (result) => {
        // API 设置
        if (result.apiKey) {
            document.getElementById('apiKey').value = result.apiKey;
        }
        
        // 翻译设置
        if (result.targetLang) {
            document.getElementById('targetLang').value = result.targetLang;
        }
        if (result.minLength) {
            document.getElementById('minLength').value = result.minLength;
        }
        if (result.maxLength) {
            document.getElementById('maxLength').value = result.maxLength;
        }
        
        // 性能设置
        if (result.batchSize) {
            document.getElementById('batchSize').value = result.batchSize;
        }
        if (result.delayMs) {
            document.getElementById('delayMs').value = result.delayMs;
        }
        
        // 界面设置
        if (result.translationStyle) {
            document.getElementById('translationStyle').value = result.translationStyle;
        }
        if (result.showProgress !== undefined) {
            document.getElementById('showProgress').checked = result.showProgress;
        }
        if (result.showNotifications !== undefined) {
            document.getElementById('showNotifications').checked = result.showNotifications;
        }
        
        // 高级设置
        if (result.targetSelectors) {
            document.getElementById('targetSelectors').value = result.targetSelectors.join('\n');
        }
        if (result.excludeSelectors) {
            document.getElementById('excludeSelectors').value = result.excludeSelectors.join('\n');
        }
    });
}

// 保存设置
function saveSettings() {
    const settings = {
        apiKey: document.getElementById('apiKey').value.trim(),
        targetLang: document.getElementById('targetLang').value,
        minLength: parseInt(document.getElementById('minLength').value),
        maxLength: parseInt(document.getElementById('maxLength').value),
        batchSize: parseInt(document.getElementById('batchSize').value),
        delayMs: parseInt(document.getElementById('delayMs').value),
        translationStyle: document.getElementById('translationStyle').value,
        showProgress: document.getElementById('showProgress').checked,
        showNotifications: document.getElementById('showNotifications').checked,
        targetSelectors: document.getElementById('targetSelectors').value.trim().split('\n').filter(line => line.trim()),
        excludeSelectors: document.getElementById('excludeSelectors').value.trim().split('\n').filter(line => line.trim())
    };
    
    chrome.storage.local.set(settings, () => {
        // 显示保存成功消息
        const status = document.getElementById('status');
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 2000);
    });
}
