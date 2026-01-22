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
            <div class='col-lg-4 col-md-6 col-sm-12 mb-5'>
                <div class='card h-100 theme-card skeleton-card'>
                    <div class='card-img-top skeleton-image'></div>
                    <div class='card-body text-center'>
                        <div class='skeleton-line mb-2'></div>
                        <div class='skeleton-line skeleton-title mb-3'></div>
                        <div class='d-flex justify-content-between mb-3'>
                            <div class='skeleton-badge'></div>
                            <div class='skeleton-badge'></div>
                        </div>
                        <div class='d-flex justify-content-evenly gap-2 mt-4'>
                            <div class='skeleton-button'></div>
                            <div class='skeleton-button'></div>
                        </div>
                    </div>
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
        
        const skeletonCards = this.container.querySelectorAll('.skeleton-card');
        skeletonCards.forEach(card => {
            if (card.parentNode) {
                card.parentNode.remove();
            }
        });
    }

    hideAll() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default SkeletonLoader;