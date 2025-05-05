import express from 'express';  
import bodyParser from 'body-parser'; 
import cors from 'cors';
import userRoutes from './api/user/index.js'; 
import adminRoutes from './api/admin/index.js';
import categoryRoutes from './api/categories/categoryRoutes.js';
import productRoutes from './api/products/productRoutes.js';
import checkoutRoutes from './api/checkout/checkoutRoutes.js';
import ordersRoutes from './api/orders/orderRoutes.js';
import webhookRoutes from './api/webhook/webhookRoutes.js';
import performanceRoutes from './api/performance/performanceRoutes.js';

const app = express();

app.use(express.json());

// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:5000'], 
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

app.use(cors());
// Middleware to parse JSON requests
app.use(bodyParser.json());

// Use the user registration route
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/api', checkoutRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api', performanceRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to EStore!');
});

// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
