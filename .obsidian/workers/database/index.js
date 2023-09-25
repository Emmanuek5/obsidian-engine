const fs = require("fs");
const mysql = require("mysql");
const mongoose = require("mongoose");
const path = require("path");
const EventEmitter = require("events"); // Import the EventEmitter module

class Database {
  constructor(dbName) {
    this.dbName = dbName;
    this.tables = {};
    this.save();
    this.load();
  }

  createTable(tableName) {
    if (!this.tables[tableName]) {
      this.tables[tableName] = new Table();
      return true;
    } else {
      return false;
    }
  }

  getTable(tableName) {
    return this.tables[tableName];
  }

  listTables() {
    return Object.keys(this.tables);
  }

  save() {
    const data = {
      tables: {},
    };
    if (!fs.existsSync(path.join(__dirname + "/data"))) {
      fs.mkdirSync(path.join(__dirname + "/data"));
    }
    for (const tableName in this.tables) {
      data.tables[tableName] = this.tables[tableName].toJSON();
    }

    const jsonContent = JSON.stringify(data, null, 4);

    fs.writeFileSync(
      path.join(__dirname + "/data", `${this.dbName}.json`),
      jsonContent
    );
  }

  async toMongoDB(mongoDBUrl) {
    try {
      // Open a connection to the MongoDB server using Mongoose
      await mongoose.connect(mongoDBUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const mongoDBData = this.toMongoDBFormat();

      for (const tableName in mongoDBData) {
        const Model = mongoose.model(tableName, new mongoose.Schema({}));

        // Insert data into the MongoDB collection
        await Model.insertMany(mongoDBData[tableName]);
      }

      console.log("Data sent to MongoDB server successfully");
    } catch (error) {
      console.error("Error sending data to MongoDB server:", error);
    } finally {
      // Close the Mongoose connection
      mongoose.connection.close();
    }
  }

  toSQL(host, username, password, database) {
    const connection = mysql.createConnection({
      host: host,
      user: username,
      password: password,
      database: database,
    });

    connection.connect((err) => {
      if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
      }

      console.log("Connected to MySQL");

      for (const tableName in this.tables) {
        const tableData = this.tables[tableName].data;

        // Create the table
        let createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (id INT PRIMARY KEY AUTO_INCREMENT, `;

        // Assume the first row has keys for column names
        const columnNames = Object.keys(tableData[0]);

        for (const columnName of columnNames) {
          createTableQuery += `${columnName} VARCHAR(255), `;
        }

        createTableQuery = createTableQuery.slice(0, -2); // Remove the last comma and space
        createTableQuery += ");";

        connection.query(createTableQuery, (err, result) => {
          if (err) {
            console.error("Error creating table:", err);
          } else {
            console.log(`Table ${tableName} created`);
          }
        });

        // Insert data into the table
        for (const row of tableData) {
          let insertQuery = `INSERT INTO ${tableName} (`;
          insertQuery += columnNames.join(", ") + ") VALUES (";
          insertQuery +=
            columnNames.map((col) => `'${row[col]}'`).join(", ") + ");";

          connection.query(insertQuery, (err, result) => {
            if (err) {
              console.error("Error inserting data:", err);
            } else {
              console.log(`Data inserted into ${tableName}`);
            }
          });
        }
      }

      connection.end((err) => {
        if (err) {
          console.error("Error closing connection:", err);
        } else {
          console.log("Connection closed");
        }
      });
    });
  }

  add(module) {
    if (typeof module === "object" && module instanceof Table) {
      if (module.name !== "") {
        if (!this.tables[module.name]) {
          this.tables[module.name] = module;
          module.on("save", () => {
            this.save();
          });
          return true;
        } else {
          // Table already exists, append data to the existing table
          this.tables[module.name].insertData(module.data);
          module.on("save", () => {
            this.save();
          });
          return true;
        }
      } else {
        console.error("The Table name is not defined.");
        return false;
      }
    } else {
      console.error("The table module must be an instance of Table.");
      return false;
    }
  }

  load() {
    const data = fs.readFileSync(
      path.join(__dirname + "/data", `${this.dbName}.json`),
      "utf8"
    );

    const jsonContent = JSON.parse(data);

    for (const tableName in jsonContent.tables) {
      const table = new Table();
      table.insertData(jsonContent.tables[tableName].data);
      this.tables[tableName] = table;
    }
  }
}

class Table extends EventEmitter {
  // Extend EventEmitter
  constructor() {
    super(); // Call the constructor of the EventEmitter class
    this.data = [];
    this.name = "";
    this.schema = {}; // Store the table schema as an object
  }

  addId() {
    let id = 1;

    for (const row of this.data) {
      row.id = id;
      id++;
    }
  }

  // Set the table schema
  setSchema(schema) {
    this.schema = schema;
  }

  // Insert a row into the table
  insert(row) {
    // Validate that the inserted row matches the schema
    const schemaKeys = Object.keys(this.schema);
    const rowKeys = Object.keys(row);

    if (!schemaKeys.every((key) => rowKeys.includes(key))) {
      console.error("Inserted row doesn't match the table schema.");
      return;
    }

    for (const key in this.schema) {
      if (this.schema[key].required && !row[key]) {
        console.error(
          `Column '${key}' is required but not provided in the inserted row.`
        );
        return;
      }
    }

    this.data.push(row);
    this.addId();
    this.emit("save");
    // Emit the 'save' event after inserting a row
  }

  insertData(data) {
    this.data = data;
    this.emit("save");
  }

  selectAll() {
    return this.data;
  }

  toJSON() {
    return {
      data: this.data,
    };
  }

  find(query) {
    const results = [];

    for (const row of this.data) {
      let match = true;

      for (const key in query) {
        if (row[key] !== query[key]) {
          match = false;
          break;
        }
      }

      if (match) {
        results.push(row);
      }
    }

    return results;
  }

  findAndUpdate(query, update) {
    const results = this.find(query);
    if (results.length > 0) {
      const updatedRow = results[0];
      for (const key in update) {
        updatedRow[key] = update[key];
      }
      this.emit("save");
      return true;
    } else {
      return false;
    }
    // Emit the 'save' event after updating a row
  }

  findAndDelete(query) {
    const results = this.find(query);
    if (results.length > 0) {
      const index = this.data.indexOf(results[0]);
      this.data.splice(index, 1);
      this.emit("save");
      return true;
    } else {
      return false;
    }
    // Emit the 'save' event after deleting a row
  }
}

module.exports = {
  Database,
  Table,
};
