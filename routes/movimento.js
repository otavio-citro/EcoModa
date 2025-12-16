const express = require('express');
const rotas = express.Router();
const BD = require('../db')

rotas.get('/listar', async (req, res) => {
   const { busca } = req.query;
   let sql = "SELECT m.id_movimentacao, m.tipo, m.quantidade_total, m.data_, p.nome_produto, p.quantidade_produto as qtde_produto FROM movimentacoes AS m LEFT JOIN produtos AS p on m.id_produto = p.id_produto";
  let params = [];
  if (busca) {
    sql += " WHERE p.nome_produto ILIKE $1";
    params.push(`%${busca}%`);
  }
  sql += " ORDER BY p.nome_produto ASC";
  const result = await BD.query(sql, params);
  res.render('movimento/lista', { usuario: req.session.user, movimento: result.rows, busca });
});

rotas.get('/novo', async (req, res) => {
  const produtos = await BD.query("SELECT * FROM produtos WHERE ativo = true ORDER BY nome_produto ASC");
  const dadosusuarios = await BD.query(`
    SELECT id_usuario, nome, email, numero, cpf, senha FROM usuarios
    WHERE ativo = true
    ORDER BY nome`)
  res.render('movimento/novo', { usuarios: dadosusuarios.rows, produtos: produtos.rows });
});

rotas.post('/novo', async (req, res) => {
  const { id_produto, tipo, quantidade_mov, id_usuario } = req.body;
  const qtd = parseFloat(quantidade_mov);
  const descricao = ("Roupa");
  const novo_estoque = (1);

  const prod = await BD.query("SELECT * FROM produtos WHERE id_produto=$1", [id_produto]);


  let novaQt = parseFloat(prod.rows[0].quantidade_produto);
  if (tipo === 'E') novaQt += qtd;
  if (tipo === 'S') novaQt -= qtd;

  
  await BD.query("UPDATE produtos SET quantidade_produto=$1 WHERE id_produto=$2", [parseInt(novaQt), id_produto]);
  await BD.query("INSERT INTO movimentacoes (id_produto, tipo, quantidade_total, id_usuario, descricao, novo_estoque) VALUES ($1,$2,$3,$4,$5,$6)",
    [id_produto, tipo, qtd, id_usuario, descricao, novo_estoque]);

  let mensagem = null;
  if (novaQt < prod.rows[0].estoque_minimo) mensagem = "⚠️ Estoque abaixo do mínimo!";
  const busca = null;
  res.redirect('/movimento/listar');
});

rotas.get('/editar/:id', async (req, res) => {
  const { id } = req.params;
  const mov = await BD.query(`
    SELECT m.id_movimentacao, m.tipo, m.quantidade_total, m.data_, 
           p.id_produto, p.nome_produto, p.quantidade_produto as qtde_produto 
    FROM movimentacoes as m 
    LEFT JOIN produtos as p ON m.id_produto = p.id_produto 
    WHERE id_movimentacao=$1
  `, [id]);

  if (mov.rowCount === 0) return res.redirect('/movimento/listar');

  const produtos = await BD.query("SELECT id_produto, nome_produto FROM produtos WHERE ativo = true ORDER BY nome_produto");

  res.render('movimento/editar', { 
    usuario: req.session.user, 
    m: mov.rows[0], 
    produtos: produtos.rows 
  });
});

rotas.post('/editar/:id', async (req, res) => {
  const { id_produto, tipo, quantidade_mov } = req.body;
  const id = req.params.id;
  const qtdNova = parseFloat(quantidade_mov); //vem da tela

  try {
    // Busca movimentação original
    const mov = await BD.query("SELECT * FROM movimentacoes WHERE id_movimentacao=$1", [id]);
    if (mov.rowCount === 0) return res.redirect('/movimento/listar');

    const movAntiga = mov.rows[0];
    const qtdAntiga = parseFloat(movAntiga.quantidade_total);

    // Busca produto
    const prod = await BD.query("SELECT * FROM produtos WHERE id_produto=$1", [id_produto]);
    if (prod.rowCount === 0) return res.redirect('/listar');

    let novaQt = parseFloat(prod.rows[0].quantidade_produto);

    // Remove efeito da movimentação antiga
    if (movAntiga.tipo === 'E') novaQt -= qtdAntiga; //Quantidade prod.
    if (movAntiga.tipo === 'S') novaQt += qtdAntiga; //Quantidade prod.

    // Aplica efeito da movimentação nova
    if (tipo === 'E') novaQt += qtdNova; //Quantidade Movimento
    if (tipo === 'S') novaQt -= qtdNova; //Quantidade Movimento

    //console.log(novaQt, qtdNova, qtdAntiga);
    
    // Atualiza produto
    await BD.query("UPDATE produtos SET quantidade_produto=$1 WHERE id_produto=$2", [parseInt(novaQt), id_produto]);

    // Atualiza movimentação
    await BD.query("UPDATE movimentacoes SET id_produto=$1, tipo=$2, quantidade_total=$3 WHERE id_movimentacao=$4", 
      [id_produto, tipo, parseInt(qtdNova), id]);

    // Verifica estoque mínimo
    let mensagem = null;
    if (novaQt < prod.rows[0].estoque_minimo) mensagem = "⚠️ Estoque abaixo do mínimo!";

    res.redirect('/movimento/listar');
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao editar movimentação");
  }
});

rotas.post('/excluir/:id', async (req, res) => {
  const { id } = req.params;

  // Busca a movimentação antes de excluir
  const mov = await BD.query("SELECT * FROM movimentacoes WHERE id_movimentacao=$1", [id]);
  if (mov.rowCount === 0) {
    return res.redirect('/movimento/lista'); // Não encontrada
  }

  const { id_produto, tipo, quantidade_total } = mov.rows[0];

  // Busca o produto para ajustar quantidade_total
  const prod = await BD.query("SELECT * FROM produtos WHERE id_produto=$1", [id_produto]);
  if (prod.rowCount === 0) {
    return res.redirect('/movimento/lista'); // Produto não encontrado
  }

  let novaQt = parseFloat(prod.rows[0].quantidade_produto);

  console.log(novaQt);
  // Ajusta conforme tipo da movimentação
  if (tipo === 'S') {
    novaQt += parseFloat(quantidade_total); // devolve estoque
  } else if (tipo === 'E') {
    novaQt -= parseFloat(quantidade_total); // retira estoque
  }
  
  // Atualiza produto
  await BD.query("UPDATE produtos SET quantidade_produto=$1 WHERE id_produto=$2", [novaQt, id_produto]);

  // Exclui movimentação
  await BD.query("DELETE FROM movimentacoes WHERE id_movimentacao=$1", [id]);

  res.redirect('/movimento/listar');
});

module.exports = rotas