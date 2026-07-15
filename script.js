/* ==========================================================================
   0. IMPORTS E CONFIGURAÇÕES INICIAIS
========================================================================== 
*/
import { initThreeBackground, add3DPlant } from './visual.js';

initThreeBackground();


/* ==========================================================================
   1. ESTADOS GLOBAIS E SELETORES
========================================================================== 
*/
let timer = null;
let totalTime = 1500; 
let timeLeft = totalTime; 
let gardenItemCount = 0;
const circumference = 212 * 2 * Math.PI;
const starCount = window.innerWidth < 768 ? 1000 : 3000;
const getEl = (id) => document.getElementById(id);
const display = getEl('timer-display');
const circle = document.querySelector('.progress-ring__circle');
const taskInput = getEl('task-input');
const subtasksList = getEl('subtasks-list');
const startBtn = getEl('start-btn');

/* ==========================================================================
   2. LÓGICA DO TIMER E VISUALIZAÇÃO
========================================================================== 
*/
function atualizarDisplayVisual() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    if (display) display.innerText = `${min}:${sec < 10 ? '0' + sec : sec}`;

    if (circle) {
        const offset = circumference - (timeLeft / totalTime) * circumference;
        circle.style.strokeDashoffset = offset;
    }
}

function updateTimer() {
    if (timeLeft <= 0) {
        finalizarCicloFoco();
        return;
    }

    timeLeft--;
    const elapsed = totalTime - timeLeft; 
    const intervaloCrescimento = totalTime > 1500 ? 900 : 300; 

    if (elapsed > 0 && elapsed % intervaloCrescimento === 0) {
        spawnGardenItem(); 
        orbitTalk("O jardim está se expandindo... 🌿");
    }

    if (elapsed > 0 && elapsed % 1800 === 0) pausarParaDescanso();
    
    // Exemplo: A cada 45 minutos (2700 segundos) de foco
    if (elapsed === 2700) {
        window.OrbitAI.reagir('alerta_saude');
    }

    atualizarDisplayVisual();
}

function pausarParaDescanso() {
    clearInterval(timer);
    timer = null;
    if (startBtn) startBtn.innerText = "RETOMAR";
    setOrbitState('default');
    orbitTalk("Hora de esticar as costas! Pausa recomendada. ☕");
    getEl('audio-complete')?.play();
}

function finalizarCicloFoco() {
    clearInterval(timer);
    timer = null;
    timeLeft = totalTime;
    atualizarDisplayVisual();
    if (startBtn) startBtn.innerText = "REINICIAR";
    getEl('audio-complete')?.play();
    setOrbitState('default');
}

/* ==========================================================================
   4. O JARDIM ORBITAL (SISTEMA DE EMOJIS)
========================================================================== 
*/
function spawnGardenItem() {
    const container = document.querySelector('.sphere-wrapper');
    const gardenStyle = getEl('garden-style');
    if (!container) return;

    const style = gardenStyle ? gardenStyle.value : 'plantas';
    const items = { 
        plantas: ['🌿', '🌱', '🌸', '🍀', '🌻', '🍃'], 
        espaco: ['✨', '🪐', '🌟', '☄️', '🌙', '🛰️'], 
        notas: ['🎵', '🎹', '🎸', '🎶', '🎷', '🎻'], 
        comida: ['☕', '🍪', '🥐', '🧁', '🍎', '🍓'] 
    };
    
    const selected = items[style] || items.plantas;
    const emoji = selected[Math.floor(Math.random() * selected.length)];
    const item = document.createElement('div');
    item.className = 'garden-item'; 

    item.innerText = emoji;
    item.style.setProperty('--orbit-duration', `25s`);
    item.style.setProperty('--orbit-distance', `170px`);
    item.style.setProperty('--start-angle', `${gardenItemCount * 45}deg`);
    

    if (window.add3DPlant) add3DPlant(emoji);
    container.appendChild(item);
    gardenItemCount++;
}

/* ==========================================================================
   5. INTERFACE DO ORBIT (LENTES E FALA)
========================================================================== 
*/
function orbitTalk(text) {
    const speech = getEl('orbit-speech');
    if (!speech) return;
    speech.innerText = text;
    speech.classList.add('active');
    setTimeout(() => speech.classList.remove('active'), 5000);
}

function setOrbitState(state) {
    const orbitImg = getEl('orbit-img');
    if (!orbitImg) return;
    const paths = {
        'default': './components/orbits/error.png', 
        'foco': './components/orbits/foco.png',
        'goblin': './components/orbits/Goblin.png',
        'dopamina': './components/orbits/dopamina.png',
        'serenidade': './components/orbits/serenidade.png',
        'autonomia': './components/orbits/autonomia.png',
        'adm': './components/orbits/adm.png'
    };
    orbitImg.src = paths[state.toLowerCase()] || paths['default'];
}

window.setMode = (mode) => {
    const colors = { dopamina: '#ff2da4', serenidade: '#5ef3ff', autonomia: '#adff2f', goblin: '#ff4d4d' };
    if (colors[mode]) {
        document.documentElement.style.setProperty('--accent-cyan', colors[mode]);
        setOrbitState(mode);
        orbitTalk(`Lente de ${mode} ativada.`);
    }
};

/* ==========================================================================
   6. CONTROLES DO TIMER (START/PAUSE)
========================================================================== 
*/

if (startBtn) {
    startBtn.onclick = () => {
        if (document.body.classList.contains('onboarding-active')) {
            document.body.classList.remove('onboarding-active');
            getEl('mixer-anchor')?.appendChild(startBtn);
        }

        if (!timer) {
            getEl('audio-start')?.play().catch(() => {});

            // Inicia novo ciclo se o tempo tiver acabado ou for igual ao total
            if (timeLeft <= 0) {
                timeLeft = totalTime;
            }
            
            if (gardenItemCount === 0) spawnGardenItem();

            timer = setInterval(updateTimer, 1000);
            startBtn.innerText = "PAUSAR";
            setOrbitState('foco');
        } else {
            clearInterval(timer);
            timer = null;
            startBtn.innerText = "RETOMAR";
            setOrbitState('default');
        }
    };
}

/* ==========================================================================
   7. MODO GOBLIN E ÁUDIO
========================================================================== 
*/
const breakBtn = getEl('break-task-btn');
if (breakBtn) {
    breakBtn.onclick = () => {
        const text = taskInput.value.trim();
        if (!text) return orbitTalk("Escreva algo para eu dividir! 👹");
        
        const parts = [`Preparar: ${text}`, `Executar: ${text}`, `Finalizar: ${text}`];
        parts.forEach(t => {
            const div = document.createElement('div');
            div.className = 'subtask-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            const span = document.createElement('span');
            span.textContent = t;
            div.appendChild(checkbox);
            div.appendChild(document.createTextNode(' '));
            div.appendChild(span);
            checkbox.onchange = (e) => {
                if (e.target.checked) {
                    div.style.opacity = "0.5";
                    setTimeout(() => div.remove(), 800);
                }
            };
            subtasksList.appendChild(div);
        });
        taskInput.value = "";
        window.setMode('goblin');
    };
}

function setupAudio(sliderId, audioId) {
    const s = getEl(sliderId), a = getEl(audioId);
    if (s && a) s.oninput = (e) => { 
        a.volume = e.target.value; 
        if (a.volume > 0) a.play(); else a.pause(); 
    };
}
setupAudio('rain-vol', 'audio-rain');
setupAudio('fire-vol', 'audio-fire');

/* ==========================================================================
   8. AGENDA E LEMBRETES
========================================================================== 
*/
function atualizarCardLembrete(texto) {
    const card = getEl('quick-reminder-card');
    const p = getEl('reminder-text');
    if (!card || !p) return;
    card.style.display = (texto && texto.trim() !== "") ? 'block' : 'none';
    if(texto) p.innerText = texto.substring(0, 100);
}

getEl('agenda-trigger')?.addEventListener('click', () => {
    const hoje = new Date().toISOString().split('T')[0];
    if (getEl('agenda-date')) {
        getEl('agenda-date').value = hoje;
        getEl('agenda-notes').value = localStorage.getItem(`note_${hoje}`) || "";
    }
    getEl('agenda-modal').classList.add('active');
});

getEl('save-agenda')?.addEventListener('click', () => {
    const data = getEl('agenda-date').value;
    const texto = getEl('agenda-notes').value;
    localStorage.setItem(`note_${data}`, texto);
    if (data === new Date().toISOString().split('T')[0]) atualizarCardLembrete(texto);
    orbitTalk("Lembrete guardado! 💾");
    getEl('agenda-modal').classList.remove('active');
});

/* ==========================================================================
   9. COMENTÁRIOS (ENVIO POR E-MAIL VIA EMAILJS)
========================================================================== 
*/

// ⚠️ CONFIGURAÇÃO NECESSÁRIA: crie uma conta grátis em https://www.emailjs.com
// e substitua os valores abaixo pelos seus (Service ID, Template ID e Public Key).
// O destinatário (reinaldo.f.menezes@outlook.com) deve ser configurado como
// "To Email" no template criado no painel do EmailJS.
const EMAILJS_SERVICE_ID = "SEU_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "SEU_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "SUA_PUBLIC_KEY";
const COMMENTS_DESTINATION_EMAIL = "reinaldo.f.menezes@outlook.com";

if (window.emailjs && EMAILJS_PUBLIC_KEY !== "SUA_PUBLIC_KEY") {
    window.emailjs.init(EMAILJS_PUBLIC_KEY);
}

// Abrir modal de comentários
const btnComments = getEl('comments-trigger');
if (btnComments) {
    btnComments.onclick = (e) => {
        e.preventDefault();
        const modal = getEl('comments-modal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    };
}

// Enviar comentário
getEl('send-comment-btn')?.addEventListener('click', async () => {
    const texto = getEl('comment-text').value.trim();
    const statusMsg = getEl('comment-status');

    if (!texto) {
        orbitTalk("Escreva algo antes de enviar! ✍️");
        return;
    }

    const params = {
        to_email: COMMENTS_DESTINATION_EMAIL,
        from_name: getEl('comment-name').value || "Anônimo",
        from_email: getEl('comment-email').value || "Não informado",
        message: texto
    };

    if (!window.emailjs || EMAILJS_PUBLIC_KEY === "SUA_PUBLIC_KEY") {
        if (statusMsg) statusMsg.innerText = "⚠️ Envio ainda não configurado (EmailJS).";
        orbitTalk("O envio de comentários ainda está sendo configurado. ⚙️");
        return;
    }

    if (statusMsg) statusMsg.innerText = "Enviando...";

    try {
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);

        if (statusMsg) statusMsg.innerText = "Comentário enviado! Obrigado. ✨";
        orbitTalk("Comentário enviado! Obrigado. ✨");

        setTimeout(() => {
            const modal = getEl('comments-modal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
            getEl('comment-text').value = "";
            getEl('comment-name').value = "";
            getEl('comment-email').value = "";
            if (statusMsg) statusMsg.innerText = "";
        }, 2000);
    } catch (err) {
        console.error("Erro ao enviar comentário:", err);
        if (statusMsg) statusMsg.innerText = "Houve um erro ao enviar. ❌";
        orbitTalk("Houve um erro ao enviar. ❌");
    }
});
/* ==========================================================================
   10. MODAIS E INICIALIZAÇÃO (VERSÃO MOBILE FRIENDLY)
========================================================================== */

const safeClick = (id, callback) => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('click', (e) => {
            // Removemos o preventDefault para testar a resposta pura
            callback(e);
        });
    }
};

// Fechar todas as modais - Versão corrigida para Mobile
document.querySelectorAll('.close-modal, .modal-vitral').forEach(el => {
    el.addEventListener('click', function(e) {
        // Se clicar na lateral da modal (fundo) ou no botão fechar, ela fecha
        if (e.target === this || this.classList.contains('close-modal')) {
            document.querySelectorAll('.modal-vitral').forEach(m => m.classList.remove('active'));
        }
    });
});

/* ==========================================================================
   11. Lógica do Botão RESET / PÂNICO
========================================================================== 
*/
const panicBtn = document.getElementById('panic-btn'); // Única declaração necessária

if (panicBtn) {
    // CLIQUE ÚNICO: Reset do Timer e Jardim
    panicBtn.addEventListener('click', () => {
        // 1. Para o cronômetro imediatamente
        clearInterval(timer);
        timer = null;
        
        // 2. Reseta o tempo para o valor selecionado no seletor
        timeLeft = totalTime;
        atualizarDisplayVisual();
        
        // 3. Limpa o jardim visual (remove todos os emojis)
        const container = document.querySelector('.sphere-wrapper');
        if (container) {
            container.querySelectorAll('.garden-item').forEach(el => el.remove());
            gardenItemCount = 0;
        }
        
        // 4. Reseta os textos da interface
        if (startBtn) startBtn.innerText = "INICIAR";
        setOrbitState('default');
        orbitTalk("Resetado! ✨");
        
        console.log("Sistema resetado instantaneamente.");
    });

    // CLIQUE DUPLO: Alívio Sensorial (Modo Pânico Aprimorado)
    panicBtn.addEventListener('dblclick', () => {
        console.log("⚠️ MODO PÂNICO ATIVADO: Limpando estímulos...");
        
        // 1. Silenciar Mixer de Áudio
        document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        
        // 2. Resetar Sliders de volume visualmente
        const rainVol = document.getElementById('rain-vol');
        const fireVol = document.getElementById('fire-vol');
        if(rainVol) rainVol.value = 0;
        if(fireVol) fireVol.value = 0;

        // 3. Esconder elementos que causam distração
        document.body.style.filter = "grayscale(100%) brightness(70%)";
        const garden = document.getElementById('plants-display');
        if(garden) garden.style.display = 'none';
        document.querySelectorAll('.orbit-path').forEach(o => o.style.display = 'none');
        
        // 4. Feedback do Assistente
        if (window.OrbitAI && typeof window.OrbitAI.falar === 'function') {
            window.OrbitAI.falar("Respire fundo... Tudo em silêncio agora. ✨");
        } else {
            orbitTalk("Respire fundo... Tudo em silêncio. ✨");
        }
    });
}

/* ==========================================================================
   12. Gerenciamento Sensorial
========================================================================== */
const sensorySettings = {
    init() {
        this.bindEvents();
        console.log("Sistema Sensorial inicializado.");
    },

    bindEvents() {
        const getById = (id) => document.getElementById(id);
        const sensoryModal = getById('sensory-settings-modal');

        // 1. Animações de Fundo (Three.js)
        getById('toggle-bg-animation')?.addEventListener('change', (e) => {
            const canvas = getById('three-canvas');
            if (canvas) canvas.style.opacity = e.target.checked ? '1' : '0';
        });

        // 2. Jardim Orbitante
        getById('toggle-garden')?.addEventListener('change', (e) => {
            const garden = getById('plants-display');
            const orbits = document.querySelectorAll('.orbit-path');
            const state = e.target.checked ? 'block' : 'none';
            if (garden) garden.style.display = state;
            orbits.forEach(orb => orb.style.display = state);
        });

        // 3. Assistente Orbit (Falas)
        getById('toggle-orbit-speech')?.addEventListener('change', (e) => {
            const speech = getById('orbit-speech');
            if (speech) speech.style.visibility = e.target.checked ? 'visible' : 'hidden';
        });

        // 4. Modo Tons de Cinza
        getById('toggle-grayscale')?.addEventListener('change', (e) => {
            document.body.style.filter = e.target.checked ? "grayscale(100%) contrast(90%)" : "none";
        });

        // 5. Botão Abrir
        getById('sensory-trigger')?.addEventListener('click', () => {
            console.log("Botão clicado: Abrindo modal");
            if (sensoryModal) {
                sensoryModal.classList.add('active');
                sensoryModal.style.display = 'flex';
            }
        });

        // 6. Botões Fechar
        const closeSelectors = '#apply-sensory-btn, #sensory-settings-modal .close-modal';
        document.querySelectorAll(closeSelectors).forEach(btn => {
            btn.addEventListener('click', () => {
                if (sensoryModal) {
                    sensoryModal.classList.remove('active');
                    sensoryModal.style.display = 'none';
                }
            });
        });
    } // Fim bindEvents
}; // Fim sensorySettings

// Inicialização segura
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => sensorySettings.init());
} else {
    sensorySettings.init();
}

/* ==========================================================================
   14. Orbit Contextual Helper (Explicações por Hover/Tap)
========================================================================== */
const setupOrbitContextHelp = () => {
    const infoElements = document.querySelectorAll('[data-info]');
    let helpTimer;

    infoElements.forEach(el => {
        // DESKTOP: Mouse parado por 1 segundo
        el.addEventListener('mouseenter', () => {
            const text = el.getAttribute('data-info');
            helpTimer = setTimeout(() => {
                if (window.OrbitAI) window.OrbitAI.falar(text);
            }, 1000); 
        });

        el.addEventListener('mouseleave', () => {
            clearTimeout(helpTimer);
        });

        // MOBILE: Toque rápido
        el.addEventListener('touchstart', (e) => {
            const text = el.getAttribute('data-info');
            if (window.OrbitAI) window.OrbitAI.falar(text);
        }, { passive: true });
    });
};

// Inicializa o sistema de ajuda
if (document.readyState === 'complete') {
    setupOrbitContextHelp();
} else {
    window.addEventListener('load', setupOrbitContextHelp);
}