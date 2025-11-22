// =============================
//  GERADOR INICIAL (primeira etapa)
// =============================

let qr; // objeto global do QR Code Styling

function gerarQRCode() {
    const tipo = document.getElementById("tipo").value;
    const input = document.getElementById("texto").value.trim();

    if (!input) {
        exibirAlerta("Digite algo para gerar o QR Code.");
        return;
    }

    let conteudo = "";

    switch (tipo) {
        case "texto":
            conteudo = input;
            break;

        case "link":
            if (!input.startsWith("http")) {
                exibirAlerta("Forneça uma URL válida, como https://... .");
                return;
            }
            conteudo = input;
            break;

        case "whatsapp":
            const numero = input.replace(/\D/g, "");
            // Pega a mensagem do campo adicional
            const msg = document.getElementById("whatsapp-msg").value.trim();
            conteudo = `https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`;
            break;

        case "email":
            // Pega os valores dos campos adicionais
            const assunto = document.getElementById("email-assunto").value.trim();
            const corpo = document.getElementById("email-corpo").value.trim();
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
            if (!input.startsWith("http")) {
                exibirAlerta("Para usar foto, forneça uma URL válida, como https://... .");
                return;
            }
            conteudo = input;
            break;
    }

    iniciarCustomizacao(conteudo);
}


// =============================
//  INICIAR CUSTOMIZAÇÃO (mostra a segunda parte)
// =============================

function iniciarCustomizacao(texto) {

    // Apaga possível QR anterior
    document.getElementById("qr-container").innerHTML = "";

    // Instancia o QR Code inicial e Renderiza
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

function atualizarQRCode() {
    if (!qr) return;

    const wrapper = document.getElementById("qr-wrapper");

    const size = document.getElementById("size").value;
    const shape = document.getElementById("shape").value;
    const borderSize = document.getElementById("border-size").value;
    const radius = document.getElementById("border-radius").value;
    const labelText = document.getElementById("qr-text").value;
    const bold = document.getElementById("bold-text").checked;

    // Atualiza texto
    const label = document.getElementById("qr-label");
    label.innerText = labelText;
    label.style.fontWeight = bold ? "bold" : "normal";

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
let campoAtual = null;

// Abre o painel de cores
function abrirPicker(campo) {
    campoAtual = campo;
    document.getElementById("colorPickerPanel").style.display = "block";
}

// Fecha o painel
function fecharPicker() {
    document.getElementById("colorPickerPanel").style.display = "none";
}

// Aplica a cor selecionada
function aplicarCor() {
    let novaCor = document.getElementById("colorPickerInput").value;

    if (!qr) return;

    switch (campoAtual) {
        case "cor": // cor dos pontos
            qr.update({ dotsOptions: { color: novaCor } });
            break;
        case "bg": // cor de fundo
            qr.update({ backgroundOptions: { color: novaCor } });
            break;
        case "border": // cor da borda
            document.getElementById("qr-wrapper").style.borderColor = novaCor;
            break;
    }
}


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


/// =============================
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
            const bold = document.getElementById("bold-text").checked;
            const textMarginTop = 1;
            const textHeight = texto ? 36 : 0;

            // --- CÁLCULO DA ÁREA FINAL DO CANVAS ---
            const canvasWidth = qrWrapperWidth + 40; // 40px de margem externa total

            let canvasHeight = qrWrapperHeight;
            if (texto) {
                canvasHeight += textMarginTop + textHeight;
            }
            canvasHeight += 40; // 40px de margem superior e inferior

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
            const finalOuterWidth = qrWrapperWidth;
            const finalOuterHeight = canvasHeight - 40;

            // Função para desenhar retângulo arredondado
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
            const qrX = wrapperX + (finalOuterWidth - innerWidth) / 2;
            const qrY = wrapperY + borderWidth + (paddingVertical / 2);
            ctx.drawImage(img, qrX, qrY, innerWidth, innerHeight);

            // 4. Desenhar o Texto (Centralizado Abaixo do QR)
            if (texto) {
                const fontSize = 18;
                const textY = wrapperY + innerHeight + (paddingVertical / 2) + borderWidth + textMarginTop + fontSize;

                ctx.font = (bold ? "700 " : "400 ") + fontSize + "px Arial";
                ctx.fillStyle = "#000";
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
        alert("Erro ao processar a imagem do QR para download.");
    };
}


// =============================
//  EVENTOS DE CONTROLES
// =============================

document.getElementById("qr-text").addEventListener("input", atualizarQRCode);
document.getElementById("border-size").addEventListener("input", atualizarQRCode);
document.getElementById("border-radius").addEventListener("input", atualizarQRCode);
document.getElementById("shape").addEventListener("change", atualizarQRCode);
document.getElementById("size").addEventListener("input", atualizarQRCode);
document.getElementById("bold-text").addEventListener("change", atualizarQRCode);


// Fecha o painel de cores ao clicar fora dele
document.addEventListener("click", function (event) {
    const panel = document.getElementById("colorPickerPanel");

    // Se o painel estiver visível
    if (panel.style.display === "block") {
        // Se o clique não foi no painel e nem no botão que o abre, feche
        if (!panel.contains(event.target) && !event.target.classList.contains("colorButton")) {
            fecharPicker();
        }
    }
});


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