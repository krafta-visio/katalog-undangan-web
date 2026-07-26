import SkeletonLoader from './skeleton.js';
import ImageLoader from './image-loader.js';

class ThemeCatalog {
    constructor() {
        this.currentIndex = 0;
        this.batchSize = 9;
        this.isLoading = false;
        this.hasMore = true;
        this.hasInitialLoad = false;
        this.themes = [];
        this.filteredThemes = [];
        this.currentFilter = 'all';
        
        // Elements
        this.themesContainer = document.getElementById('tema-container');
        this.initialPrompt = document.getElementById('initial-prompt');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.filterButtons = document.querySelectorAll('.filter-badge');
        this.backToTopBtn = document.getElementById('back-to-top');
        this.infiniteScrollTrigger = document.getElementById('infinite-scroll-trigger');
        
        // Cek elemen vital
        if (!this.themesContainer) {
            console.error('❌ CRITICAL: tema-container tidak ditemukan');
            return;
        }
        
        // Services
        this.skeletonLoader = new SkeletonLoader('tema-container', this.batchSize);
        this.imageLoader = new ImageLoader();
        
        // State untuk mencegah multiple loads
        this.isLoadingMore = false;
        this.loadMoreTimeout = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 ThemeCatalog initialization started');
        
        try {
            // Load data pertama
            await this.loadThemesData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial themes secara otomatis
            await this.loadInitialThemes();
            
            console.log('✅ ThemeCatalog initialized successfully');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showError('Gagal menginisialisasi katalog. Silahkan refresh halaman.');
        }
    }

    async loadThemesData() {
        try {
            console.log('📦 Loading themes data...');
            
            const response = await fetch('data/themes.json', {
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Raw JSON data:', data);
            
            if (!data.themes || !Array.isArray(data.themes)) {
                throw new Error('Format data themes tidak valid');
            }
            
            this.themes = data.themes.map((theme, index) => ({
                id: theme.id || index + 1,
                name: theme.name || `theme-${index + 1}`,
                displayName: theme.displayName || theme.name,
                image: theme.image || 'preview.jpg',
                category: theme.category || 'other',
                type: theme.type || 'scroll',
                description: theme.description || ''
            }));
            
            this.filteredThemes = [...this.themes];
            console.log(`✅ Loaded ${this.themes.length} themes`);
            
        } catch (error) {
            console.error('❌ Failed to load themes data:', error);
            
            // Fallback
            try {
                const fallbackResponse = await fetch('data/themes.json');
                const fallbackData = await fallbackResponse.json();
                
                if (fallbackData.themes) {
                    this.themes = fallbackData.themes.map((theme, index) => ({
                        id: theme.id || index + 1,
                        name: theme.name || `theme-${index + 1}`,
                        displayName: theme.displayName || theme.name,
                        image: theme.image || 'preview.jpg',
                        category: theme.category || 'other',
                        type: theme.type || 'scroll',
                        description: theme.description || ''
                    }));
                    
                    this.filteredThemes = [...this.themes];
                    console.log(`✅ Loaded ${this.themes.length} themes (fallback)`);
                } else {
                    throw error;
                }
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
                this.themes = [];
                this.filteredThemes = [];
                throw error;
            }
        }
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = btn.dataset.filter;
                console.log(`🎛️ Filter clicked: ${filter}`);
                this.applyFilter(filter);
            });
        });

        // Back to top
        if (this.backToTopBtn) {
            this.backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY || document.documentElement.scrollTop;
                this.backToTopBtn.style.display = scrollY > 300 ? 'flex' : 'none';
            });
        }
        
        console.log('✅ Event listeners setup complete');
    }

    async loadInitialThemes() {
        console.log('🔄 Loading initial themes...');
        
        if (this.isLoading) {
            console.log('⚠️ Already loading, skipping...');
            return;
        }
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            // Cek jika ada data
            if (this.filteredThemes.length === 0) {
                this.showNoResults();
                this.hideInitialPrompt();
                this.hideLoading();
                return;
            }
            
            // Hide initial prompt
            this.hideInitialPrompt();
            
            // Show skeleton loader
            console.log('👻 Showing skeleton loader...');
            this.skeletonLoader.show();
            
            // Delay kecil untuk UX
            await this.delay(200);
            
            // Load first batch
            const themesToShow = this.filteredThemes.slice(0, this.batchSize);
            console.log(`📸 Rendering ${themesToShow.length} themes...`);
            
            // Render themes
            this.renderThemes(themesToShow);
            
            // Update state
            this.currentIndex = themesToShow.length;
            this.hasMore = this.currentIndex < this.filteredThemes.length;
            this.hasInitialLoad = true;
            
            // Setup lazy loading untuk gambar
            this.setupLazyImages();
            
            // Setup infinite scroll untuk batch berikutnya
            if (this.hasMore) {
                console.log('🔄 Setting up infinite scroll...');
                this.setupInfiniteScroll();
            } else {
                this.showEndMessage();
            }
            
            // Hide skeleton dan loading
            console.log('👻 Hiding skeleton loader...');
            setTimeout(() => {
                this.skeletonLoader.hide();
                this.hideLoading();
                console.log(`✅ Initial load complete: ${themesToShow.length} themes loaded`);
            }, 300);
            
        } catch (error) {
            console.error('❌ Failed to load initial themes:', error);
            this.showError('Gagal memuat tema awal');
            this.skeletonLoader.hide();
            this.hideLoading();
        } finally {
            this.isLoading = false;
        }
    }

    setupInfiniteScroll() {
        // Hapus observer lama jika ada
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
            this.scrollObserver = null;
        }
        
        // Pastikan trigger element ada
        if (!this.infiniteScrollTrigger) {
            console.error('❌ Infinite scroll trigger not found');
            return;
        }
        
        // Pastikan masih ada data yang bisa diload
        if (!this.hasMore) {
            console.log('⚠️ No more data to load, skipping infinite scroll setup');
            return;
        }
        
        console.log('🔍 Setting up infinite scroll observer...');
        
        // Tampilkan trigger
        this.infiniteScrollTrigger.style.display = 'block';
        
        // Setup IntersectionObserver
        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.hasMore && !this.isLoading && !this.isLoadingMore) {
                    console.log('🎯 Infinite scroll trigger hit!');
                    
                    clearTimeout(this.loadMoreTimeout);
                    this.loadMoreTimeout = setTimeout(() => {
                        this.loadMoreThemes();
                    }, 100);
                }
            });
        }, {
            root: null,
            rootMargin: '150px 0px', // Load 150px sebelum trigger
            threshold: 0.01
        });
        
        // Mulai observe trigger
        this.scrollObserver.observe(this.infiniteScrollTrigger);
        console.log('✅ Infinite scroll observer active');
    }

    async loadMoreThemes() {
        if (this.isLoadingMore || !this.hasMore) {
            return;
        }
        
        this.isLoadingMore = true;
        this.showLoading();
        
        try {
            const nextIndex = this.currentIndex;
            const endIndex = nextIndex + this.batchSize;
            const themesToShow = this.filteredThemes.slice(nextIndex, endIndex);
            
            if (themesToShow.length === 0) {
                this.hasMore = false;
                this.hideLoading();
                return;
            }
            
            // Show skeleton untuk batch baru
            this.skeletonLoader.showAppend(3);
            
            await this.delay(150);
            
            // Render themes baru
            this.renderThemes(themesToShow, true);
            
            // Update state
            this.currentIndex += themesToShow.length;
            this.hasMore = this.currentIndex < this.filteredThemes.length;
            
            this.setupLazyImages();
            
            setTimeout(() => {
                this.skeletonLoader.hide();
            }, 200);
            
            if (this.hasMore) {
                this.setupInfiniteScroll();
            } else {
                this.showEndMessage();
                if (this.scrollObserver) {
                    this.scrollObserver.disconnect();
                    this.scrollObserver = null;
                }
                if (this.infiniteScrollTrigger) {
                    this.infiniteScrollTrigger.style.display = 'none';
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to load more themes:', error);
        } finally {
            this.isLoadingMore = false;
            setTimeout(() => {
                this.hideLoading();
            }, 300);
        }
    }

    renderThemes(themes, append = false) {
        if (!themes || themes.length === 0) {
            return;
        }
        
        const fragment = document.createDocumentFragment();
        
        themes.forEach(theme => {
            const themeCard = this.createThemeCard(theme);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = themeCard;
            
            if (tempDiv.firstElementChild) {
                fragment.appendChild(tempDiv.firstElementChild);
            }
        });
        
        if (append) {
            this.themesContainer.appendChild(fragment);
        } else {
            this.themesContainer.innerHTML = '';
            this.themesContainer.appendChild(fragment);
        }
    }

    createThemeCard(theme) {
        const whatsappText = encodeURIComponent(
            `Halo kak! Saya ingin order undangan web dengan tema ${theme.displayName} ini, bagaimana caranya?, terima kasih.`
        );
        const whatsappUrl = `https://api.whatsapp.com/send?phone=6281370705753&text=${whatsappText}`;
        
        const imagePath = `pilihan-tema/${theme.name}/${theme.image}`;
        const placeholder = 'images/placeholder.jpg';
        
        return `
            <div class="col-lg-6 col-md-6 mb-4 theme-item" data-theme-id="${theme.id}">
                <div class="katalog-card">
                    <div class="katalog-card-img-wrapper">
                        <img src="${placeholder}"
                             data-src="${imagePath}"
                             class="katalog-card-img lazy-image"
                             alt="${theme.displayName}"
                             loading="lazy" />
                        <div class="image-loading">
                            <div class="spinner-border text-warning" role="status" style="width: 1.5rem; height: 1.5rem;">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                    <div class="katalog-card-body">
                        <div>
                            <span class="theme-category mb-2">Digital Web Invitation Theme</span>
                            <h3 class="katalog-card-title">${theme.displayName}</h3>
                            <p class="katalog-card-desc mb-3">${theme.description}</p>
                            <div class="d-flex flex-wrap gap-2 mb-4">
                                <span class="badge bg-secondary text-light text-uppercase font-weight-bold" style="font-size: 0.65rem; border-radius: 0; letter-spacing: 0.05em;">${theme.category}</span>
                                <span class="badge bg-secondary text-light text-uppercase font-weight-bold" style="font-size: 0.65rem; border-radius: 0; letter-spacing: 0.05em;">${theme.type}</span>
                            </div>
                        </div>
                        <div class="d-flex gap-2 w-100 mt-auto">
                            <a href="pilihan-tema/${theme.name}" 
                               class="btn btn-katalog-preview flex-grow-1 text-uppercase fw-bold"
                               target="_blank"
                               rel="noopener">
                                <i class="fas fa-eye me-1"></i> Preview
                            </a>
                            <a href="${whatsappUrl}" 
                               class="btn btn-warning flex-grow-1 text-uppercase fw-bold text-dark"
                               style="border-radius: 0; font-size: 0.75rem; letter-spacing: 0.05em; background-color: var(--accent); border-color: var(--accent);"
                               target="_blank"
                               rel="noopener">
                                <i class="fab fa-whatsapp me-1"></i> Order
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupLazyImages() {
        const lazyImages = this.themesContainer.querySelectorAll('.lazy-image:not([data-loaded])');
        
        if (lazyImages.length === 0) {
            return;
        }
        
        this.checkLazyLoadImages();
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                root: null,
                rootMargin: '100px 0px',
                threshold: 0.01
            });
            
            lazyImages.forEach(img => {
                if (!img.getAttribute('data-observed')) {
                    img.setAttribute('data-observed', 'true');
                    imageObserver.observe(img);
                }
            });
        }
    }

    checkLazyLoadImages() {
        const lazyImages = this.themesContainer.querySelectorAll('.lazy-image:not([data-loaded]):not([data-loading])');
        
        lazyImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            const isVisible = (
                rect.top < window.innerHeight + 200 &&
                rect.bottom > -200
            );
            
            if (isVisible) {
                this.loadImage(img);
            }
        });
    }

    async loadImage(img) {
        if (!img || img.getAttribute('data-loading') === 'true' || img.getAttribute('data-loaded') === 'true') {
            return;
        }
        
        const src = img.getAttribute('data-src');
        if (!src) {
            return;
        }
        
        img.setAttribute('data-loading', 'true');
        
        try {
            await new Promise((resolve) => {
                const tempImg = new Image();
                tempImg.onload = () => {
                    requestAnimationFrame(() => {
                        img.src = src;
                        img.classList.add('loaded');
                        img.setAttribute('data-loaded', 'true');
                        img.removeAttribute('data-loading');
                        img.removeAttribute('data-src');
                        resolve();
                    });
                };
                tempImg.onerror = () => {
                    requestAnimationFrame(() => {
                        img.classList.add('error');
                        img.setAttribute('data-loaded', 'true');
                        img.removeAttribute('data-loading');
                        resolve();
                    });
                };
                tempImg.src = src;
            });
            
        } catch (error) {
            console.warn('Failed to load image:', error);
            img.setAttribute('data-loaded', 'true');
            img.removeAttribute('data-loading');
        }
    }

    applyFilter(filter) {
        if (this.currentFilter === filter || this.isLoading || this.isLoadingMore) {
            return;
        }
        
        this.currentFilter = filter;
        this.currentIndex = 0;
        this.hasMore = true;
        this.hasInitialLoad = false;
        
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
            this.scrollObserver = null;
        }
        
        if (this.infiniteScrollTrigger) {
            this.infiniteScrollTrigger.style.display = 'block';
        }
        
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        if (filter === 'all') {
            this.filteredThemes = [...this.themes];
        } else {
            this.filteredThemes = this.themes.filter(theme => 
                theme.category === filter || theme.type === filter
            );
        }

        if (this.filteredThemes.length > 0) {
            this.loadInitialThemes();
        } else {
            this.showNoResults();
            this.hideLoading();
        }
    }

    hideInitialPrompt() {
        if (this.initialPrompt) {
            this.initialPrompt.style.opacity = '0';
            this.initialPrompt.style.transition = 'opacity 0.3s';
            
            setTimeout(() => {
                if (this.initialPrompt.parentNode) {
                    this.initialPrompt.style.display = 'none';
                }
            }, 300);
        }
    }

    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.remove('hidden');
            this.loadingIndicator.classList.add('show');
        }
    }

    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.remove('show');
            setTimeout(() => {
                if (!this.isLoading && !this.isLoadingMore) {
                    this.loadingIndicator.classList.add('hidden');
                }
            }, 300);
        }
    }

    showNoResults() {
        this.themesContainer.innerHTML = `
            <div class="status-empty">
                <i class="fas fa-search"></i>
                <p>Tidak ada tema yang ditemukan</p>
                <span>Silahkan pilih kategori filter lainnya.</span>
            </div>
        `;
        this.hideLoading();
    }

    showEndMessage() {
        const endMessage = `
            <div class="status-end">
                <i class="fas fa-check-circle"></i>
                <p>Semua ${this.filteredThemes.length} tema telah ditampilkan</p>
                <span>Selesai memuat katalog undangan web.</span>
            </div>
        `;
        this.themesContainer.insertAdjacentHTML('beforeend', endMessage);
        this.hideLoading();
    }

    showError(message) {
        this.themesContainer.innerHTML = `
            <div class="status-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Terjadi Kesalahan</p>
                <span>${message}</span>
                <button class="btn btn-outline-light mt-3" onclick="location.reload()">
                    <i class="fas fa-redo me-1"></i> Muat Ulang
                </button>
            </div>
        `;
        this.hideLoading();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    destroy() {
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
            this.scrollObserver = null;
        }
        clearTimeout(this.loadMoreTimeout);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // ── Loader Hiding ──
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(() => loader.style.display = 'none', 700);
        }, 2500);
    }

    // ── Cursor Glow ──
    const cursor = document.getElementById('cursorGlow');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }

    // ── Theme Switcher Widget ──
    const themeToggleBtn = document.getElementById('themeToggle');
    const toggleIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    
    const getSavedTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme : 'dark';
    };

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        if (toggleIcon) {
            toggleIcon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    };

    if (themeToggleBtn) {
        applyTheme(getSavedTheme());
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }

    // ── Dynamic Year ──
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ── Initialize ThemeCatalog ──
    setTimeout(() => {
        try {
            const catalog = new ThemeCatalog();
            window.themeCatalog = catalog;
        } catch (error) {
            console.error('❌ Failed to initialize ThemeCatalog:', error);
        }
    }, 100);
});

export default ThemeCatalog;