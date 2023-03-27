const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');

//if we want to use this file variable in app.js file then we have config the file before requiring the app file
//So again we couldn't read the process variableinside app.js because it wasn't yet configured.

// our collection of model or our tour model is created in test db not in natours db but jonas tour model is created in natours database becuase in conncetion url which is present in process.env where jonas write the natuors in that url but we didn't becuase our url is different
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.set('strictQuery', true);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true, not supported
    // useFindAndModify: false, not suppoerted
    // useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection sucessful');
  });

//always Model first letter of firstName always in capital it is just a convention to identify that it is model

// console.log(process.env);
const port = 3000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
