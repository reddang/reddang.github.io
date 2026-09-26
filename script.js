/* script.js – renders the home page lists and the case study page from projects.json */

document.addEventListener('DOMContentLoaded', () => {
    initNav();

    fetch('projects.json?v=2026-09-redesign')
        .then(res => res.json())
        .then(projects => {
            if (document.getElementById('detail')) {
                const id = new URLSearchParams(window.location.search).get('id');
                renderDetail(projects, id);
            } else {
                renderFeatured(projects.filter(p => p.tier === 'featured'));
                renderShipped(projects.filter(p => p.tier === 'shipped'));
                renderArchive(projects.filter(p => p.tier === 'archive'));
            }
        })
        .catch(err => console.error('Could not load projects.json', err));
});

// ---------- helpers ----------

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const detailUrl = p => `project.html?id=${encodeURIComponent(p.id)}`;

// Grid thumbnails use the smaller copy in assets/img/card/
const cardSrc = src => (src && src.startsWith('assets/img/') ? src.replace('assets/img/', 'assets/img/card/') : src);

// Product logo first, then the company logo when the product has its own brand
const logoImgs = (p, attrs = '') =>
    [p.logo, p.company_logo].filter(Boolean).map(src => `<img src="${esc(src)}" alt="" ${attrs}>`).join('');

const LINK_ICONS = {
    'google-play': 'fa-brands fa-google-play',
    'app-store': 'fa-brands fa-app-store-ios',
    'chrome': 'fa-brands fa-chrome',
    'udemy': 'fa-solid fa-graduation-cap',
    'unica': 'fa-solid fa-graduation-cap',
    'pdf': 'fa-solid fa-file-pdf',
    'website': 'fa-solid fa-arrow-up-right-from-square'
};

function linkButtons(links, cls = 'btn btn-ghost btn-small') {
    return (links || []).map(l =>
        `<a class="${cls}" href="${esc(l.url)}" target="_blank" rel="noopener"><i class="${LINK_ICONS[l.type] || LINK_ICONS.website}"></i> ${esc(l.label)}</a>`
    ).join('');
}

// ---------- navigation ----------

function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    const setOpen = open => {
        links.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    };

    toggle.addEventListener('click', e => {
        e.stopPropagation();
        setOpen(!links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('click', e => {
        if (!links.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
}

// ---------- home page ----------

function renderFeatured(list) {
    const el = document.getElementById('featured-list');
    if (!el) return;
    el.innerHTML = list.map(p => {
        const metrics = (p.metrics || []).slice(0, 2).map(m =>
            `<li><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></li>`).join('');
        return `
        <article class="feature">
            <a class="feature-media${p.thumb_fit === 'contain' ? ' fit-contain' : ''}" href="${detailUrl(p)}" tabindex="-1" aria-hidden="true">
                <img src="${esc(cardSrc(p.thumb))}" alt="" loading="lazy">
            </a>
            <div class="feature-body">
                <div class="feature-meta">
                    ${logoImgs(p, 'loading="lazy"')}
                    <span>${esc(p.company)} · ${esc(p.period)}</span>
                </div>
                <h3><a href="${detailUrl(p)}">${esc(p.title)}</a></h3>
                <p class="feature-tagline">${esc(p.tagline)}</p>
                ${metrics ? `<ul class="metric-row">${metrics}</ul>` : ''}
                <a class="text-link" href="${detailUrl(p)}">Read case study <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        </article>`;
    }).join('');
}

function renderShipped(list) {
    const el = document.getElementById('shipped-list');
    if (!el) return;
    el.innerHTML = list.map(p => `
        <article class="card">
            <a class="card-media" href="${detailUrl(p)}" tabindex="-1" aria-hidden="true">
                <img src="${esc(cardSrc(p.thumb))}" alt="" loading="lazy">
            </a>
            <div class="card-body">
                <p class="card-kicker">${esc(p.platform)}</p>
                <h3><a href="${detailUrl(p)}">${esc(p.title)}</a></h3>
                <p>${esc(p.tagline)}</p>
                <div class="card-actions">
                    <a class="text-link" href="${detailUrl(p)}">Details <i class="fa-solid fa-arrow-right"></i></a>
                    ${linkButtons(p.links, 'chip-link')}
                </div>
            </div>
        </article>`).join('');
}

const ARCHIVE_GROUPS = [
    { key: 'product', title: 'Product & UX design' },
    { key: '3d', title: '3D & visualization' },
    { key: 'graphic', title: 'Graphic & brand' },
    { key: 'games', title: 'Games' }
];

function renderArchive(list) {
    const el = document.getElementById('archive-list');
    if (!el) return;
    el.innerHTML = ARCHIVE_GROUPS.map(g => {
        const items = list.filter(p => p.group === g.key);
        if (!items.length) return '';
        return `
        <div class="archive-group">
            <h3>${esc(g.title)}</h3>
            <div class="archive-grid">
                ${items.map(p => `
                <a class="archive-item" href="${detailUrl(p)}">
                    <img src="${esc(cardSrc(p.thumb))}" alt="" loading="lazy">
                    <span class="archive-title">${esc(p.title)}</span>
                    <span class="archive-role">${esc(p.role)}</span>
                </a>`).join('')}
            </div>
        </div>`;
    }).join('');

    // Open the archive when someone jumps to #design
    const details = document.querySelector('details.archive');
    if (details) {
        const label = details.querySelector('summary span');
        details.addEventListener('toggle', () => { label.textContent = details.open ? 'Hide design work' : 'Show design work'; });
        if (window.location.hash === '#design') details.open = true;
    }
    document.querySelectorAll('a[href="#design"]').forEach(a =>
        a.addEventListener('click', () => { if (details) details.open = true; }));
}

// ---------- case study page ----------

function renderDetail(projects, id) {
    const main = document.getElementById('detail');
    const p = projects.find(x => x.id === id);

    if (!p) {
        main.innerHTML = `
        <div class="container detail-missing">
            <h1>Project not found</h1>
            <p>This project is no longer listed.</p>
            <a class="btn" href="index.html#work">See all work</a>
        </div>`;
        return;
    }

    document.title = `${p.title} | Red Dang`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && (p.tagline || p.role)) desc.setAttribute('content', p.tagline || `${p.title}: ${p.role}`);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `${p.title} | Red Dang`);

    const isArchive = p.tier === 'archive';
    const facts = [
        ['Role', p.role],
        ['Company', isArchive ? p.company : null],
        ['Period', p.period],
        ['Platform', p.platform],
        ['Industry', p.industry]
    ].filter(([, v]) => v);

    const metrics = (p.metrics || []).map(m => `
        <li><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span>${m.from ? `<em>${esc(m.from)}</em>` : ''}</li>`).join('');

    const sections = (p.sections || []).map(s => {
        const body = s.list
            ? `<div class="decision-grid">${s.list.map(d => `<div class="decision"><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></div>`).join('')}</div>`
            : s.html;
        return `<section class="cs-section"><h2>${esc(s.heading)}</h2><div class="prose">${body}</div></section>`;
    }).join('');

    const gallery = (p.gallery || []).length ? `
        <section class="cs-section cs-wide">
            <h2>Screens</h2>
            <div class="gallery" tabindex="0" aria-label="${esc(p.title)} screens">
                ${p.gallery.map((g, i) => `
                <figure>
                    <img src="${esc(g.src)}" alt="${esc(g.caption || `${p.title} screen ${i + 1}`)}" loading="lazy">
                    ${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}
                </figure>`).join('')}
            </div>
        </section>` : '';

    const media = (p.media || []).map(m => renderMedia(m, p.title)).join('');

    // Prev / next within the same list (work or design archive)
    const seq = projects.filter(x => (x.tier === 'archive') === isArchive);
    const i = seq.findIndex(x => x.id === p.id);
    const prev = seq[(i - 1 + seq.length) % seq.length];
    const next = seq[(i + 1) % seq.length];

    main.innerHTML = `
    <article>
        <header class="detail-hero container">
            <a class="back-link" href="index.html#${isArchive ? 'design' : 'work'}"><i class="fa-solid fa-arrow-left"></i> ${isArchive ? 'Design work' : 'All work'}</a>
            <div class="detail-company">
                ${logoImgs(p)}
                <span>${esc(isArchive ? `Design archive · ${p.company}` : p.company)}</span>
            </div>
            <h1>${esc(p.title)}</h1>
            ${p.tagline ? `<p class="lead">${esc(p.tagline)}</p>` : ''}
            <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
            ${(p.links || []).length ? `<div class="detail-links">${linkButtons(p.links, 'btn btn-small')}</div>` : ''}
        </header>

        ${metrics ? `<div class="container"><ul class="metrics-band">${metrics}</ul></div>` : ''}

        <div class="container cs-body">
            ${sections}
            ${isArchive && p.content_html ? `<section class="cs-section"><div class="prose">${p.content_html}</div></section>` : ''}
        </div>

        <div class="container">
            ${gallery}
            ${media ? `<section class="cs-section cs-wide">${isArchive ? '' : '<h2>Visuals</h2>'}<div class="media-stack${p.media_layout === 'grid' ? ' grid' : ''}">${media}</div></section>` : ''}
        </div>

        <nav class="container pager" aria-label="More projects">
            <a href="${detailUrl(prev)}"><small><i class="fa-solid fa-arrow-left"></i> Previous</small><span>${esc(prev.title)}</span></a>
            <a href="${detailUrl(next)}" class="pager-next"><small>Next <i class="fa-solid fa-arrow-right"></i></small><span>${esc(next.title)}</span></a>
        </nav>
    </article>`;
}

function renderMedia(m, title) {
    const cap = m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : '';
    if (m.type === 'img') {
        return `<figure class="media"><a href="${esc(m.src)}" target="_blank" rel="noopener"><img src="${esc(m.src)}" alt="${esc(m.caption || title)}" loading="lazy"></a>${cap}</figure>`;
    }
    if (m.type === 'video') {
        return `<figure class="media"><video controls preload="${m.poster ? 'none' : 'metadata'}" playsinline ${m.poster ? `poster="${esc(m.poster)}"` : ''}><source src="${esc(m.src)}" type="video/mp4"></video>${cap}</figure>`;
    }
    if (m.type === 'iframe') {
        return `<figure class="media"><div class="embed"><iframe src="${esc(m.src)}" title="${esc(m.caption || title)}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>${cap}</figure>`;
    }
    return '';
}
