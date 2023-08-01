import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import rootRouter from './routes/rootRoute';
import userRouter from './routes/userRoute';
import boardRouter from './routes/boardRoute';
import apiRouter from './routes/apiRoute';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const path = require('path');
const swaggerSpec = YAML.load(path.join(__dirname, '../build/swagger.yaml'));

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(corsMiddleware);
app.use(cors());
//Swagger 관련

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/user', userRouter);
app.use('/board', boardRouter);

//Swagger locall api
// app.listen(3300, function () {
//   console.log('Server Running at http://127.0.0.1:3300');
// });
export default app;
