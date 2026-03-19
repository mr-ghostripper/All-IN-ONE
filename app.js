/**
 * ALL IN ONE - SPA Logic & State Management
 */

// --- Global State ---
let currentState = {
    page: 'home',
    cart: [],
    chatMessages: [
        { sender: 'System', text: 'Welcome to the All-in-One Hub! Feel free to chat while you shop.', type: 'received', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
        { sender: 'Alex', text: 'Has anyone tried the new minimalist headphones from the shop?', type: 'received', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ],
    widgets: {
        chat: false,
        music: false,
        musicMinimized: false
    }
};

// --- Mock Data ---
const products = [
    {
        id: 1,
        name: "Aura Premium ANC Headphones",
        price: 299.99,
        category: "Tech",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: "Best Seller"
    },
    {
        id: 2,
        name: "Lumina Smartwatch Series 5",
        price: 199.99,
        category: "Tech",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: "New Arrival"
    },
    {
        id: 3,
        name: "Aero Minimalist Sneakers",
        price: 149.50,
        category: "Lifestyle",
        image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: "Trending"
    },
    {
        id: 4,
        name: "Nova mechanical Keyboard",
        price: 129.99,
        category: "Tech",
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: ""
    },
    {
        id: 5,
        name: "Vertex Smart Glasses",
        price: 399.00,
        category: "Tech",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: "Pre-order"
    },
    {
        id: 6,
        name: "Echo Bluetooth Speaker",
        price: 89.99,
        category: "Tech",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: "Sale"
    }
];


// --- Initialization & Entry Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Read hash from URL if exists to support deep linking
    const hash = window.location.hash.substring(1) || 'home';
    navigate(hash);
    
    // Initialize Chat rendering
    renderMessages();
});

// User Entry Function (Bypasses Browser Auto-Play policies)
function enterApp() {
    const overlay = document.getElementById('entry-overlay');
    overlay.style.opacity = '0';
    
    setTimeout(() => {
        overlay.style.display = 'none';
        
        // Ensure the music widget is shown
        toggleMusicWidget();
        
        // Auto-play default Youtube video smoothly
        const iframe = document.getElementById('yt-player');
        if (iframe) {
            iframe.src = iframe.src.replace('autoplay=0', 'autoplay=1');
        }
        showToast('Welcome inside! Enjoy the tunes.', 'success');
    }, 700); // Wait for transition
}

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1) || 'home';
    navigate(hash, false);
});


// --- Routing & Navigation ---
function navigate(pageId, updateHistory = true) {
    const appContent = document.getElementById('app-content');
    const template = document.getElementById(`page-${pageId}`);
    
    if (!template) return;

    // Fade out current
    appContent.style.opacity = '0';
    
    setTimeout(() => {
        // Replace content
        appContent.innerHTML = '';
        const clone = template.content.cloneNode(true);
        appContent.appendChild(clone);
        
        // Update State
        currentState.page = pageId;
        
        if (updateHistory) {
            window.history.pushState(null, null, `#${pageId}`);
        }

        // Update Nav Active States
        document.querySelectorAll('.nav-link').forEach(link => {
            if(link.getAttribute('href') === `#${pageId}`) {
                link.classList.add('active');
                link.classList.remove('text-gray-400');
            } else {
                link.classList.remove('active');
                link.classList.add('text-gray-400');
            }
        });

        // Execute Page Specific Logic
        if (pageId === 'shop') {
            renderProducts();
        } else if (pageId === 'chat') {
            renderMessages();
            // If they navigate to full chat, automatically hide mini chat if open
            if(currentState.widgets.chat) {
                toggleMiniChat();
            }
        }
        
        // Fade in new
        appContent.style.opacity = '1';
    }, 200); // Wait for transition
}


// --- Shop Logic ---
function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    products.forEach((product, idx) => {
        const delay = idx * 0.1;
        
        const cardHTML = `
            <div class="product-card glass-panel border border-glass-border rounded-2xl overflow-hidden group flex flex-col fade-in-up" style="animation-delay: ${delay}s">
                <div class="relative w-full h-56 overflow-hidden bg-white/5">
                    <img src="${product.image}" alt="${product.name}" class="product-img object-cover w-full h-full">
                    ${product.tag ? `<div class="absolute top-3 left-3 bg-primary/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">${product.tag}</div>` : ''}
                    
                    <!-- Hover overlay actions -->
                    <div class="product-overlay absolute inset-0 bg-dark/40 backdrop-blur-[2px] opacity-0 flex items-center justify-center gap-3 transition-opacity duration-300">
                        <button onclick="addToCart(${product.id})" class="w-10 h-10 rounded-full bg-white text-dark hover:bg-primary hover:text-white flex items-center justify-center transition-colors transform hover:scale-110 shadow-xl">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                        <button class="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors shadow-xl">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                </div>
                <div class="p-5 flex-grow flex flex-col justify-between">
                    <div>
                        <div class="text-xs text-primary font-semibold mb-1">${product.category}</div>
                        <h3 class="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">${product.name}</h3>
                    </div>
                    <div class="mt-4 flex items-center justify-between">
                        <span class="text-xl font-extrabold">$${product.price.toFixed(2)}</span>
                        <div class="flex items-center text-yellow-400 text-xs gap-1 opacity-80">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star-half-stroke"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        currentState.cart.push(product);
        updateCartUI();
        showToast(`Added to cart: ${product.name}`, 'success');
    }
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.textContent = currentState.cart.length;
        // bump animation
        countEl.classList.add('scale-150');
        setTimeout(() => countEl.classList.remove('scale-150'), 200);
    }
}


// --- Chat Logic ---
function toggleMiniChat() {
    const widget = document.getElementById('floating-chat');
    currentState.widgets.chat = !currentState.widgets.chat;
    
    if (currentState.widgets.chat) {
        widget.classList.add('widget-active');
        renderMessages();
    } else {
        widget.classList.remove('widget-active');
    }
}

// --- Utilities ---
function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderMessages() {
    // Identify targets (can be both at same time in DOM)
    const miniContainer = document.getElementById('mini-chat-container');
    const mainContainer = document.getElementById('main-chat-container');

    const renderTo = (container, isMini) => {
        if (!container) return;
        container.innerHTML = '';
        
        currentState.chatMessages.forEach(msg => {
            const isSent = msg.type === 'sent';
            
            // Sanitize variables to prevent XSS
            const safeText = escapeHTML(msg.text);
            const safeSender = escapeHTML(msg.sender);
            const safeTime = escapeHTML(msg.time);
            
            // Build visual representation
            const html = `
                <div class="flex flex-col ${isSent ? 'items-end' : 'items-start'} mb-1">
                    ${!isSent && !isMini ? `<span class="text-[10px] text-gray-500 ml-2 mb-1">${safeSender}</span>` : ''}
                    <div class="chat-bubble ${isSent ? 'sent' : 'received'}">
                        ${isMini && !isSent ? `<span class="text-xs font-bold block mb-1 text-primary opacity-80">${safeSender}</span>` : ''}
                        ${safeText}
                    </div>
                    <span class="text-[9px] text-gray-500 mt-1 ${isSent ? 'mr-1' : 'ml-1'}">${safeTime}</span>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
        
        // scroll to bottom
        container.scrollTop = container.scrollHeight;
    };

    renderTo(miniContainer, true);
    renderTo(mainContainer, false);
}

function handleChatSubmit(e, inputId) {
    e.preventDefault();
    const input = document.getElementById(inputId);
    const text = input.value.trim();
    
    if (text) {
        // Add sent message
        currentState.chatMessages.push({
            sender: 'You',
            text: text,
            type: 'sent',
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
        
        input.value = '';
        renderMessages();
        
        // Mock response
        setTimeout(() => {
            const responses = ["That's awesome!", "I see what you mean.", "Definitely adding that to cart.", "So cool!"];
            currentState.chatMessages.push({
                sender: 'Alex',
                text: responses[Math.floor(Math.random() * responses.length)],
                type: 'received',
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            });
            renderMessages();
            
            // If they are on shop page and received a message, show toast if mini chat is closed
            if (currentState.page !== 'chat' && !currentState.widgets.chat) {
                showToast(`New message from Alex`, 'info');
                // flash icon
                document.querySelector('.fa-comment-dots').classList.add('text-secondary', 'animate-pulse');
                setTimeout(() => document.querySelector('.fa-comment-dots').classList.remove('text-secondary', 'animate-pulse'), 3000);
            }
        }, 1500);
    }
}


// --- Music Player Widget Logic ---
function toggleMusicWidget() {
    const widget = document.getElementById('floating-music');
    currentState.widgets.music = !currentState.widgets.music;
    
    if (currentState.widgets.music) {
        widget.classList.add('widget-active');
        widget.classList.remove('widget-minimized');
        currentState.widgets.musicMinimized = false;
    } else {
        widget.classList.remove('widget-active');
        widget.classList.remove('widget-minimized');
        
        // Optional: pause video when closed (commented out to allow true background listening)
        // const iframe = document.getElementById('yt-player');
        // if(iframe) {
        //    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        // }
    }
}

function minimizeMusic() {
    const widget = document.getElementById('floating-music');
    if (!currentState.widgets.musicMinimized) {
        widget.classList.add('widget-minimized');
        currentState.widgets.musicMinimized = true;
    } else {
        widget.classList.remove('widget-minimized');
        currentState.widgets.musicMinimized = false;
    }
}

function loadCustomVideo() {
    const input = document.getElementById('yt-search-input');
    const val = input.value.trim();
    if(val) {
        let videoId = val;
        // Basic url extraction
        if (val.includes('v=')) {
            videoId = val.split('v=')[1].split('&')[0];
        } else if (val.includes('youtu.be/')) {
            videoId = val.split('youtu.be/')[1].split('?')[0];
        }
        
        // Securely ensure only alphanumeric & basic chars for videoId to prevent iframe escaping
        videoId = videoId.replace(/[^a-zA-Z0-9_-]/g, '');
        
        const iframe = document.getElementById('yt-player');
        iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1`;
        input.value = '';
        showToast('Now Playing your selection', 'success');
    }
}

// Draggable functionality for music widget (Basic implementation)
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

const dragItem = document.getElementById("floating-music");
const dragHandle = document.getElementById("music-header");

dragHandle.addEventListener("mousedown", dragStart);
document.addEventListener("mouseup", dragEnd);
document.addEventListener("mousemove", drag);

function dragStart(e) {
    if(currentState.widgets.musicMinimized) return; // Don't drag while minimized
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    if (e.target === dragHandle || dragHandle.contains(e.target)) {
        isDragging = true;
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        
        // Remove standard classes to apply custom transform
        dragItem.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
}

// Switch between YouTube and Local MP3
function switchMusicSource(source) {
    const btnYt = document.getElementById('tab-youtube');
    const btnLoc = document.getElementById('tab-local');
    const ytContainer = document.getElementById('source-youtube');
    const locContainer = document.getElementById('source-local');

    if (source === 'youtube') {
        // UI
        btnYt.className = 'text-white border-b-2 border-primary pb-1 cursor-pointer';
        btnLoc.className = 'text-gray-400 hover:text-white pb-1 border-b-2 border-transparent hover:border-white/30 transition-all cursor-pointer';
        ytContainer.classList.remove('hidden');
        locContainer.classList.add('hidden');
        
        // Logic: specific pause local if playing
        const lp = document.getElementById('local-audio-player');
        if (lp && !lp.paused) {
            lp.pause();
        }
    } else {
        // UI
        btnLoc.className = 'text-white border-b-2 border-primary pb-1 cursor-pointer';
        btnYt.className = 'text-gray-400 hover:text-white pb-1 border-b-2 border-transparent hover:border-white/30 transition-all cursor-pointer';
        locContainer.classList.remove('hidden');
        ytContainer.classList.add('hidden');
        
        // Logic: Stop YouTube
        const iframe = document.getElementById('yt-player');
        if (iframe) {
            // replacing 'autoplay=1' to 'autoplay=0' effectively pauses the iframe immediately without postMessage setup
            iframe.src = iframe.src.replace('autoplay=1', 'autoplay=0');
        }
    }
}

// Handle Local Audio MP3 Upload
function handleLocalAudio(event) {
    const file = event.target.files[0];
    if (file) {
        // Update Name securely
        const safeName = escapeHTML(file.name);
        document.getElementById('local-file-name').innerHTML = `<span class="text-primary font-bold">${safeName}</span>`;
        
        const url = URL.createObjectURL(file);
        const player = document.getElementById('local-audio-player');
        player.src = url;
        player.classList.remove('hidden'); // Ensure native player is visible
        
        player.play().then(() => {
            showToast(`Now Playing: ${safeName}`, 'success');
        }).catch(e => {
            console.error("Auto-play prevented by browser policy", e);
            // Native UI player will still be visible for them to click play manually if error
        });
    }
}


// --- Utilities ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const id = Date.now();
    
    let icon = 'fa-info-circle';
    let borderColor = 'border-blue-500';
    
    if (type === 'success') {
        icon = 'fa-check-circle text-green-400';
        borderColor = 'border-green-500/30';
    }
    
    const html = `
        <div id="toast-${id}" class="glass-panel px-4 py-3 rounded-lg border-l-4 ${borderColor} flex items-center gap-3 shadow-2xl toast-enter pointer-events-auto max-w-sm">
            <i class="fa-solid ${icon}"></i>
            <span class="text-sm font-medium text-white">${message}</span>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
    
    setTimeout(() => {
        const toast = document.getElementById(`toast-${id}`);
        if(toast) {
            toast.classList.replace('toast-enter', 'toast-exit');
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}
