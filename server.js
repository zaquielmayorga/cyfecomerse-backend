const express = require("express");
const app = express();
const { Pool } = require("pg");
const bodyParser = require("body-parser");

// middleware
app.use(bodyParser.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_ecommerce",
  password: "migracode",
  port: 5432,
});

app.get("/customers", async (req, res) => {
  try {
    await pool
      .query("SELECT * FROM customers")
      .then((result) => res.json(result.rows));
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/customers/:customerId", async (req, res) => {
  try {
    await pool
      .query("SELECT * FROM customers WHERE id = $1", [req.params.customerId])
      .then((result) => res.json(result.rows[0]));
  } catch (err) {
    console.error(err.message);
  }
});

app.post("/customers", async (req, res) => {
  try {
    const newCustomerName = req.body.name;
    const newCustomerAddress = req.body.address;
    const newCustomerCity = req.body.city;
    const newCustomerCountry = req.body.country;
    const query =
      "INSERT INTO customers (name, address, city, country) VALUES ($1, $2, $3, $4)";

    await pool
      .query(query, [
        newCustomerName,
        newCustomerAddress,
        newCustomerCity,
        newCustomerCountry,
      ])
      .then((results) => res.send("New Customer added successfully."));
  } catch (err) {
    console.error(err.message);
  }
});

app.patch("/customers/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const newCustomerName = req.body.name;
    const newCustomerAddress = req.body.address;
    const newCustomerCity = req.body.city;
    const newCustomerCountry = req.body.country;

    await pool
      .query("SELECT * FROM customers WHERE id=$1;", [customerId])
      .then(async (result) => {
        if (result.rows.length > 0) {
          const customer = result.rows[0];

          if (req.body.name !== "" && req.body.name !== undefined) {
            customer.name = newCustomerName;
          }
          if (req.body.address !== "" && req.body.address !== undefined) {
            customer.address = newCustomerAddress;
          }
          if (req.body.city !== "" && req.body.city !== undefined) {
            customer.city = newCustomerCity;
          }
          if (req.body.country !== "" && req.body.country !== undefined) {
            customer.country = newCustomerCountry;
          }

          await pool
            .query(
              "UPDATE customers SET name=$2, address=$3, city=$4, country=$5 WHERE id=$1",
              [
                customer.id,
                customer.name,
                customer.address,
                customer.city,
                customer.country,
              ]
            )
            .then(() => res.send(`Customer ${customerId} updated!`));
        } else {
          return res
            .status(400)
            .send(
              "There is not a customer with that ID in our database. Please try again with a valid customer ID."
            );
        }
      });
  } catch (err) {
    console.error(err.message);
  }
});

app.delete("/customers/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;

    await pool
      .query("SELECT * FROM customers WHERE id=$1", [customerId])
      .then(async (result) => {
        if (result.rows.length === 1) {
          await pool
            .query("SELECT * FROM orders WHERE customer_id=$1", [customerId])
            .then(async (result) => {
              if (result.rows.length === 0) {
                await pool
                  .query("DELETE FROM customers WHERE id=$1", [customerId])
                  .then(() => res.send(`Customer ${customerId} deleted!`));
              } else {
                return res
                  .status(400)
                  .send(
                    "There is at least one order with this customer ID, Please delete all orders related to this user before deleting it."
                  );
              }
            });
        } else {
          return res
            .status(400)
            .send(
              "There is not a customer with that ID in our database. Please try again with a valid customer ID."
            );
        }
      });
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/suppliers", function (req, res) {
  pool.query("SELECT * FROM suppliers", (error, result) => {
    res.json(result.rows);
  });
});

app.get("/products", async (req, res) => {
  try {
    if (req.query.name) {
      await pool
        .query(
          "SELECT * FROM products WHERE product_name LIKE '%' || $1 || '%'",
          [req.query.name]
        )
        .then((result) => res.json(result.rows));
    } else {
      await pool
        .query("SELECT * FROM products")
        .then((result) => res.json(result.rows));
    }
  } catch (err) {
    console.error(err.message);
  }
});

app.post("/products", async (req, res) => {
  try {
    const newProductName = req.body.name;
    const newProductPrice = req.body.price;
    const newProductSupplierId = req.body.supplier;

    await pool
      .query("SELECT * FROM suppliers WHERE id = $1", [newProductSupplierId])
      .then(async (result) => {
        if (result.rows.length > 0) {
          if (parseInt(newProductPrice) > 0) {
            const query =
              "INSERT INTO products (product_name, unit_price, supplier_id) VALUES ($1, $2, $3)";
            await pool
              .query(query, [
                newProductName,
                newProductPrice,
                newProductSupplierId,
              ])
              .then((results) => res.send("New Product added successfully."));
          } else {
            res.status(400).send("The product price must be greater than 0.");
          }
        } else {
          return res
            .status(400)
            .send(
              "There is not a supplier with that ID in our database. Please try again with a valid supplier ID."
            );
        }
      });
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/customers/:customerId/orders", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const query = `SELECT
      order_reference, 
      order_date, 
      product_name, 
      unit_price, 
      suppliers.supplier_name as supplier, 
      quantity
      FROM order_items
      JOIN orders
      ON order_items.order_id = orders.id
      JOIN products
      ON order_items.product_id = products.id
      JOIN suppliers
      ON products.supplier_id = suppliers.id
      JOIN customers
      ON orders.customer_id = customers.id
      WHERE customer_id = $1`;
    await pool
      .query(query, [customerId])
      .then((result) => res.json(result.rows));
  } catch (err) {
    console.error(err.message);
  }
});

app.post("/customers/:customerId/orders", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const newOderDate = req.body.date;
    const newOrderReference = req.body.reference;

    await pool
      .query("SELECT * FROM customers WHERE id = $1", [customerId])
      .then(async (result) => {
        if (result.rows.length > 0) {
          const query =
            "INSERT INTO orders (order_date, order_reference, customer_id) VALUES ($1, $2, $3)";
          await pool
            .query(query, [newOderDate, newOrderReference, customerId])
            .then((result) => res.send("New Order added successfully."));
        } else {
          return res
            .status(400)
            .send(
              "There is not a customer with that ID in our database. Please try again with a valid customer ID."
            );
        }
      });
  } catch (err) {
    console.error(err.message);
  }
});

app.delete("/orders/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;

    await pool
      .query("DELETE FROM order_items WHERE order_id=$1", [orderId])
      .then(async () => {
        await pool
          .query("DELETE FROM orders WHERE id=$1", [orderId])
          .then(() => res.send(`Order ${orderId} deleted!`));
      });
  } catch (err) {
    console.error(err.message);
  }
});

app.listen(3000, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});

// const express = require("express");
// const app = express();
// const port = 3221;
// const bodyParser = require("body-parser");
// const { Pool } = require("pg");

// app.use(bodyParser.json());

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "cyf_ecommerce",
//   password: "migracode",
//   port: 5432,
// });

// // If you don't have it already, add a new GET endpoint /products to load all the product names along with their supplier names.
// // Update the previous GET endpoint /products to filter the list of products by name using a query parameter, for example /products?name=Cup. This endpoint should still work even if you don't use the name query parameter!

// app.get("/products", (req, res) => {
//   const name = req.query.name;
//   const query = name
//     ? pool.query(
//         "SELECT products.product_name, suppliers.supplier_name FROM products JOIN suppliers ON products.supplier_id = suppliers.id WHERE products.product_name = $1",
//         [name]
//       )
//     : pool.query(
//         "SELECT products.product_name, suppliers.supplier_name FROM products JOIN suppliers ON products.supplier_id = suppliers.id"
//       );
//   query
//     .then((result) => res.json(result.rows))
//     .catch((e) => {
//       console.error(e);
//       res.send(e, 500);
//     });
// });

// // Add a new GET endpoint /customers/:customerId to load a single customer by ID.
// app.get("/customers/:customerId", (req, res) => {
//   const { customerId } = req.params;
//   pool
//     .query("select * from customers c where c.id = $1", [customerId])
//     .then((result) => {
//       if (result.rows.length === 0) {
//         res.sendStatus(404);
//       } else {
//         res.json(result.rows[0]);
//       }
//     })
//     .catch((e) => {
//       console.error(e);
//       res.send(e, 500);
//     });
// });

// // Add a new POST endpoint /customers to create a new customer.

// // Add a new POST endpoint /products to create a new product (with a product name, a price and a supplier id). Check that the price is a positive integer and that the supplier ID exists in the database, otherwise return an error.

// // Add a new POST endpoint /customers/:customerId/orders to create a new order (including an order date, and an order reference) for a customer. Check that the customerId corresponds to an existing customer or return an error.

// // Add a new PUT endpoint /customers/:customerId to update an existing customer (name, address, city and country).

// // Add a new DELETE endpoint /orders/:orderId to delete an existing order along all the associated order items.

// // Add a new DELETE endpoint /customers/:customerId to delete an existing customer only if this customer doesn't have orders.

// // Add a new GET endpoint /customers/:customerId/orders to load all the orders along the items in the orders of a specific customer. Especially, the following information should be returned: order references, order dates, product names, unit prices, suppliers and quantities.

// app.listen(port, () => console.log(`Example app listening on port port!`));
