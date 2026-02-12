// cache.js - 翻译缓存管理（支持重复注入保护）

if (!window.__AI_TRANSLATION_CACHE__) {
    class TranslationCache {
        constructor() {
            this.cacheKey = 'ai_translation_cache';
            this.maxCacheSize = 1000; // 最大缓存条目数
            this.cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7天过期
        }

        generateKey(text, targetLang) {
            const normalizedText = text.trim().toLowerCase();
            return `${targetLang}:${normalizedText}`;
        }

        async get(text, targetLang) {
            try {
                const cacheKey = this.generateKey(text, targetLang);
                const cache = await this.loadCache();

                const cachedItem = cache[cacheKey];
                if (cachedItem) {
                    if (Date.now() - cachedItem.timestamp < this.cacheExpiry) {
                        console.log('缓存命中:', text.substring(0, 50));
                        return cachedItem.translation;
                    }

                    delete cache[cacheKey];
                    await this.saveCache(cache);
                }

                return null;
            } catch (error) {
                console.error('获取缓存失败:', error);
                return null;
            }
        }

        async set(text, targetLang, translation) {
            try {
                const cacheKey = this.generateKey(text, targetLang);
                const cache = await this.loadCache();

                cache[cacheKey] = {
                    translation,
                    timestamp: Date.now(),
                    textLength: text.length
                };

                await this.cleanupCache(cache);
                await this.saveCache(cache);

                console.log('缓存已保存:', text.substring(0, 50));
            } catch (error) {
                console.error('设置缓存失败:', error);
            }
        }

        async loadCache() {
            return new Promise((resolve) => {
                chrome.storage.local.get([this.cacheKey], (result) => {
                    resolve(result[this.cacheKey] || {});
                });
            });
        }

        async saveCache(cache) {
            return new Promise((resolve) => {
                chrome.storage.local.set({ [this.cacheKey]: cache }, () => {
                    resolve();
                });
            });
        }

        async cleanupCache(cache) {
            const now = Date.now();
            const keys = Object.keys(cache);

            for (const key of keys) {
                const item = cache[key];
                if (now - item.timestamp > this.cacheExpiry) {
                    delete cache[key];
                }
            }

            if (Object.keys(cache).length > this.maxCacheSize) {
                const sortedKeys = Object.keys(cache).sort((a, b) => cache[a].timestamp - cache[b].timestamp);
                const keysToRemove = sortedKeys.slice(0, Object.keys(cache).length - this.maxCacheSize);
                for (const key of keysToRemove) {
                    delete cache[key];
                }
            }
        }

        async clear() {
            return new Promise((resolve) => {
                chrome.storage.local.remove([this.cacheKey], () => {
                    console.log('缓存已清空');
                    resolve();
                });
            });
        }

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

    window.__AI_TRANSLATION_CACHE__ = new TranslationCache();
}

if (typeof window !== 'undefined') {
    window.translationCache = window.__AI_TRANSLATION_CACHE__;
}
