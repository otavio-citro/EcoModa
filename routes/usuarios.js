const express = require('express');
const rotas = express.Router();
const BD = require('../db')

rotas.get('/listar', async (req, res) => {
    const dados = await BD.query(`SELECT *
        FROM usuarios
        WHERE ativo = true
        ORDER BY nome;`);
    console.log(dados.rows);
    res.render('usuarios/lista.ejs', { dadosUsuarios: dados.rows })

});

module.exports = rotas