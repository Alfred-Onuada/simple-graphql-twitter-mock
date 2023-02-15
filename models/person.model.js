import { Sequelize, DataTypes } from "sequelize";
import sequelize from './../config/db.config.js';

const Person = sequelize.define('Person', {
    _id: {
        type: DataTypes.UUIDV4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true 
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    bio: {
        type: DataTypes.STRING
    }
})

// sync the model so I can use them
await sequelize.sync();

export default Person;