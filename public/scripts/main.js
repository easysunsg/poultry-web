// 模拟产品数据
const products = [
    {
        id: 1,
        name: '生态散养土鸡',
        description: '180天自然生长周期，纯天然饲养',
        price: 288,
        image: '/assets/chicken.jpg'
    },
    {
        id: 2,
        name: '农家散养鸭',
        description: '120天散养周期，无抗生素',
        price: 198,
        image: '/assets/duck.jpg'
    },
    {
        id: 3,
        name: '有机鹅蛋',
        description: '散养鹅自然下蛋，营养丰富',
        price: 15,
        image: '/assets/goose-egg.jpg'
    }
];

// 页面管理
class PageManager {
    constructor() {
        this.pages = document.querySelectorAll('.page');
        this.tabBar = document.querySelector('.tab-bar');
        this.setupEventListeners();
        this.initializeProducts();
    }

    setupEventListeners() {
        this.tabBar.addEventListener('click', (e) => {
            const tabItem = e.target.closest('.tab-item');
            if (!tabItem) return;

            const targetPage = tabItem.dataset.page;
            this.switchPage(targetPage);

            // 更新标签栏激活状态
            document.querySelectorAll('.tab-item').forEach(item => {
                item.classList.toggle('active', item === tabItem);
            });
        });
    }

    switchPage(pageId) {
        this.pages.forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });
    }

    initializeProducts() {
        const productGrid = document.querySelector('.product-grid');
        products.forEach(product => {
            const card = this.createProductCard(product);
            productGrid.appendChild(card);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img class="product-image" src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-price">¥${product.price}</div>
                <button class="ios-button" onclick="orderManager.createOrder(${product.id})">
                    立即订购
                </button>
            </div>
        `;
        return card;
    }
}

// 订单管理
class OrderManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.initializeOrders();
    }

    createOrder(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const order = {
            id: Date.now(),
            productId,
            status: 'preparing',
            createTime: new Date().toISOString(),
            timeline: [
                {
                    time: new Date().toISOString(),
                    status: 'ordered',
                    text: '订单创建成功'
                }
            ]
        };

        this.orders.unshift(order);
        this.saveOrders();
        this.renderOrders();
        
        // 切换到订单页面
        document.querySelector('[data-page="orders"]').click();
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    initializeOrders() {
        this.renderOrders();
    }

    renderOrders() {
        const container = document.querySelector('.orders-container');
        if (!container) return;

        container.innerHTML = this.orders.map(order => {
            const product = products.find(p => p.id === order.productId);
            return `
                <div class="order-card">
                    <div class="order-status ${order.status}">${this.getStatusText(order.status)}</div>
                    <div class="order-info">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="timeline">
                            ${this.renderTimeline(order.timeline)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTimeline(timeline) {
        return timeline.map((item, index) => `
            <div class="timeline-item ${index === 0 ? 'active' : ''}">
                <div class="timeline-content">
                    <div class="timeline-time">${this.formatDate(item.time)}</div>
                    <div class="timeline-text">${item.text}</div>
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'preparing': '养殖中',
            'completed': '已完成'
        };
        return statusMap[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
}

// 用户信息管理
class UserManager {
    constructor() {
        this.initializeForm();
    }

    initializeForm() {
        const form = document.querySelector('.ios-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUserInfo(new FormData(form));
        });

        // 头像上传
        const avatarInput = document.createElement('input');
        avatarInput.type = 'file';
        avatarInput.accept = 'image/*';
        avatarInput.style.display = 'none';

        document.querySelector('.avatar-wrapper').addEventListener('click', () => {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('userAvatar').src = e.target.result;
                    localStorage.setItem('userAvatar', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });

        // 恢复保存的头像
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
            document.getElementById('userAvatar').src = savedAvatar;
        }
    }

    saveUserInfo(formData) {
        const userData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            address: formData.get('address')
        };

        localStorage.setItem('userData', JSON.stringify(userData));
        this.showToast('保存成功');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'ios-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2000);
    }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
    window.pageManager = new PageManager();
    window.orderManager = new OrderManager();
    window.userManager = new UserManager();
}); 