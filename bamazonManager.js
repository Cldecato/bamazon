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
    promptManager();
});

function promptManager() {
    inquirer.prompt({
    name: 'options',
    message: 'Which function would you like to perform?',
    type: 'rawlist',
    choices: [
        'View Products for Sale',
        'View Low Inventory',
        'Add to Inventory',
        'Add New Product'
    ]
    }).then(function(answer) {
        switch (answer.options) {
        case 'View Products for Sale':
            viewProducts();
            break;
        case 'View Low Inventory':
            lowInventory();
            break;
        case 'Add to Inventory':
            addInventory();
            break;
        case 'Add New Product':
            addProduct();
            break;
        }
    })   
}

function viewProducts() {
    connection.query('SELECT product_name FROM products', function(err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log(`\n${res[i].product_name}`);
        }
    })  
}

function lowInventory() {
    connection.query('SELECT product_name, stock_quantity FROM products WHERE (stock_quantity < 6)', function(err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log(`\n${res[i].product_name} | ${res[i].stock_quantity}`);
        }
    })  
}

function addInventory() {
    connection.query('SELECT product_name FROM products', function(err, res) {
        var opts = [];
        for (var i = 0; i < res.length; i++) {
            opts.push(res[i].product_name);
        }
        inquirer.prompt([{
            name: 'item',
            message: 'Which item would you like to add stock to?',
            type: 'list',
            choices: opts
        },{
            name: 'inventory',
            message: 'How much stock would you like to add?',
            type: 'input'
        }
        ]).then(function(ans) {
            connection.query('SELECT stock_quantity FROM products WHERE product_name = ?', [ans.item], function(err, response) {
                connection.query('UPDATE products SET ? WHERE ?', [{ stock_quantity : (response[0].stock_quantity + ans.inventory)},{ product_name : ans.item}], function(err, res) {
                    console.log(`You have added ${ans.inventory} stock to ${ans.item}`);
                })
            })  
        })
    })
}

function addProduct() {
    inquirer.prompt([{
        name: 'item',
        message: 'What item would you like to add?',
        type: 'input'
    },{
        name: 'stock',
        message: 'How many of this item would you like to add?',
        type: 'input'
    },{
        name: 'department',
        message: 'What department is this item a part of?',
        type: 'input',
    },{
        name: 'price',
        message: 'What id the cost per item of this item?',
        type: 'input'
    }]).then(function(ans) {
        connection.query('INSERT INTO products SET ?',
        {
            product_name: ans.item,
            stock_quantity: ans.stock,
            department: ans.department,
            price: ans.price
        }) 
    })
}

