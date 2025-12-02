const express = require('express');
const rotas = express.Router();
const BD = require('../db')

//rota para o painel administrativo



rotas.get('/login', async (req, res)=>{
    res.render('./admin/login.ejs')
});

rotas.post('/login', async (req, res)=>{
    const { email, senha } = req.body;  
    
    const sql = 'SELECT * FROM usuarios WHERE email = $1 AND senha = $2';
    const dados = await BD.query(sql, [email, senha]);
    console.log(dados);
    

    if(dados.rows.length == 0){
        res.render('./admin/login.ejs', {mensagem: 'Usuário ou senha inválidos'});
    } else {
        req.session.usuario = dados.rows[0];
        res.redirect('/admin/dashboard');
    }
});

rotas.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login')
})

module.exports = rotas