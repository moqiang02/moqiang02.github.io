(function($){
  var searchIndex = null;
  var searchResultWrap = $('#local-search-result');
  var searchOverlay = $('#search-overlay');
  var searchInput = $('#local-search-input');

  // 加载 search.json 索引
  function loadSearchIndex() {
    if (searchIndex) return;
    $.getJSON('/search.json', function(data) {
      searchIndex = data;
    }).fail(function() {
      console.warn('[Local Search] Failed to load /search.json');
    });
  }

  // 高亮关键词
  function highlightKeyword(text, keyword) {
    if (!text) return '';
    var idx = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (idx === -1) return text;
    var start = Math.max(0, idx - 20);
    var end = Math.min(text.length, idx + keyword.length + 20);
    var snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
    return snippet.replace(new RegExp(escapeRegExp(keyword), 'gi'), '<mark>$&</mark>');
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 渲染搜索结果
  function renderResults(results, keyword) {
    if (!results.length) {
      searchResultWrap.html('<div class="search-result-empty">未找到相关文章</div>').addClass('on');
      searchOverlay.addClass('on');
      return;
    }
    var html = results.map(function(item) {
      var title = highlightKeyword(item.title, keyword);
      var snippet = item.content ? highlightKeyword(item.content, keyword) : '';
      return '<a href="' + item.url + '" class="search-result-item">' +
        '<div class="search-result-title">' + title + '</div>' +
        (snippet ? '<div class="search-result-snippet">' + snippet + '</div>' : '') +
        '</a>';
    }).join('');
    searchResultWrap.html(html).addClass('on');
    searchOverlay.addClass('on');
  }

  // 执行搜索
  function doSearch(keyword) {
    if (!keyword || keyword.length < 1) {
      closeSearch();
      return;
    }
    if (!searchIndex) {
      loadSearchIndex();
      setTimeout(function() { doSearch(keyword); }, 200);
      return;
    }
    keyword = keyword.trim();
    var results = searchIndex.filter(function(item) {
      return (item.title && item.title.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) ||
             (item.content && item.content.toLowerCase().indexOf(keyword.toLowerCase()) !== -1);
    }).slice(0, 10); // 最多显示10条
    renderResults(results, keyword);
  }

  // 事件绑定
  var searchTimeout;
  searchInput.on('input', function() {
    clearTimeout(searchTimeout);
    var val = $(this).val();
    searchTimeout = setTimeout(function() { doSearch(val); }, 200);
  });

  searchInput.on('focus', function() {
    loadSearchIndex();
    var val = $(this).val();
    if (val) doSearch(val);
  });

  function closeSearch() {
    searchResultWrap.removeClass('on').html('');
    searchOverlay.removeClass('on');
  }

  // 点击遮罩关闭
  searchOverlay.on('click', closeSearch);

  // 键盘导航
  searchInput.on('keydown', function(e) {
    var items = searchResultWrap.find('.search-result-item');
    if (!items.length) return;
    var active = searchResultWrap.find('.search-result-item.active');
    var idx = items.index(active);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      active.removeClass('active');
      items.eq((idx + 1) % items.length).addClass('active');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      active.removeClass('active');
      items.eq((idx - 1 + items.length) % items.length).addClass('active');
    } else if (e.key === 'Enter' && active.length) {
      e.preventDefault();
      window.location.href = active.attr('href');
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  });
})(jQuery);
