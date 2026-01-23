/* script.js */

document.addEventListener("DOMContentLoaded", () => {
    loadSharedComponents();
    
    // Kiểm tra xem đang ở trang chủ hay trang chi tiết
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    // Tải dữ liệu JSON
    fetch('projects.json')
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
        item.setAttribute('data-category', p.category);
        
        item.innerHTML = `
            <img src="${p.thumb}" alt="${p.title}" class="portfolio-thumb">
            <div class="portfolio-info">
                <h3>${p.title}</h3>
                <p>${p.category_display} | ${p.date}</p>
            </div>
        `;
        container.appendChild(item);
    });

    // Sau khi render xong mới khởi tạo bộ lọc
    initPortfolioFilter();
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
    document.getElementById('p-content').innerHTML = project.content_html;

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

    // Gọi hàm cho từng trường thông tin
    updateMetaInfo('p-category', project.category_display);
    updateMetaInfo('p-project', project.project_display);
    updateMetaInfo('p-client', project.client);
    updateMetaInfo('p-date', project.date);

    // 2. Render Media (Ảnh/Video/PDF)
const mediaContainer = document.getElementById('p-media');
mediaContainer.innerHTML = ''; // Xóa nội dung cũ để tránh bị trùng lặp

if (project.media && project.media.length > 0) {
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

        } else if (m.type === 'pdf') {
            // Hiển thị PDF LOCAL
            elementHTML = `
                <div style="margin-bottom:20px;">
                    <iframe src="${m.src}" width="100%" height="600px" style="border:none;"></iframe>
                    <p style="text-align:center; font-size:0.9rem; margin-top:5px;">
                        <a href="${m.src}" target="_blank" style="color:#E63946;">
                            <i class="fas fa-external-link-alt"></i> Mở PDF trong tab mới
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

    // 3. Xử lý nút Next / Prev (Tự động tính toán)
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    // Prev: Nếu là bài đầu tiên (0) thì quay về bài cuối cùng, hoặc ẩn đi
    const prevIndex = currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    btnPrev.href = `project-detail.html?id=${projects[prevIndex].id}`;
    // Cập nhật text cho nút để người dùng biết sẽ sang bài nào (tùy chọn)
    // btnPrev.innerHTML = `<i class="fas fa-arrow-left"></i> ${projects[prevIndex].title}`;

    // Next: Nếu là bài cuối cùng thì quay về bài đầu tiên (0)
    const nextIndex = currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
    btnNext.href = `project-detail.html?id=${projects[nextIndex].id}`;
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

        // 5. Sau khi gắn xong HTML, mới chạy các chức năng giao diện
        initMobileMenu();
        highlightActiveLink();
        initPortfolioFilter(); // Chỉ chạy nếu có bộ lọc trên trang

    } catch (error) {
        console.error("Lỗi tải giao diện chung:", error);
    }
}

// --- CHỨC NĂNG 1: Menu Mobile ---
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
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

// --- CHỨC NĂNG 3: Bộ lọc Portfolio (Logic cũ) ---
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                portfolioItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'block';
                        item.style.opacity = '0';
                        setTimeout(() => item.style.opacity = '1', 50);
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
}