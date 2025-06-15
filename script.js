document.addEventListener('DOMContentLoaded', function() {
    const photoFrame = document.querySelector('.photo-frame');
    const photoUpload = document.getElementById('photo-upload');
    const shareBtn = document.querySelector('.share-btn');
    const fireworksBtn = document.querySelector('.fireworks-btn');
    const container = document.querySelector('.container');
    const bigHeartContainer = document.querySelector('.big-heart-container');
    const canvas = document.getElementById('fireworks');
    const heartCanvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');
    const heartCtx = heartCanvas.getContext('2d');

    // 放大爱心canvas为2400x2400，始终居中
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        heartCanvas.width = 2400;
        heartCanvas.height = 2400;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 烟花粒子类
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = {
                x: (Math.random() - 0.5) * 8,
                y: (Math.random() - 0.5) * 8
            };
            this.alpha = 1;
            this.friction = 0.95;
            this.gravity = 0.2;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }

        update() {
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            this.velocity.y += this.gravity;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= 0.01;
        }
    }

    // 爱心粒子类
    class HeartParticle {
        constructor(x, y, targetX, targetY) {
            this.x = x;
            this.y = y;
            this.targetX0 = targetX; // 原始目标点
            this.targetY0 = targetY;
            this.targetX = targetX;
            this.targetY = targetY;
            this.size = 2.5; // 粒子更大
            this.color = '#ff4b4b';
            this.velocity = {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            };
        }

        draw() {
            heartCtx.beginPath();
            heartCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            heartCtx.fillStyle = this.color;
            heartCtx.fill();
        }

        update() {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            if (this.x < 0 || this.x > heartCanvas.width) this.velocity.x *= -1;
            if (this.y < 0 || this.y > heartCanvas.height) this.velocity.y *= -1;
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            this.x += dx * 0.1;
            this.y += dy * 0.1;
        }
    }

    let particles = [];
    let heartParticles = [];
    let isFireworksActive = false;
    let fireworksInterval;
    let heartTime = 0;

    // 随机采样填充整个心形区域，均匀分布
    function isInHeart(x, y, cx, cy, scale) {
        x = (x - cx) / scale;
        y = (y - cy) / scale;
        return Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y <= 0;
    }

    function createHeartShape() {
        const points = [];
        const cx = heartCanvas.width / 2;
        const cy = heartCanvas.height / 2+50; // 垂直居中
        const scale = 200; // y方向更长
        let count = 0;
        const maxPoints = 4000; // 粒子数量
        while (count < maxPoints) {
            const x = Math.random() * heartCanvas.width;
            const y = Math.random() * heartCanvas.height;
            // x方向拉宽1.8倍，y方向加负号正过来
            if (isInHeart((x - cx) / 1 + cx, -(y - cy) + cy, cx, cy, scale)) {
                points.push({ x, y });
                count++;
            }
        }
        return points;
    }

    function initHeartParticles() {
        const heartPoints = createHeartShape();
        heartParticles = [];
        for (let i = 0; i < heartPoints.length; i++) {
            const point = heartPoints[i];
            heartParticles.push(new HeartParticle(
                Math.random() * heartCanvas.width,
                Math.random() * heartCanvas.height,
                point.x,
                point.y
            ));
        }
    }

    // 创建烟花
    function createFirework(x, y) {
        const colors = ['#ff0000', '#ff4b4b', '#ff6b6b', '#ff8b8b', '#ffabab'];
        for (let i = 0; i < 100; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(x, y, color));
        }
    }

    // 开始持续放烟花
    function startContinuousFireworks() {
        if (!isFireworksActive) {
            isFireworksActive = true;
            fireworksInterval = setInterval(() => {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height * 0.5;
                createFirework(x, y);
            }, 300);
        }
    }

    // 停止放烟花
    function stopFireworks() {
        if (isFireworksActive) {
            isFireworksActive = false;
            clearInterval(fireworksInterval);
        }
    }

    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 烟花动画
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(particle => particle.alpha > 0);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // 爱心动画
        heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
        // 跳动缩放因子
        heartTime += 0.05;
        const scale = 1 + 0.15 * Math.sin(heartTime * 2);
        const cx = heartCanvas.width / 2;
        const cy = heartCanvas.height / 2;
        heartParticles.forEach(particle => {
            // 目标点随scale变化
            particle.targetX = (particle.targetX0 - cx) * scale + cx;
            particle.targetY = (particle.targetY0 - cy) * scale + cy;
            particle.update();
            particle.draw();
        });
    }

    // 点击照片框触发文件选择
    photoFrame.addEventListener('click', () => {
        photoUpload.click();
    });

    // 处理照片上传
    photoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%';
                img.style.borderRadius = '8px';
                
                const placeholder = document.querySelector('.photo-placeholder');
                placeholder.innerHTML = '';
                placeholder.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });

    // 分享功能
    shareBtn.addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: '父亲节快乐',
                text: '送给最亲爱的爸爸',
                url: window.location.href
            })
            .catch(error => console.log('分享失败:', error));
        } else {
            alert('复制链接分享给爸爸吧！');
        }
    });

    // 点击放烟花按钮
    fireworksBtn.addEventListener('click', function() {
        container.classList.add('hide');
        bigHeartContainer.style.display = 'flex';
        initHeartParticles();
        startContinuousFireworks();
    });

    // 开始动画
    animate();
}); 