import express from 'express';
import helmet from 'helmet';

const app = express();

app.use(express.json());//uso express
app.use(helmet());//uso helmet 

export default app;