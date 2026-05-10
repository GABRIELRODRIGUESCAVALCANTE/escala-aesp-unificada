const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path'); // Necessário para gerenciar pastas

const app = express();
app.use(cors());
app.use(express.json());

// 1. ROTA DE BUSCA (API)
app.post('/buscar', async (req, res) => {
    const { nome, url } = req.body;
    const urlAlvo = url || 'https://app2.aesp.ce.gov.br/qts/index.php/publico/visualiza_qts/1919/2/3_2026';

    console.log(`\n🎯 Busca solicitada por: "${nome}"`);

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        
        const page = await browser.newPage();
        await page.goto(urlAlvo, { waitUntil: 'networkidle2', timeout: 90000 });

        const resultados = await page.evaluate((nomeBusca) => {
            const linhas = Array.from(document.querySelectorAll('tr'));
            let dataAtual = "---";
            let achados = [];
            
            const regexData = /\d{2}\/\d{2}\/\d{4}/;
            const regexHora = /^\d{2}:\d{2}/; 
            const regexNome = new RegExp(`\\b${nomeBusca.trim()}\\b`, 'i');

            linhas.forEach(linha => {
                const colunas = Array.from(linha.querySelectorAll('td, th'))
                                     .map(c => c.innerText.trim())
                                     .filter(t => t !== "");

                if (colunas.length < 2) return;

                if (regexData.test(colunas[0])) {
                    dataAtual = colunas[0].split('\n')[0].trim();
                }

                for (let i = 0; i < colunas.length; i++) {
                    const textoCelula = colunas[i];

                    if (regexNome.test(textoCelula)) {
                        let horario = (i > 0 && regexHora.test(colunas[i - 1])) 
                                      ? colunas[i - 1] 
                                      : "Horário não identificado";
                        
                        let extra = (i < colunas.length - 1) ? colunas[i + 1] : "";

                        achados.push({
                            data: dataAtual,
                            horario: horario,
                            disciplina: textoCelula,
                            extra: extra !== '-x-' ? extra : '' 
                        });
                    }
                }
            });

            return achados;
        }, nome || "");

        await browser.close();
        console.log(`✅ Sucesso! ${resultados.length} blocos encontrados.`);
        res.json({ encontrado: resultados.length > 0, dados: resultados });
        
    } catch (error) {
        if(browser) await browser.close();
        console.error("❌ Erro:", error.message);
        res.status(500).json({ erro: "Erro ao acessar o site", detalhes: error.message });
    }
});

// 2. CONFIGURAÇÃO DE DEPLOY (SERVIDOR DE ARQUIVOS)
// Avisa ao Express para servir os arquivos estáticos da pasta do React (buildada)
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Qualquer rota que o usuário acessar no navegador (fora a /buscar) cairá no React
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Usa a porta fornecida pelo Render (process.env.PORT) ou 3001 localmente
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor unificado rodando na porta ${PORT}`);
    console.log(`📂 Servindo frontend de: ${path.join(__dirname, 'frontend/dist')}`);
});