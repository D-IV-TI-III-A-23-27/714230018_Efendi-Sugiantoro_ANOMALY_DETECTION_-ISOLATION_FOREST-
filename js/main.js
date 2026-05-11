/**
 * AI Core - Main Logic
 * Developed by Prof. Blonde
 */

let isDragging = false;
let currentX = 0;
let currentY = 0;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('py-2', 'shadow-xl');
            nav.classList.remove('py-4');
        } else {
            nav.classList.add('py-4');
            nav.classList.remove('py-2', 'shadow-xl');
        }
    });

    // 2. Auto-setup zoomable images (Cyber Lightbox)
    document.querySelectorAll('img').forEach(img => {
        if (img.classList.contains('no-zoom')) return;
        
        img.classList.add('zoomable');
        img.addEventListener('click', () => {
            openModal(img.src, img.alt);
        });
    });

    // 3. Global Mouse Listeners for Dragging
    document.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);
});

// Tab Navigation Logic
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('bg-sky-500', 'text-white', 'shadow-[0_0_15px_rgba(56,189,248,0.3)]');
        el.classList.add('text-muted-theme', 'hover:text-sky-500', 'hover:bg-bg-accent');
    });
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    const btn = document.getElementById('btn-' + tabId);
    if (btn) {
        btn.classList.remove('text-muted-theme', 'hover:text-sky-500', 'hover:bg-bg-accent');
        btn.classList.add('bg-sky-500', 'text-white', 'shadow-[0_0_15px_rgba(56,189,248,0.3)]');
    }
    
    if (tabId === 'simulasi' && typeof initCanvas === 'function') {
        initCanvas();
    }
}

// Image Zoom / Modal Logic
function openModal(imgSrc, caption) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');
    
    if (!modal || !modalImg) return;

    // Reset positions
    xOffset = 0;
    yOffset = 0;
    currentX = 0;
    currentY = 0;
    setTranslate(0, 0, modalImg);
    isDragging = false;
    
    modalImg.src = imgSrc;
    modalCaption.innerText = caption || '';
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

// DRAG & DROP LOGIC
function dragStart(e) {
    const modalImg = document.getElementById('modalImg');
    const modal = document.getElementById('imageModal');
    
    // Only drag if modal is open and we click the image
    if (modal.classList.contains('hidden')) return;
    if (e.target !== modalImg) return;

    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    isDragging = true;
    
    modalImg.style.cursor = 'grabbing';
    modalImg.classList.add('shadow-[0_0_80px_rgba(56,189,248,0.5)]', 'scale-[1.02]');
}

function dragEnd(e) {
    const modalImg = document.getElementById('modalImg');
    if (!modalImg) return;

    initialX = currentX;
    initialY = currentY;
    isDragging = false;

    modalImg.style.cursor = 'zoom-in';
    modalImg.classList.remove('scale-[1.02]');
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        const modalImg = document.getElementById('modalImg');
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, modalImg);
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}
