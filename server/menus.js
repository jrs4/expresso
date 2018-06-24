const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = menusRouter;

//Middleware
menusRouter.param('menuId', (req, res, next, id) => {
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

menusRouter.param('menuItemId', (req, res, next, id) => {
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
menusRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Menu", (error, data) => {
        if (error) {
            throw error;
        } else {
            res.send({menus: data});
        }
    })
});

menusRouter.post('/', (req, res, body) => {
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
menusRouter.get('/:menuId', (req, res, next) => {
    res.send({menu: req.menu});
});

menusRouter.put('/:menuId', (req, res, next) => {
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

menusRouter.delete('/:menuId', (req, res, next) => {
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
menusRouter.get('/:menuId/menu-items', (req, res, next) => {
    const menuItems = [];
    db.each('SELECT * FROM MenuItem WHERE menu_id = $id', {$id: req.menu.id}, (error, row) => {
        menuItems.push(row);
    }, (error, numOfRows) => {
        res.send({menuItems: menuItems});
    })
});

menusRouter.post('/:menuId/menu-items', (req, res, body) => {
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

///:menuId/menu-items/:menuItemId
menusRouter.put('/:menuId/menu-items/:menuItemId', (req, res, next) => {
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

menusRouter.delete('/:menuId/menu-items/:menuItemId', (req, res, next) => {
    db.run('DELETE FROM MenuItem WHERE id = $id', {$id: req.menuItem.id}, (error) => {
        res.status(204).send();
    });
});