const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = app;

/* Do not change the following line! It is required for testing and allowing
*  the frontend application to interact as planned with the api server
*/
const PORT = process.env.PORT || 4000;

// Middware for parsing request bodies
app.use(bodyParser.json());

// Middleware for handling CORS requests from index.html
app.use(cors());

//Middleware for logging
morgan('tiny');

//Route Middlewares
app.param('employeeId', (req, res, next, id) => {
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

app.param('timesheetId', (req, res, next, id) => {
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

app.param('menuId', (req, res, next, id) => {
    db.each('SELECT * FROM Menu WHERE id = $id', {$id: id}, (error, data) => {
        if (error) {
            res.status(404).send('Menu does not exist');
        } else {
            req.menu = data;
            next();
        }
    }, (error, numOfRows) => {
        if (!req.menu) {
            res.status(404).send('Menu does not exist');
        }
    });   
});

app.param('menuItemId', (req, res, next, id) => {
    db.each('SELECT * FROM MenuItem WHERE id = $id', {$id: id}, (error, data) => {
        if (error) {
            res.status(404).send('Menu Item does not exist');
        } else {
            req.menuItem = data;
            next();
        }
    }, (error, numOfRows) => {
        if (!req.menuItem) {
            res.status(404).send('Menu Item does not exist');
        }
    });   
});


/*****************Routes*********************/
//employees
app.get('/api/employees', (req, res, next) => {
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

app.post('/api/employees', (req, res, body) => {
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

//employees/:employeeId
app.get('/api/employees/:employeeId', (req, res, next) => {
    res.send({employee: req.employee});
});

app.put('/api/employees/:employeeId', (req, res, next) => {
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

app.delete('/api/employees/:employeeId', (req, res, next) => {
    req.employee.is_current_employee = 0;
    db.run('UPDATE Employee SET is_current_employee = 0',  (error) => {
        res.send({employee: req.employee});
    })    
});

//employees/:employeeId/timesheets
app.get('/api/employees/:employeeId/timesheets', (req, res, next) => {
    const timesheets = [];
    db.each('SELECT * FROM Timesheet WHERE employee_id = $id', {$id: req.employee.id}, (error, row) => {
        timesheets.push(row);
    }, (error, numOfRows) => {
        res.send({timesheets: timesheets});
    })
});

app.post('/api/employees/:employeeId/timesheets', (req, res, body) => {
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

//employees/:employeeId/timesheets/:timesheetId
app.put('/api/employees/:employeeId/timesheets/:timesheetId', (req, res, next) => {
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

app.delete('/api/employees/:employeeId/timesheets/:timesheetId', (req, res, next) => {
    db.run('DELETE FROM Timesheet WHERE id = $id', {$id: req.timesheet.id}, (error) => {
        res.status(204).send();
    });
});

//menus
app.get('/api/menus', (req, res, next) => {
    db.all("SELECT * FROM Menu", (error, data) => {
        if (error) {
            throw error;
        } else {
            res.send({menus: data});
        }
    })
});

app.post('/api/menus', (req, res, body) => {
    const menu = req.body.menu;
    if (menu.title) {
        db.run('INSERT INTO Menu (title) VALUES ($title)', {$title: menu.title}, function (error) {
            if (error) {
                throw error;
            } else {
                db.get('SELECT * FROM Menu WHERE id = $id', {
                    $id: this.lastID
                }, (error, row) => {
                    if (error) {
                        throw error;
                    } else {
                        res.status(201).send({menu: row});
                    }
                })
            }
        });
    } else {
        res.status(400).send();
    }
});

//menus/:menuId
app.get('/api/menus/:menuId', (req, res, next) => {
    res.send({menu: req.menu});
});

app.put('/api/menus/:menuId', (req, res, next) => {
    const currentMenu = req.menu;
    const updateData = req.body.menu;
    if (updateData.title) {
        currentMenu.title = updateData.title;
        db.run('UPDATE Menu SET title = $title', {$title: currentMenu.title}, (error) => {
            res.send({menu: currentMenu});
        })
    } else {
        res.status(400).send();
    }
});

app.delete('/api/menus/:menuId', (req, res, next) => {
    let hasRelatedItems = false;
    db.each('SELECT * FROM MenuItem WHERE menu_id = $menu_id', {$menu_id: req.menu.id}, (error, row) => {
        hasRelatedItems = true;
    }, (error, numOfRows) => {
        if(hasRelatedItems) {
            res.status(400).send();
        } else {
            db.run('DELETE FROM Menu WHERE id = $id', {$id: req.menu.id}, (error) => {
                res.status(204).send();
            });
        }
    });
});

//menus/:menuId/menu-items
app.get('/api/menus/:menuId/menu-items', (req, res, next) => {
    const menuItems = [];
    db.each('SELECT * FROM MenuItem WHERE menu_id = $id', {$id: req.menu.id}, (error, row) => {
        menuItems.push(row);
    }, (error, numOfRows) => {
        res.send({menuItems: menuItems});
    })
});

app.post('/api/menus/:menuId/menu-items', (req, res, body) => {
    const menuItem = req.body.menuItem;
    if (menuItem.name && menuItem.description && menuItem.inventory && menuItem.price) {
        db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) ' +
               'VALUES ($name, $description, $inventory, $price, $menu_id)', {
            $name: menuItem.name,
            $description: menuItem.description,
            $inventory: menuItem.inventory,
            $price: menuItem.price,
            $menu_id: req.menu.id
        }, function (error) {
            if (error) {
                throw error;
            } else {
                db.get('SELECT * FROM MenuItem WHERE id = $id', {
                    $id: this.lastID
                }, (error, row) => {
                    if (error) {
                        throw error;
                    } else {
                        res.status(201).send({menuItem: row});
                    }
                })
            }
        });
    } else {
        res.status(400).send();
    }
});

//menus/:menuId/menu-items/:menuItemId
app.put('/api/menus/:menuId/menu-items/:menuItemId', (req, res, next) => {
    const currentMenuItem = req.menuItem;
    const updateData = req.body.menuItem;
    if (updateData.name && updateData.description && updateData.inventory && updateData.price) {
        currentMenuItem.name =updateData.name;
        currentMenuItem.description =updateData.description;
        currentMenuItem.inventory =updateData.inventory;
        currentMenuItem.price =updateData.price;
        db.run('UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price', {
            $name: currentMenuItem.name,
            $description: currentMenuItem.description,
            $inventory: currentMenuItem.inventory,
            $price: currentMenuItem.price
        }, (error) => {
            res.send({menuItem: currentMenuItem});
        })
    } else {
        res.status(400).send();
    }
});

app.delete('/api/menus/:menuId/menu-items/:menuItemId', (req, res, next) => {
    db.run('DELETE FROM MenuItem WHERE id = $id', {$id: req.menuItem.id}, (error) => {
        res.status(204).send();
    });
});

// This conditional is here for testing purposes:
if (!module.parent) { 
  // Add your code to start the server listening at PORT below:
  app.listen(PORT, () => console.log('I am listening!'));
}