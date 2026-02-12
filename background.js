class TranslationCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 1000;
  }

  getKey(text, targetLang) {
    return text + '|' + targetLang;
  }

  get(text, targetLang) {
    const key = this.getKey(text, targetLang);
    const value = this.cache.get(key);

    if (value !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }

    return value;
  }

  set(text, targetLang, result) {
    const key = this.getKey(text, targetLang);

    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, result);

    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

class TranslationQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.queue = [];
    this.active = 0;
  }

  async enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.active++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.active--;
      this.process();
    }
  }
}

const translationCache = new TranslationCache();
const translationQueue = new TranslationQueue();

async function callTranslationAPI(apiKey, text, targetLang, retryCount = 0) {
  const cached = translationCache.get(text, targetLang);
  if (cached) {
    return cached;
  }

  const API_URL = "https://api.siliconflow.cn/v1/chat/completions";
  const systemPrompt = targetLang === '代码解释'
    ? "你是一个代码解释助手。请解释以下代码的功能和关键点，用简洁的中文回答。"
    : "你是一个翻译引擎。请将文本翻译成" + targetLang + "。不要输出任何解释，直接输出译文。";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      let errorMessage = "API Error: " + response.status;
      try {
        const errorData = await response.json();
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
      }

      if (retryCount < 2 && (response.status === 429 || response.status >= 500)) {
        console.log("Translation API error, retrying (" + (retryCount + 1) + "/2)...");
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return callTranslationAPI(apiKey, text, targetLang, retryCount + 1);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const result = data.choices[0] && data.choices[0].message && data.choices[0].message.content ? data.choices[0].message.content : "";

    translationCache.set(text, targetLang, result);
    return result;
  } catch (error) {
    console.error('Translation API error:', error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translateBatch') {
    const texts = request.texts;
    const apiKey = request.apiKey;
    const targetLang = request.targetLang;

    Promise.all(
      texts.map(text =>
        translationQueue.enqueue(() =>
          callTranslationAPI(apiKey, text, targetLang)
        )
      )
    )
      .then(results => {
        sendResponse({ success: true, results });
      })
      .catch(error => {
        console.error('Batch translation error:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  if (request.action === 'translateSelection') {
    const text = request.text;
    const apiKey = request.apiKey;
    const targetLang = request.targetLang;

    translationQueue.enqueue(() =>
      callTranslationAPI(apiKey, text, targetLang)
    )
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(error => {
        console.error('Selection translation error:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  if (request.action === 'getCacheSize') {
    sendResponse({ size: translationCache.cache.size });
    return true;
  }

  if (request.action === 'clearCache') {
    translationCache.cache.clear();
    sendResponse({ success: true });
    return true;
  }
});

setInterval(() => {
  if (translationCache.cache.size > 500) {
    const keys = Array.from(translationCache.cache.keys());
    for (let i = 0; i < keys.length / 2; i++) {
      translationCache.cache.delete(keys[i]);
    }
  }
}, 5 * 60 * 1000);
