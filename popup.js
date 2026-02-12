// popup.js - 增强版

async function sendMessageWithInjectionFallback(tabId, payload) {
    try {
        await chrome.tabs.sendMessage(tabId, payload);
        return;
    } catch (error) {
        const message = error?.message || '';
        const shouldInject = message.includes('Receiving end does not exist') || message.includes('Could not establish connection');

        if (!shouldInject) {
            throw error;
        }

        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['cache.js', 'content.js']
        });

        await chrome.scripting.insertCSS({
            target: { tabId },
            files: ['inject.css']
        });

        await chrome.tabs.sendMessage(tabId, payload);
    }
}

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
            if (!tab?.id) {
                throw new Error('未找到当前标签页');
            }

            await sendMessageWithInjectionFallback(tab.id, {
                action: 'start_translate',
                apiKey,
                targetLang
            });

            setTimeout(() => {
                translateBtn.disabled = false;
                translateBtn.textContent = '开始翻译';
                window.close();
            }, 3000);

        } catch (error) {
            console.error('错误:', error);
            const reason = error?.message ? `\n原因：${error.message}` : '';
            alert(`翻译失败，请刷新页面重试${reason}`);
            translateBtn.disabled = false;
            translateBtn.textContent = '开始翻译';
        }
    });
});
