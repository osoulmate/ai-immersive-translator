// cache.js - 翻译缓存管理

class TranslationCache {
    constructor() {
        this.cacheKey = 'ai_translation_cache';
        this.maxCacheSize = 1000; // 最大缓存条目数
        this.cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7天过期
    }

    // 生成缓存键
    generateKey(text, targetLang) {
        // 使用文本内容和目标语言生成唯一的缓存键
        const normalizedText = text.trim().toLowerCase();
        return `${targetLang}:${normalizedText}`;
    }

    // 获取缓存
    async get(text, targetLang) {
        try {
            const cacheKey = this.generateKey(text, targetLang);
            const cache = await this.loadCache();

            const cachedItem = cache[cacheKey];
            if (cachedItem) {
                // 检查是否过期
                if (Date.now() - cachedItem.timestamp < this.cacheExpiry) {
                    console.log('缓存命中:', text.substring(0, 50));
                    return cachedItem.translation;
                } else {
                    // 删除过期缓存
                    delete cache[cacheKey];
                    await this.saveCache(cache);
                }
            }
            return null;
        } catch (error) {
            console.error('获取缓存失败:', error);
            return null;
        }
    }

    // 设置缓存
    async set(text, targetLang, translation) {
        try {
            const cacheKey = this.generateKey(text, targetLang);
            const cache = await this.loadCache();

            // 添加新缓存
            cache[cacheKey] = {
                translation,
                timestamp: Date.now(),
                textLength: text.length
            };

            // 清理过期缓存
            await this.cleanupCache(cache);

            // 保存缓存
            await this.saveCache(cache);

            console.log('缓存已保存:', text.substring(0, 50));
        } catch (error) {
            console.error('设置缓存失败:', error);
        }
    }

    // 加载缓存
    async loadCache() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.cacheKey], (result) => {
                resolve(result[this.cacheKey] || {});
            });
        });
    }

    // 保存缓存
    async saveCache(cache) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.cacheKey]: cache }, () => {
                resolve();
            });
        });
    }

    // 清理缓存
    async cleanupCache(cache) {
        const now = Date.now();
        const keys = Object.keys(cache);

        // 删除过期缓存
        for (const key of keys) {
            const item = cache[key];
            if (now - item.timestamp > this.cacheExpiry) {
                delete cache[key];
            }
        }

        // 如果缓存仍然太大，删除最旧的条目
        if (Object.keys(cache).length > this.maxCacheSize) {
            const sortedKeys = Object.keys(cache).sort((a, b) => {
                return cache[a].timestamp - cache[b].timestamp;
            });

            // 删除最旧的条目，直到缓存大小合适
            const keysToRemove = sortedKeys.slice(0, Object.keys(cache).length - this.maxCacheSize);
            for (const key of keysToRemove) {
                delete cache[key];
            }
        }
    }

    // 清空缓存
    async clear() {
        return new Promise((resolve) => {
            chrome.storage.local.remove([this.cacheKey], () => {
                console.log('缓存已清空');
                resolve();
            });
        });
    }

    // 获取缓存统计信息
    async getStats() {
        const cache = await this.loadCache();
        const now = Date.now();

        let totalEntries = 0;
        let expiredEntries = 0;
        let totalSize = 0;

        for (const key in cache) {
            totalEntries++;
            totalSize += cache[key].textLength || 0;

            if (now - cache[key].timestamp > this.cacheExpiry) {
                expiredEntries++;
            }
        }

        return {
            totalEntries,
            expiredEntries,
            totalSize,
            cacheSize: Object.keys(cache).length
        };
    }
}

// 导出单例实例
const translationCache = new TranslationCache();

// 为了兼容动态导入
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translationCache };
} else if (typeof window !== 'undefined') {
    window.translationCache = translationCache;
}