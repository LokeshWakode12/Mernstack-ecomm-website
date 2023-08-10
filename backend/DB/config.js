const mongoose = require('mongoose');
const connctDb = async() => {
    try {
        const connect = await mongoose.connect('mongodb+srv://admin:admin@lokeshcluster.rph1lyp.mongodb.net/e-comm');
        console.log("Database Connnected:", connect.connection.host, connect.connection.name);
    } catch (err) {
        console.log(err);
        process.exit[1];
    }
};

module.exports = connctDb ;