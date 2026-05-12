// --- ANIMATION CANVAS LOGIC ---
let canvas, ctx, points = [], anomalyPoint = null, normalPoint = null, isRunning = false;
let logicalW, logicalH;
let currentSimLevel = 1;

// Theme Colors
const getThemeColor = (varName) => getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

// Initialize elements
function initElements() {
    canvas = document.getElementById('isoCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        resizeCanvas();
    }
}

function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    logicalW = rect.width;
    logicalH = rect.height;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    if (ctx) ctx.scale(dpr, dpr);
}

window.setSimLevel = function(lvl) {
    if (isRunning) return;
    currentSimLevel = lvl;
    
    // Update UI buttons
    document.querySelectorAll('.lvl-btn').forEach(btn => {
        btn.classList.remove('bg-sky-500', 'text-white', 'shadow-lg', 'shadow-sky-500/20');
        btn.classList.add('text-muted-theme', 'hover:text-sky-500');
    });
    const activeBtn = document.getElementById('lvl-' + lvl);
    if (activeBtn) {
        activeBtn.classList.add('bg-sky-500', 'text-white', 'shadow-lg', 'shadow-sky-500/20');
        activeBtn.classList.remove('text-muted-theme', 'hover:text-sky-500');
    }
    
    window.initCanvas();
};

function generateCluster(count, centerX, centerY, sigma) {
    for(let i=0; i<count; i++) {
        let u = Math.random(), v = Math.random();
        let numX = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        let numY = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v);
        points.push({ x: centerX + numX * sigma, y: centerY + numY * sigma, type: 'normal' });
    }
}

window.initCanvas = function() {
    initElements();
    if (!canvas) return;

    points = [];
    document.getElementById('stat-anomaly').innerText = '0';
    document.getElementById('stat-normal').innerText = '0';
    document.getElementById('sim-conclusion').classList.add('hidden');
    
    const btnRun = document.getElementById('btn-run');
    if (btnRun) {
        btnRun.disabled = false;
        btnRun.classList.remove('opacity-50');
    }

    // Level-based Data Generation
    if (currentSimLevel === 1) {
        // BASIC: Satu Cluster Sentral
        generateCluster(120, logicalW/2 + 50, logicalH/2, 35);
        anomalyPoint = { x: logicalW * 0.15, y: logicalH * 0.25, type: 'anomaly' };
    } else if (currentSimLevel === 2) {
        // COMPLEX: Dua Cluster Terpisah (Sesuai Gambar User)
        generateCluster(80, logicalW * 0.25, logicalH * 0.7, 30);
        generateCluster(80, logicalW * 0.75, logicalH * 0.3, 30);
        anomalyPoint = { x: logicalW * 0.5, y: logicalH * 0.5, type: 'anomaly' };
    } else {
        // EXTREME: Tiga Cluster + Noise (Masking Scenario)
        generateCluster(60, logicalW * 0.2, logicalH * 0.2, 25);
        generateCluster(60, logicalW * 0.8, logicalH * 0.8, 25);
        generateCluster(60, logicalW * 0.5, logicalH * 0.5, 40);
        // Add uniform noise
        for(let i=0; i<40; i++) {
            points.push({ x: Math.random() * logicalW, y: Math.random() * logicalH, type: 'normal' });
        }
        anomalyPoint = { x: logicalW * 0.1, y: logicalH * 0.9, type: 'anomaly' };
    }

    normalPoint = points[0];
    points.push(anomalyPoint);

    drawPoints();
};

function drawPoints() {
    if (!ctx) return;
    ctx.clearRect(0, 0, logicalW, logicalH);
    
    const colorAnomaly = getThemeColor('--accent-red') || '#ef4444';
    const colorNormal = getThemeColor('--accent') || '#38bdf8';
    const colorData = getThemeColor('--text-muted') || '#94a3b8';

    points.forEach(p => {
        ctx.beginPath();
        if (p === anomalyPoint) {
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = colorAnomaly; 
            ctx.shadowColor = colorAnomaly;
            ctx.shadowBlur = 15;
        } else if (p === normalPoint) {
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = colorNormal; 
            ctx.shadowColor = colorNormal;
            ctx.shadowBlur = 15;
        } else {
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = colorData;
            ctx.shadowBlur = 0;
        }
        ctx.fill();
    });
    ctx.shadowBlur = 0;
}

function drawLine(x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function isolatePoint(target, colorTheme, statId) {
    let currentPoints = [...points];
    let bounds = { minX: 0, maxX: logicalW, minY: 0, maxY: logicalH };
    let steps = 0;

    while(currentPoints.length > 1 && steps < 20) {
        steps++;
        let dataMinX = Math.min(...currentPoints.map(p => p.x));
        let dataMaxX = Math.max(...currentPoints.map(p => p.x));
        let dataMinY = Math.min(...currentPoints.map(p => p.y));
        let dataMaxY = Math.max(...currentPoints.map(p => p.y));

        let splitAxis = (dataMaxX - dataMinX) > (dataMaxY - dataMinY) ? 'x' : 'y';
        let splitVal;

        if(splitAxis === 'x') {
            splitVal = dataMinX + Math.random() * (dataMaxX - dataMinX);
            drawLine(splitVal, bounds.minY, splitVal, bounds.maxY, colorTheme);
            if (target.x < splitVal) {
                bounds.maxX = splitVal;
                currentPoints = currentPoints.filter(p => p.x < splitVal);
            } else {
                bounds.minX = splitVal;
                currentPoints = currentPoints.filter(p => p.x >= splitVal);
            }
        } else {
            splitVal = dataMinY + Math.random() * (dataMaxY - dataMinY);
            drawLine(bounds.minX, splitVal, bounds.maxX, splitVal, colorTheme);
            if (target.y < splitVal) {
                bounds.maxY = splitVal;
                currentPoints = currentPoints.filter(p => p.y < splitVal);
            } else {
                bounds.minY = splitVal;
                currentPoints = currentPoints.filter(p => p.y >= splitVal);
            }
        }

        document.getElementById(statId).innerText = steps;
        ctx.fillStyle = colorTheme + '22';
        ctx.fillRect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
        await sleep(400);
    }
    return steps;
}

window.startSimulation = async function() {
    if(isRunning) return;
    isRunning = true;
    const btn = document.getElementById('btn-run');
    if (btn) {
        btn.disabled = true;
        btn.classList.add('opacity-50');
    }

    const colorAnomaly = getThemeColor('--accent-red') || '#ef4444';
    const colorNormal = getThemeColor('--accent') || '#2563eb';

    drawPoints();
    const aSteps = await isolatePoint(anomalyPoint, colorAnomaly, 'stat-anomaly');
    await sleep(1000);
    
    drawPoints();
    const nSteps = await isolatePoint(normalPoint, colorNormal, 'stat-normal');

    const txtAnomali = document.getElementById('txt-anomali-step');
    const txtNormal = document.getElementById('txt-normal-step');
    if (txtAnomali) txtAnomali.innerText = aSteps;
    if (txtNormal) txtNormal.innerText = nSteps;
    
    const conclusion = document.getElementById('sim-conclusion');
    if (conclusion) conclusion.classList.remove('hidden');
    
    isRunning = false;
    if (btn) {
        btn.disabled = false;
        btn.classList.remove('opacity-50');
    }
};

window.resetSimulation = function() {
    if(isRunning) return;
    window.initCanvas();
};

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    window.initCanvas();
    // Ensure theme UI is updated after DOM loads
    if (window.updateThemeUI) {
        window.updateThemeUI(localStorage.getItem('theme') || 'system');
    }
});

window.addEventListener('resize', () => {
    resizeCanvas();
    drawPoints();
});

