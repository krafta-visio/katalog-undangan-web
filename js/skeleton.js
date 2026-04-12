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
            <div class='skeleton-card-wrapper'>
                <div class='skeleton-card'>
                    <div class='skeleton-image'></div>
                    <div style='padding:1rem;text-align:center;'>
                        <div class='skeleton-line' style='width:40%;margin:0 auto 8px;'></div>
                        <div class='skeleton-title'></div>
                        <div class='skeleton-line' style='width:80%;margin:0 auto 6px;'></div>
                        <div class='skeleton-line' style='width:60%;margin:0 auto 12px;'></div>
                        <div style='display:flex;gap:6px;justify-content:center;margin-bottom:12px;'>
                            <div class='skeleton-badge'></div>
                            <div class='skeleton-badge'></div>
                        </div>
                        <div style='display:flex;gap:8px;'>
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