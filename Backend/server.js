const express = require('express'); //framework for building web servers in Node.js
const mysql = require('mysql2'); //used to connect and query mysql database
const cors = require('cors'); //allows frontend to access backend

const app = express();
app.use(express.json()); //middleware to parse incoming JSON requests, allowing the server to access the data sent in the request body as a JavaScript object through req.body
app.use(cors()); //applies CORS middleware to allow requests from different origins

require('dotenv').config();

function sanitizeString(str) {
  return str.replace(/[^a-zA-Z0-9 .,!?@'-]/g, '');
} //sanitizes user input by removing any characters that are not letters, numbers, spaces, or common punctuation marks. This helps ensure only safe characters are included in the input.


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.log('DB connection failed:', err);
  } else {
    console.log('DB connected successfully');
  }
});

app.get('/', (req, res) => {
  return res.json('From backend side');
})

//here, data is all expense records
app.get('/expense', (req, res) => {
  const sql = 'SELECT e.expense_id, c.category_name, e.amount, e.date, e.expense_description, IF(e.necessity = 1, "Yes", "No") AS necessity FROM expense e JOIN categories c ON e.category_id = c.category_id';
  db.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.get('/categories', (req, res) => {
  const sql = 'SELECT * FROM categories';
  db.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    } 
  });
});

app.get('/expense/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT e.expense_id, c.category_name, e.amount, e.date, e.expense_description, e.necessity FROM expense e JOIN categories c ON e.category_id = c.category_id WHERE e.expense_id = ?';
  db.query(sql, [id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data[0]); // return single expense object
  });
});

app.get('/report', (req, res) => {
  const categoryName = sanitizeString(req.query.category_name); //categoryName is the query parameter sent from the frontend to specify which category of expenses to filter by for the report. This allows the backend to know which category's expenses to retrieve and return in the response.)
  const sql = 'SELECT e.expense_id, c.category_name, e.amount, e.date, e.expense_description, e.necessity FROM expense e JOIN categories c ON e.category_id = c.category_id WHERE c.category_name = ?';
  db.query(sql, [categoryName], (err, data) => {
    if (err) return res.json([]); // return empty array if there's an error, so that the frontend can handle it gracefully without crashing. This way, if there's an issue with the database query or connection, the frontend will simply receive an empty report instead of an error message, allowing it to continue functioning without interruption.]);
    return res.json(data); // return filtered expense objects
  });
});

app.post('/create', (req, res) => {
  //const {category_name, amount, date, expense_description, necessity} = req.body;
  const category_name = sanitizeString(req.body.category_name);
  const expense_description = sanitizeString(req.body.expense_description);
  const amount = req.body.amount;
  const date = req.body.date;
  const necessity = req.body.necessity;

  let necessityValue = null;
  if (necessity === 'true') {
    necessityValue = 1;
  } else {
    necessityValue = 0;
  }

  //starting a transaction to ensure that both the retrieval of category_id and the insertion of the new expense record are treated as a single atomic operation. This means that if any part of the process fails , such as an error fetching the category_id or inserting the expense, the entire transaction can be rolled back to maintain data integrity in the database.
  db.beginTransaction(err => {
    if (err) {//if the transaction fails to start, stop it immediately
      return res.json("error starting transaction: " + err);
    }
  
    //finding the category id using a prepared statement to prevent SQL injection
    db.query('SELECT category_id FROM categories WHERE category_name = ?', [category_name], (err, data) => {
      if (err || data.length === 0) { //if the query fails or the category does not exist, the transaction is rolled back so no partial operations are saved and consistency is maintained in the database. 
        return db.rollback(() => {
          return res.json("error fetching category_id: " + (err || "Category not found"));
        });
      }

      categoryId = data[0].category_id; //extract the category_id from the query result
  
      //insert the expense using the extracted category_id and other details from the request using a prepared statement. If the insertion fails, the transaction is rolled back to prevent any partial data from being saved
      db.query("INSERT INTO expense (category_id, amount, date, expense_description, necessity) VALUES (?, ?, ?, ?, ?)",
        [categoryId, amount, date, expense_description, necessityValue], (err, data) => {
          if (err) {
            return db.rollback(() => {
              return res.json("error inserting expense: " + err);
            });
          }

          //commit the trasaction to save changes in the database if both the select and the insert queries are successful. If the commit fails, the transaction is rolled back 
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                return res.json("error committing transaction: " + err);
              });
            }
            return res.json(data); //return success response after successful commit
          });
        }
      );
    });
  });
}); //creating an expense and inserting it into the table. We first need to get the category_id from the categories table based on the category_name provided in the request body, and then we can insert the new expense record into the expense table with the corresponding category_id and other details.


app.put('/update/:id', (req, res) => {
  //const {category_name, amount, date, expense_description, necessity} = req.body;
  const category_name = sanitizeString(req.body.category_name);
  const expense_description = sanitizeString(req.body.expense_description);
  const amount = req.body.amount;
  const date = req.body.date;
  const necessity = req.body.necessity;

  let necessityValue = null;
  if (necessity === 'true') {
    necessityValue = 1;
  } else {
    necessityValue = 0;
  }
  let categoryId;
  db.query('SELECT category_id FROM categories WHERE category_name = ?', [category_name], (err, data) => {
    if (err) {
      return res.json(err);
    }
    categoryId = data[0].category_id;
  
  
    const sql = "UPDATE expense SET category_id = ?, amount = ?, date = ?, expense_description = ?, necessity = ? WHERE expense_id = ?";
    const values = [
      categoryId, 
      amount, 
      date, 
      expense_description, 
      necessityValue
    ];
    const id = req.params.id;

    db.query(sql, [...values, id], (err, data) => {
      if (err) return res.json("error"+err);
      return res.json(data);
    });
  });
}); //updating an existing expense record. Similar to the create endpoint, we first need to get the category_id based on the category_name provided in the request body, and then we can update the existing expense record in the expense table with the new details using the expense_id provided as a URL parameter.


app.delete('/delete/:id', (req, res) => {
  const sql = "DELETE FROM expense WHERE expense_id = ?";
  const id = req.params.id;
  
  db.query(sql, [id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
  
}); //delete records by id


app.listen(8081, '0.0.0.0', () => {
  console.log('Server is running on port 8081');
});