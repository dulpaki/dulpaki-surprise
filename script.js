document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const mainStage = document.getElementById('main-stage');
    const thumbnailGallery = document.getElementById('thumbnail-gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const scrollIndicator = document.querySelector('.scroll-down-indicator');
    const gallerySection = document.getElementById('gallery-section');

    // --- 設定 -------------------------------------------------
    const mainVisualImage = 'images/main-visual.jpg'; 
    const totalPhotos = 9; 
    const photoImageFiles = [];
    for (let i = 1; i <= totalPhotos; i++) {
        photoImageFiles.push(`images/${i}.jpeg`);
    }
    const illustrationFiles = [/* 'images/illust1.png' */];
    const allStreamingImages = [...photoImageFiles, ...illustrationFiles];

    // --- スマホ判定 ---
    const isMobile = window.innerWidth <= 768;

    // --- アニメーション設定 ---
    const rowDurations = [28, 35, 24]; 
    const rowDirections = ['scroll-left-to-right', 'scroll-right-to-left', 'scroll-left-to-right'];
    const rowStates = [
        { busy: false, cooldown: isMobile ? 10000 : 5000 }, 
        { busy: false, cooldown: isMobile ? 10000 : 5000 }, 
        { busy: false, cooldown: isMobile ? 10000 : 5000 }
    ];
    // -----------------------------------------------------------

    // --- 画像の事前読み込み ---
    function preloadImages(paths) {
        const promises = paths.map(path => new Promise((resolve, reject) => {
            const img = new Image();
            img.src = path;
            img.onload = resolve;
            img.onerror = reject;
        }));
        return Promise.all(promises);
    }

    // --- メインの処理 ---
    function initialize() {
        loader.classList.add('hidden');
        setupThumbnailGallery();
        startStreamingAnimation();
        setupEventListeners();
    }
    
    function setupThumbnailGallery() {
        photoImageFiles.forEach(src => {
            const thumbImg = document.createElement('img');
            thumbImg.src = src;
            thumbImg.addEventListener('click', () => {
                lightbox.style.display = 'flex';
                lightboxImg.src = src;
            });
            thumbnailGallery.appendChild(thumbImg);
        });
    }

    // --- アニメーション関連 ---
    function createStreamingImage(row) {
        if (allStreamingImages.length === 0) return;
        const randomSrc = allStreamingImages[Math.floor(Math.random() * allStreamingImages.length)];
        const img = document.createElement('img');
        img.src = randomSrc;
        img.className = 'streaming-image';
        
        const size = isMobile ? (Math.random() * 5 + 8) : (Math.random() * 10 + 15);
        const topPosition = [15, 45, 75];
        
        img.style.top = `${topPosition[row]}%`;
        img.style.height = `${size}vh`;
        img.style.width = 'auto';

        const duration = rowDurations[row];
        const direction = rowDirections[row];

        // ★★★ ここからが修正点 ★★★
        // 先にDOMに追加する
        mainStage.appendChild(img);

        // ほんの僅かに遅延させてからアニメーションを開始する
        setTimeout(() => {
            img.style.animationName = direction;
            img.style.animationDuration = `${duration}s`;
        }, 10); // 10ミリ秒の遅延
        // ★★★ 修正点ここまで ★★★

        setTimeout(() => {
            img.remove();
        }, duration * 1000 + 50); // 念のため少し余裕を持たせる
    }

    // アニメーションを開始する関数
    function startStreamingAnimation() {
        const creationInterval = isMobile ? 3500 : 1000;

        setInterval(() => {
            const availableRows = [];
            for (let i = 0; i < rowStates.length; i++) {
                if (!rowStates[i].busy) {
                    availableRows.push(i);
                }
            }
            if (availableRows.length > 0) {
                const chosenRow = availableRows[Math.floor(Math.random() * availableRows.length)];
                createStreamingImage(chosenRow);
                rowStates[chosenRow].busy = true;
                setTimeout(() => {
                    rowStates[chosenRow].busy = false;
                }, rowStates[chosenRow].cooldown);
            }
        }, creationInterval);
    }

    // --- その他のイベントリスナー ---
    function setupEventListeners() {
        lightboxClose.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
        scrollIndicator.addEventListener('click', () => {
            gallerySection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- 実行 ---
    const allImagesToLoad = [mainVisualImage, ...photoImageFiles, ...illustrationFiles];
    preloadImages(allImagesToLoad)
        .then(() => {
            console.log('All images preloaded successfully!');
            initialize();
        })
        .catch(error => {
            console.error('画像のプリロード中にエラーが発生しました:', error);
            loader.innerHTML = '<p>画像の読み込みに失敗しました。ページを再読み込みしてみてください。</p>';
        });
});
