const express = require('express');
const ejs = require('ejs');
const path = require('path');
const app = express();
app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const session = require('express-session');
app.use(session({
    secret: 'pescasenai', //uma chave secreta para assinar o ID da sessão  
    resave: false, //não salvar a sessão se não houve modificação
    saveUninitialized: false  //não criar sessão até que algo seja armazenado
}));


const verificarAutenticacao = (req, res, next) => {
    if (req.session.usuario) {
       res.locals.usuario = req.session.usuario || null; // Disponibiliza o usuário para as views
       next(); // Usuário autenticado, prosseguir para a próxima função
    } else {
       res.redirect('/admin/login'); // Redireciona para a página de login se não autenticado
    }
};



//rota da pagina principal "landing page"
app.get('/', (req, res) => {
    res.render('landing/index')
});

app.get('/admin/dashboard', verificarAutenticacao, (req, res) => {
    res.render('admin/dashboard')
})

//importando as rotas do admin
const adminRotas = require('./routes/admin');
app.use('/admin', adminRotas)

//importando as rotas de produtos
const produtosRotas = require('./routes/produtos');
app.use('/produtos', verificarAutenticacao, produtosRotas)

//importando as rotas de usuarios
const usuariosRotas = require('./routes/usuarios');
app.use('/usuarios', verificarAutenticacao, usuariosRotas)

//importando as rotas de categorias
const categoriasRotas = require('./routes/categorias');
app.use('/categorias', verificarAutenticacao, categoriasRotas)

const porta = 3000;
app.listen(porta, () => {
    console.log(`servidor rodando em http://192.168.0.170:${porta}`)
});
