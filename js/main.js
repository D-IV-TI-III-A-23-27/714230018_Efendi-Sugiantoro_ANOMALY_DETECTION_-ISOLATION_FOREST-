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

// Architecture SVG Interactivity
function showNodeInfo(type) {
    const card = document.getElementById('nodeInfoCard');
    const title = document.getElementById('infoTitle');
    const text = document.getElementById('infoText');
    const icon = document.getElementById('infoIcon');

    const data = {
        source: {
            title: "Data Streaming",
            icon: '<i class="fas fa-database"></i>',
            text: "Input data mentah yang akan dianalisis. Dataset bisa berupa log server, transaksi keuangan, atau metrik sensor secara real-time."
        },
        sampling: {
            title: "Sub-Sampling",
            icon: '<i class="fas fa-filter"></i>',
            text: "Proses pengambilan sampel acak (biasanya n=256) untuk membangun iTree. Berguna untuk menghindari masalah 'swamping' dan 'masking'."
        },
        forest: {
            title: "Isolation Forest",
            icon: '<i class="fas fa-tree"></i>',
            text: "Kumpulan ratusan pohon isolasi (iTrees) yang dibangun secara independen. Di sinilah proses partisi rekursif terjadi secara paralel."
        },
        scoring: {
            title: "Anomaly Scoring",
            icon: '<i class="fas fa-tachometer-alt"></i>',
            text: "Tahap akhir di mana rata-rata panjang jalur dikonversi menjadi skor (0-1). Skor di atas 0.6 biasanya dianggap sebagai anomali kuat."
        }
    };

    if (data[type]) {
        title.innerText = data[type].title;
        text.innerText = data[type].text;
        icon.innerHTML = data[type].icon;
        card.classList.remove('hidden');
    }
}

function hideNodeInfo() {
    document.getElementById('nodeInfoCard').classList.add('hidden');
}

// Complex Architecture Detail Logic
function showArchDetail(type) {
    const card = document.getElementById('archDetailCard');
    const title = document.getElementById('archDetailTitle');
    const text = document.getElementById('archDetailText');
    const icon = document.getElementById('archDetailIcon');

    const data = {
        dataset: {
            title: "Offline Dataset",
            icon: '<i class="fas fa-database"></i>',
            text: "Kumpulan data historis besar yang digunakan untuk melatih model. Data ini harus bersih dan mewakili perilaku sistem dalam kondisi normal."
        },
        engineering: {
            title: "Feature Eng.",
            icon: '<i class="fas fa-tools"></i>',
            text: "Tahap transformasi data mentah menjadi fitur numerik yang bisa dipahami algoritma iForest, seperti normalisasi dan seleksi variabel."
        },
        artifact: {
            title: "Model Artifact",
            icon: '<i class="fas fa-cube"></i>',
            text: "File biner hasil training yang berisi struktur iForest (kumpulan pohon isolasi) yang sudah siap digunakan untuk deteksi."
        },
        forest: {
            title: "iForest Engine",
            icon: '<i class="fas fa-microchip"></i>',
            text: "Inti dari arsitektur di mana algoritma Isolation Forest membangun ratusan iTrees. Setiap pohon mengisolasi titik data melalui partisi acak."
        },
        registry: {
            title: "Model Registry",
            icon: '<i class="fas fa-cloud-upload-alt"></i>',
            text: "Repositori pusat untuk menyimpan versi model. Memungkinkan layanan online untuk mendownload model terbaru secara otomatis."
        },
        live: {
            title: "Live Stream",
            icon: '<i class="fas fa-broadcast-tower"></i>',
            text: "Aliran data real-time dari sistem produksi. Setiap titik data akan langsung dikirim ke layanan inferensi untuk diperiksa."
        },
        alert: {
            title: "Alert System",
            icon: '<i class="fas fa-exclamation-triangle"></i>',
            text: "Jika skor anomali melampaui ambang batas (misal > 0.6), sistem akan memicu peringatan dan tindakan mitigasi otomatis."
        },
        preprocess: {
            title: "Live Preproc.",
            icon: '<i class="fas fa-microchip"></i>',
            text: "Transformasi data real-time yang harus berjalan sangat cepat (latensi rendah) agar sesuai dengan format yang dibutuhkan model."
        },
        inference: {
            title: "Inference Svc.",
            icon: '<i class="fas fa-brain"></i>',
            text: "Mesin utama yang menghitung skor isolasi untuk data baru menggunakan model yang sudah dilatih sebelumnya."
        },
        score: {
            title: "Decision Logic",
            icon: '<i class="fas fa-calculator"></i>',
            text: "Logika penentuan apakah sebuah data normal atau anomali berdasarkan ambang batas statistik yang ditentukan."
        }
    };

    if (data[type]) {
        title.innerText = data[type].title;
        text.innerText = data[type].text;
        icon.innerHTML = data[type].icon;
        card.classList.remove('hidden');
    }
}

function hideArchDetail() {
    document.getElementById('archDetailCard').classList.add('hidden');
}
