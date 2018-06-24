const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = employeesRouter;

//Middleware
employeesRouter.param('employeeId', (req, res, next, id) => {
    db.each('SELECT * FROM Employee WHERE id = $id', {$id: id}, (error, data) => {
        if (error) {
            res.status(404).send('Employee does not exist');
        } else {
            req.employee = data;
            next();
        }
    }, (error, numOfRows) => {
        if (!req.employee) {
            res.status(404).send('Employee does not exist');
        }
    });   
});

employeesRouter.param('timesheetId', (req, res, next, id) => {
    db.each('SELECT * FROM Timesheet WHERE id = $id', {$id: id}, (error, data) => {
        if (error) {
            res.status(404).send('Timesheet does not exist');
        } else {
            req.timesheet = data;
            next();
        }
    }, (error, numOfRows) => {
        if (!req.timesheet) {
            res.status(404).send('Timesheet does not exist');
        }
    });   
});

/*****************Routes*********************/
employeesRouter.get('/', (req, res, next) => {
    let employed = [];
    db.each("SELECT * FROM Employee", (error, row) => {
        if (error) {
            throw error;
        } else {
            if (row.is_current_employee) {
                employed.push(row);
            }
        }
    }, (error, numOfRows) => {
        res.send({employees: employed});
    });
});

employeesRouter.post('/', (req, res, body) => {
    const employee = req.body.employee;
    if (employee.name && employee.position && employee.wage) {
        db.run('INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)', {
            $name: employee.name,
            $position: employee.position,
            $wage: employee.wage
        }, function (error) {
            if (error) {
                throw error;
            } else {
                db.get('SELECT * FROM Employee WHERE id = $id', {
                    $id: this.lastID
                }, (error, row) => {
                    if (error) {
                        throw error;
                    } else {
                        res.status(201).send({employee: row});
                    }
                })
            }
        });
    } else {
        res.status(400).send();
    }
});

///:employeeId
employeesRouter.get('/:employeeId', (req, res, next) => {
    res.send({employee: req.employee});
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const currentEmployee = req.employee;
    const updateData = req.body.employee;
    if (updateData.name && updateData.position && updateData.wage) {
        currentEmployee.name =updateData.name;
        currentEmployee.position =updateData.position;
        currentEmployee.wage =updateData.wage;
        db.run('UPDATE Employee SET name = $name, position = $position, wage = $wage', {
            $name: currentEmployee.name,
            $position: currentEmployee.position,
            $wage: currentEmployee.wage
        }, (error) => {
            res.send({employee: currentEmployee});
        })
    } else {
        res.status(400).send();
    }
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    req.employee.is_current_employee = 0;
    db.run('UPDATE Employee SET is_current_employee = 0',  (error) => {
        res.send({employee: req.employee});
    })    
});

///:employeeId/timesheets
employeesRouter.get('/:employeeId/timesheets', (req, res, next) => {
    const timesheets = [];
    db.each('SELECT * FROM Timesheet WHERE employee_id = $id', {$id: req.employee.id}, (error, row) => {
        timesheets.push(row);
    }, (error, numOfRows) => {
        res.send({timesheets: timesheets});
    })
});

employeesRouter.post('/:employeeId/timesheets', (req, res, body) => {
    const timesheet = req.body.timesheet;
    if (timesheet.hours && timesheet.rate && timesheet.date) {
        db.run('INSERT INTO Timesheet (hours, rate, date, employee_id) ' +
               'VALUES ($hours, $rate, $date, $employee_id)', {
            $hours: timesheet.hours,
            $rate: timesheet.rate,
            $date: timesheet.date,
            $employee_id: req.employee.id
        }, function (error) {
            if (error) {
                throw error;
            } else {
                db.get('SELECT * FROM Timesheet WHERE id = $id', {
                    $id: this.lastID
                }, (error, row) => {
                    if (error) {
                        throw error;
                    } else {
                        res.status(201).send({timesheet: row});
                    }
                })
            }
        });
    } else {
        res.status(400).send();
    }
});

///:employeeId/timesheets/:timesheetId
employeesRouter.put('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
    const currentTimesheet = req.timesheet;
    const updateData = req.body.timesheet;
    if (updateData.hours && updateData.rate && updateData.date) {
        currentTimesheet.hours =updateData.hours;
        currentTimesheet.rate =updateData.rate;
        currentTimesheet.date =updateData.date;
        db.run('UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date', {
            $hours: currentTimesheet.hours,
            $rate: currentTimesheet.rate,
            $date: currentTimesheet.date
        }, (error) => {
            res.send({timesheet: currentTimesheet});
        })
    } else {
        res.status(400).send();
    }
});

employeesRouter.delete('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
    db.run('DELETE FROM Timesheet WHERE id = $id', {$id: req.timesheet.id}, (error) => {
        res.status(204).send();
    });
});
