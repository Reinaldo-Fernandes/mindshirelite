/* ==========================================================
   ORBIT.JS - Corrigido e Seguro
   ========================================================== */

const OrbitAI = {
    sessao: {
        focosConcluidos: 0,
        nomeUsuario: "Viajante"
    },

    memoria: {
        saudacoes: [
            "Pronto para mais um ciclo, {nome}?",
            "Sistema online. Como posso ajudar hoje, {nome}?",
            "Explorando novas fronteiras de produtividade, {nome}?"
        ],
        foco: [
            "Modo de foco ativado. Silenciando distrações...",
            "Excelente escolha. O tempo é seu recurso mais valioso.",
            "Iniciando isolamento mental. Vamos produzir!"
        ],
        descanso: [
            "Ciclo concluído! Hora de esticar as costas, {nome}.",
            "Ótimo trabalho. Uma pausa agora vai renovar sua mente.",
            "Sessão finalizada. Sinta esse progresso!"
        ],
        saude: [
            "Detecto cansaço mental. Que tal um gole de água? 💧",
            "Você está focado há muito tempo. Estique os braços!",
            "Pausa de segurança: Olhe para longe por 20 segundos. 🧊"
        ],
        admin: [
            "Sistema operando normalmente.",
            "Aguardando comandos, {nome}."
        ]
    },

    falar(mensagem) {
        if (!mensagem) return;
        const balao = document.getElementById('orbit-bubble') || document.getElementById('orbit-speech');
        if (balao) {
            const textoFinal = mensagem.replace(/{nome}/g, this.sessao.nomeUsuario);
            balao.classList.remove('active');
            setTimeout(() => {
                balao.innerText = textoFinal;
                balao.classList.add('active');
                setTimeout(() => balao.classList.remove('active'), 7000);
            }, 300);
        }
    },

    reagir(evento, dados = {}) {
        if (dados.nome) this.sessao.nomeUsuario = dados.nome;

        if (evento === 'alerta_saude') return this.falar(this.getFrase('saude'));

        let categoria = 'admin';
        if (evento === 'timer_start') categoria = 'foco';
        if (evento === 'timer_end') {
            this.sessao.focosConcluidos++;
            categoria = 'descanso';
        }
        
        this.falar(this.getFrase(categoria));
    },

    // FUNÇÃO REFEITA PARA SER À PROVA DE ERROS
    getFrase(categoria) {
        const lista = this.memoria[categoria];
        
        // Se a categoria não existir ou estiver vazia, retorna uma frase padrão da categoria admin
        if (!lista || lista.length === 0) {
            console.warn(`OrbitAI: Categoria '${categoria}' não encontrada na memória.`);
            return this.memoria.admin[0];
        }
        
        return lista[Math.floor(Math.random() * lista.length)];
    }
};

document.getElementById('start-btn').addEventListener('click', () => {
    const introText = document.querySelector('.orbit-intro-text');
    if(introText) introText.style.opacity = '0';
});

window.OrbitAI = OrbitAI;