var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon_db"
});

connection.connect(function(err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
    queryProducts();
});
  
function queryProducts() {
connection.query("SELECT * FROM products", function(err, res) {
    for (var i = 0; i < res.length; i++) {
    console.log(`${res[i].id} | ${res[i].product_name} | ${res[i].department} | ${res[i].price} | ${res[i].stock_quantity}`);
    }
    console.log("-----------------------------------");
    prompt();
});
}

function prompt() {
    inquirer.prompt([{
        name: 'prodID',
        message: 'What is the ID of the product you would like to buy?',
        type: 'input'
    },{
        name: 'prodQuantity',
        message: 'How many of this product would you like to buy?',
        type: 'input'
    }]).then(function(ans) {
        checkQuantity(ans);
    })}

function checkQuantity(ans) {
    connection.query("SELECT * FROM products WHERE id = ?", [ans.prodID], function(err, res) {
       if (ans.prodQuantity > res[0].stock_quantity) {
           console.log('Not enough in stock. Come back later');
       } else {
           console.log('Congrats, You got it!');
           var newQuantity = res[0].stock_quantity - ans.prodQuantity;
           updateProducts(ans.prodID, newQuantity);
           purchaseCost(ans.prodQuantity, res[0].price)
       }
    })
}

function updateProducts(id, quantity) {
    var query = connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: quantity
        },
        {
          id: id
        }
      ],
      function(err, res) {
        console.log(res.affectedRows + " products updated!\n");
      }
    );
    console.log(query.sql);
  }

function purchaseCost(quantity, price) {
    var result = quantity * price;
    console.log(`Your purchase cost $${result}`);
}