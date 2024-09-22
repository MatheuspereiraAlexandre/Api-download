const express = require('express');
const mysql2 = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*',  //declara que todas as fontes podem ser acessadas;
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const storage = multer.memoryStorage(); // salva na memoria do usuario 
const upload = multer({ storage: storage }); // slva o arquivo la no banco bro

//conexao ao banco 
const mysqli = mysql2.createConnection({ 
    host: process.env.BD_HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASDE
});

app.use(express.json());
app.use(express.static('public')); // defini que a pasta public vai ser utilizada

app.get('/arquivo', (req, res) => {
    const sql = 'SELECT id_arquivo, nome_arquivo, download_arquivo, tipo FROM arquivo';
    mysqli.query(sql, (err, result) => {
        if (err) {
            console.log('Erro ao consultar dados: ', err);
            return res.status(500).json({ success: false, message: 'erro ao consultar o banco' });
        }
        res.json(result);
    });
});

app.post('/upload', upload.single('download_arquivo'), (req, res) => {
    const { nome_arquivo } = req.body; // pega o nome do arquivo no form la
    const download_arquivo = req.file ? req.file.buffer : null; // pega o arquivo
    const tipo = req.file ? req.file.mimetype : null; // defini o tipo dele

    if (!nome_arquivo || !download_arquivo) {
        return res.status(400).json({ success: false, message: 'nome do arquivo e arquivo sao obrigatorias' });
    }

    const sql = 'INSERT INTO arquivo (nome_arquivo, download_arquivo, tipo) VALUES (?, ?, ?)';
    mysqli.query(sql, [nome_arquivo, download_arquivo, tipo], (err, result) => { // executa a query
        if (err) {
            console.log('Erro ao inserir dados: ', err);
            return res.status(500).json({ success: false, message: 'erro ao dar insert' });
        }
       res.redirect('/teste.html')
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
