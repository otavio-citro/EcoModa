const express = require('express');
const ejs = require('ejs');
const path = require('path');
const app = express();
app.use(express.static('public'));
const BD = require('./db.js');

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

// const session = require('express-session');
// const pgSession = require('connect-pg-simple')(session)
// const { log } = require('console');
// app.use(session({
//     store: new pgSession({
//         pool: BD,
//         tableName: 'sessoes',
//         createTableIfMissing: true
//     }),

//     secret: 'sesisenai',
//     resave: false,
//     saveUninitialized: false,

//     cookie: {
//         maxAge: 1000 * 60 * 60 * 24, //duração da sessao em milissegundos (1 dia)
//         secure: true // definir como true se estiver testando na vercer senao com false
//     }
// }));
// app.set('trust proxy', 1)

const verificarAutenticacao = (req, res, next) => {
    if (req.session.usuario) {
        res.locals.usuario = req.session.usuario || null; // Disponibiliza o usuário para as views
        next(); // Usuário autenticado, prosseguir para a próxima função
    } else {
        res.redirect('/admin/login'); // Redireciona para a página de login se não autenticado
    }
};
//Gráfico
// app.get('/admin/dashboard', verificarAutenticacao, async (req, res) => {

//     const qProdutos = await BD.query ('select count(*) as total_produtos from produtos where ativo = true')
   
//     const qCategorias = await BD.query ('select count(*) as total_categorias from categorias where ativo = true')

//     const qProdutosCategorias = await BD.query(`
//         SELECT p.nome_produto
//         FROM produtos AS p INNER JOIN categorias AS c
//         ON p.id_categoria = c.id_categoria
//         GROUP BY p.nome_produto
//         `);

//     res.render('admin/dashboard', {
//         total_produtos: qProdutos.rows[0].total_produtos,
//         total_categorias: qCategorias.rows[0].total_categorias,
//         produtosCategorias: qProdutosCategorias

//     })
// });



app.get('/admin/dashboard', verificarAutenticacao, async (req, res) => {

  const qTotal = await BD.query(
    `SELECT SUM(quantidade_produto) AS total_produtos FROM produtos WHERE ativo = true`
  );
  
  const qTotalUsuario = await BD.query(
    `SELECT COUNT(id_usuario) AS total_usuarios FROM usuarios WHERE ativo = TRUE`
  );
  
  const qTotalValor = await BD.query(
    `SELECT SUM(valor) AS total_valor FROM produtos WHERE ativo = true`
  );
  
  const qTotalCategoria = await BD.query(
    `SELECT COUNT(id_categoria) AS total_categorias FROM categorias WHERE ativo = true`
  );
  
  const qTabelaMinimo = await BD.query(
    `SELECT p.nome_produto, c.nome_categoria, p.quantidade_produto, p.valor, p.limite_minimo 
    FROM produtos as p 
    INNER JOIN categorias as c on p.id_categoria = c.id_categoria
    WHERE limite_minimo > quantidade_produto AND p.ativo = true`
  );

  const qGrafico = await BD.query(
    `SELECT nome_produto, SUM(quantidade_produto) AS quantidade
     FROM produtos
     WHERE ativo = true
     GROUP BY nome_produto`
  );

  const produtosTotal = await BD.query('SELECT p.nome_produto, c.nome_categoria, p.quantidade_produto, p.valor FROM produtos as p INNER JOIN categorias as c on p.id_categoria = c.id_categoria where p.ativo = true and c.ativo = true and valor >= 90')

  res.render('admin/dashboard', {
    total_produtos: qTotal.rows[0].total_produtos || 0,
    total_valor: qTotalValor.rows[0].total_valor || 0,
    total_categorias: qTotalCategoria.rows[0].total_categorias || 0,
    total_usuarios: qTotalUsuario.rows[0].total_usuarios || 0,
    tabelaMinimo: qTabelaMinimo.rows,  
    graficoProdutos: qGrafico.rows, tabelaProdutos: produtosTotal.rows  
  });

});

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

//importando as rotas de categorias
const movimentoRotas = require('./routes/movimento');
app.use('/movimento', verificarAutenticacao, movimentoRotas)

app.get('/', (req, res) => {
    res.render('landing/index');
});

const porta = 3000;
app.listen(porta, () => {
    console.log(`servidor rodando em  http://192.168.0.170:${porta}`)
});
