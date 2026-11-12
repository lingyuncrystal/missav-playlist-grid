// ==UserScript==
// @name         MissAV 片单网格化（仿分类页样式）
// @namespace    https://missav.ws/
// @version      1.0.0
// @description  把 MissAV 播放列表(片单)页面改成和「中文字幕」等分类页一样的缩略图网格卡片样式
// @author       you
// @match        https://missav.ws/playlists/*
// @match        https://missav.ws/cn/playlists/*
// @match        https://missav.com/playlists/*
// @match        https://missav.com/cn/playlists/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    /**
     * 把片单页的竖向列表改造成分类页的网格卡片。
     * 只做 class / 位置调整，不碰 Alpine.js 的 x-data / x-ref 绑定，
     * 因此「提交评语」「删除」功能保持可用。
     */
    function applyGridLayout() {
        // 片单条目列表（页面里唯一一个 mb-12 space-y-8 的 ul）
        const ul = document.querySelector('ul.mb-12.space-y-8');
        if (!ul) return false;
        if (ul.dataset.gridified === '1') return true; // 已处理过

        // 1. 容器：竖向列表 -> 分类页同款响应式网格
        ul.classList.remove('space-y-8');
        ul.classList.add('grid', 'grid-cols-2', 'md:grid-cols-3', 'xl:grid-cols-4', 'gap-5');

        ul.querySelectorAll(':scope > li').forEach((li) => {
            // 2. 条目：去掉横向 flex 布局，变成普通块级卡片
            li.classList.remove('sm:flex', 'w-72', 'sm:w-full', 'mx-auto');

            // 3. 缩略图外层包装：去掉固定宽度，让封面铺满卡片
            const wrap = li.querySelector(':scope > div');
            if (wrap) wrap.className = '';

            const thumbnail = li.querySelector('.thumbnail');
            const form = li.querySelector(':scope > form');
            const label = form ? form.querySelector('label') : null;

            // 4. 标题：把表单里的 label 换成分类页同款「图下方单行截断链接」
            if (thumbnail && label) {
                const href = (thumbnail.querySelector('a[href]') || {}).href || '#';
                const titleDiv = document.createElement('div');
                titleDiv.className = 'my-2 text-sm text-nord4 truncate';
                const a = document.createElement('a');
                a.className = 'text-secondary group-hover:text-primary';
                a.href = href;
                a.textContent = label.textContent.trim();
                titleDiv.appendChild(a);
                // 放进 .thumbnail.group 内部，和分类页 DOM 结构一致
                thumbnail.appendChild(titleDiv);
                label.remove();
            }

            // 5. 评语表单：默认折叠，加一个小开关，保持卡片整洁
            if (form) {
                form.classList.remove('grow');
                form.style.display = 'none';
                const textarea = form.querySelector('textarea');
                if (textarea) textarea.rows = 2;

                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.textContent = '评语 / 删除';
                toggle.className =
                    'mt-1 text-xs text-nord8 hover:text-primary underline underline-offset-2';
                toggle.addEventListener('click', () => {
                    const hidden = form.style.display === 'none';
                    form.style.display = hidden ? '' : 'none';
                    toggle.textContent = hidden ? '收起' : '评语 / 删除';
                });
                // 插到缩略图后面、表单前面
                li.insertBefore(toggle, form);
            }
        });

        ul.dataset.gridified = '1';
        return true;
    }

    // 页面是服务端渲染 + Alpine，正常情况下 document-idle 时 DOM 已就绪；
    // 保险起见轮询几秒，应对慢网络/客户端渲染。
    let tries = 0;
    const timer = setInterval(() => {
        if (applyGridLayout() || ++tries > 20) clearInterval(timer);
    }, 300);
})();
