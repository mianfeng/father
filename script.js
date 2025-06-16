document.addEventListener('DOMContentLoaded', function () {
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

    // 道歉语列表
    const messages = [
        "宝贝宝贝对不起",
        "我是凑凑大麻瓜",
        "超级巫师美丽大方",
        "摇了我吧~~",
        "你是我心中最珍贵的宝贝",
        "没有你的日子我度日如年",
        "原谅我的愚蠢和冲动"
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

    let particles = [];
    let heartParticles = [];
    let textParticles = []; // 添加文字粒子数组
    let isFireworksActive = false;
    let fireworksInterval;
    let heartTime = 0;
    const MAX_PARTICLES = 5000;
    const APOLOGY_TEXT = "对不起"; // 道歉文字
    let currentTextIndex = 0; // 当前显示的文字索引

    // 烟花粒子类
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = {
                x: (Math.random() - 0.5) * 12,
                y: (Math.random() - 0.5) * 12
            };
            this.alpha = 1;
            this.friction = 0.96;
            this.gravity = 0.15;
            this.size = Math.random() * 3 + 1;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.2;
            this.trail = [];
            this.maxTrailLength = 5;
            this.createdAt = Date.now(); // 记录创建时间
            this.lifeTime = 3000; // 3秒生命周期
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            for (let i = 0; i < this.trail.length; i++) {
                const pos = this.trail[i];
                ctx.beginPath();
                ctx.arc(pos.x - this.x, pos.y - this.y, this.size * (i / this.trail.length), 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.alpha * (i / this.trail.length);
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            ctx.restore();
        }

        update() {
            // 检查是否超过生命周期
            if (Date.now() - this.createdAt > this.lifeTime) {
                return false;
            }

            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }

            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            this.velocity.y += this.gravity;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= 0.008;
            this.rotation += this.rotationSpeed;

            return this.alpha > 0;
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
            this.baseSize = Math.random() * 3 + 1; // 保存基础大小
            this.size = this.baseSize; // 当前大小
            this.color = `hsl(${Math.random() * 60 + 330}, 100%, 70%)`;
            this.velocity = {
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 3
            };
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.1;
            this.pulse = Math.random() * 0.2 + 0.9; // 增加初始脉冲范围
            this.pulseSpeed = Math.random() * 0.06 + 0.02; // 增加脉冲速度
        }

        draw() {
            heartCtx.save();
            heartCtx.translate(this.x, this.y);
            heartCtx.rotate(this.rotation);

            heartCtx.beginPath();
            heartCtx.moveTo(0, 0);
            heartCtx.bezierCurveTo(
                this.size * 2, -this.size * 2,
                this.size * 3, 0,
                0, this.size * 3
            );
            heartCtx.bezierCurveTo(
                -this.size * 3, 0,
                -this.size * 2, -this.size * 2,
                0, 0
            );
            heartCtx.fillStyle = this.color;
            heartCtx.fill();

            heartCtx.restore();
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

            this.rotation += this.rotationSpeed;

            this.pulse += this.pulseSpeed;
            if (this.pulse > 3 || this.pulse < 0.5) { // 扩大脉冲范围
                this.pulseSpeed *= -1;
            }
            this.size = this.baseSize * this.pulse * 2; // 保持2倍缩放
        }
    }

    // 文字粒子类
    class TextParticle {
        constructor(x, y, text) {
            this.x = x;
            this.y = y;
            this.text = text;
            this.alpha = 0;
            this.size = 80; // 文字大小增加到80像素
            this.createdAt = Date.now();
            this.lifeTime = 1000; // 1秒生命周期
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.font = `bold ${this.size}px Arial`; // 添加bold使文字更清晰
            ctx.fillStyle = '#ffffff'; // 改为白色
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }

        update() {
            const elapsed = Date.now() - this.createdAt;
            if (elapsed > this.lifeTime) {
                return false;
            }

            // 计算透明度：0-500ms淡入，500-1000ms淡出
            if (elapsed < 500) {
                this.alpha = elapsed / 500;
            } else {
                this.alpha = 1 - (elapsed - 500) / 500;
            }

            return true;
        }
    }

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
        const scale = 400;
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
        const colors = [
            '#ff6b8b', '#ff8da1', '#ffa5b5', '#ffbdc9', '#ffd5dd',
            '#ff69b4', '#ff1493', '#ffb6c1', '#ffc0cb', '#db7093'
        ];

        for (let layer = 0; layer < 3; layer++) {
            const particleCount = 100 + layer * 50;
            const color = colors[Math.floor(Math.random() * colors.length)];

            for (let i = 0; i < particleCount; i++) {
                const particle = new Particle(x, y, color);
                particle.velocity.x *= (1 + layer * 0.5);
                particle.velocity.y *= (1 + layer * 0.5);
                particles.push(particle);
            }
        }

        // 在烟花位置创建文字
        const text = APOLOGY_TEXT[currentTextIndex];
        textParticles.push(new TextParticle(x, y, text));
        currentTextIndex = (currentTextIndex + 1) % APOLOGY_TEXT.length;
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
            particles = [];
            heartParticles = [];
            textParticles = []; // 清理文字粒子
        }
    }

    // 动画循环
    function animate() {
        requestAnimationFrame(animate);

        // 烟花动画
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles = particles.filter(particle => {
            const isAlive = particle.update();
            if (isAlive) {
                particle.draw();
            }
            return isAlive;
        });

        // 更新和绘制文字
        textParticles = textParticles.filter(particle => {
            const isAlive = particle.update();
            if (isAlive) {
                particle.draw();
            }
            return isAlive;
        });

        // 爱心动画
        heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
        heartTime += 0.08;
        const scale = 1 + 0.35 * Math.sin(heartTime * 2);
        const cx = heartCanvas.width / 2;
        const cy = heartCanvas.height / 2;

        const gradient = heartCtx.createRadialGradient(cx, cy, 0, cx, cy, 600);
        gradient.addColorStop(0, 'rgba(255, 107, 139, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 107, 139, 0)');
        heartCtx.fillStyle = gradient;
        heartCtx.fillRect(0, 0, heartCanvas.width, heartCanvas.height);

        heartParticles.forEach(particle => {
            particle.targetX = (particle.targetX0 - cx) * scale + cx;
            particle.targetY = (particle.targetY0 - cy) * scale + cy;
            particle.update();
            particle.draw();
        });
    }

    // 点击表达爱意
    if (loveBtn) {
        loveBtn.addEventListener('click', function () {
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
        fireworksBtn.addEventListener('click', function () {
            container.classList.add('hide');
            bigHeartContainer.style.display = 'flex';
            initHeartParticles();
            startContinuousFireworks();
        });
    }

    // 开始动画
    animate();
}); 
