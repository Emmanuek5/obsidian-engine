const { Table } = require("../modules");
const table = new Table();
table.name = "users";

table.setSchema({
    username: {
        type: "string",
        required: true,
    },
    password: {
        type: "string",
        required: true,
    },
    email: {
        type: "string",
        required: true,
        unique: true
    },
    });


module.exports = table;

