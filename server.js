import {Sequelize, DataTypes} from 'sequelize';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const bearerToken = 'Bearer aaa.eyJzdWIiOiIxMjMifQ.bbb';
const token = bearerToken.slice(7);
const header = bearerToken.split(' ')[0];
const payload = bearerToken.split('.')[1];
const signature = bearerToken.split('.')[2];

if(!token)
  console.log('No token provided');

console.log('Token is valid');
console.log('Bearer Token:', token);
console.log('Header:', header);
console.log('Payload:', payload);
console.log('Signature:', signature);

dotenv.config();

const UseSSL = process.env.PGSSLMODE === 'require';
const DB_SCHEMA = process.env.DB_SCHEMA;
const app = express();

app.use(cors())
app.use(express.json())

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  dialectOptions: UseSSL
    ? {
        SSL: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined,
  define: {
    schema: DB_SCHEMA,
  },
});

const puppies =sequelize.define('puppies', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  breed: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  schema: DB_SCHEMA,
  tableName: 'puppies',
  timestamps: false,
});

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  const PORT = process.env.PORT || 5001;
  
  const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    await puppies.sync({ alter: true });
    console.log(`Puppies model synced in schema "${DB_SCHEMA}".`);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error: ', err);
    process.exit(1);  // Exit with failure code
  }
};

startServer();