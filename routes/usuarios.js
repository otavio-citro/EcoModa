const express = require('express');
const rotas = express.Router();
const BD = require('../db')



 rotas.get('/listar', async (req, res) => {
     const busca = req.query.busca || '';
    const ordem = req.query.ordem || 'nome';

    const dados = await BD.query(`SELECT *
        FROM usuarios
        WHERE usuarios.ativo = true and usuarios.nome ilike $1
        ORDER BY ${ordem};`, [`%${busca}%`]);
     console.log(dados.rows);
     res.render('usuarios/lista.ejs', { dadosusuarios: dados.rows })

});

rotas.get('/novo', async (req, res) => {
    //Buscando os usuarios para alimentar o select da tela
    const dadosusuarios = await BD.query(`
    SELECT id_usuario, nome, email, numero, cpf, senha FROM usuarios
    WHERE ativo = true
    ORDER BY nome`)

    res.render('usuarios/novo.ejs', { dadosusuarios: dadosusuarios.rows })
});

rotas.post('/novo', async (req, res) => {
    //obtendo os dado do formulario e as guardando em uma variável
    const nome = req.body.nome;
    const email = req.body.email;
    const numero = req.body.numero;
    const cpf = req.body.cpf;
    const senha = req.body.senha;
    //const {} = req.body;

    const sql = `INSERT INTO usuarios (nome, email, numero, cpf, senha)
                    VALUES ($1, $2, $3, $4, $5)`;

    await BD.query(sql, [nome, email, numero, cpf, senha]);

    res.redirect('/usuarios/listar')
});


//criando rota para excluir o turmas passando o id (D - Delete)
rotas.post('/excluir/:id', async (req, res) => {
    //Recebendo o código que quero excluir
    const id = req.params.id;

    //Comando SQL para excluir do BD
    //const sql = 'DELETE FROM turmas WHERE id_turma = $1';
    //A melhor prática é desativar o item e não excluir
    const sql = 'UPDATE usuarios SET ativo = false WHERE id_usuario = $1';
    //Executando o comando no BD
    await BD.query(sql, [id]);

    //Redirecionando para a página de listagem
    res.redirect('/usuarios/listar');
});

rotas.get('/editar/:id', async (req, res) => {
    const id = req.params.id;
    const resultado = await BD.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id]);
    res.render('usuarios/editar.ejs', {usuario: resultado.rows[0] });
});

rotas.post('/editar/:id', async (req, res) => {
    //obtendo os dado do formulario e as guardando em uma variável
    const nome = req.body.nome;
    const email = req.body.email;
    const numero = req.body.numero;
    const cpf = req.body.cpf;
    const senha = req.body.senha;
    const id = req.params.id;
    //const {nome_professor, telefone, formacao} = req.body;
    await BD.query(
            `UPDATE usuarios SET nome = $1, email = $2, numero = $3, cpf = $4, senha = $5 WHERE id_usuario = $6`,
            [nome, email, numero, cpf, senha, id]
        );

    res.redirect('/usuarios/listar')
});

module.exports = rotas