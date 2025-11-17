const express = require('express');
const rotas = express.Router();
const BD = require('../db')

rotas.get('/listar', async (req, res) => {
    const busca = req.query.busca || '';
    const ordem = req.query.ordem || 'nome_categoria';

    // whitelist de ordenação segura
    const orderBy = {
        'nome_categoria': 'nome_categoria ASC',
        'nome_categoria desc': 'nome_categoria DESC',
    }[ordem] || 'nome_categoria ASC';

    let sql;
    let params = [];



    if (busca) {
        sql = `
            SELECT * FROM categorias 
            WHERE ativo = true 
              AND nome_categoria ILIKE $1
            ORDER BY ${orderBy}
        `;
        params = [`%${busca}%`];
    } else {
        sql = `
            SELECT * FROM categorias 
            ORDER BY ${orderBy}
        `;
    }

    const dados = await BD.query(sql, params);
    res.render('categorias/lista.ejs', { dadoscategorias: dados.rows });
});

rotas.get('/listar', async (req, res) => {
    const dados = await BD.query(`SELECT *
        FROM categorias
        WHERE ativo = true
        ORDER BY nome_categoria;`);
    console.log(dados.rows);
    res.render('categorias/lista.ejs', { dadoscategorias: dados.rows })

});

rotas.get('/novo', async (req, res) => {
    //Buscando os categorias para alimentar o select da tela
    const dadoscategorias = await BD.query(`
    SELECT id_categoria, nome_categoria FROM categorias
    WHERE ativo = true
    ORDER BY nome_categoria`)

    res.render('categorias/novo.ejs', { dadoscategorias: dadoscategorias.rows })
});

rotas.post('/novo', async (req, res) => {
    //obtendo os dado do formulario e as guardando em uma variável
    const nome_categoria = req.body.nome_categoria;
    //const {} = req.body;

    const sql = `INSERT INTO categorias (nome_categoria)
                    VALUES ($1)`;

    await BD.query(sql, [nome_categoria]);

    res.redirect('/categorias/listar')
});


//criando rota para excluir o turmas passando o id (D - Delete)
rotas.post('/excluir/:id', async (req, res) => {
    //Recebendo o código que quero excluir
    const id = req.params.id;

    //Comando SQL para excluir do BD
    //const sql = 'DELETE FROM turmas WHERE id_turma = $1';
    //A melhor prática é desativar o item e não excluir
    const sql = 'UPDATE categorias SET ativo = false WHERE id_categoria = $1';
    //Executando o comando no BD
    await BD.query(sql, [id]);

    //Redirecionando para a página de listagem
    res.redirect('/categorias/listar');
});

rotas.get('/editar/:id', async (req, res) => {
    const id = req.params.id;
    const resultado = await BD.query('SELECT * FROM categorias WHERE id_categoria = $1', [id]);
    res.render('categorias/editar.ejs', { categoria: resultado.rows[0] });
});

rotas.post('/editar/:id', async (req, res) => {
    //obtendo os dado do formulario e as guardando em uma variável
    const nome_categoria = req.body.nome_categoria;
    const id = req.params.id;
    //const {nome_professor, telefone, formacao} = req.body;
    await BD.query(
        `UPDATE categorias SET nome_categoria = $1 WHERE id_categoria = $2`,
        [nome_categoria, id]
    );

    res.redirect('/categorias/listar')
});

module.exports = rotas