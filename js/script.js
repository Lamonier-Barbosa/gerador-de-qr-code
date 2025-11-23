// =============================
//  GERADOR INICIAL (primeira etapa)
// =============================

const MAX_CARACTERES_COMUM = 250;
const MAX_CARACTERES_ROTULO = 16;
const MAX_QR_DATA_SIZE = 230;

let qr; // objeto global do QR Code Styling

function gerarQRCode() {
    const tipo = document.getElementById("tipo").value;
    let input = document.getElementById("texto").value.trim(); // Use let para poder modificar

    if (!input) {
        exibirAlerta("Digite algo para gerar o QR Code.");
        return;
    }

    let conteudo = "";

    // --- NOVO BLOCO DE VERIFICAÇÃO DE LIMITE DE CARACTERES ---
    if (input.length > MAX_CARACTERES_COMUM) {
        // Trunca o texto e exibe um alerta
        input = input.substring(0, MAX_CARACTERES_COMUM);
        exibirAlerta(`O texto foi truncado para ${MAX_CARACTERES_COMUM} caracteres para garantir a escaneabilidade do QR Code.`);
    }
    // --------------------------------------------------------

    switch (tipo) {
        case "texto":
            conteudo = input;
            break;

        case "link":
            // ⭐️ MODIFICAÇÃO: Não exige mais 'https'. Se faltar 'http', ele adiciona.
            if (!input.startsWith("http")) {
                input = "http://" + input;
            }
            conteudo = input;
            break;

        // ... (Mantenha os outros cases: whatsapp, email, telefone, spotify, foto) ...

        case "whatsapp":

            const regexCelular = /^\d{11}$/;

            if (!regexCelular.test(input)) {
                exibirAlerta("O número de WhatsApp deve conter somente números com 11 dígitos (DDD + número).");
                return;
            }

            // Se passar na validação, usa o input (que é o número limpo de 11 dígitos)
            const numeroLimpo = input; // Agora 'input' é garantidamente o número limpo.

            // Pega a mensagem do campo adicional
            const msg = document.getElementById("whatsapp-msg").value.trim();
            // CORREÇÃO DE LIMITE (mantida)
            const msgLimitada = msg.substring(0, MAX_CARACTERES_COMUM);

            // Usa o número limpo (11 dígitos)
            conteudo = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(msgLimitada)}`;
            break;

        case "email":
            // Pega os valores dos campos adicionais
            const assunto = document.getElementById("email-assunto").value.trim().substring(0, MAX_CARACTERES_COMUM);
            const corpo = document.getElementById("email-corpo").value.trim().substring(0, MAX_CARACTERES_COMUM);
            conteudo =
                `mailto:${input}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
            break;

        case "telefone":
            const tel = input.replace(/\D/g, "");
            conteudo = `tel:+${tel}`;
            break;

        case "spotify":
            conteudo = input.startsWith("http")
                ? input
                : "https://open.spotify.com/search/" + encodeURIComponent(input);
            break;

        case "foto":
            // ⭐️ MODIFICAÇÃO: Não exige mais 'https'. Se faltar 'http', ele adiciona.
            if (!input.startsWith("http")) {
                // Se não começar com http ou https, adiciona http://
                input = "http://" + input;
            }
            conteudo = input;
            break;
    }

    iniciarCustomizacao(conteudo);
}

// =============================
//  VOLTAR PARA INICIAL (Nova função)
// =============================

/**
 * Esconde a área de customização e mostra a área inicial.
 */
function voltarParaInicial() {
    // 1. Esconde a área de customização
    document.querySelector(".layout").style.display = "none";
    // 2. Mostra a área inicial
    document.querySelector(".inicial").style.display = "flex"; // Use 'block' ou 'flex' dependendo do seu CSS original

    // Opcional: Limpar campos da página inicial ao voltar
    document.getElementById("texto").value = "";
    document.getElementById("whatsapp-msg").value = "";
    document.getElementById("email-assunto").value = "";
    document.getElementById("email-corpo").value = "";

    // Opcional: Se desejar, force a re-exibição correta dos campos adicionais
    atualizarPlaceholder();
}

// =============================
//  INICIAR CUSTOMIZAÇÃO (mostra a segunda parte)
// =============================

function iniciarCustomizacao(texto) {

    // Apaga possível QR anterior
    document.getElementById("qr-container").innerHTML = "";

    // Instancia o QR Code inicial e Renderiza (com as cores atuais)
    qr = new QRCodeStyling({
        width: 250,
        height: 250,
        data: texto,
        dotsOptions: { color: "#000", type: "square" },
        backgroundOptions: { color: "#fff" }
    });
    qr.append(document.getElementById("qr-container"));

    // Mostra a área de customização
    document.querySelector(".layout").style.display = "flex";
    document.querySelector(".inicial").style.display = "none";
}


// =============================
//  ALERTA CUSTOMIZADO 📢
// =============================

function exibirAlerta(mensagem) {
    const modal = document.getElementById('customAlertModal');
    const msgContainer = document.getElementById('alertMessage');
    const box = document.querySelector('.alert-box');

    msgContainer.textContent = mensagem;
    modal.style.display = 'flex'; // Exibe o modal

    // Adiciona classe de animação para entrada
    box.classList.remove('slide-out');
    box.classList.add('slide-in');
}

function fecharAlerta() {
    const modal = document.getElementById('customAlertModal');
    const box = document.querySelector('.alert-box');

    // Adiciona classe de animação para saída
    box.classList.remove('slide-in');
    box.classList.add('slide-out');

    // Remove o modal do fluxo após a animação de saída
    setTimeout(() => {
        modal.style.display = 'none';
        box.classList.remove('slide-out'); // Remove a classe para a próxima vez
    }, 400);
}


// =============================
//  ATUALIZAÇÃO DO QR CODE EM TEMPO REAL
// =============================

// =============================
//  ATUALIZAÇÃO DO QR CODE EM TEMPO REAL
// =============================

function atualizarQRCode() {
    if (!qr) return;

    const wrapper = document.getElementById("qr-wrapper");

    const size = document.getElementById("size").value;
    const shape = document.getElementById("shape").value;
    const borderSize = document.getElementById("border-size").value;
    const radius = document.getElementById("border-radius").value;

    const labelText = document.getElementById("qr-text").value;
    const fontWeight = document.getElementById("font-weight").value;
    const fontFamily = document.getElementById("font-family").value;

    // ⭐️ NOVO: CALCULA O TAMANHO DA FONTE DINAMICAMENTE
    // Define a fonte como aproximadamente 12% da largura do QR.
    // O valor '0.12' pode ser ajustado para otimizar o encaixe.
    const fontSize = Math.max(12, Math.round(parseInt(size) * 0.12));
    // Usamos Math.max(12, ...) para garantir um tamanho mínimo legível.
    // FIM NOVOS VALORES DE TEXTO

    // Atualiza texto
    const label = document.getElementById("qr-label");
    label.innerText = labelText;

    // APLICA OS NOVOS ESTILOS DE TEXTO
    label.style.fontWeight = fontWeight;
    label.style.fontFamily = fontFamily;
    label.style.fontSize = fontSize + "px"; // Usa o valor calculado

    // Borda do wrapper
    wrapper.style.borderWidth = borderSize + "px";
    wrapper.style.borderRadius = radius + "px";

    // Atualiza QR Code
    qr.update({
        width: size,
        height: size,
        dotsOptions: { type: shape }
    });
}



// =============================
//  PICKERS DE COR
// =============================
function aplicarCorDireto(campo) {
    if (!qr) return;

    let novaCor;

    switch (campo) {
        case "cor": // cor dos pontos
            novaCor = document.getElementById("colorDotsInput").value;
            qr.update({ dotsOptions: { color: novaCor } });
            break;
        case "bg": // cor de fundo
            novaCor = document.getElementById("colorBgInput").value;
            qr.update({ backgroundOptions: { color: novaCor } });
            break;
        case "border": // cor da borda
            novaCor = document.getElementById("colorBorderInput").value;
            document.getElementById("qr-wrapper").style.borderColor = novaCor;
            break;
        case "text":
            novaCor = document.getElementById("colorText").value;
            document.getElementById("qr-label").style.color = novaCor;
            break;
    }
}

// =============================
//  VALIDAÇÃO DE COMPATIBILIDADE DE TAMANHOS
// =============================



// =============================
//  UPLOAD DE LOGO
// =============================

document.getElementById("logo").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        qr.update({ image: e.target.result });
    };
    reader.readAsDataURL(file);
});


function removerLogo() {
    if (!qr) return;
    qr.update({ image: "" }); // remove a imagem
    document.getElementById("logo").value = ""; // limpa o input
}

// =============================
//  DOWNLOAD (VERSÃO FINAL)
// =============================

async function baixar() {
    if (!qr) return;

    const blob = await qr.getRawData("png");
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;

    img.onload = () => {
        try {
            const wrapper = document.getElementById("qr-wrapper");
            const cs = window.getComputedStyle(wrapper);

            // --- VARIÁVEIS DE CÁLCULO ---
            const px = v => parseFloat(v) || 0;

            const borderWidth = px(cs.borderWidth);
            const borderRadius = px(cs.borderRadius);
            const paddingHorizontal = px(cs.paddingLeft) + px(cs.paddingRight);
            const paddingVertical = px(cs.paddingTop) + px(cs.paddingBottom);

            const bgColor = (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') ? cs.backgroundColor : '#ffffff';
            const borderColor = cs.borderColor || '#000000';

            const qrImgWidth = img.width;
            const qrImgHeight = img.height;

            const innerWidth = qrImgWidth;
            const innerHeight = qrImgHeight;

            const qrWrapperWidth = innerWidth + paddingHorizontal + 2 * borderWidth;
            const qrWrapperHeight = innerHeight + paddingVertical + 2 * borderWidth;

            // --- CÁLCULO DO TEXTO E ESPAÇO FINAL ---
            const texto = document.getElementById("qr-text").value || "";

            // CORREÇÃO: LÊ OS NOVOS CONTROLES DE ESTILO DE TEXTO
            const fontWeight = document.getElementById("font-weight").value;
            const fontFamily = document.getElementById("font-family").value;

            // Calcula o tamanho da fonte dinamicamente (PROPORCIONAL AO QR)
            const size = document.getElementById("size").value;
            const fontSize = Math.max(12, Math.round(parseInt(size) * 0.12)); // Valor em pixels
            const textColor = document.getElementById("colorText").value;

            const textMarginTop = 1;
            // Altura que o texto vai ocupar no Canvas (altura da fonte + margens)
            const textHeight = texto ? (fontSize + 20) : 0; // Margem de 20px (10px acima e 10px abaixo da fonte)

            // --- CÁLCULO DA ÁREA FINAL DO CANVAS ---
            const canvasWidth = qrWrapperWidth + 40; // 20px de margem externa em cada lado

            let canvasHeight = qrWrapperHeight;
            if (texto) {
                // Adiciona a altura do texto com a margem
                canvasHeight += textMarginTop + textHeight;
            }
            canvasHeight += 40; // 20px de margem superior e inferior

            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(canvasWidth);
            canvas.height = Math.ceil(canvasHeight);
            const ctx = canvas.getContext("2d");

            // 1. Limpar e pintar fundo do canvas (branco)
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Desenhar o Retângulo de Borda Arredondada
            const wrapperX = 20;
            const wrapperY = 20;
            // Altura do wrapper é a altura total do canvas - margens externas (40px)
            const finalOuterWidth = qrWrapperWidth;
            const finalOuterHeight = canvasHeight - 40;

            // Função para desenhar retângulo arredondado (mantida)
            function roundRect(ctx, x, y, w, h, r) {
                const min = Math.min(w, h) / 2;
                if (r > min) r = min;
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y, x + w, y + h, r);
                ctx.arcTo(x + w, y + h, x, y + h, r);
                ctx.arcTo(x, y + h, x, y, r);
                ctx.arcTo(x, y, x + w, y, r);
                ctx.closePath();
            }

            // Desenha fundo do wrapper total
            roundRect(ctx, wrapperX, wrapperY, finalOuterWidth, finalOuterHeight, borderRadius);
            ctx.fillStyle = bgColor;
            ctx.fill();

            // Desenha borda (se borderWidth > 0)
            if (borderWidth > 0) {
                ctx.lineWidth = borderWidth;
                ctx.strokeStyle = borderColor;
                ctx.stroke();
            }

            // 3. Desenhar a Imagem do QR Code
            const qrX = wrapperX + borderWidth + (paddingHorizontal / 2); // Posição X ajustada
            const qrY = wrapperY + borderWidth + (paddingVertical / 2);
            ctx.drawImage(img, qrX, qrY, innerWidth, innerHeight);

            // 4. Desenhar o Texto (Centralizado Abaixo do QR)
            if (texto) {
                // CORREÇÃO: Define um padding (espaço) entre o QR e o texto
                const textPaddingTop = 15;

                // Calcula Y com o novo padding
                // Posição central vertical do texto
                const textY = qrY + innerHeight + textPaddingTop + (fontSize / 2);

                // Converte 'bold' para '700' ou 'normal' para '400' para o canvas
                const weight = (fontWeight === 'bold' ? "700 " : "400 ");
                ctx.font = weight + fontSize + "px " + fontFamily.replace(/'/g, '');

                ctx.fillStyle = textColor;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.fillText(texto, canvasWidth / 2, textY);
            }

            // 5. Baixar Arquivo
            const link = document.createElement("a");
            link.download = "qr_completo_com_borda.png";
            link.href = canvas.toDataURL("image/png");
            link.click();

        } finally {
            URL.revokeObjectURL(url);
        }
    };

    img.onerror = () => {
        URL.revokeObjectURL(url);
        // Alterado para exibir o alerta customizado, se possível
        if (typeof exibirAlerta === 'function') {
            exibirAlerta("Erro ao processar a imagem do QR para download.");
        } else {
            alert("Erro ao processar a imagem do QR para download.");
        }
    };
}
// =============================
//  EVENTOS DE CONTROLES
// =============================

document.getElementById("qr-text").addEventListener("input", function () {
    let input = this.value;

    if (input.length > MAX_CARACTERES_ROTULO) {
        // 1. Trunca o texto
        this.value = input.substring(0, MAX_CARACTERES_ROTULO);

        // 2. Notifica o usuário
        exibirAlerta(`O texto do rótulo foi limitado a ${MAX_CARACTERES_ROTULO} caracteres para caber na área de visualização.`);
    }

    // 3. ATUALIZA o visual após o ajuste ou digitação normal
    atualizarQRCode();
});

// NOVOS EVENTOS PARA CONTROLES DE TEXTO
document.getElementById("font-weight").addEventListener("change", atualizarQRCode);
document.getElementById("font-family").addEventListener("change", atualizarQRCode);

// EVENTOS DE BORDAS E QR
document.getElementById("border-size").addEventListener("input", atualizarQRCode);
document.getElementById("border-radius").addEventListener("input", atualizarQRCode);
document.getElementById("shape").addEventListener("change", atualizarQRCode);
document.getElementById("size").addEventListener("input", atualizarQRCode);

// O antigo: document.getElementById("bold-text").addEventListener("change", atualizarQRCode); FOI REMOVIDO


// =============================
// PLACEHOLDERS DINÂMICOS E CAMPOS ADICIONAIS
// =============================

document.getElementById("tipo").addEventListener("change", atualizarPlaceholder);

function atualizarPlaceholder() {
    const tipo = document.getElementById("tipo").value;
    const input = document.getElementById("texto");
    const camposAdicionais = document.getElementById("camposAdicionais");
    const waMsg = document.getElementById("whatsapp-msg");
    const emailAssunto = document.getElementById("email-assunto");
    const emailCorpo = document.getElementById("email-corpo");

    // Esconde todos os campos primeiro
    camposAdicionais.style.display = "none";
    waMsg.style.display = "none";
    emailAssunto.style.display = "none";
    emailCorpo.style.display = "none";

    // Mostra os campos relevantes e atualiza placeholder
    switch (tipo) {
        case "texto":
            input.placeholder = "Digite um texto qualquer";
            break;
        case "link":
            input.placeholder = "Ex: https://meusite.com";
            break;
        case "whatsapp":
            input.placeholder = "Digite apenas o DDD mais números (ex: 11984561234)";
            camposAdicionais.style.display = "block";
            waMsg.style.display = "block";
            break;
        case "email":
            input.placeholder = "exemplo@dominio.com";
            camposAdicionais.style.display = "block";
            emailAssunto.style.display = "block";
            emailCorpo.style.display = "block";
            break;
        case "telefone":
            input.placeholder = "Digite apenas o DDD mais números (ex: 11984561234)";
            break;
        case "spotify":
            input.placeholder = "Cole o link do Spotify ou pesquise por nome";
            break;
        case "foto":
            input.placeholder = "Insira uma URL direta da imagem (https://...)";
            break;
    }
}

atualizarPlaceholder();