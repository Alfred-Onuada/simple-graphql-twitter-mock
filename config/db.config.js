import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT,
  storage: process.env.DB_PATH
})

try {
  await sequelize.authenticate();
  console.log("Database connection successful");
} catch (error) {
  console.log(`Database connection failed: ${error}`);
  throw Error("DB connect failed");
}

export default sequelize;