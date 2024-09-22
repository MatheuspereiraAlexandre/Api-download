const express = require('express');
const mysql2 = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Criação da conexão ao banco de dados
const mysqli = mysql2.createConnection({
    host: process.env.MYSQL_HOST, // Atualizado para a variável correta
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// Verifica a conexão com o banco de dados
mysqli.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return process.exit(1);
    }
    console.log('Conectado ao MySQL com sucesso!');
});

app.use(express.json());
app.use(express.static('public'));

// Função utilitária para enviar respostas de erro
const sendErrorResponse = (res, message, statusCode = 500) => {
    console.error(message);
    res.status(statusCode).json({ success: false, message });
};

// Endpoint para obter arquivos
app.get('/arquivo', (req, res) => {
    const sql = 'SELECT id_arquivo, nome_arquivo, download_arquivo, tipo FROM arquivo';
    mysqli.query(sql, (err, result) => {
        if (err) {
            return sendErrorResponse(res, 'Erro ao consultar dados: ' + err.message);
        }
        res.json(result);
    });
});

// Endpoint para upload de arquivos
app.post('/upload', upload.single('download_arquivo'), (req, res) => {
    const { nome_arquivo } = req.body; 
    const download_arquivo = req.file ? req.file.buffer : null; 
    const tipo = req.file ? req.file.mimetype : null; 

    if (!nome_arquivo || !download_arquivo) {
        return sendErrorResponse(res, 'Nome do arquivo e arquivo são obrigatórios', 400);
    }

    const sql = 'INSERT INTO arquivo (nome_arquivo, download_arquivo, tipo) VALUES (?, ?, ?)';
    mysqli.query(sql, [nome_arquivo, download_arquivo, tipo], (err, result) => { 
        if (err) {
            return sendErrorResponse(res, 'Erro ao inserir dados: ' + err.message);
        }
        res.redirect('/teste.html');
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
