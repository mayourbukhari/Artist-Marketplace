# 🎨 Artist Marketplace

A modern e-commerce platform built with MERN stack that empowers artists to showcase and sell their artwork directly to collectors and art enthusiasts worldwide.

![Artist Marketplace](https://i.ibb.co/jk3Fckfw/Chat-GPT-Image-Jun-24-2025-10-47-42-AM.png)

## ✨ Features

### 🎭 For Artists
- **Professional Portfolios** - Create stunning artist profiles with bio, statement, and social links
- **Artwork Management** - Upload high-resolution images with detailed descriptions and pricing
- **Sales Dashboard** - Track sales, revenue, and customer analytics
- **Commission System** - Accept custom artwork requests with price negotiation
- **Verification Badges** - Get verified status for enhanced credibility

### 🖼️ For Art Collectors
- **Advanced Search** - Find art by style, medium, price, color, and dimensions
- **High-Quality Viewing** - Zoom and explore artworks in detail
- **Make Offers** - Negotiate prices directly with artists
- **Wishlist & Collections** - Save and organize favorite pieces
- **Secure Transactions** - Safe payment processing with buyer protection

### 🔧 Platform Features
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Image Protection** - Watermarking and right-click protection
- **Shipping Integration** - Automated shipping calculator and tracking
- **Review System** - Build trust through verified reviews
- **Social Features** - Follow artists and share collections

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface framework
- **Redux Toolkit** - State management
- **Material-UI** - Component library
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling

### Third-Party Services
- **Cloudinary** - Image storage and optimization
- **Stripe** - Payment processing
- **SendGrid** - Email notifications
- **Google Maps API** - Shipping addresses

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/artist-marketplace.git
   cd artist-marketplace
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/artist-marketplace
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
   
   # Email Service
   SENDGRID_API_KEY=your-sendgrid-api-key
   FROM_EMAIL=noreply@yourartistmarketplace.com
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   # Start both client and server
   npm run dev
   
   # Or start them separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

## 📁 Project Structure

```
artist-marketplace/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Redux store
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Express backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Server utilities
│   └── server.js         # Server entry point
├── uploads/              # Temporary file uploads
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Artworks
- `GET /api/artworks` - Get all artworks (with filters)
- `GET /api/artworks/:id` - Get artwork by ID
- `POST /api/artworks` - Create new artwork
- `PUT /api/artworks/:id` - Update artwork
- `DELETE /api/artworks/:id` - Delete artwork

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Artists
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get artist profile
- `POST /api/artists/verify` - Request artist verification

## 🎯 Usage Examples

### Artist Registration
```javascript
// Register as an artist
const artistData = {
  email: "artist@example.com",
  password: "securepassword",
  role: "artist",
  profile: {
    name: "Jane Doe",
    bio: "Contemporary abstract artist...",
    specialties: ["Abstract", "Acrylic"],
    location: "New York, NY"
  }
};

const response = await axios.post('/api/auth/register', artistData);
```

### Upload Artwork
```javascript
// Upload new artwork
const formData = new FormData();
formData.append('title', 'Sunset Dreams');
formData.append('description', 'A vibrant abstract piece...');
formData.append('price', 850);
formData.append('category', 'painting');
formData.append('images', fileInput.files[0]);

const artwork = await axios.post('/api/artworks', formData);
```

### Search Artworks
```javascript
// Search with filters
const searchParams = {
  category: 'painting',
  minPrice: 100,
  maxPrice: 1000,
  medium: 'acrylic',
  style: 'abstract'
};

const results = await axios.get('/api/artworks', { params: searchParams });
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/           # End-to-end tests
```

## 🚀 Deployment

### Production Build
```bash
# Build the client
cd client
npm run build

# The build folder will be created with optimized production files
```

### Environment Setup
1. Set `NODE_ENV=production` in your environment variables
2. Use production database URI
3. Configure production Stripe keys
4. Set up proper CORS origins
5. Enable HTTPS in production

### Deployment Options
- **Heroku** - Easy deployment with Git integration
- **Vercel** - Frontend deployment with serverless functions
- **DigitalOcean** - Full-stack deployment on VPS
- **AWS** - Scalable cloud deployment

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow ES6+ JavaScript standards
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- 📖 Check the [Documentation](docs/)
- 🐛 Report bugs in [Issues](https://github.com/yourusername/artist-marketplace/issues)
- 💬 Join our [Discord Community](https://discord.gg/artist-marketplace)
- 📧 Email support: support@artistmarketplace.com

### FAQ

**Q: How do I become a verified artist?**
A: Upload verification documents through your artist dashboard and wait for admin approval.

**Q: What payment methods do you support?**
A: We support all major credit cards, PayPal, and bank transfers through Stripe.

**Q: Can I sell prints of my original artwork?**
A: Yes! You can list both original pieces and prints with different pricing.

**Q: How are shipping costs calculated?**
A: Shipping costs are automatically calculated based on artwork dimensions, weight, and destination.

## 🔮 Roadmap

### Phase 1 (Current)
- [x] User authentication system
- [x] Basic artwork upload and display
- [x] Search and filtering
- [x] Shopping cart and checkout
- [x] Artist profiles

### Phase 2 (Next Release)
- [ ] Advanced commission system
- [ ] Artist verification process
- [ ] Mobile app (React Native)
- [ ] AR artwork preview
- [ ] Social media integration

### Phase 3 (Future)
- [ ] NFT marketplace integration
- [ ] Virtual gallery tours
- [ ] AI-powered art recommendations
- [ ] Multi-language support
- [ ] Artist mentorship program

## 🏆 Acknowledgments

- **Design Inspiration** - Saatchi Art, Artsy, Etsy
- **Icons** - Heroicons, Lucide React
- **Images** - Unsplash, Pexels
- **Community** - All the amazing artists and developers who contribute

---

**Made with ❤️ by Mohsin, for artists**

*Star ⭐ this repository if you found it helpful!*
