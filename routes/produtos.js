const express = require('express');
const rotas = express.Router();
const BD = require('../db')

rotas.get('/listar', async (req, res) => {
    const dados = await BD.query(`SELECT *
        FROM produtos
        LEFT JOIN categorias on produtos.id_categoria = categorias.id_categoria
        WHERE produtos.ativo = true
        ORDER BY produtos.nome_produto;`);
    console.log(dados.rows);
    res.render('produtos/lista.ejs', { dadosProdutos: dados.rows })

});

rotas.get('/novo', async (req, res) => {
    //Buscando os produtos para alimentar o select da tela
    const dadosProdutos = await BD.query(`
    SELECT id_categoria, nome_categoria FROM categorias
    WHERE ativo = true
    ORDER BY nome_categoria`)

    res.render('produtos/novo.ejs', { dadosProdutos: dadosProdutos.rows })
});

rotas.post('/novo', async (req, res) => {
    //obtendo os dado do formulario e as guardando em uma variável
    const nome_produto = req.body.nome_produto;
    const quantidade_produto = req.body.quantidade_produto;
    const imagem_produto = req.body.imagem_produto;
    const limite_minimo = req.body.limite_minimo;
    const descricao = req.body.descricao;
    const data_produto = req.body.data_produto;
    const valor = req.body.valor;
    const id_categoria = req.body.id_categoria;
    //const {} = req.body;

    const sql = `INSERT INTO produtos (nome_produto, quantidade_produto, imagem_produto, limite_minimo, descricao, data_produto, valor, id_categoria )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;

    await BD.query(sql, [nome_produto, quantidade_produto, imagem_produto, limite_minimo, descricao, data_produto, valor, id_categoria]);

    res.redirect('/produtos/listar')
});


//criando rota para excluir o turmas passando o id (D - Delete)
rotas.post('/excluir/:id', async (req, res) => {
    //Recebendo o código que quero excluir
    const id = req.params.id;

    //Comando SQL para excluir do BD
    //const sql = 'DELETE FROM turmas WHERE id_turma = $1';
    //A melhor prática é desativar o item e não excluir
    const sql = 'UPDATE produtos SET ativo = false WHERE id_produto = $1';
    //Executando o comando no BD
    await BD.query(sql, [id]);

    //Redirecionando para a página de listagem
    res.redirect('/produtos/listar');
});

rotas.get('/editar/:id', async (req, res) => {
    const { id } = req.params.id;
    const resultado = await BD.query('SELECT * FROM produtos WHERE id_produto = $1', [id]);
    res.render('produtos/editar.ejs', { produto: resultado.rows[0] });
});

rotas.post('/editar/:id', async (req, res) => {
    //obtendo os dado do formulario e as guardando em uma variável
    const id = req.params.id;
    const nome_produto = req.body.nome_produto;
    const quantidade_produto = req.body.quantidade_produto;
    const imagem_produto = req.body.imagem_produto;
    const limite_minimo = req.body.limite_minimo;
    const descricao = req.body.descricao;
    const data_produto = req.body.data_produto;
    const valor = req.body.valor;
    const id_categoria = req.body.id_categoria;
    //const {nome_professor, telefone, formacao} = req.body;
    await BD.query(`UPDATE produtos SET
                nome_produto = $1,
                quantidade_produto = $2,
                imagem_produto = $3 
                limite_minimo = $4,
                descricao = $5,
                data_produto = $6,
                valor = $7,
                id_categoria = $8 WHERE
                id_produto = $9`
    [nome_produto, quantidade_produto, imagem_produto, limite_minimo, descricao, data_produto, valor, id_categoria, id]);

    res.redirect('/produtos/listar')
});

module.exports = rotas