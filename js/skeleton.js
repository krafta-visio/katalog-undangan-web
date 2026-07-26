class SkeletonLoader {
    constructor(containerId, count = 9) {
        this.container = document.getElementById(containerId);
        this.count = count;
        
        if (!this.container) {
            console.error(`Container ${containerId} not found`);
        }
    }

    createSkeletonCard() {
        return `
            <div class="col-lg-6 col-md-6 mb-4 skeleton-card-wrapper">
                <div class="skeleton-card">
                    <div class="skeleton-shimmer"></div>
                </div>
            </div>
        `;
    }

    show() {
        if (!this.container) return;
        
        let skeletonHTML = '';
        for (let i = 0; i < this.count; i++) {
            skeletonHTML += this.createSkeletonCard();
        }
        this.container.innerHTML = skeletonHTML;
    }

    showAppend(count = 3) {
        if (!this.container) return;
        
        let skeletonHTML = '';
        for (let i = 0; i < count; i++) {
            skeletonHTML += this.createSkeletonCard();
        }
        this.container.insertAdjacentHTML('beforeend', skeletonHTML);
    }

    hide() {
        if (!this.container) return;
        
        const skeletonCards = this.container.querySelectorAll('.skeleton-card-wrapper');
        skeletonCards.forEach(card => {
            card.remove();
        });
    }

    hideAll() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default SkeletonLoader;