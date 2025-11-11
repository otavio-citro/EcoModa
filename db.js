const { Pool } = require('pg');
const BD = new Pool(
    {
        user: 'postgres', //Usuario cadastrado no banco de dados
        host: 'localhost', //endereço do servidor do BD
        database: 'ecomoda', //nome do BD a ser conectado
        password: 'admin', //Senha do usuario
        port: 5432 //Porta de conexão
    }


);

module.exports = BD;
