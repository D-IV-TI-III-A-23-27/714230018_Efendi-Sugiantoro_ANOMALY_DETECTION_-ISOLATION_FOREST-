// --- ANIMATION CANVAS LOGIC ---
let canvas, ctx, points = [], anomalyPoint = null, normalPoint = null, isRunning = false;
let logicalW, logicalH;

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

    const centerX = logicalW / 2 + 50;
    const centerY = logicalH / 2;

    // Generate Normal Cluster
    for(let i=0; i<120; i++) {
        let u = Math.random(), v = Math.random();
        let numX = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        let numY = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v);
        points.push({ x: centerX + numX * 35, y: centerY + numY * 35, type: 'normal' });
    }

    normalPoint = points[0];
    anomalyPoint = { x: logicalW * 0.15, y: logicalH * 0.25, type: 'anomaly' };
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

