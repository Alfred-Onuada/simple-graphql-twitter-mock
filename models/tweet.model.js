import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";
import Person from "./person.model.js";

const Tweet = sequelize.define('tweet', {
    _id: {
        type: DataTypes.UUIDV4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    likes: {
        type: DataTypes.NUMBER,
        defaultValue: 0
    }
})

// creates the person field automatically
Tweet.belongsTo(Person, {
    foreignKey: 'person' // this allows you to change the default name, by default it would be "Person"+"_id"
});

// sync the models so I can use them
await sequelize.sync();

export default Tweet;