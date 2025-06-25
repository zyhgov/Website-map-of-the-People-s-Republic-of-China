

    // 初始化搜索功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const searchToggleDesktop = document.getElementById('search-toggle-desktop');
    const searchToggleMobile = document.getElementById('search-toggle');
    const searchModal = document.getElementById('search-modal');
    const closeSearch = document.getElementById('close-search');
    
    // 桌面端搜索按钮点击事件
    searchToggleDesktop.addEventListener('click', function() {
        searchModal.classList.remove('hidden');
        searchModal.style.display = 'flex'; // 确保显示
        document.getElementById('search-input').focus(); // 自动聚焦到搜索框
    });
    
    // 移动端搜索按钮点击事件
    searchToggleMobile.addEventListener('click', function() {
        searchModal.classList.remove('hidden');
        searchModal.style.display = 'flex'; // 确保显示
        document.getElementById('search-input').focus(); // 自动聚焦到搜索框
    });
    
    // 关闭按钮点击事件
    closeSearch.addEventListener('click', function() {
        searchModal.classList.add('hidden');
        searchModal.style.display = 'none'; // 确保隐藏
    });
    
    // 点击模态框外部关闭
    searchModal.addEventListener('click', function(e) {
        if (e.target === searchModal) {
            searchModal.classList.add('hidden');
            searchModal.style.display = 'none';
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !searchModal.classList.contains('hidden')) {
            searchModal.classList.add('hidden');
            searchModal.style.display = 'none';
        }
    });
});