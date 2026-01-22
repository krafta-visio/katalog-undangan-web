class ImageLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    async loadImage(themeName, imageName) {
        const cacheKey = `${themeName}/${imageName}`;
        
        // Return cached promise jika sedang loading
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        // Jika sudah di cache, langsung return
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Buat promise untuk loading
        const loadPromise = this.tryLoadImage(themeName, imageName);
        this.loadingPromises.set(cacheKey, loadPromise);

        try {
            const result = await loadPromise;
            this.cache.set(cacheKey, result);
            return result;
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    }

    async tryLoadImage(themeName, imageName) {
        const paths = this.generateImagePaths(themeName, imageName);
        
        for (const path of paths) {
            try {
                await this.validateImage(path);
                return path; // Return path pertama yang berhasil
            } catch (error) {
                console.debug(`Failed to load: ${path}`);
                continue;
            }
        }
        
        // Fallback ke placeholder
        return 'images/placeholder.jpg';
    }

    async validateImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            // Timeout cepat (3 detik)
            const timeout = setTimeout(() => {
                img.src = '';
                reject(new Error('timeout'));
            }, 3000);
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve();
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('load error'));
            };
            
            img.src = src;
        });
    }

    generateImagePaths(themeName, imageName) {
        const basePath = 'pilihan-tema';
        const paths = [];
        
        // 1. Path asli dari JSON
        if (imageName) {
            paths.push(`${basePath}/${themeName}/${imageName}`);
        }
        
        // 2. Nama umum dengan berbagai ekstensi
        const commonNames = ['preview', 'image', 'thumbnail', 'cover'];
        const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
        
        for (const name of commonNames) {
            for (const ext of extensions) {
                paths.push(`${basePath}/${themeName}/${name}${ext}`);
            }
        }
        
        return paths;
    }

    preloadImages(themes) {
        // Preload hanya 3 gambar pertama untuk percepat initial load
        themes.slice(0, 3).forEach(theme => {
            this.loadImage(theme.name, theme.image).catch(() => {});
        });
    }

    clearCache() {
        this.cache.clear();
        this.loadingPromises.clear();
    }
}

export default ImageLoader;