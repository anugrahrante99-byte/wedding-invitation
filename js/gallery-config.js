// Static Gallery Configuration for GitHub Pages
// This replaces the serverless API function

const GALLERY_CONFIG = {
    categories: {
        bride: {
            name: 'Mempelai Wanita',
            files: [
                '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg',
                '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg'
            ]
        },
        groom: {
            name: 'Mempelai Pria',
            files: [
                '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg',
                '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg'
            ]
        },
        engagement: {
            name: 'Engagement',
            files: [
                '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg',
                '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg'
            ]
        },
        prewedding: {
            name: 'Pre-Wedding',
            files: [
                '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg',
                '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg'
            ]
        },
        moments: {
            name: 'Moments',
            files: [
                '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg',
                '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg'
            ]
        },
        together: {
            name: 'Together',
            files: [
                '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg',
                '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg'
            ]
        }
    }
};

// Static API function
function getGalleryPhotos(category) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (GALLERY_CONFIG.categories[category]) {
                resolve({
                    success: true,
                    files: GALLERY_CONFIG.categories[category].files,
                    count: GALLERY_CONFIG.categories[category].files.length,
                    category: category
                });
            } else {
                resolve({
                    success: false,
                    files: [],
                    error: 'Category not found'
                });
            }
        }, 100); // Simulate network delay
    });
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GALLERY_CONFIG, getGalleryPhotos };
}
