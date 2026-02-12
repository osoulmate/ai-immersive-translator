// popup.js - 增强版

document.addEventListener('DOMContentLoaded', () => {
    const translateBtn = document.getElementById('translateBtn');
    const apiKeyInput = document.getElementById('apiKey');
    const targetLangSelect = document.getElementById('targetLang');

    // 加载保存的设置
    chrome.storage.local.get(['apiKey', 'targetLang'], (result) => {
        if (result.apiKey) {
            apiKeyInput.value = result.apiKey;
        }
        if (result.targetLang) {
            targetLangSelect.value = result.targetLang;
        }
    });

    // 保存设置
    document.getElementById('saveSettings').addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const targetLang = targetLangSelect.value;

        if (apiKey) {
            chrome.storage.local.set({ apiKey, targetLang }, () => {
                alert('设置已保存');
            });
        } else {
            alert('请输入 API Key');
        }
    });

    // 开始翻译
    translateBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const targetLang = targetLangSelect.value;

        if (!apiKey) {
            alert('请先配置 API Key');
            return;
        }

        translateBtn.disabled = true;
        translateBtn.textContent = '翻译中...';

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            await chrome.tabs.sendMessage(tab.id, {
                action: 'start_translate',
                apiKey: apiKey,
                targetLang: targetLang
            });

            // 3秒后恢复按钮
            setTimeout(() => {
                translateBtn.disabled = false;
                translateBtn.textContent = '开始翻译';
                window.close(); // 自动关闭弹窗
            }, 3000);

        } catch (error) {
            console.error('错误:', error);
            alert('翻译失败，请刷新页面重试');
            translateBtn.disabled = false;
            translateBtn.textContent = '开始翻译';
        }
    });
});