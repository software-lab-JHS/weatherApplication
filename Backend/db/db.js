const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/userRegistration', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to the database successfully');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error.message);
  });
