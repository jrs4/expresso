const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const logNodeError = error => {
    if (error) {
        throw error;
    }
}

db.serialize(() => {  
    //Create Employee Table
    db.run('DROP TABLE IF EXISTS Employee', logNodeError);
    db.run('CREATE TABLE Employee (id INTEGER PRIMARY KEY, ' +  
                                  'name TEXT NOT NULL, ' +
                                  'position TEXT NOT NULL, ' +
                                  'wage TEXT NOT NULL, ' +
                                  'is_current_employee INTEGER DEFAULT 1);', logNodeError);
                                
    //Create Timesheet Table
    db.run('DROP TABLE IF EXISTS Timesheet', logNodeError);
    db.run('CREATE TABLE Timesheet (id INTEGER PRIMARY KEY, ' +  
                                    'hours INTEGER NOT NULL, ' +
                                    'rate INTEGER NOT NULL, ' +
                                    'date INTEGER NOT NULL, ' +
                                    'employee_id INTEGER NOT NULL);', logNodeError);
                                
    //Create Menu Table
    db.run('DROP TABLE IF EXISTS Menu', logNodeError);
    db.run('CREATE TABLE Menu (id INTEGER PRIMARY KEY, ' +  
                              'title TEXT NOT NULL);', logNodeError);
                              
    //Create MenuItem Table
    db.run('DROP TABLE IF EXISTS MenuItem', logNodeError);
    db.run('CREATE TABLE MenuItem (id INTEGER PRIMARY KEY, ' +  
                                  'name TEXT NOT NULL, ' +
                                  'description TEXT NOT NULL, ' +
                                  'inventory INTEGER NOT NULL, ' +
                                  'price INTEGER NOT NULL, ' +
                                  'menu_id INTEGER NOT NULL);', logNodeError);
});