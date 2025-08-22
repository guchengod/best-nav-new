-- 插入默认管理员用户 (密码: admin123)
INSERT INTO users (id, username, password, created_at, updated_at) VALUES
('1', 'admin', '0192023a7bbd73250516f069df18b500', datetime('now'), datetime('now'));

-- 第一层菜单（10条有意义的数据）
INSERT INTO menus (id, name, icon, url, parent_id, sort_order) VALUES
('1', '搜索引擎', 'search_icon', '/search', NULL, 1),
('2', '视频平台', 'video_icon', '/video', NULL, 2),
('3', '社交媒体', 'social_icon', '/social', NULL, 3),
('4', '新闻媒体', 'news_icon', '/news', NULL, 4),
('5', '学习资源', 'learning_icon', '/learning', NULL, 5),
('6', '开发工具', 'dev_icon', '/dev', NULL, 6),
('7', '购物平台', 'shopping_icon', '/shopping', NULL, 7),
('8', '金融服务', 'finance_icon', '/finance', NULL, 8),
('9', '健康管理', 'health_icon', '/health', NULL, 9),
('10', '娱乐应用', 'entertainment_icon', '/entertainment', NULL, 10);

-- 第二层菜单（每个第一层菜单关联5条有意义的数据）
INSERT INTO menus (id, name, icon, url, parent_id, sort_order) VALUES
('11', '国际搜索', 'global_search_icon', '/search/global', '1', 1),
('12', '中文搜索', 'chinese_search_icon', '/search/chinese', '1', 2),
('13', '学术搜索', 'academic_search_icon', '/search/academic', '1', 3),
('14', '图片搜索', 'image_search_icon', '/search/image', '1', 4),
('15', '视频搜索', 'video_search_icon', '/search/video', '1', 5),

('16', '短视频平台', 'short_video_icon', '/video/short', '2', 1),
('17', '长视频平台', 'long_video_icon', '/video/long', '2', 2),
('18', '直播平台', 'live_icon', '/video/live', '2', 3),
('19', '教育视频', 'edu_video_icon', '/video/edu', '2', 4),
('20', '影视平台', 'film_icon', '/video/film', '2', 5),

('21', '国际社交', 'global_social_icon', '/social/global', '3', 1),
('22', '中文社交', 'chinese_social_icon', '/social/chinese', '3', 2),
('23', '职业社交', 'career_social_icon', '/social/career', '3', 3),
('24', '兴趣社交', 'hobby_social_icon', '/social/hobby', '3', 4),
('25', '匿名社交', 'anonymous_social_icon', '/social/anonymous', '3', 5),

('26', '国际新闻', 'global_news_icon', '/news/global', '4', 1),
('27', '中文新闻', 'chinese_news_icon', '/news/chinese', '4', 2),
('28', '科技新闻', 'tech_news_icon', '/news/tech', '4', 3),
('29', '财经新闻', 'finance_news_icon', '/news/finance', '4', 4),
('30', '体育新闻', 'sports_news_icon', '/news/sports', '4', 5);

-- 国际搜索菜单
INSERT INTO websites (id, name, url, icon, description, alive, menu_id, sort_order) VALUES
('1', 'Google', 'https://www.google.com', 'google_icon', '国际搜索引擎', 1, '11', 1),
('2', 'Bing', 'https://www.bing.com', 'bing_icon', '微软搜索引擎', 1, '11', 2),
('3', 'DuckDuckGo', 'https://duckduckgo.com', 'duckduckgo_icon', '隐私保护搜索引擎', 1, '11', 3),
('4', 'Yahoo', 'https://www.yahoo.com', 'yahoo_icon', '国际综合门户', 1, '11', 4),
('5', 'Ecosia', 'https://www.ecosia.org', 'ecosia_icon', '环保搜索引擎', 1, '11', 5),
('6', 'Startpage', 'https://www.startpage.com', 'startpage_icon', '隐私优先搜索引擎', 1, '11', 6),
('7', 'Swisscows', 'https://swisscows.com', 'swisscows_icon', '家庭安全搜索引擎', 1, '11', 7),
('8', 'Yandex', 'https://www.yandex.com', 'yandex_icon', '俄罗斯搜索引擎', 1, '11', 8),
('9', 'Seznam', 'https://www.seznam.cz', 'seznam_icon', '捷克本地搜索', 1, '11', 9),
('10', 'MetaGer', 'https://metager.org', 'metager_icon', '开源搜索引擎', 1, '11', 10);

-- 中文搜索菜单
INSERT INTO websites (id, name, url, icon, description, alive, menu_id, sort_order) VALUES
('11', '百度', 'https://www.baidu.com', 'baidu_icon', '中文搜索引擎', 1, '12', 1),
('12', '搜狗', 'https://www.sogou.com', 'sogou_icon', '中文搜索引擎', 1, '12', 2),
('13', '360搜索', 'https://www.so.com', '360_icon', '中文安全搜索', 1, '12', 3),
('14', '神马', 'https://m.sm.cn', 'shenma_icon', '中文移动端搜索', 1, '12', 4),
('15', '必应国际版', 'https://cn.bing.com', 'bing_cn_icon', '中文国际搜索', 1, '12', 5),
('16', '中文Google', 'https://www.google.com.hk', 'google_cn_icon', '中文Google搜索', 1, '12', 6),
('17', '知乎搜索', 'https://www.zhihu.com/search', 'zhihu_icon', '中文问答搜索', 1, '12', 7),
('18', '豆瓣搜索', 'https://www.douban.com', 'douban_icon', '中文书影音搜索', 1, '12', 8),
('19', '微博搜索', 'https://s.weibo.com', 'weibo_icon', '中文社交搜索', 1, '12', 9),
('20', '网易云搜索', 'https://music.163.com', 'netease_music_icon', '中文音乐搜索', 1, '12', 10);

-- 短视频平台菜单
INSERT INTO websites (id, name, url, icon, description, alive, menu_id, sort_order) VALUES
('21', '抖音', 'https://www.douyin.com', 'douyin_icon', '短视频平台', 1, '16', 1),
('22', '快手', 'https://www.kuaishou.com', 'kuaishou_icon', '中文短视频平台', 1, '16', 2),
('23', '微视', 'https://weishi.qq.com', 'weishi_icon', '腾讯短视频', 1, '16', 3),
('24', 'Instagram Reels', 'https://www.instagram.com/reels', 'reels_icon', 'Instagram短视频功能', 1, '16', 4),
('25', 'Snapchat Spotlight', 'https://www.snapchat.com', 'snapchat_icon', 'Snapchat短视频功能', 1, '16', 5),
('26', 'YouTube Shorts', 'https://www.youtube.com/shorts', 'youtube_shorts_icon', 'YouTube短视频', 1, '16', 6),
('27', 'Vigo Video', 'https://www.vigovideo.net', 'vigo_icon', '短视频应用', 1, '16', 7),
('28', 'Likee', 'https://www.likee.video', 'likee_icon', '全球短视频社区', 1, '16', 8),
('29', 'Firework', 'https://firework.tv', 'firework_icon', '短视频内容平台', 1, '16', 9),
('30', 'Triller', 'https://triller.co', 'triller_icon', '短视频创意工具', 1, '16', 10);

-- 标签表（10条）
INSERT INTO tags (id, name, color) VALUES
('1', '搜索', '#FF0000'),
('2', '国际', '#00FF00'),
('3', '中文', '#0000FF'),
('4', '视频', '#FFFF00'),
('5', '短视频', '#FF00FF'),
('6', '工具', '#00FFFF'),
('7', '社交', '#A52A2A'),
('8', '新闻', '#708090'),
('9', '科技', '#8A2BE2'),
('10', '娱乐', '#5F9EA0');

-- 每个网站至少关联两个标签
INSERT INTO website_tags (website_id, tag_id) VALUES
('1', '1'), ('1', '2'),  -- Google关联“搜索”和“国际”
('2', '1'), ('2', '2'),  -- Bing关联“搜索”和“国际”
('3', '1'), ('3', '2'),  -- DuckDuckGo关联“搜索”和“国际”
('4', '1'), ('4', '2'),  -- Yahoo关联“搜索”和“国际”
('5', '1'), ('5', '2'),  -- Ecosia关联“搜索”和“国际”
('6', '1'), ('6', '2'),  -- Startpage关联“搜索”和“国际”
('7', '1'), ('7', '2'),  -- Swisscows关联“搜索”和“国际”
('8', '1'), ('8', '2'),  -- Yandex关联“搜索”和“国际”
('9', '1'), ('9', '2'),  -- Seznam关联“搜索”和“国际”
('10', '1'), ('10', '2'), -- MetaGer关联“搜索”和“国际”

('11', '1'), ('11', '3'), -- 百度关联“搜索”和“中文”
('12', '1'), ('12', '3'), -- 搜狗关联“搜索”和“中文”
('13', '1'), ('13', '3'), -- 360搜索关联“搜索”和“中文”
('14', '1'), ('14', '3'), -- 神马关联“搜索”和“中文”
('15', '1'), ('15', '3'), -- 必应国际版关联“搜索”和“中文”
('16', '1'), ('16', '3'), -- 中文Google关联“搜索”和“中文”
('17', '1'), ('17', '3'), -- 知乎搜索关联“搜索”和“中文”
('18', '1'), ('18', '3'), -- 豆瓣搜索关联“搜索”和“中文”
('19', '1'), ('19', '3'), -- 微博搜索关联“搜索”和“中文”
('20', '1'), ('20', '3'); -- 网易云搜索关联“搜索”和“中文”

INSERT INTO system_settings (id, theme, language, sidebar_width, show_tag_colors) VALUES
('1', 'light', 'zh', 240, 1),