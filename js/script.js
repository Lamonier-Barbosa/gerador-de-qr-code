// =============================
//  GERADOR INICIAL (primeira etapa)
// =============================

let qr; // objeto global do QR Code Styling

function gerarQRCode() {
    const tipo = document.getElementById("tipo").value;
    const input = document.getElementById("texto").value.trim();

    if (!input) {
        alert("Digite algo para gerar o QR Code.");
        return;
    }

    let conteudo = "";

    switch (tipo) {
        case "texto":
            conteudo = input;
            break;

        case "link":
            if (!input.startsWith("http")) {
                alert("Forneça uma URL válida, como https://... .");
                return;
            }
            conteudo = input; // link direto para a imagem
            break;

        case "whatsapp":
            const numero = input.replace(/\D/g, "");
            const msg = prompt("Digite a mensagem:");
            conteudo = `https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`;
            break;

        case "email":
            const assunto = prompt("Assunto:");
            const corpo = prompt("Mensagem:");
            conteudo =
                `mailto:${input}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
            break;

        case "telefone":
            const tel = input.replace(/\D/g, "");
            conteudo = `tel:+${tel}`;
            break;

        case "spotify":
            // O usuário apenas cola o link do Spotify
            conteudo = input.startsWith("http")
                ? input
                : "https://open.spotify.com/search/" + encodeURIComponent(input);
            break;

        case "foto":
            if (!input.startsWith("http")) {
                alert("Para usar foto, forneça uma URL válida, como https://... .");
                return;
            }
            conteudo = input; // link direto para a imagem
            break;

    }

    iniciarCustomizacao(conteudo);
}



// =============================
//  INICIAR CUSTOMIZAÇÃO (mostra a segunda parte)
// =============================

function iniciarCustomizacao(texto) {

    // Apaga possível QR anterior
    document.getElementById("qr-container").innerHTML = "";

    // Instancia o QR Code inicial
    qr = new QRCodeStyling({
        width: 250,
        height: 250,
        data: texto,
        dotsOptions: { color: "#000", type: "square" },
        backgroundOptions: { color: "#fff" }
    });

    // Renderiza
    qr.append(document.getElementById("qr-container"));

    // Agora mostra a área de customização
    document.querySelector(".layout").style.display = "flex";
    document.querySelector(".inicial").style.display = "none";
}



// =============================
//  ATUALIZAÇÃO DO QR CODE EM TEMPO REAL
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
//  PICKERS DE COR
// =============================
let campoAtual = null;

// Abre o painel de cores no lado direito
function abrirPicker(campo) {
    campoAtual = campo;
    document.getElementById("colorPickerPanel").style.display = "block";
}

// Fecha o painel
function fecharPicker() {
    document.getElementById("colorPickerPanel").style.display = "none";
}

// Aplica a cor selecionada no QR Code
function aplicarCor() {
    let novaCor = document.getElementById("colorPickerInput").value;

    if (!qr) return;

    switch (campoAtual) {

        case "cor": // cor dos pontos
            qr.update({
                dotsOptions: { color: novaCor }
            });
            break;

        case "bg": // cor de fundo
            qr.update({
                backgroundOptions: { color: novaCor }
            });
            break;

        case "border": // cor da borda
            document.getElementById("qr-wrapper").style.borderColor = novaCor;
            break;
    }
}




// =============================
//  UPLOAD DE LOGO
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



// =============================
//  DOWNLOAD
// =============================

async function baixar() {
    if (!qr) return;

    // pega o blob PNG do qr
    const blob = await qr.getRawData("png");
    const img = new Image();
    // necessário para evitar problemas de CORS
    const url = URL.createObjectURL(blob);
    img.src = url;

    img.onload = () => {
        try {
            // estilos do wrapper
            const wrapper = document.getElementById("qr-wrapper");
            const cs = window.getComputedStyle(wrapper);

            // parse de valores em px (retorna número)
            const px = v => parseFloat(v) || 0;

            const borderWidth = px(cs.borderWidth); // largura da borda
            const borderRadius = px(cs.borderRadius);
            const paddingTop = px(cs.paddingTop);
            const paddingRight = px(cs.paddingRight);
            const paddingBottom = px(cs.paddingBottom);
            const paddingLeft = px(cs.paddingLeft);

            // cores (se transparente, usa branco)
            const bgColor = (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') ? cs.backgroundColor : '#ffffff';
            const borderColor = cs.borderColor || '#000000';

            // tamanho do QR (img contém apenas o QR gerado pela lib)
            const qrImgWidth = img.width;
            const qrImgHeight = img.height;

            // área interna onde o QR fica = qr image size
            // área externa = padding + borda ao redor do QR
            const innerWidth = qrImgWidth;
            const innerHeight = qrImgHeight;

            const outerWidth = innerWidth + paddingLeft + paddingRight + 2 * borderWidth;
            const outerHeight = innerHeight + paddingTop + paddingBottom + 2 * borderWidth;

            // texto (se houver)
            const texto = document.getElementById("qr-text").value || "";
            const bold = document.getElementById("bold-text").checked;
            const textHeight = texto ? 40 : 0; // espaço reservado para o texto

            // canvas final: largura = outerWidth (usar arredondamento inteiro), altura = outerHeight + textHeight + margem
            const margin = 16;
            const canvasWidth = Math.ceil(outerWidth + margin * 2);
            const canvasHeight = Math.ceil(outerHeight + textHeight + margin * 3);

            const canvas = document.createElement("canvas");
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext("2d");

            // limpar e pintar fundo (opcional branco)
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // posição do retângulo wrapper (centralizado horizontalmente)
            const wrapperX = (canvasWidth - outerWidth) / 2;
            const wrapperY = margin;

            // função para desenhar retângulo arredondado
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

            // desenha fundo do wrapper
            roundRect(ctx, wrapperX, wrapperY, outerWidth, outerHeight, borderRadius);
            ctx.fillStyle = bgColor;
            ctx.fill();

            // desenha borda (se borderWidth > 0)
            if (borderWidth > 0) {
                ctx.lineWidth = borderWidth;
                ctx.strokeStyle = borderColor;
                ctx.stroke();
            }

            // posição onde desenhar o QR image dentro do wrapper
            const qrX = wrapperX + borderWidth + paddingLeft;
            const qrY = wrapperY + borderWidth + paddingTop;

            // desenha a imagem do QR (já contém o QR + eventual imagem/logo embutida)
            ctx.drawImage(img, qrX, qrY, innerWidth, innerHeight);

            // desenha o texto (centralizado abaixo do wrapper)
            if (texto) {
                const textY = wrapperY + outerHeight + margin + 18; // 18px offset para baseline
                const fontSize = 18;
                ctx.font = (bold ? "700 " : "400 ") + fontSize + "px Arial";
                ctx.fillStyle = "#000";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(texto, canvasWidth / 2, textY);
            }

            // baixar arquivo
            const link = document.createElement("a");
            link.download = "qr_completo.png";
            link.href = canvas.toDataURL("image/png");
            link.click();

        } finally {
            // cleanup URL do blob
            URL.revokeObjectURL(url);
        }
    };

    img.onerror = () => {
        URL.revokeObjectURL(url);
        alert("Erro ao processar a imagem do QR para download.");
    };
}




// =============================
//  EVENTOS DE CONTROLES
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

    // Se o painel não estiver aberto, não faz nada
    if (panel.style.display !== "block") return;

    // Se clicou dentro do painel, não fecha
    if (panel.contains(event.target)) return;

    // Se clicou no botão que abre o painel, não fecha
    if (event.target.classList.contains("colorButton")) return;

    // Fecha o painel
    fecharPicker();
});

// =============================
// PLACEHOLDERS DINÂMICOS
// =============================

document.getElementById("tipo").addEventListener("change", atualizarPlaceholder);

function atualizarPlaceholder() {
    const tipo = document.getElementById("tipo").value;
    const input = document.getElementById("texto");

    switch (tipo) {
        case "texto":
            input.placeholder = "Digite um texto qualquer";
            break;

        case "link":
            input.placeholder = "Ex: https://meusite.com";
            break;

        case "whatsapp":
            input.placeholder = "Digite apenas o DDD mais números (ex: 11984561234)";
            break;

        case "email":
            input.placeholder = "exemplo@dominio.com";
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


function removerLogo() {
    if (!qr) return;

    qr.update({ image: "" }); // remove a imagem

    // limpa o input para evitar reaplicar cache
    document.getElementById("logo").value = "";
}


atualizarPlaceholder();