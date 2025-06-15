document.addEventListener('DOMContentLoaded', function() {
    // 获取所有需要的元素
    const loveBtn = document.querySelector('.love-btn');
    const fireworksBtn = document.querySelector('.fireworks-btn');
    const container = document.querySelector('.container');
    const bigHeartContainer = document.querySelector('.big-heart-container');
    const canvas = document.getElementById('fireworks');
    const heartCanvas = document.getElementById('heartCanvas');
    const loveMessages = document.querySelector('.love-messages');

    // 检查必要的元素是否存在
    if (!loveBtn || !fireworksBtn || !container || !bigHeartContainer || !canvas || !heartCanvas || !loveMessages) {
        console.error('某些必要的元素未找到，请检查HTML结构');
        return;
    }

    const ctx = canvas.getContext('2d');
    const heartCtx = heartCanvas.getContext('2d');

    // 温馨感谢语列表
    const messages = [
        "爸爸，您是我心中最温暖的太阳",
        "感谢您用坚实的臂膀为我遮风挡雨",
        "您的笑容是我最珍贵的宝藏",
        "您教会我勇敢面对生活的挑战",
        "您的爱是我前进的动力",
        "感谢您一直以来的默默付出",
        "您是我心中最伟大的英雄",
        "您的关怀让我倍感温暖",
        "感谢您为我撑起一片天",
        "您的爱让我茁壮成长"
    ];

    let messageIndex = 0;

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
            this.targetX0 = targetX;
            this.targetY0 = targetY;
            this.targetX = targetX;
            this.targetY = targetY;
            this.size = 2.5;
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
        const cy = heartCanvas.height / 2 + 100;
        const scale = 300;
        let count = 0;
        const maxPoints = 7000;
        while (count < maxPoints) {
            const x = Math.random() * heartCanvas.width;
            const y = Math.random() * heartCanvas.height;
            if (isInHeart((x - cx) / 1.2 + cx, -(y - cy) + cy, cx, cy, scale)) {
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
        heartTime += 0.05;
        const scale = 1 + 0.15 * Math.sin(heartTime * 2);
        const cx = heartCanvas.width / 2;
        const cy = heartCanvas.height / 2;
        heartParticles.forEach(particle => {
            particle.targetX = (particle.targetX0 - cx) * scale + cx;
            particle.targetY = (particle.targetY0 - cy) * scale + cy;
            particle.update();
            particle.draw();
        });
    }

    // 点击表达爱意
    if (loveBtn) {
        loveBtn.addEventListener('click', function() {
            if (messageIndex < messages.length) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'love-message';
                messageDiv.textContent = messages[messageIndex];
                loveMessages.appendChild(messageDiv);
                messageIndex++;
                
                // 添加动画效果
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    messageDiv.style.opacity = '1';
                    messageDiv.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    }

    // 点击放烟花按钮
    if (fireworksBtn) {
        fireworksBtn.addEventListener('click', function() {
            container.classList.add('hide');
            bigHeartContainer.style.display = 'flex';
            initHeartParticles();
            startContinuousFireworks();
        });
    }

    // 开始动画
    animate();
}); 
