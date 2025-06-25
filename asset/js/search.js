    // === 全局数据变量 ===
    let allItems = [];

    // === DOM 元素引用 ===
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    // === 初始化入口函数 ===
    document.addEventListener('DOMContentLoaded', () => {
        loadData();
        setupEventListeners();
    });

    // === 加载 JSON 数据并初始化 ===
    async function loadData() {
        try {
            const response = await fetch('/sitemap.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            // 收集所有条目并添加标准化字段
            allItems = [
                ...data.central,
                ...data.stateCouncil,
                ...data.local,
                ...data.hongkongMacau,
                ...data.overseas
            ].map(item => ({
                ...item,
                searchText: `${item.department} ${item.url || ''}`.toLowerCase()
            }));

            console.log('✅ 成功加载数据:', allItems.length, '个政府部门');
        } catch (error) {
            console.error('❌ 加载数据失败:', error);
            searchResults.innerHTML = `
                <div class="py-8 text-center">
                    <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                        </path>
                    </svg>
                    <h3 class="mt-2 text-lg font-medium text-gray-900">加载失败</h3>
                    <p class="mt-1 text-sm text-gray-500">请刷新页面重试</p>
                </div>`;
        }
    }

    // === 设置事件监听器 ===
    function setupEventListeners() {
        // 打开搜索框按钮
        document.querySelectorAll('#search-toggle, #search-toggle-desktop').forEach(btn => {
            btn.addEventListener('click', () => {
                searchModal.classList.remove('hidden');
                searchInput.focus();
                searchInput.value = '';
                searchResults.innerHTML = `
                    <div class="py-6 text-center text-gray-500">
                        <svg class="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <p class="mt-2">输入关键词搜索政府部门</p>
                    </div>`;
            });
        });

        // 关闭搜索框按钮
        document.getElementById('close-search')?.addEventListener('click', () => {
            searchModal.classList.add('hidden');
            searchInput.value = '';
            searchResults.innerHTML = '';
        });

        // 点击遮罩层关闭
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.add('hidden');
                searchInput.value = '';
                searchResults.innerHTML = '';
            }
        });

        // 输入搜索关键词
        searchInput.addEventListener('input', debounce(handleSearchInput, 300));
    }

    // === 处理输入事件（带防抖）===
    function handleSearchInput() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            searchResults.innerHTML = `
                <div class="py-6 text-center text-gray-500">
                    <svg class="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <p class="mt-2">输入关键词搜索政府部门</p>
                </div>`;
            return;
        }

        const results = allItems.filter(item =>
            item.searchText.includes(query)
        );

        renderResults(results, query);
    }

    // === 渲染搜索结果 ===
    function renderResults(results, query) {
        const statsDiv = document.getElementById('search-stats');
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="py-8 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="mt-2 text-lg font-medium text-gray-900">未找到相关政府部门</h3>
                    <p class="mt-1 text-sm text-gray-500">没有找到与 "<strong>${escapeHtml(query)}</strong>" 匹配的政府部门</p>
                </div>`;
            return;
        }
    // 记录开始时间
    const startTime = performance.now();

    // 高亮匹配文本
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const highlightText = text => text.replace(regex, '<mark>$1</mark>');

    // 构建 HTML 内容
    const html = results.map(item => `
        <div class="border-b border-gray-200 py-2 flex items-center">
            <img src="${item.logo}" alt="${item.department} Logo" class="h-8 w-8 mr-3 object-contain">
            <div>
                <a href="${item.url}" target="_blank" class="font-medium text-blue-600 hover:underline">
                    ${highlightText(item.department)}
                </a>
                <p class="text-xs text-gray-500 mt-1 truncate">
                    ${highlightText(item.url)}
                </p>
            </div>
        </div>
    `).join('');
    // 计算耗时
    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000; // 单位：秒

    // 更新 DOM
    statsDiv.textContent = `共找到 ${results.length} 条结果，用时 ${(timeTaken).toFixed(3)} 秒`;
    searchResults.innerHTML = html;
        // 高亮匹配文本
        // const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        // const highlightText = text => text.replace(regex, '<mark>$1</mark>');

        searchResults.innerHTML = results.map(item => `
            <div class="border-b border-gray-200 py-2 flex items-center">
                <img src="${item.logo}" alt="${item.department} Logo" class="h-8 w-8 mr-3 object-contain">
                <div>
                    <a href="${item.url}" target="_blank" class="font-medium text-blue-600 hover:underline">
                        ${highlightText(item.department)}
                    </a>
                    <p class="text-xs text-gray-500 mt-1 truncate">
                        ${highlightText(item.url)}
                    </p>
                </div>
            </div>
        `).join('');
    }

    // === 工具函数 ===

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // 转义 HTML 特殊字符防止 XSS
    function escapeHtml(text) {
        return text.replace(/[&<>"'`]/g, match => ({
            '&': '&amp;',
            '<': '<',
            '>': '>',
            '"': '&quot;',
            "'": '&#39;',
            '`': '&#x60;'
        }[match]));
    }

    // 正则表达式转义
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched substring
    }