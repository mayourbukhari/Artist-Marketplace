const mongoose = require('mongoose');
const Artwork = require('./server/models/Artwork');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkArtworks() {
  try {
    console.log('Checking artworks in database...');
    
    // Get total count
    const totalCount = await Artwork.countDocuments();
    console.log(`Total artworks in database: ${totalCount}`);
    
    // Get published and public artworks
    const publishedCount = await Artwork.countDocuments({ status: 'published', isPublic: true });
    console.log(`Published and public artworks: ${publishedCount}`);
    
    // Get all artworks with their status
    const allArtworks = await Artwork.find({}, 'title status isPublic availability artist createdAt').populate('artist', 'email').sort({ createdAt: -1 }).limit(10);
    
    console.log('\nRecent artworks:');
    allArtworks.forEach((artwork, index) => {
      console.log(`${index + 1}. "${artwork.title}" - Status: ${artwork.status}, Public: ${artwork.isPublic}, Availability: ${artwork.availability}, Artist: ${artwork.artist?.email || 'Unknown'}, Created: ${artwork.createdAt}`);
    });
    
    // Check for any drafts or non-public artworks
    const drafts = await Artwork.countDocuments({ status: 'draft' });
    const nonPublic = await Artwork.countDocuments({ isPublic: false });
    
    console.log(`\nDraft artworks: ${drafts}`);
    console.log(`Non-public artworks: ${nonPublic}`);
    
  } catch (error) {
    console.error('Error checking artworks:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkArtworks();
