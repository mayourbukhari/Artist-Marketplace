const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Simple test server to check artwork creation
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Artwork = require('./server/models/Artwork');

// Test route to get all artworks
app.get('/test/artworks', async (req, res) => {
  try {
    const artworks = await Artwork.find({})
      .populate('artist', 'email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`Found ${artworks.length} artworks in database`);
    
    res.json({
      total: artworks.length,
      artworks: artworks.map(artwork => ({
        id: artwork._id,
        title: artwork.title,
        status: artwork.status,
        isPublic: artwork.isPublic,
        availability: artwork.availability,
        artist: artwork.artist?.email,
        createdAt: artwork.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test route to get artworks with gallery filter
app.get('/test/gallery-artworks', async (req, res) => {
  try {
    const filter = { status: 'published', isPublic: true };
    
    const artworks = await Artwork.find(filter)
      .populate('artist', 'email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`Found ${artworks.length} gallery artworks with filter:`, filter);
    
    res.json({
      total: artworks.length,
      filter,
      artworks: artworks.map(artwork => ({
        id: artwork._id,
        title: artwork.title,
        status: artwork.status,
        isPublic: artwork.isPublic,
        availability: artwork.availability,
        artist: artwork.artist?.email,
        createdAt: artwork.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching gallery artworks:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.TEST_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log(`- http://localhost:${PORT}/test/artworks`);
  console.log(`- http://localhost:${PORT}/test/gallery-artworks`);
});
