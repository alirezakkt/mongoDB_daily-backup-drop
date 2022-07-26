const { spawn } = require('child_process');
const path = require('path');
const cron = require('node-cron');

  // newdb is the database we drop
  var url = "mongodb://localhost:27017/testdb";
 
  // create a client to mongodb
  var MongoClient = require('mongodb').MongoClient;

/* 
Basic mongo dump and restore commands, they contain more options you can have a look at man page for both of them.
1. mongodump --db=rbac_tutorial --archive=./rbac.gzip --gzip
2. mongorestore --db=rbac_tutorial --archive=./rbac.gzip --gzip

Using mongodump - without any args:
  will dump each and every db into a folder called "dump" in the directory from where it was executed.
Using mongorestore - without any args:
  will try to restore every database from "dump" folder in current directory, if "dump" folder does not exist then it will simply fail.
*/
//enter your database name
const DB_NAME = 'testdb';
//save your backup file in dbbackup dir
const ARCHIVE_PATH = path.join(__dirname, 'dbbackup', `${DB_NAME}.${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate()}.gzip`);

//  Cron expression for every night at 00:00 hours (0 0 * * * ) after 3 sec drop DATAbase

// Scheduling the backup every 5 seconds (using node-cron)
cron.schedule('0 0 * * *', () => backupMongoDB());
cron.schedule('3 0 * * *', () => dropDatabase());
const { promisify } = require('util');
// const exec = promisify(require('child_process').exec)

function backupMongoDB() {
  const child = spawn('mongodump', [
    `--db=${DB_NAME}`,
    `--archive=${ARCHIVE_PATH}`,
    '--gzip',
  ]);

  child.stdout.on('data', (data) => {
    console.log('stdout:\n', data);
  });
  child.stderr.on('data', (data) => {
    console.log('stderr:\n', Buffer.from(data).toString());
  });
  child.on('error', (error) => {
    console.log('error:\n', error);
  });
  child.on('exit', (code, signal) => {
    if (code) console.log('Process exit with code:', code);
    else if (signal) console.log('Process killed with signal:', signal);
    else console.log('Backup is successfull ✅');
  
  });
 
}
function dropDatabase() {
  var mongoose = require('mongoose');
/* Connect to the DB */
mongoose.connect('mongodb://localhost/testdb',function(){
  console.log("connected to DB")
    /* Drop the DB */
    mongoose.connection.db.dropDatabase();
    console.log("DB droped")
});
}