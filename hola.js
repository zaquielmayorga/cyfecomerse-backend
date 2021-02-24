// const express = require("express");
// const app = express();

// const { Pool } = require("pg");
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());

// const secrets = require("./secrets.json");
// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "postgres",
//   password: secrets.password,
//   port: 5432,
// });
// Get message
// app.get("/message", (request, response) => {
//   response.send("hola");
// });
// const zaquiel = (request, response) => {
//   response.send("hola");
// };

// const GetFromDataBase = (request, response) => {
//   pool.query("select * from hotels", (error, result) => {
//     response.send(result.rows);
//   });
// };
// app.get("/getFromDB", GetFromDataBase);

// app.post("/hotels", function (req, res) {
//   const newHotelName = req.body.name;
//   const newHotelRooms = req.body.rooms;
//   const newHotelPostcode = req.body.postcode;

//   const query =
//     "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";

//   pool
//     .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
//     .then(() => res.send("Hotel created!"))
//     .catch((e) => console.error(e));
// });

// app.post("/customers", function (req, res) {
//   const newCustomersName = req.body.name;
//   const newCustomersEmail = req.body.email;
//   const newCustomersAddress = req.body.address;
//   const newCustomersCity = req.body.city;
//   const newCustomersPostcode = req.body.postcode;
//   const newCustomersCountry = req.body.country;

//   const query =
//     "INSERT INTO customers (name, email, address, city, postcode, country) VALUES ($1, $2, $3, $4, $5,$6)";

//   pool
//     .query(query, [
//       newCustomersName,
//       newCustomersEmail,
//       newCustomersAddress,
//       newCustomersCity,
//       newCustomersPostcode,
//       newCustomersCountry,
//     ])
//     .then(() => res.send("Customers created!"))
//     .catch((e) => console.error(e));
// });

// app.put("/customers/:customerId", function (req, res) {
//   const customerId = req.params.customerId;
//   const newEmail = req.body.email;

//   pool
//     .query("UPDATE customers SET email=$1 WHERE id=$2", [newEmail, customerId])
//     .then(() => res.send(`Customer ${customerId} updated!`))
//     .catch((e) => console.error(e));
// });

// app.delete("/customers/:customerId", function (req, res) {
//   const customerId = req.params.customerId;

//   pool
//         .query("DELETE FROM bookings WHERE customer_id=$1", [customerId])
//         .then(() => {
//             pool
//                 .query("DELETE FROM customers WHERE id=$1", [customerId])
//                 .then(() => res.send(`Customer ${customerId} deleted!`))
//                 .catch((e) => console.error(e));
//         })
//         .catch((e) => console.error(e));
// };

// app.listen(4001, () => {
//   console.log("welcomed");
// });

// ejerccio 2 semana 20

// Add the GET endpoints /hotels and /hotels/:hotelId mentioned above and try to use these endpoints with Postman.
// Add a new GET endpoint /customers to load all customers ordered by name.
// Add a new GET endpoint /customers/:customerId to load one customer by ID.
// Add a new GET endpoint /customers/:customerId/bookings to load all the bookings of a specific customer. Returns the following information: check in date, number of nights, hotel name, hotel postcode.
// app.get("/hotels/:hotelId", function (req, res) {
//   const hotelId = req.params.hotelId;
//   pool
//     .query("SELECT * FROM hotels WHERE id=$1", [hotelId])
//     .then((result) => res.json(result.rows))
//     .catch((e) => console.error(e));
// });
// app.get("/customers", function (req, res) {
//   let query = `SELECT * FROM customers ORDER BY name`;
//   pool
//     .query(query)
//     .then((result) => res.json(result.rows))
//     .catch((e) => console.error(e));
// });
// app.get("/customers/:customerId", function (req, res) {
//   const customerId = req.params.customerId;
//   pool
//     .query("SELECT * FROM customers WHERE id=$1", [customerId])
//     .then((result) => res.json(result.rows))
//     .catch((e) => console.error(e));
// });
// app.get("/customers/:customerId/bookings", function (req, res) {
//   const customerId = req.params.customerId;
//   pool
//     .query(
//       `SELECT bookings.checkin_date, bookings.nights, hotels.name, hotels.postcode FROM bookings INNER JOIN hotels ON hotels.id = bookings.hotel_id where bookings.customer_id = $1`,
//       [customerId]
//     )
//     .then((result) => res.json(result.rows))
//     .catch((e) => console.error(e));
// });

// ejercicio 3 semana 20
// Add the PUT endpoint /customers/:customerId and verify you can update a customer email using Postman.
// Add validation for the email before updating the customer record in the database. If the email is empty, return an error message.
// Add the possibility to also update the address, the city, the postcode and the country of a customer. Be aware that if you want to update the city only for example, the other fields should not be changed!

// /////////////////////////////////////////////////////////////////////////
// CODIGO DE  EL PROFESOR

// const express = require("express")
// const bodyParser = require('body-parser');
// const app = express()
// const port = 3000
// const {
//     Pool
// } = require("pg")
// const secrets = require('./secrets.json')
// const pool = new Pool({
//     user: "eduar",
//     host: "localhost",
//     database: "20201215_hotels",
//     password: secrets.password,
//     port: 5432,
// })
// // FUNCTIONS
// const getHotels = (request, response) => {
//     pool
//         .query("SELECT * FROM hotels")
//         .then((result) => response.json(result.rows))
//         .catch((e) => console.error(e))
// }
// const postHotel = (request, response) => {
//     const newHotelName = request.body.name;
//     const newHotelRooms = request.body.rooms;
//     const newHotelPostcode = request.body.postcode;
//     const query = "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
//     pool
//         .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
//         .then(() => response.send("Hotel created!"))
//         .catch((e) => console.error(e));
// }
// const postCustomer = (request, response) => {
//     const name = request.body.name;
//     const email = request.body.email;
//     const address = request.body.address;
//     const city = request.body.city;
//     const postcode = request.body.postcode;
//     const country = request.body.country;
//     const query = "INSERT INTO customers (name, email, address, city, postcode, country) VALUES ($1, $2, $3, $4, $5, $6)";
//     pool
//         .query(query, [name, email, address, city, postcode, country])
//         .then(() => response.send("Customer created!"))
//         .catch((e) => console.error(e));
// }
// const updateCustomerEmail = (request, response) => {
//     const customerId = request.params.customerId;
//     const newEmail = request.body.email;
//     pool
//         .query("UPDATE customers SET email=$1 WHERE id=$2", [newEmail, customerId])
//         .then(() => response.send(`Customer ${customerId} updated!`))
//         .catch((e) => console.error(e));
// }
// const deleteCustomer = (req, res) => {
//     const customerId = req.params.customerId;
//     pool
//         .query("DELETE FROM bookings WHERE customer_id=$1", [customerId])
//         .then(() => {
//             pool
//                 .query("DELETE FROM customers WHERE id=$1", [customerId])
//                 .then(() => res.send(`Customer ${customerId} deleted!`))
//                 .catch((e) => console.error(e));
//         })
//         .catch((e) => console.error(e));
// };
// // ENDPOINTS
// app.get("/hotels", getHotels)
// app.use(bodyParser.json());
// app.post("/hotels", postHotel)
// app.post("/customers", postCustomer)
// app.put("/customers/:customerId", updateCustomerEmail)
// app.delete("/customers/:customerId", deleteCustomer)
// app.listen(port, () => console.log(`Server is listening on port ${port}.`))
