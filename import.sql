create database `eat`;
use `eat`;
create table users (
    id int NOT NULL AUTO_INCREMENT,
    email varchar(30) NOT NULL,
    number varchar(11) NOT NULL,
    firstname varchar(20) NOT NULL,
    lastname varchar(20) NOT NULL,
    hash varchar(128) NOT NULL,
    token varchar(128) NOT NULL,
    smail varchar(128) NOT NULL,
    `online` TIMESTAMP(6),
    `double` varchar(10) NOT NULL,
    createdAt date NOT NULL,
    updatedAt date NOT NULL,
    PRIMARY KEY (id)
);
create table auths (
    id int NOT NULL AUTO_INCREMENT,
    user int NOT NULL,
    `double` varchar(10) NOT NULL,
    platforma varchar(50) NOT NULL,
    device varchar(15) NOT NULL,
    ip varchar(15) NOT NULL,
    createdAt date NOT NULL,
    updatedAt date NOT NULL,
    PRIMARY KEY (id)
);
create table stores (
    id int NOT NULL AUTO_INCREMENT,
    name varchar(30) NOT NULL,
    info varchar(512) NOT NULL,
    categories varchar(128) NOT NULL,
    image varchar(256) NOT NULL,
    `admin` int NOT NULL,
    createdAt date NOT NULL,
    updatedAt date NOT NULL,
    PRIMARY KEY (id)
);
create table products (
    id int NOT NULL AUTO_INCREMENT,
    name varchar(30) NOT NULL,
    info varchar(512) NOT NULL,
    category varchar(64) NOT NULL,
    price int NOT NULL,
    store int NOT NULL,
    image1 varchar(256),
    image2 varchar(256),
    image3 varchar(256),
    createdAt date NOT NULL,
    updatedAt date NOT NULL,
    PRIMARY KEY (id)
);
create table comments (
    id int NOT NULL AUTO_INCREMENT,
    author int NOT NULL,
    product int NOT NULL,
    content varchar(256) NOT NULL,
    createdAt date NOT NULL,
    updatedAt date NOT NULL,
    PRIMARY KEY (id)
);
create table stars (
    id int NOT NULL AUTO_INCREMENT,
    product int NOT NULL,
    rating int NOT NULL,
    author int NOT NULL,
    createdAt date NOT NULL,
    updatedAt date NOT NULL,
    PRIMARY KEY (id)
);
create table carts (
    id int NOT NULL AUTO_INCREMENT,
    user int NOT NULL,
    product int NOT NULL,
    `count` int NOT NULL,
    createdAt date NOT NULL,
    updatedAt date NOT NULL,
    PRIMARY KEY (id)
);
create table chats (
    id int NOT NULL AUTO_INCREMENT,
    user1 int NOT NULL,
    user2 int NOT NULL,
    createdAt date NOT NULL,
    updatedAt date NOT NULL,
    PRIMARY KEY (id)
);
create table messages (
    id int NOT NULL AUTO_INCREMENT,
    content varchar(256) NOT NULL,
    sender int NOT NULL,
    chatid int NOT NULL,
    createdAt date NOT NULL,
    updatedAt date NOT NULL,
    PRIMARY KEY (id)
);

