// content.js - 修复布局问题的版本

class ImmersiveTranslator {
    constructor() {
        this.config = {
            // 精准的选择器，优先选择主要内容区域
            targetSelectors: [
                'main p',
                'article p',
                '.content p',
                '.markdown p',
                '[role="main"] p',
                '.prose p',
                'section p',
                '.documentation p',
                '.post p',
                '.article-body p',
                '.blog-post p',
                '.text-content p',
                'main h1',
                'main h2',
                'main h3',
                'article h1',
                'article h2',
                'article h3',
                '.content h1',
                '.content h2',
                '.content h3'
            ],
            excludeSelectors: [
                'nav',
                'header',
                'footer',
                '.navbar',
                '.sidebar',
                '.menu',
                '.code-block',
                'pre',
                'code',
                '.highlight',
                '.terminal',
                '.nav',
                '.header',
                '.footer',
                '.menu-item',
                '.nav-item',
                '.breadcrumb',
                '.pagination',
                '.social-share',
                '.comment',
                '.comments',
                '.sidebar-nav',
                '.header-nav',
                '.footer-nav',
                '.tooltipp',
                '.popup',
                '.modal',
                '.dialog',
                '.notification',
                '.alert',
                '.badge',
                '.tag',
                '.label',
                '.button',
                '.btn',
                '.icon',
                '.avatar',
                '.logo',
                '.brand',
                '.copyright',
                '.legal',
                '.disclaimer',
                '.advertisement',
                '.ad',
                '.sponsor',
                '.sponsored',
                '.affiliate',
                '.form',
                '.input',
                '.textarea',
                '.select',
                '.checkbox',
                '.radio',
                '.toggle',
                '.switch',
                '.slider',
                '.range',
                '.progress',
                '.loading',
                '.spinner',
                '.skeleton',
                '.placeholder',
                '.overlay',
                '.backdrop',
                '.mask',
                '.filter',
                '.search',
                '.search-bar',
                '.search-box',
                '.search-input',
                '.search-results',
                '.autocomplete',
                '.dropdown',
                '.drop-down',
                '.menu-dropdown',
                '.nav-dropdown',
                '.user-dropdown',
                '.language-dropdown',
                '.settings-dropdown',
                '.mobile-nav',
                '.mobile-menu',
                '.hamburger',
                '.toggle-menu',
                '.sidebar-toggle',
                '.header-toggle',
                '.footer-toggle',
                '.collapse',
                '.expand',
                '.accordion',
                '.tab',
                '.tabs',
                '.tab-content',
                '.tab-panel',
                '.carousel',
                '.slider',
                '.slide',
                '.gallery',
                '.image-gallery',
                '.media',
                '.video',
                '.audio',
                '.embed',
                '.iframe',
                '.map',
                '.chart',
                '.graph',
                '.table',
                '.table-container',
                '.table-wrapper',
                '.data-table',
                '.grid',
                '.grid-container',
                '.grid-wrapper',
                '.flex',
                '.flex-container',
                '.flex-wrapper',
                '.card',
                '.card-container',
                '.card-wrapper',
                '.panel',
                '.panel-container',
                '.panel-wrapper',
                '.widget',
                '.widget-container',
                '.widget-wrapper',
                '.module',
                '.module-container',
                '.module-wrapper',
                '.block',
                '.block-container',
                '.block-wrapper',
                '.section',
                '.section-container',
                '.section-wrapper',
                '.container',
                '.wrapper',
                '.outer',
                '.inner',
                '.content',
                '.content-wrapper',
                '.main',
                '.main-content',
                '.main-wrapper',
                '.article',
                '.article-content',
                '.article-wrapper',
                '.post',
                '.post-content',
                '.post-wrapper',
                '.page',
                '.page-content',
                '.page-wrapper',
                '.document',
                '.document-content',
                '.document-wrapper',
                '.documentation',
                '.documentation-content',
                '.documentation-wrapper',
                '.guide',
                '.guide-content',
                '.guide-wrapper',
                '.tutorial',
                '.tutorial-content',
                '.tutorial-wrapper',
                '.lesson',
                '.lesson-content',
                '.lesson-wrapper',
                '.course',
                '.course-content',
                '.course-wrapper',
                '.book',
                '.book-content',
                '.book-wrapper',
                '.chapter',
                '.chapter-content',
                '.chapter-wrapper',
                '.section',
                '.section-content',
                '.section-wrapper',
                '.unit',
                '.unit-content',
                '.unit-wrapper',
                '.module',
                '.module-content',
                '.module-wrapper',
                '.component',
                '.component-content',
                '.component-wrapper',
                '.element',
                '.element-content',
                '.element-wrapper',
                '.item',
                '.item-content',
                '.item-wrapper',
                '.list',
                '.list-content',
                '.list-wrapper',
                '.menu',
                '.menu-content',
                '.menu-wrapper',
                '.nav',
                '.nav-content',
                '.nav-wrapper',
                '.header',
                '.header-content',
                '.header-wrapper',
                '.footer',
                '.footer-content',
                '.footer-wrapper',
                '.sidebar',
                '.sidebar-content',
                '.sidebar-wrapper',
                '.aside',
                '.aside-content',
                '.aside-wrapper',
                '.main',
                '.main-content',
                '.main-wrapper',
                '.content',
                '.content-wrapper',
                '.container',
                '.container-wrapper',
                '.wrapper',
                '.outer-wrapper',
                '.inner-wrapper'
            ],
            minLength: 10,
            maxLength: 800
        };

        this.translating = false;
        this.init();
    }

    init() {
        this.setupMessageListener();
        this.setupContextMenu();
        this.translationQueue = [];
        this.isProcessingQueue = false;
        this.concurrentLimit = 3; // 并发限制
        this.activeRequests = 0;
        this.cache = null;
        this.useCache = true; // 默认启用缓存
        this.initCache();
    }

    // 初始化缓存
    initCache() {
        // 直接使用全局对象方式加载缓存
        if (typeof window !== 'undefined' && window.translationCache) {
            this.cache = window.translationCache;
            console.log('缓存模块已加载');
        } else {
            // 缓存加载失败，禁用缓存功能
            this.useCache = false;
            console.warn('缓存模块加载失败，将禁用缓存功能');
        }
    }

    // 禁用动态导入缓存的代码
    // 移除可能导致动态导入的代码

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'start_translate') {
                this.startTranslation(request.apiKey, request.targetLang || '中文');
            } else if (request.action === 'stop_translate') {
                this.stopTranslation();
            } else if (request.action === 'toggle_translate') {
                this.toggleTranslation(request.apiKey, request.targetLang);
            }
        });
    }

    setupContextMenu() {
        // 添加上下文菜单事件监听
        document.addEventListener('contextmenu', (e) => {
            const selection = window.getSelection().toString().trim();
            if (selection.length > 0) {
                // 存储选择的文本
                this.selectedText = selection;
            }
        });

        // 添加键盘快捷键支持
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+T 触发翻译
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                const selection = window.getSelection().toString().trim();
                if (selection.length > 0) {
                    e.preventDefault();
                    this.translateSelection(selection);
                }
            }
        });
    }

    async translateSelection(text) {
        if (!this.apiKey) {
            this.showNotification('请先在弹出窗口中设置API Key');
            return;
        }

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'translateSelection',
                text: text,
                apiKey: this.apiKey,
                targetLang: this.targetLang || '中文'
            });

            if (response && response.success) {
                this.showTranslationTooltip(response.result);
            } else {
                this.showNotification('翻译失败，请重试');
            }
        } catch (error) {
            console.error('翻译失败:', error);
            this.showNotification('翻译失败，请检查API Key是否正确');
        }
    }

    showTranslationTooltip(translation) {
        // 移除现有的tooltip
        const existingTooltip = document.getElementById('ai-translator-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        // 创建tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'ai-translator-tooltip';
        tooltip.style.cssText = `
      position: fixed;
      background: white;
      color: #333;
      padding: 10px 15px;
      border-radius: 6px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 10000;
      font-size: 12px;
      max-width: 300px;
      word-wrap: break-word;
      pointer-events: none;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    `;
        tooltip.textContent = translation;

        // 获取选择位置
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // 定位tooltip
            tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
            tooltip.style.left = `${rect.left + window.scrollX}px`;
        }

        document.body.appendChild(tooltip);

        // 显示tooltip
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        });

        // 3秒后自动隐藏
        setTimeout(() => {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(-10px)';
            setTimeout(() => tooltip.remove(), 300);
        }, 3000);
    }

    startTranslation(apiKey, targetLang) {
        if (this.translating) {
            console.log('翻译已在运行中');
            return;
        }

        this.translating = true;
        this.apiKey = apiKey;
        this.targetLang = targetLang;

        console.log('开始翻译，目标语言:', targetLang);

        // 收集所有需要翻译的元素
        const elements = this.collectTranslatableElements();
        console.log('找到', elements.length, '个需要翻译的元素');

        if (elements.length === 0) {
            console.log('没有找到需要翻译的内容');
            this.translating = false;
            return;
        }

        // 将元素添加到队列
        this.translationQueue = elements.map(element => ({
            element,
            text: this.extractTextContent(element),
            status: 'pending'
        }));

        // 开始处理队列
        this.processQueue();
    }

    stopTranslation() {
        this.translating = false;
        this.hideProgressIndicator();
        console.log('翻译已停止');
    }

    toggleTranslation(apiKey, targetLang) {
        if (this.translating) {
            this.stopTranslation();
        } else {
            this.startTranslation(apiKey, targetLang);
        }
    }

    collectTranslatableElements() {
        const elements = [];

        // 简化选择器：使用更通用的选择器
        const targetTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'td', 'th'];

        // 首先尝试选择主要内容区域
        const mainSelectors = ['main', 'article', '[role="main"]', '.content', '.documentation', '.post-content'];

        for (const selector of mainSelectors) {
            const found = document.querySelectorAll(selector);
            if (found.length > 0) {
                found.forEach(context => {
                    targetTags.forEach(tag => {
                        const tagElements = context.querySelectorAll(tag);
                        tagElements.forEach(element => {
                            if (this.shouldTranslateElement(element)) {
                                elements.push(element);
                            }
                        });
                    });
                });
                // 不要break，继续检查其他主要内容区域
                // break; // 找到主要内容区域后就停止
            }
        }

        // 如果没有找到主要内容区域，则在整个文档中查找
        if (elements.length === 0) {
            targetTags.forEach(tag => {
                const tagElements = document.querySelectorAll(tag);
                tagElements.forEach(element => {
                    if (this.shouldTranslateElement(element)) {
                        elements.push(element);
                    }
                });
            });
        }

        return elements;
    }

    findExcludedParent(element) {
        let current = element;
        while (current && current !== document.body) {
            const tagName = current.tagName.toLowerCase();
            const className = current.className || '';
            const id = current.id || '';

            // 检查是否匹配排除选择器
            const isExcluded = this.config.excludeSelectors.some(selector => {
                if (selector.startsWith('.') && className.includes(selector.slice(1))) {
                    return true;
                }
                if (selector === tagName) {
                    return true;
                }
                if (selector.includes('[') && current.matches(selector)) {
                    return true;
                }
                return false;
            });

            if (isExcluded) {
                return current;
            }

            current = current.parentElement;
        }
        return null;
    }

    shouldTranslateElement(element) {
        // 检查是否可见
        if (!this.isElementVisible(element)) {
            return false;
        }

        // 检查是否已翻译
        if (element.dataset.translated === 'true') {
            return false;
        }

        // 检查是否为代码元素或在代码元素内
        if (this.isCodeElement(element)) {
            return false;
        }

        // 检查文本长度
        const text = this.extractTextContent(element);
        if (!text || text.length < this.config.minLength || text.length > this.config.maxLength) {
            return false;
        }

        // 检查是否包含太多特殊字符（可能是代码）
        const specialCharRatio = (text.match(/[{}()<>\[\]=+*&^%$#@!~`|\\]/g) || []).length / text.length;
        if (specialCharRatio > 0.3) {
            return false;
        }

        // 检查是否包含代码特征词 - 临时禁用，避免误判
        /*
        if (this.containsCodePatterns(text)) {
            return false;
        }
        */

        // 检查是否已经是目标语言（简单检测）
        if (this.targetLang === '中文' && this.isChinese(text)) {
            return false;
        }

        return true;
    }

    isCodeElement(element) {
        // 检查元素本身是否为代码元素
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'code' || tagName === 'pre') {
            return true;
        }

        // 检查元素是否有代码相关的类名
        const className = element.className || '';
        const codeClasses = ['code', 'pre', 'highlight', 'terminal', 'snippet', 'script', 'css', 'js', 'javascript', 'html', 'json', 'xml', 'yaml', 'yml', 'md', 'markdown', 'bash', 'shell', 'console'];
        for (const codeClass of codeClasses) {
            if (className.includes(codeClass)) {
                return true;
            }
        }

        // 检查元素是否在代码元素内
        let current = element;
        while (current && current !== document.body) {
            const currentTagName = current.tagName.toLowerCase();
            if (currentTagName === 'code' || currentTagName === 'pre') {
                return true;
            }
            const currentClassName = current.className || '';
            for (const codeClass of codeClasses) {
                if (currentClassName.includes(codeClass)) {
                    return true;
                }
            }
            current = current.parentElement;
        }

        return false;
    }

    containsCodePatterns(text) {
        // 检查是否包含代码特征模式
        // 减少过于严格的模式，避免误判文档中的代码描述
        const codePatterns = [
            /function\s*\([^)]*\)\s*\{[\s\S]*\}/, // 完整函数定义
            /class\s+\w+\s*\{[\s\S]*\}/, // 完整类定义
            /import\s+.*\s+from\s+['"][^'"]+['"];/, // 完整 import 语句
            /export\s+default\s+[^;]+;/, // 完整 export 语句
            /console\.log\([^)]*\)/, // 完整 console.log 调用
            /document\.querySelector\([^)]*\)/, // 完整 querySelector 调用
            /\.addEventListener\([^)]*\)/, // 完整 addEventListener 调用
            /for\s*\(.*\)\s*\{[\s\S]*\}/, // 完整 for 循环
            /if\s*\(.*\)\s*\{[\s\S]*\}/, // 完整 if 语句
            /\.forEach\(/,
            /try\s*\{/,
            /catch\s*\(/,
            /throw\s+new\s+Error/,
            /return\s+/,
            /switch\s*\(.*\)\s*\{/,
            /case\s+\w+:/,
            /default:/,
            /break;/,
            /continue;/,
            /typeof\s+/,
            /instanceof\s+/,
            /new\s+\w+/,
            /this\./,
            /super\./,
            /static\s+/,
            /async\s+function/,
            /await\s+/,
            /Promise\.resolve/,
            /Promise\.reject/,
            /fetch\(/,
            /axios\./,
            /require\(['"]/,
            /module\.exports/,
            /__dirname/,
            /__filename/,
            /process\./,
            /Buffer\./,
            /setTimeout\(/,
            /setInterval\(/,
            /clearTimeout\(/,
            /clearInterval\(/,
            /Math\./,
            /Date\./,
            /Array\./,
            /Object\./,
            /String\./,
            /Number\./,
            /Boolean\./,
            /RegExp\./,
            /Function\./,
            /Error\./,
            /\/\/.*$/,
            /\/\*[\s\S]*?\*\//
        ];

        for (const pattern of codePatterns) {
            if (pattern.test(text)) {
                return true;
            }
        }

        return false;
    }

    isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            element.offsetWidth > 0 &&
            element.offsetHeight > 0;
    }

    extractTextContent(element) {
        // 克隆元素以避免修改原DOM
        const clone = element.cloneNode(true);

        // 移除不需要的元素
        const toRemove = clone.querySelectorAll('script, style, .ai-translation, .translation');
        toRemove.forEach(el => el.remove());

        const text = clone.textContent || clone.innerText || '';
        return text.trim().replace(/\s+/g, ' ');
    }

    isChinese(text) {
        // 简单的中文检测
        const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
        return chineseChars.length / text.length > 0.3;
    }

    async processQueue() {
        if (this.isProcessingQueue || this.translationQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.translationQueue.length > 0) {
            // 等待并发限制
            while (this.activeRequests >= this.concurrentLimit) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const pendingItems = this.translationQueue.filter(item => item.status === 'pending');
            if (pendingItems.length === 0) {
                break;
            }

            // 取出一批待翻译项
            const batch = pendingItems.slice(0, Math.min(5, pendingItems.length));
            batch.forEach(item => item.status = 'processing');

            // 批量翻译
            this.translateBatch(batch).then(() => {
                // 检查是否所有项目都已完成
                const allDone = this.translationQueue.every(item =>
                    item.status === 'completed' || item.status === 'failed'
                );

                if (allDone) {
                    this.translating = false;
                    this.isProcessingQueue = false;
                    console.log('翻译完成');
                }
            });
        }
    }

    async translateBatch(batch) {
        this.activeRequests++;

        try {
            // 检查缓存
            const texts = batch.map(item => item.text);
            let translations = [];

            if (this.useCache && this.cache && typeof this.cache.get === 'function') {
                // 尝试从缓存获取
                try {
                    translations = await Promise.all(
                        texts.map(text => this.cache.get(text, this.targetLang))
                    );
                } catch (cacheError) {
                    console.warn('缓存获取失败，使用API翻译:', cacheError);
                    this.useCache = false;
                    translations = Array(texts.length).fill(null);
                }

                // 标记哪些需要从API获取
                const needsTranslation = [];
                const needsTranslationIndices = [];

                for (let i = 0; i < translations.length; i++) {
                    if (!translations[i]) {
                        needsTranslation.push(texts[i]);
                        needsTranslationIndices.push(i);
                    }
                }

                // 如果有需要翻译的文本
                if (needsTranslation.length > 0) {
                    console.log(`从缓存中命中 ${translations.length - needsTranslation.length} 个，需要翻译 ${needsTranslation.length} 个`);

                    // 通过runtime API获取翻译
                    const response = await chrome.runtime.sendMessage({
                        action: 'translateBatch',
                        texts: needsTranslation,
                        apiKey: this.apiKey,
                        targetLang: this.targetLang
                    });

                    if (response && response.success) {
                        // 更新翻译结果并缓存
                        for (let j = 0; j < needsTranslationIndices.length; j++) {
                            const index = needsTranslationIndices[j];
                            if (response.results[j]) {
                                translations[index] = response.results[j];
                                // 保存到缓存（添加错误处理）
                                try {
                                    if (this.cache && typeof this.cache.set === 'function') {
                                        await this.cache.set(texts[index], this.targetLang, response.results[j]);
                                    }
                                } catch (cacheError) {
                                    console.warn('缓存保存失败:', cacheError);
                                }
                            }
                        }
                    } else {
                        console.error('批量翻译失败:', response?.error);
                        // API失败时，标记这些项目为失败
                        needsTranslationIndices.forEach(index => {
                            translations[index] = null;
                        });
                    }
                } else {
                    console.log('全部从缓存中获取');
                }
            } else {
                // 无缓存模式，全部从API获取
                const response = await chrome.runtime.sendMessage({
                    action: 'translateBatch',
                    texts: texts,
                    apiKey: this.apiKey,
                    targetLang: this.targetLang
                });

                if (response && response.success) {
                    translations = response.results;
                } else {
                    console.error('批量翻译失败:', response?.error);
                    translations = Array(texts.length).fill(null);
                }
            }

            // 注入翻译结果
            batch.forEach((item, index) => {
                if (translations[index]) {
                    this.injectTranslation(item.element, translations[index]);
                    item.status = 'completed';
                } else {
                    item.status = 'failed';
                }
            });
        } catch (error) {
            console.error('批量翻译失败:', error);
            batch.forEach(item => item.status = 'failed');
        } finally {
            this.activeRequests--;
            // 继续处理队列
            this.processQueue();
        }
    }

    injectTranslation(originalElement, translatedText) {
        // 标记为已翻译
        originalElement.dataset.translated = 'true';

        // 检查是否已经存在翻译
        const existingTranslation = originalElement.nextElementSibling;
        if (existingTranslation && existingTranslation.classList.contains('ai-translation-block')) {
            existingTranslation.textContent = translatedText;
            return;
        }

        // 创建翻译元素
        const transElement = document.createElement('div');
        transElement.className = 'ai-translation-block';
        transElement.textContent = translatedText;
        transElement.setAttribute('data-translated', 'true');

        // 优化样式，匹配图片效果
        transElement.style.cssText = `
        color: #333;
        font-size: 1em;
        line-height: 1.6;
        margin-top: 8px;
        margin-bottom: 16px;
        display: block;
        text-align: left;
        padding-left: 0;
        border-left: none;
        background: none;
        font-weight: normal;
        position: static;
        z-index: 1;
      `;

        // 关键修复：插入到原文元素的外部下方，而不是内部
        originalElement.parentNode.insertBefore(transElement, originalElement.nextSibling);

        // 添加淡入效果
        requestAnimationFrame(() => {
            transElement.style.transition = 'opacity 0.3s ease, transform 0.2s ease';
            transElement.style.opacity = '1';
            transElement.style.transform = 'translateY(0)';
        });
    }

    showProgressIndicator(total) {
        this.removeProgressIndicator();

        const indicator = document.createElement('div');
        indicator.id = 'ai-translator-progress';
        indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: white;
      padding: 10px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10000;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid #e0e0e0;
    `;

        const spinner = document.createElement('div');
        spinner.style.cssText = `
      width: 16px;
      height: 16px;
      border: 2px solid #e0e0e0;
      border-top: 2px solid #4CAF50;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

        const text = document.createElement('span');
        text.id = 'ai-translator-progress-text';
        text.textContent = `正在翻译... 0/${total}`;

        indicator.appendChild(spinner);
        indicator.appendChild(text);
        document.body.appendChild(indicator);

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
        document.head.appendChild(style);
    }

    updateProgressIndicator(current, total) {
        const textEl = document.getElementById('ai-translator-progress-text');
        if (textEl) {
            textEl.textContent = `正在翻译... ${current}/${total}`;
        }
    }

    hideProgressIndicator() {
        this.removeProgressIndicator();
    }

    removeProgressIndicator() {
        const indicator = document.getElementById('ai-translator-progress');
        if (indicator) {
            indicator.remove();
        }
    }

    showNotification(message) {
        // 移除现有的通知
        const existing = document.getElementById('ai-translator-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.id = 'ai-translator-notification';
        notification.style.cssText = `
      position: fixed;
      top: 50px;
      right: 10px;
      background: #4CAF50;
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 12px;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
        notification.textContent = message;
        document.body.appendChild(notification);

        // 显示动画
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        });

        // 自动隐藏
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-10px)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化
let translator = null;

// 等待页面加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        translator = new ImmersiveTranslator();
    });
} else {
    translator = new ImmersiveTranslator();
}