const express = require('express');
const mysql2 = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const mysqli = mysql2.createConnection({
    host: process.env.MYSQL_PUBLIC_URL || 'autorack.proxy.rlwy.net',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 28097 
});

mysqli.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.code, err.message);
        return process.exit(1);
    }
    console.log('Conectado ao MySQL com sucesso!');
});

app.use(express.json());
app.use(express.static('public'));

const sendErrorResponse = (res, message, statusCode = 500) => {
    console.error(message);
    res.status(statusCode).json({ success: false, message });
};

app.get('/arquivo', (req, res) => {
    const sql = 'SELECT id_arquivo, nome_arquivo, download_arquivo, tipo FROM arquivo';
    mysqli.query(sql, (err, result) => {
        if (err) {
            return sendErrorResponse(res, 'Erro ao consultar dados: ' + err.message);
        }
        res.json(result);
    });
});

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
        res.json({ success: true, message: 'Upload concluído' });
    });
});

app.get('/loading', (req, res) => {
    setTimeout(() =>{
        res.redirect('/')
    }, 15000)
});



app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
