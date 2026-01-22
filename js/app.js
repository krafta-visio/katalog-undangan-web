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
            
            // Fallback: coba lagi dengan cache
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
                this.backToTopBtn.style.display = scrollY > 300 ? 'block' : 'none';
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
        
        // Setup IntersectionObserver dengan threshold lebih sensitif
        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.hasMore && !this.isLoading && !this.isLoadingMore) {
                    console.log('🎯 Infinite scroll trigger hit!');
                    
                    // Debounce untuk mencegah multiple loads
                    clearTimeout(this.loadMoreTimeout);
                    this.loadMoreTimeout = setTimeout(() => {
                        this.loadMoreThemes();
                    }, 100); // Delay kecil
                }
            });
        }, {
            root: null,
            rootMargin: '100px 0px', // Load 100px sebelum mencapai trigger
            threshold: 0.01 // Sangat sensitif
        });
        
        // Mulai observe trigger
        this.scrollObserver.observe(this.infiniteScrollTrigger);
        console.log('✅ Infinite scroll observer active');
    }

    async loadMoreThemes() {
        if (this.isLoadingMore || !this.hasMore) {
            console.log('⏸️ Skipping loadMoreThemes:', {
                isLoadingMore: this.isLoadingMore,
                hasMore: this.hasMore
            });
            return;
        }
        
        console.log('📦 Loading more themes...');
        
        this.isLoadingMore = true;
        this.showLoading();
        
        try {
            const nextIndex = this.currentIndex;
            const endIndex = nextIndex + this.batchSize;
            const themesToShow = this.filteredThemes.slice(nextIndex, endIndex);
            
            if (themesToShow.length === 0) {
                console.log('📭 No more themes to show');
                this.hasMore = false;
                this.hideLoading();
                return;
            }
            
            // Show skeleton untuk batch baru
            this.skeletonLoader.showAppend(3);
            
            // Delay kecil untuk UX
            await this.delay(150);
            
            // Render themes baru
            this.renderThemes(themesToShow, true);
            
            // Update state
            this.currentIndex += themesToShow.length;
            this.hasMore = this.currentIndex < this.filteredThemes.length;
            
            // Setup lazy loading untuk gambar baru
            this.setupLazyImages();
            
            console.log(`✅ Loaded ${themesToShow.length} more themes, total: ${this.currentIndex}`);
            
            // Hide skeleton
            setTimeout(() => {
                this.skeletonLoader.hide();
            }, 200);
            
            // Jika masih ada data, setup ulang observer untuk batch berikutnya
            if (this.hasMore) {
                console.log('🔄 Still more themes, resetting infinite scroll...');
                // Setup ulang observer untuk trigger berikutnya
                this.setupInfiniteScroll();
            } else {
                console.log('🏁 All themes loaded');
                this.showEndMessage();
                
                // Cleanup observer karena tidak ada lagi data
                if (this.scrollObserver) {
                    this.scrollObserver.disconnect();
                    this.scrollObserver = null;
                }
                
                // Sembunyikan trigger
                if (this.infiniteScrollTrigger) {
                    this.infiniteScrollTrigger.style.display = 'none';
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to load more themes:', error);
        } finally {
            this.isLoadingMore = false;
            // PASTIKAN loading indicator selalu dihide
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
        
        console.log(`🎨 Rendered ${themes.length} theme cards`);
    }

    createThemeCard(theme) {
        const whatsappText = encodeURIComponent(
            `Halo kak! Saya ingin order undangan web dengan tema ${theme.displayName} ini, bagaimana caranya?, terima kasih.`
        );
        const whatsappUrl = `https://api.whatsapp.com/send?phone=6281370705753&text=${whatsappText}`;
        
        const imagePath = `pilihan-tema/${theme.name}/${theme.image}`;
        const placeholder = 'images/placeholder.jpg';
        
        return `
            <div class='col-lg-4 col-md-6 col-sm-12 mb-5 theme-item' data-theme-id="${theme.id}">
                <div class='card h-100 theme-card'>
                    <div class="image-container">
                        <img src="${placeholder}"
                             data-src="${imagePath}"
                             class="card-img-top theme-image lazy-image"
                             alt="${theme.displayName}"
                             loading="lazy"
                             width="400"
                             height="300">
                        <div class="image-loading"></div>
                    </div>
                    <div class='card-body text-center'>
                        <span class="theme-category">Digital Web Invitation Theme</span>
                        <h3 class='card-title mb-2'>${theme.displayName}</h3>
                        <p class="theme-description text-muted small mb-3">${theme.description}</p>
                        <div class="theme-meta mb-3">
                            <span class="badge bg-secondary me-1">${theme.category}</span>
                            <span class="badge bg-info">${theme.type}</span>
                        </div>
                        <hr class="my-3">
                        <div class='d-flex justify-content-evenly gap-2'>
                            <a href='pilihan-tema/${theme.name}' 
                               class='btn btn-primary btn-sm flex-fill'
                               target='_blank'
                               rel="noopener">
                                <i class="fas fa-eye me-1"></i> Preview
                            </a>
                            <a href='${whatsappUrl}' 
                               class='btn btn-success btn-sm flex-fill'
                               target='_blank'
                               rel="noopener">
                                <i class="fas fa-shopping-cart me-1"></i> Order
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
        
        // Cek gambar yang sudah terlihat
        this.checkLazyLoadImages();
        
        // Setup IntersectionObserver untuk sisanya
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
            // Preload image
            await new Promise((resolve, reject) => {
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
        
        console.log(`🔍 Applying filter: ${filter}`);
        
        this.currentFilter = filter;
        this.currentIndex = 0;
        this.hasMore = true;
        this.hasInitialLoad = false;
        
        // Cleanup observers
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
            this.scrollObserver = null;
        }
        
        // Reset infinite scroll trigger
        if (this.infiniteScrollTrigger) {
            this.infiniteScrollTrigger.style.display = 'block';
        }
        
        // Update filter buttons
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Filter themes
        if (filter === 'all') {
            this.filteredThemes = [...this.themes];
        } else {
            this.filteredThemes = this.themes.filter(theme => 
                theme.category === filter || theme.type === filter
            );
        }
        
        console.log(`🔍 Filtered to ${this.filteredThemes.length} themes`);

        // Load themes untuk filter baru
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
            
            // Tambahkan delay sebelum benar-benar hide
            setTimeout(() => {
                if (!this.isLoading && !this.isLoadingMore) {
                    this.loadingIndicator.classList.add('hidden');
                }
            }, 300);
        }
    }

    showNoResults() {
        console.log('📭 No results found');
        
        this.themesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info">
                    <i class="fas fa-search fa-2x mb-3 text-info"></i>
                    <h4>Tidak ada tema yang ditemukan</h4>
                    <p>Silahkan pilih kategori filter lainnya.</p>
                </div>
            </div>
        `;
        
        this.hideLoading();
    }

    showEndMessage() {
        console.log(`🏁 Showing end message for ${this.filteredThemes.length} themes`);
        
        const endMessage = `
            <div class="col-12 text-center py-4">
                <div class="alert alert-light border">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    <span>Semua ${this.filteredThemes.length} tema telah ditampilkan</span>
                </div>
            </div>
        `;
        
        this.themesContainer.insertAdjacentHTML('beforeend', endMessage);
        this.hideLoading();
    }

    showError(message) {
        console.error('❌ Showing error:', message);
        
        this.themesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h4>Terjadi Kesalahan</h4>
                    <p>${message}</p>
                    <button class="btn btn-outline-danger mt-2" onclick="location.reload()">
                        <i class="fas fa-redo me-1"></i> Muat Ulang Halaman
                    </button>
                </div>
            </div>
        `;
        
        this.hideLoading();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Cleanup
    destroy() {
        console.log('🧹 Cleaning up ThemeCatalog...');
        
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
            this.scrollObserver = null;
        }
        
        clearTimeout(this.loadMoreTimeout);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded');
    
    setTimeout(() => {
        try {
            console.log('🚀 Initializing ThemeCatalog...');
            const catalog = new ThemeCatalog();
            window.themeCatalog = catalog;
            
            // Debug helper
            window.debugCatalog = () => {
                console.log('🔍 Catalog Debug Info:', {
                    themes: catalog.themes?.length || 0,
                    filteredThemes: catalog.filteredThemes?.length || 0,
                    currentIndex: catalog.currentIndex,
                    hasMore: catalog.hasMore,
                    isLoading: catalog.isLoading,
                    isLoadingMore: catalog.isLoadingMore,
                    hasInitialLoad: catalog.hasInitialLoad
                });
            };
            
        } catch (error) {
            console.error('❌ Failed to initialize ThemeCatalog:', error);
            
            const container = document.getElementById('tema-container');
            if (container) {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <div class="alert alert-danger">
                            <h4>Gagal Memuat Katalog</h4>
                            <p>${error.message}</p>
                            <button class="btn btn-outline-danger" onclick="location.reload()">
                                <i class="fas fa-redo me-1"></i> Refresh Halaman
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }, 100);
});

export default ThemeCatalog;