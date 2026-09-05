/* script.js */

document.addEventListener("DOMContentLoaded", () => {
    loadSharedComponents();

    // Kiểm tra xem đang ở trang chủ hay trang chi tiết
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    // Tải dữ liệu JSON
    fetch(`projects.json?v=${Date.now()}`, { cache: 'no-store' })
        .then(response => response.json())
        .then(projects => {
            if (projectId) {
                // Đang ở trang chi tiết -> Load nội dung chi tiết
                loadProjectDetail(projects, projectId);
            } else if (document.getElementById('portfolio-container')) {
                // Đang ở trang chủ -> Render danh sách
                renderPortfolioGrid(projects);
            }
        })
        .catch(err => console.error('Lỗi tải dữ liệu:', err));
});

// --- HÀM 1: Render danh sách ở trang chủ ---
function renderPortfolioGrid(projects) {
    const container = document.getElementById('portfolio-container');
    container.innerHTML = ''; // Xóa nội dung cũ

    projects.forEach(p => {
        const item = document.createElement('a');
        item.href = `project-detail.html?id=${p.id}`; // Tạo link động
        item.className = 'portfolio-item';
        
        // Gắn danh mục mốc sự nghiệp chuẩn
        item.setAttribute('data-category', p.category);

        let badgesHTML = '';
        if (p.badges && p.badges.length > 0) {
            badgesHTML = `<div class="project-badges">` +
                p.badges.map(badge => {
                    const badgeClass = badge.toLowerCase().replace(/\s+/g, '-');
                    return `<span class="project-badge badge-${badgeClass}">${badge}</span>`;
                }).join('') +
                `</div>`;
        }

        item.innerHTML = `
            <div class="portfolio-thumb-wrapper">
                <img src="${p.thumb}" alt="${p.title}" class="portfolio-thumb">
            </div>
            <div class="portfolio-info">
                ${badgesHTML}
                <h3>${p.title}</h3>
                <p>${p.project_display} | ${p.date}</p>
            </div>
        `;
        container.appendChild(item);
    });

    // Sau khi render xong mới khởi tạo bộ lọc với số lượng dự án
    initPortfolioFilter(projects);
}

// --- HÀM 2: Load nội dung trang chi tiết ---
function loadProjectDetail(projects, currentId) {
    // Tìm index của dự án hiện tại trong mảng
    const currentIndex = projects.findIndex(p => p.id === currentId);

    if (currentIndex === -1) {
        document.querySelector('.container').innerHTML = "<h1>Không tìm thấy dự án</h1>";
        return;
    }

    const project = projects[currentIndex];

    // 1. Điền thông tin cơ bản
    document.title = `${project.title} | Portfolio`;
    document.getElementById('p-title').textContent = project.title;

    // Hiển thị/Ẩn phần mô tả dựa trên sự tồn tại của nội dung
    const contentContainer = document.getElementById('p-content');
    const contentSection = document.getElementById('p-content-section');
    if (project.content_html && project.content_html.trim() !== "") {
        contentContainer.innerHTML = project.content_html;
        if (contentSection) contentSection.style.display = 'block';
    } else {
        contentContainer.innerHTML = '';
        if (contentSection) contentSection.style.display = 'none';
    }

    // Render danh sách link liên kết của dự án
    const linksContainer = document.getElementById('p-links');
    if (linksContainer) {
        linksContainer.innerHTML = '';
        if (project.links && project.links.length > 0) {
            project.links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.target = '_blank';
                a.className = `project-link-btn ${link.type}`;

                let iconClass = 'fas fa-external-link-alt';
                if (link.type === 'google-play') iconClass = 'fab fa-google-play';
                else if (link.type === 'app-store') iconClass = 'fab fa-app-store-ios';
                else if (link.type === 'website') iconClass = 'fa-solid fa-earth-americas';
                else if (link.type === 'chrome' || link.type === 'chrome-store') iconClass = 'fab fa-chrome';
                else if (link.type === 'udemy') iconClass = 'fas fa-graduation-cap';

                a.innerHTML = `<i class="${iconClass}"></i> ${link.label}`;
                linksContainer.appendChild(a);
            });
            linksContainer.style.display = 'flex';
        } else {
            linksContainer.style.display = 'none';
        }
    }

    // Hàm hỗ trợ: Nếu có data thì hiện, không có thì ẩn thẻ cha
    const updateMetaInfo = (elementId, data) => {
        const element = document.getElementById(elementId);
        if (element) {
            // Lấy thẻ cha (là thẻ <span> chứa cả icon <i> và text)
            const parentSpan = element.parentElement;

            if (data && data.trim() !== "") {
                // Nếu có dữ liệu
                element.textContent = data;
                parentSpan.style.display = "inline-block"; // Hoặc "inline-flex" tùy CSS của bạn
            } else {
                // Nếu dữ liệu trống hoặc null -> Ẩn toàn bộ dòng
                parentSpan.style.display = "none";
            }
        }
    };

    // Gọi hàm cho từng trường thông tin (chỉ hiện công ty khi là dự án doanh nghiệp thực tế)
    const validCompany = (project.company && project.company.trim() !== "" && project.company !== "Personal Project") ? project.company : null;
    updateMetaInfo('p-category', project.industry || project.category_display);
    updateMetaInfo('p-project', project.project_display);
    updateMetaInfo('p-company-meta', validCompany);
    updateMetaInfo('p-date', project.date);

    // Add Company Info Section (chỉ hiện khi có công ty doanh nghiệp và logo)
    const companySection = document.getElementById('p-company-section');
    if (validCompany && project.location && project.logo) {
        document.getElementById('p-company-logo').src = project.logo;
        document.getElementById('p-company').textContent = validCompany;
        document.getElementById('p-location').textContent = project.location;
        companySection.style.display = 'block';
    } else {
        companySection.style.display = 'none';
    }

    // 2. Render Media (Ảnh/Video/PDF)
    const mediaContainer = document.getElementById('p-media');
    mediaContainer.innerHTML = ''; // Xóa nội dung cũ để tránh bị trùng lặp

    if (project.media && project.media.length > 0) {
        if (project.media_display === 'horizontal-scroll') {
            renderHorizontalMediaList(mediaContainer, project.media.filter(m => m.type === 'img'), project.title);
        } else {
            project.media.forEach(m => {
                let elementHTML = '';

                if (m.type === 'img') {
                    // Hiển thị ẢNH
                    elementHTML = `<img src="${m.src}" alt="Project Media" style="margin-bottom:20px; width:100%; border-radius:8px;">`;

                } else if (m.type === 'video') {
                    // Hiển thị VIDEO LOCAL (MP4)
                    elementHTML = `
                <video controls width="100%" style="margin-bottom:20px; border-radius:8px; background:#000;">
                    <source src="${m.src}" type="video/mp4">
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>`;

                } else if (m.type === 'pdf' || m.type === 'pptx') {
                    // Hiển thị SLIDE / PDF / PPTX LOCAL
                    const titleHTML = m.title ? `<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:10px;"><h4 style="margin:0; font-size:1.05rem; color:#1e293b; display:flex; align-items:center; gap:8px;"><i class="fas fa-file-powerpoint" style="color:#D04423;"></i> ${m.title}</h4>${m.pptx ? `<a href="${m.pptx}" download class="project-link-btn" style="background:#D04423; font-size:0.82rem; padding:6px 14px; box-shadow:none; border-radius:6px;"><i class="fas fa-download"></i> Tải slide .pptx</a>` : ''}</div>` : '';
                    elementHTML = `
                <div style="margin-bottom:30px; background:#f8fafc; padding:16px; border-radius:10px; border:1px solid #e2e8f0;">
                    ${titleHTML}
                    <iframe src="${m.src}" width="100%" height="560px" style="border:none; border-radius:8px; background:#525659;"></iframe>
                    <p style="text-align:center; font-size:0.9rem; margin-top:8px;">
                        <a href="${m.src}" target="_blank" style="color:#0B77BE; font-weight:600;">
                            <i class="fas fa-external-link-alt"></i> Mở xem toàn màn hình (Tab mới)
                        </a>
                    </p>
                </div>`;

                } else if (m.type === 'iframe') {
                    // Hiển thị IFRAME (Youtube, Drive...)
                    elementHTML = `<iframe src="${m.src}" width="100%" height="480" style="margin-bottom:20px; border:none;"></iframe>`;
                }

                // Thêm vào container
                mediaContainer.innerHTML += elementHTML;
            });
        }
    }

    // 2.5. Render Screenshots (New Section)
    const screenshotsSection = document.getElementById('p-screenshots-section');
    const screenshotsContainer = document.getElementById('p-screenshots');
    if (screenshotsContainer && screenshotsSection) {
        screenshotsContainer.innerHTML = ''; // Clear previous contents
        if (project.screenshots && project.screenshots.length > 0) {
            const mappedImages = project.screenshots.map(src => ({ type: 'img', src: src }));
            renderHorizontalMediaList(screenshotsContainer, mappedImages, project.title);
            screenshotsSection.style.display = 'block';
        } else {
            screenshotsSection.style.display = 'none';
        }
    }
    const btnPrev = document.querySelectorAll('.btn-prev');
    const btnNext = document.querySelectorAll('.btn-next');

    // Prev: Nếu là bài đầu tiên (0) thì quay về bài cuối cùng, hoặc ẩn đi
    const prevIndex = currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    btnPrev.forEach(btn => {
        btn.href = `project-detail.html?id=${projects[prevIndex].id}`;
        btn.innerHTML = `<i class="fas fa-arrow-left"></i> ${projects[prevIndex].title}`;
    });
    // Cập nhật text cho nút để người dùng biết sẽ sang bài nào (tùy chọn)
    // btnPrev.innerHTML = `<i class="fas fa-arrow-left"></i> ${projects[prevIndex].title}`;

    // Next: Nếu là bài cuối cùng thì quay về bài đầu tiên (0)
    const nextIndex = currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
    btnNext.forEach(btn => {
        btn.href = `project-detail.html?id=${projects[nextIndex].id}`;
        btn.innerHTML = `${projects[nextIndex].title} <i class="fas fa-arrow-right"></i>`;
    });
}

function renderHorizontalMediaList(container, images, title) {
    if (!images.length) return;

    const items = images.map((m, index) => `
        <figure class="media-list-item">
            <img src="${m.src}" alt="${title} screen ${index + 1}">
        </figure>
    `).join('');

    container.innerHTML = `
        <div class="media-scroll-gallery" aria-label="${title} image gallery">
            ${items}
        </div>
    `;
}

async function loadSharedComponents() {
    try {
        // 1. Tải nội dung từ file components.html
        const response = await fetch('components.html');
        if (!response.ok) throw new Error("Không thể tải components.html");

        const text = await response.text();

        // 2. Chuyển text thành HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // 3. Lấy Header và Footer từ file đó
        const headerContent = doc.querySelector('#main-header');
        const footerContent = doc.querySelector('#main-footer');

        // 4. Gắn vào các vị trí giữ chỗ (placeholder) trên trang hiện tại
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        if (headerPlaceholder && headerContent) {
            headerPlaceholder.replaceWith(headerContent);
        }
        if (footerPlaceholder && footerContent) {
            footerPlaceholder.replaceWith(footerContent);
        }

        // 5. Sau khi gắn xong HTML, mới chạy các chức năng giao diện chung
        initMobileMenu();
        highlightActiveLink();

    } catch (error) {
        console.error("Lỗi tải giao diện chung:", error);
    }
}

// --- CHỨC NĂNG 1: Menu Mobile (Dropdown mượt mà & đóng sạch sẽ) ---
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (!hamburger || !navLinks) return;
    if (hamburger.dataset.initialized === 'true') return;
    hamburger.dataset.initialized = 'true';

    function closeMenu() {
        navLinks.classList.remove('active');
        const icon = hamburger.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (icon) {
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });

    // Đóng menu khi click vào bất kỳ link nào
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Đóng menu khi chạm/click ra ngoài vùng header
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            closeMenu();
        }
    });
}

// --- CHỨC NĂNG 2: Tự động Highligh Menu đang chọn ---
function highlightActiveLink() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        // Lấy tên file từ href (ví dụ index.html)
        const linkPage = link.getAttribute('href');

        // So sánh tương đối
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active'); // Xóa active cũ nếu có
        }
    });
}

// --- CHỨC NĂNG 3: Bộ lọc Vertical Career Timeline thông minh ---
function initPortfolioFilter(projects) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const timelineCard = document.getElementById('timeline-card');
    const toggleHeader = document.getElementById('timeline-toggle-header');
    const mobileStatusText = document.getElementById('mobile-status-text');

    if (!filterBtns.length || !timelineCard) return;
    if (timelineCard.dataset.initialized === 'true') return;
    timelineCard.dataset.initialized = 'true';

    const phaseNames = {
        all: "All Projects",
        ai: "AI & Autonomous Products",
        strategy: "Product Management & Strategy",
        product: "Digital Product & UI/UX",
        '3d': "3D & Spatial Design",
        graphic: "Graphic & Brand Identity"
    };

    const mobileShortNames = {
        all: "All Projects",
        ai: "AI & Autonomous",
        strategy: "Product Mgmt & Strategy",
        product: "Digital Product & UI/UX",
        '3d': "3D & Spatial Design",
        graphic: "Graphic & Brand"
    };

    // Hàm đóng/mở timeline trên mobile
    function toggleMobileTimeline(forceClose) {
        if (!timelineCard) return;
        if (forceClose === true) {
            timelineCard.classList.remove('is-open');
        } else {
            timelineCard.classList.toggle('is-open');
        }
    }

    if (toggleHeader) {
        toggleHeader.addEventListener('click', (e) => {
            if (window.innerWidth < 992) {
                toggleMobileTimeline();
            }
        });
    }

    // 1. Hàm thực thi bộ lọc
    function applyFilter(filterValue) {
        filterBtns.forEach(b => {
            if (b.getAttribute('data-filter') === filterValue) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        portfolioItems.forEach(item => {
            const itemCat = item.getAttribute('data-category') || '';
            if (filterValue === 'all' || itemCat === filterValue) {
                item.style.display = 'block';
                item.classList.remove('is-animating');
                // Trigger reflow to restart CSS animation smoothly
                void item.offsetWidth;
                item.classList.add('is-animating');
            } else {
                item.style.display = 'none';
                item.classList.remove('is-animating');
            }
        });

        // Cập nhật text trạng thái trên thanh mobile
        if (mobileStatusText && mobileShortNames[filterValue]) {
            mobileStatusText.textContent = mobileShortNames[filterValue];
        }
    }

    // 3. Gắn sự kiện click vào từng nút lọc
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const filterValue = btn.getAttribute('data-filter');
            applyFilter(filterValue);

            // Trên mobile, tự động gập gọn lại sau khi chọn để hiển thị ngay dự án
            if (window.innerWidth < 992) {
                toggleMobileTimeline(true);
            }

            // Cập nhật hash trên URL mà không gây nhảy trang
            if (history.replaceState) {
                const newHash = filterValue === 'all' ? '' : `#${filterValue}`;
                const newUrl = window.location.pathname + window.location.search + newHash;
                history.replaceState(null, '', newUrl);
            }
        });
    });

    // 4. Hỗ trợ kích hoạt trực tiếp từ URL (?filter=ai hoặc #ai)
    const urlParams = new URLSearchParams(window.location.search);
    const filterFromQuery = urlParams.get('filter');
    const filterFromHash = window.location.hash ? window.location.hash.replace('#', '') : null;
    const initialFilter = filterFromQuery || filterFromHash;

    if (initialFilter) {
        const targetBtn = Array.from(filterBtns).find(b => b.getAttribute('data-filter') === initialFilter);
        if (targetBtn) {
            applyFilter(initialFilter);
        }
    }
}
