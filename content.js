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
            minLength: 2,
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
        this.completedCount = 0;
        this.totalCount = 0;
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
            const result = await this.requestTranslationCompletion(text, false);
            if (result) {
                this.showTranslationTooltip(result);
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

        const elements = this.collectTranslatableElements();
        console.log('找到', elements.length, '个需要翻译的元素');

        if (elements.length === 0) {
            console.log('没有找到需要翻译的内容');
            this.translating = false;
            return;
        }

        this.translationQueue = elements.map(element => ({
            element,
            text: this.extractTextContent(element),
            status: 'pending'
        }));

        this.completedCount = 0;
        this.totalCount = this.translationQueue.length;
        this.showProgressIndicator(this.totalCount);
        this.processQueue();
    }

    stopTranslation() {
        this.translating = false;
        this.translationQueue = [];
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
        const seen = new Set();

        const targetSelector = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, figcaption, dt, dd, div, span';
        const mainSelectors = ['main', 'article', '[role="main"]', '.content', '.documentation', '.post-content', '.docs-content', '.markdown', '.prose', '.theme-doc-markdown'];

        const contexts = [];
        mainSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(node => contexts.push(node));
        });

        if (contexts.length === 0) {
            contexts.push(document.body);
        }

        const addIfValid = (element) => {
            if (!element || seen.has(element)) {
                return;
            }
            if (this.shouldTranslateElement(element)) {
                seen.add(element);
                elements.push(element);
            }
        };

        // 第一阶段：语义标签匹配
        contexts.forEach(context => {
            context.querySelectorAll(targetSelector).forEach(addIfValid);
        });

        // 第二阶段：文本节点兜底，解决文档站 div/span 深层结构漏翻
        contexts.forEach(context => {
            const walker = document.createTreeWalker(context, NodeFilter.SHOW_TEXT, {
                acceptNode: (node) => {
                    const text = (node.textContent || '').trim();
                    return text.length >= this.config.minLength ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            });

            let textNode;
            while ((textNode = walker.nextNode())) {
                const parent = textNode.parentElement;
                if (!parent) {
                    continue;
                }

                const block = parent.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, figcaption, dt, dd, div, span');
                addIfValid(block);
            }
        });

        console.log('可翻译元素数量:', elements.length);
        return elements;
    }

    shouldTranslateElement(element) {
        // 避免翻译导航/页眉/侧栏等区域
        if (this.isInNonContentArea(element)) {
            return false;
        }

        // 检查是否可见
        if (!this.isElementVisible(element)) {
            return false;
        }

        // 对容器型 div/span 做额外限制，避免把大块容器当成段落
        if ((element.tagName.toLowerCase() === 'div' || element.tagName.toLowerCase() === 'span') && !this.isMeaningfulDivBlock(element)) {
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
        if (specialCharRatio > 0.45) {
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
        const className = typeof element.className === 'string' ? element.className : '';
        const codeClasses = ['code', 'pre', 'highlight', 'terminal', 'snippet', 'script', 'javascript', 'typescript', 'html', 'json', 'xml', 'yaml', 'markdown', 'bash', 'shell', 'console'];
        const classTokens = className.toLowerCase().split(/\s+/).filter(Boolean);

        for (const token of classTokens) {
            const normalizedToken = token.replace(/[^a-z0-9_-]/g, '');
            if (codeClasses.includes(normalizedToken)) {
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
            const currentClassName = typeof current.className === 'string' ? current.className : '';
            const currentTokens = currentClassName.toLowerCase().split(/\s+/).filter(Boolean);
            for (const token of currentTokens) {
                const normalizedToken = token.replace(/[^a-z0-9_-]/g, '');
                if (codeClasses.includes(normalizedToken)) {
                    return true;
                }
            }
            current = current.parentElement;
        }

        return false;
    }

    isInNonContentArea(element) {
        if (!element || !element.closest) {
            return false;
        }

        const blockedByTag = element.closest('nav, header, footer, aside, [role="navigation"], [aria-label*="breadcrumb" i]');
        if (blockedByTag) {
            return true;
        }

        const blockedByClass = element.closest('.navbar, .sidebar, .sidebar-nav, .header-nav, .footer-nav, .breadcrumb, .pagination, .toc, .table-of-contents');
        return !!blockedByClass;
    }

    isMeaningfulDivBlock(element) {
        const tagName = element.tagName.toLowerCase();
        if (tagName !== 'div' && tagName !== 'span') {
            return true;
        }

        // 如果包含明确的块级正文子节点，优先翻译子节点，避免容器重复
        const blockChildren = element.querySelectorAll(':scope > p, :scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > li, :scope > blockquote, :scope > section, :scope > article, :scope > ul, :scope > ol');
        if (blockChildren.length > 0) {
            return false;
        }

        const text = this.extractTextContent(element);
        return text.length >= this.config.minLength && text.length <= this.config.maxLength;
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
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
        }

        if (element.getClientRects().length > 0) {
            return true;
        }

        return element.offsetWidth > 0 || element.offsetHeight > 0;
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
        if (this.isProcessingQueue) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.translating) {
            while (this.activeRequests < this.concurrentLimit) {
                const nextItem = this.translationQueue.find(item => item.status === 'pending');
                if (!nextItem) {
                    break;
                }

                nextItem.status = 'processing';
                this.activeRequests++;
                this.processTranslationItem(nextItem)
                    .catch((error) => {
                        console.error('翻译条目失败:', error);
                        nextItem.status = 'failed';
                    })
                    .finally(() => {
                        this.activeRequests--;
                        this.completedCount++;
                        this.updateProgressIndicator(this.completedCount, this.totalCount);
                    });
            }

            const hasPending = this.translationQueue.some(item => item.status === 'pending' || item.status === 'processing');
            if (!hasPending) {
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 80));
        }

        this.isProcessingQueue = false;

        if (this.translating) {
            this.translating = false;
            this.hideProgressIndicator();
            this.showNotification(`翻译完成：${this.completedCount}/${this.totalCount}`);
            console.log('翻译完成');
        }
    }

    async processTranslationItem(item) {
        const cached = this.useCache && this.cache && typeof this.cache.get === 'function'
            ? await this.cache.get(item.text, this.targetLang)
            : null;

        if (cached) {
            this.injectTranslation(item.element, cached, false);
            item.status = 'completed';
            return;
        }

        let translated = '';
        const translationElement = this.injectTranslation(item.element, '', true);

        try {
            translated = await this.streamTranslateText(item.text, (partialText) => {
                this.injectTranslation(item.element, partialText, true, translationElement);
            });
        } catch (error) {
            console.warn('流式翻译失败，回退到普通翻译:', error);
            translated = await this.requestTranslationCompletion(item.text, false);
        }

        if (!translated) {
            item.status = 'failed';
            return;
        }

        this.injectTranslation(item.element, translated, false, translationElement);

        if (this.useCache && this.cache && typeof this.cache.set === 'function') {
            try {
                await this.cache.set(item.text, this.targetLang, translated);
            } catch (cacheError) {
                console.warn('缓存保存失败:', cacheError);
            }
        }

        item.status = 'completed';
    }

    async streamTranslateText(text, onPartial) {
        const response = await this.requestTranslationCompletion(text, true);

        if (typeof response === 'string') {
            onPartial(response);
            return response;
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('当前环境不支持流式读取');
        }

        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data:')) {
                    continue;
                }

                const payload = trimmed.slice(5).trim();
                if (!payload || payload === '[DONE]') {
                    continue;
                }

                try {
                    const parsed = JSON.parse(payload);
                    const delta = parsed.choices?.[0]?.delta?.content || '';
                    if (delta) {
                        fullText += delta;
                        onPartial(fullText);
                    }
                } catch (parseError) {
                    console.warn('解析流式分片失败:', parseError);
                }
            }
        }

        return fullText.trim();
    }

    async requestTranslationCompletion(text, stream = false) {
        const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
        const systemPrompt = this.targetLang === '代码解释'
            ? '你是一个代码解释助手。请解释以下代码的功能和关键点，用简洁的中文回答。'
            : `你是一个翻译引擎。请将文本翻译成${this.targetLang || '中文'}。不要输出任何解释，直接输出译文。`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'Qwen/Qwen2.5-7B-Instruct',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: text }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000,
                    stream
                })
            });

            if (!response.ok) {
                let message = `API Error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    message = errorData?.error?.message || message;
                } catch (error) {
                    console.warn('解析API错误失败:', error);
                }
                throw new Error(message);
            }

            if (stream) {
                return response;
            }

            const data = await response.json();
            return data?.choices?.[0]?.message?.content?.trim() || '';
        } catch (fetchError) {
            console.warn('内容脚本直连翻译失败，尝试通过后台服务翻译:', fetchError);

            if (stream) {
                throw fetchError;
            }

            const runtimeResponse = await chrome.runtime.sendMessage({
                action: 'translateSelection',
                text,
                apiKey: this.apiKey,
                targetLang: this.targetLang || '中文'
            });

            if (runtimeResponse?.success) {
                return runtimeResponse.result || '';
            }

            throw new Error(runtimeResponse?.error || fetchError?.message || '翻译请求失败');
        }
    }

    injectTranslation(originalElement, translatedText, isStreaming = false, existingTranslationNode = null) {
        originalElement.dataset.translated = 'true';

        const existingTranslation = existingTranslationNode || originalElement.nextElementSibling;
        let transElement = existingTranslation;

        if (!transElement || !transElement.classList?.contains('ai-translation-block')) {
            transElement = document.createElement('div');
            transElement.className = 'ai-translation-block';
            transElement.setAttribute('data-translated', 'true');
            originalElement.parentNode.insertBefore(transElement, originalElement.nextSibling);
        }

        transElement.textContent = translatedText;
        transElement.classList.toggle('streaming', isStreaming);

        if (isStreaming) {
            transElement.style.opacity = '0.95';
            transElement.style.transform = 'translateY(1px)';
        } else {
            transElement.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            transElement.style.opacity = '1';
            transElement.style.transform = 'translateY(0)';
        }

        return transElement;
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

// 初始化（支持重复注入保护）
if (!window.__AI_TRANSLATOR_INSTANCE__) {
    const initTranslator = () => {
        if (!window.__AI_TRANSLATOR_INSTANCE__) {
            window.__AI_TRANSLATOR_INSTANCE__ = new ImmersiveTranslator();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTranslator, { once: true });
    } else {
        initTranslator();
    }
}
