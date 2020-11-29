const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'eat', 'root', '', { host: 'localhost', dialect: 'mysql' }
);

const users = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(30),
        allowNull: false
    },
    number: {
        type: Sequelize.STRING(11),
        allowNull: false
    },
    firstname: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    lastname: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    hash: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
    token: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
    smail: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
    double: {
        type: Sequelize.STRING(10),
        allowNull: false
    }
});

const auth = sequelize.define('auths', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    user: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    double: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    platforma: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    device: {
        type: Sequelize.STRING(15),
        allowNull: false
    },
    ip: {
        type: Sequelize.STRING(15),
        allowNull: false
    }
});

const store = sequelize.define('stores', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    admin: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(30),
        allowNull: false
    },
    info: {
        type: Sequelize.STRING(512),
        allowNull: false
    },
    categories: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
    image: {
        type: Sequelize.STRING(256),
        allowNull: false
    }
});

const product = sequelize.define('products', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(30),
        allowNull: false
    },
    info: {
        type: Sequelize.STRING(512),
        allowNull: false
    },
    category: {
        type: Sequelize.STRING(64),
        allowNull: false
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    store: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    image1: {
        type: Sequelize.STRING(256),
        allowNull: true
    },
    image2: {
        type: Sequelize.STRING(256),
        allowNull: true
    },
    image3: {
        type: Sequelize.STRING(256),
        allowNull: true
    },
});

const star = sequelize.define('stars', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    author: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    product: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    rating: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

const comment = sequelize.define('comments', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    author: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    product: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    content: {
        type: Sequelize.STRING(256),
        allowNull: false
    }
});

sequelize.authenticate().then(function (err) {
    console.log('Connection has been established successfully.');
}).catch(function (err) {
    console.log('Unable to connect to the database:', err);
});

module.exports = { users, auth, store, product, comment, star }