const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Artwork = require('./server/models/Artwork');
    const User = require('./server/models/User');
    
    const artworks = await Artwork.find()
      .populate('artist', 'profile.firstName profile.lastName artistProfile.name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`\nFound ${artworks.length} artworks in database:`);
    
    artworks.forEach((artwork, index) => {
      const artistName = artwork.artist?.artistProfile?.name || 
                        `${artwork.artist?.profile?.firstName || ''} ${artwork.artist?.profile?.lastName || ''}`.trim() ||
                        'Unknown Artist';
      console.log(`${index + 1}. "${artwork.title}" by ${artistName} - Created: ${artwork.createdAt.toLocaleString()}`);
      console.log(`   Category: ${artwork.category}, Price: $${artwork.price || 0}, Images: ${artwork.images?.length || 0}`);
    });
    
    // Check total count
    const totalCount = await Artwork.countDocuments();
    console.log(`\nTotal artworks in database: ${totalCount}`);
    
    // Check users with artist role
    const artists = await User.find({ role: 'artist' }).select('profile.firstName profile.lastName artistProfile.name email');
    console.log(`\nFound ${artists.length} artists:`);
    artists.forEach((artist, index) => {
      const name = artist.artistProfile?.name || `${artist.profile?.firstName || ''} ${artist.profile?.lastName || ''}`.trim() || artist.email;
      console.log(`${index + 1}. ${name} (${artist.email})`);
    });
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkDatabase();
