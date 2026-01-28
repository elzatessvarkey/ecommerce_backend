import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Check if running on AWS Elastic Beanstalk with RDS
const isAWSEnvironment = process.env.RDS_HOSTNAME && process.env.RDS_PORT && process.env.RDS_DB_NAME;

let sequelize;

if (isAWSEnvironment) {
  // AWS RDS MySQL Configuration
  sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.RDS_HOSTNAME,
    port: parseInt(process.env.RDS_PORT, 10),
    database: process.env.RDS_DB_NAME,
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      connectTimeout: 60000,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
  console.log('📊 Connected to AWS RDS MySQL Database');
} else {
  // Local SQLite Configuration
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_PATH || './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
  console.log('💾 Connected to SQLite Database');
}

export default sequelize;