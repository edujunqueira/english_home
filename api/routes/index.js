var express = require("express");
var bodyParser = require("body-parser")
var mysql = require('mysql');

var router = express.Router();
var jsonParser = bodyParser.json();

/* Declarando conexão MySQL */
var con = mysql.createConnection({
    host: "host",
    user: "user",
    password: "password",
    database: "database"
});

con.connect((err) => {
    if (err) throw err;
});

/* Determinando função GET
  (onde o cliente acessa
  uma url e recebe dados)  */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* Determinando função GET
  (onde o cliente envia e
  nós recebemos os dados)  */
router.post("/", jsonParser, (req, res, next) => {

    var response = { message: "", success: null };
    if(!req.body.telefone || !req.body.nome || !(typeof req.body.telefone == "string") || !(typeof req.body.nome == "string") || req.body.telefone == "" || req.body.nome == "") {
        response.message = "empty";
        response.success = false;
        res.send(response);
        return;
    }
    /* MySQL query */
    var phoneTest = /\(\d{2}\)\s\d{4,5}\-\d{4}/;
    if(phoneTest.test(req.body.telefone)){
        con.query('SELECT * FROM usuarios WHERE telefone = ?', [req.body.telefone], (err, result, fields) => {
            if (err) throw err;

            if (result.length > 0){

                response.message = "registered";
                response.success = true;
                res.send(response);

            } else {
                var usuario =  { telefone: req.body.telefone, nome: req.body.nome };
                con.query('INSERT INTO usuarios SET ?', usuario, (err, result, fields) => {
                    if (err) throw err;
                    /* inserir no banco de dados */
                    response.success = true;
                    response.message = "successful";
                    res.send(response);
                });
                /* dar ok para o cliente */
            }
        });
    } else {
        response.success = false;
        response.message = "invalid";
        res.send(response);
    }
});

module.exports = router;
