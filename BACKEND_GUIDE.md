# Artist Marketplace Backend Development Guide

## **Overview**
This guide provides comprehensive instructions for developing and maintaining the Artist Marketplace backend using Node.js, Express, and MongoDB.

## **1. Project Setup**

### **Prerequisites**
- Node.js (v18+ recommended)
- MongoDB (v5.0+ recommended)
- Git
- Cloudinary account (for image storage)
- Stripe/Razorpay account (for payments)

### **Installation Steps**

```bash
# Clone the repository
git clone https://github.com/mayourbukhari/Artist-Marketplace.git
cd Artist-Marketplace

# Install dependencies
npm install

# Install additional packages for enhanced features
npm install compression morgan nodemailer crypto stripe

# Copy environment variables
cp .env.example .env

# Fill in your environment variables in .env
```

### **Environment Configuration**
Update your `.env` file with the following configurations:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/artist-marketplace

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourartistmarketplace.com

# Cloud Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## **2. Database Design and Models**

### **Key Models**
- **User**: Handles user authentication and profiles
- **Artwork**: Manages artwork listings and details
- **Order**: Handles purchase transactions
- **Commission**: Manages custom artwork requests
- **Mentorship**: Handles mentorship programs

### **Database Connection**
```javascript
// Enhanced connection with proper error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
```

## **3. API Endpoints**

### **Commissions API**

## **4. Authentication and Authorization**

### **JWT Implementation**
```javascript
// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### **Role-Based Access Control**
```javascript
// Middleware for different roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role ${req.user.role} not authorized` 
      });
    }
    next();
  };
};

// Usage examples
app.use('/api/admin', auth, authorize('admin'));
app.use('/api/artist-only', auth, authorize('artist'));
app.use('/api/premium', auth, requirePremium);
```

## **5. File Upload and Cloud Storage**

### **Multer Configuration**
```javascript
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads', file.fieldname);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // File type validation
    const allowedTypes = /jpeg|jpg|png|webp|gif|mp4|webm|gltf|glb/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

### **Cloudinary Integration**
```javascript
const cloudinary = require('cloudinary').v2;

const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      folder: 'artist-marketplace',
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};
```

## **6. Error Handling**

### **Global Error Handler**
```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};
```

## **7. API Testing**

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx jest auth.test.js
```

### **Sample Test Structure**
```javascript
describe('Authentication API', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI_TEST);
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('Should register a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'buyer'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.name).toBe(userData.name);
  });
});
```

## **8. Security Best Practices**

### **Middleware Stack**
```javascript
// Security middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(morgan('combined')); // Logging
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // Rate limiting
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); // CORS
app.use(express.json({ limit: '10mb' })); // Body parsing
```

### **Input Validation**
```javascript
const { body, validationResult } = require('express-validator');

const validateTourCreation = [
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('description').trim().isLength({ min: 10, max: 500 }),
  body('type').isIn(['gallery', 'studio', 'timeline', 'exhibition']),
  body('tags').optional().isArray({ max: 10 })
];
```

## **9. Performance Optimization**

### **Database Indexing**
```javascript
// Add indexes to frequently queried fields
userSchema.index({ email: 1 });
virtualTourSchema.index({ artist: 1, status: 1 });
virtualTourSchema.index({ featured: 1, 'analytics.views': -1 });
virtualTourSchema.index({ tags: 1 });
```

### **Caching Strategies**
- Use Redis for session management
- Implement query result caching
- Cache popular tours and artist profiles
- Use CDN for static assets

## **10. Deployment**

### **Production Considerations**
1. **Environment Variables**: Ensure all production credentials are secure
2. **Database**: Use MongoDB Atlas or similar managed service
3. **File Storage**: Configure Cloudinary for production
4. **Process Management**: Use PM2 for process management
5. **Logging**: Implement structured logging (Winston)
6. **Monitoring**: Set up application monitoring (New Relic, DataDog)

### **Docker Configuration**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## **11. API Documentation**

Use tools like Swagger/OpenAPI for API documentation:

```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Artist Marketplace API',
      version: '1.0.0',
      description: 'API for Artist Marketplace Platform'
    },
    servers: [{ url: '/api' }]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

## **12. Monitoring and Logging**

### **Structured Logging**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## **Quick Start Commands**

```bash
# Development
npm run dev

# Production
npm start

# Testing
npm test

# Database setup
npm run db:seed

# Build client
npm run build
```

This comprehensive backend provides a solid foundation for your Artist Marketplace with features like virtual tours, user authentication, file uploads, and comprehensive API endpoints with proper error handling and security measures.
