const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dummyEvents = require('./dummyData');
const Event = require('../models/eventModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

// Delete all existing events
const deleteData = async () => {
  try {
    await Event.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Import dummy data
const importData = async () => {
  try {
    await Event.create(dummyEvents);
    console.log('Data successfully imported!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
