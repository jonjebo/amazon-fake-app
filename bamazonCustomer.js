var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('connected')
});

function getProducts() {
    var query = "SELECT * from products";
    connection.query(query, function (err, res) {
        if (err) {
            console.log(err)
            return
        } else {
            res.map((item, i) => {
                console.log(item.item_id, item.product_name, item.price);
            })
            buyProduct();
        }
    });
}
getProducts();

function buyProduct() {
    inquirer
        .prompt([{
                name: "id",
                type: "input",
                message: "What is the ID of the product you would like to buy?: ",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "howMany",
                type: "input",
                message: "How many units of the product would you like to buy?: ",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            checkQuantity(answer.id, answer.howMany);
        });

}

function checkQuantity(id, howMany) {
    connection.query('SELECT * from products WHERE item_id = ?', id, function (err, res) {
        if (err) {
            console.log(err)
            return
        } else {
            if (howMany > res[0].stock_quantity) {
                console.log(`Insufficient quantity!`);
                return
            } else {
                placeOrder(id, howMany, res[0].stock_quantity);
            }
        }
    });
}

function placeOrder(id, orderQuantity, mysqlQuantity) {
    let newQuantity = mysqlQuantity - orderQuantity
    connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', [newQuantity, id], function (err, res) {
        connection.query('SELECT * FROM products WHERE item_id = ?', [id], function (err, res) {
            console.log("Remaining Quantity: " + res[0].stock_quantity);
        });
    });
}
//How to return the updated rows after and update query string//