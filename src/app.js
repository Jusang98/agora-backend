import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import rootRouter from './Routes/rootRouter';
const { sequelize } = require('./models');

const app = express();

// const whiteList = [
//   'http://localhost:3000',
//   'http://localhost:8080',
//   process.env.EC2_PORT,
// ];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whiteList.indexOf(origin) !== -1) {
//       // 만일 whitelist 배열에 origin인자가 있을 경우
//       callback(null, true); // cors 허용
//     } else {
//       callback(new Error('Not Allowed Origin!')); // cors 비허용
//     }
//   },
// };
const corsConfig = {
  origin: ['http://localhost:3000', 'http://localhost:8080'],
};

app.use(cors(corsConfig));

app.set('view engine', 'pug');
app.set('views', process.cwd() + '/src/views');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  next();
});

// app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', rootRouter);

export default app;
