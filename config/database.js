const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DATABASE CONNECTED SUCCESSFULLY"))
    .catch((error) => {
      console.log("DATABASE CONNECTION FAILED", error);
      process.exit(1);
    });
};

module.exports = connectDatabase;
