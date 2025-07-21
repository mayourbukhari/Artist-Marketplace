const Artwork = require('../models/Artwork');
const User = require('../models/User');
const { uploadMultipleImages, deleteMultipleImages, generateImageVariants } = require('../utils/cloudinary');
const fs = require('fs');

// Get all artworks with filtering and pagination
const getArtworks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      medium,
      style,
      search,
      featured,
      artistId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'published', isPublic: true };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (medium) filter.medium = new RegExp(medium, 'i');
    if (style) filter.style = new RegExp(style, 'i');
    if (featured) filter.featured = featured === 'true';
    if (artistId) filter.artist = artistId;
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [artworks, total] = await Promise.all([
      Artwork.find(filter)
        .populate('artist', 'artistProfile.name profile.firstName profile.lastName artistProfile.isVerified')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Artwork.countDocuments(filter)
    ]);

    // Add image variants to each artwork
    const artworksWithVariants = artworks.map(artwork => ({
      ...artwork,
      images: artwork.images.map(image => ({
        ...image,
        variants: image.publicId ? generateImageVariants(image.publicId) : null
      }))
    }));

    res.json({
      artworks: artworksWithVariants,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get artworks error:', error);
    res.status(500).json({ message: 'Server error while fetching artworks' });
  }
};

// Get single artwork by ID
const getArtworkById = async (req, res) => {
  try {
    const { id } = req.params;

    const artwork = await Artwork.findById(id)
      .populate('artist', 'artistProfile profile emailVerified')
      .populate('likes.user', 'profile.firstName profile.lastName');

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check if artwork is public or user owns it
    if (!artwork.isPublic && artwork.status !== 'published') {
      if (!req.user || (req.user._id.toString() !== artwork.artist._id.toString() && req.user.role !== 'admin')) {
        return res.status(404).json({ message: 'Artwork not found' });
      }
    }

    // Increment view count if user is not the artist
    if (!req.user || req.user._id.toString() !== artwork.artist._id.toString()) {
      artwork.views += 1;
      await artwork.save();
    }

    // Add image variants
    const artworkWithVariants = {
      ...artwork.toObject(),
      images: artwork.images.map(image => ({
        ...image,
        variants: image.publicId ? generateImageVariants(image.publicId) : null
      }))
    };

    res.json({ artwork: artworkWithVariants });
  } catch (error) {
    console.error('Get artwork error:', error);
    res.status(500).json({ message: 'Server error while fetching artwork' });
  }
};

// Create new artwork
const createArtwork = async (req, res) => {
  try {
    const artworkData = req.body;
    artworkData.artist = req.user._id;

    // Handle image uploads if files are provided
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await uploadMultipleImages(req.files, 'artworks');
        artworkData.images = uploadResults.map((result, index) => ({
          url: result.url,
          publicId: result.publicId,
          isMain: index === 0 // First image is main
        }));

        // Clean up temporary files
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({ message: 'Failed to upload images' });
      }
    }

    const artwork = new Artwork(artworkData);
    await artwork.save();

    const populatedArtwork = await Artwork.findById(artwork._id)
      .populate('artist', 'artistProfile.name profile.firstName profile.lastName');

    res.status(201).json({
      message: 'Artwork created successfully',
      artwork: populatedArtwork
    });
  } catch (error) {
    console.error('Create artwork error:', error);
    res.status(500).json({ message: 'Server error while creating artwork' });
  }
};

// Update artwork
const updateArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check ownership
    if (artwork.artist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this artwork' });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await uploadMultipleImages(req.files, 'artworks');
        const newImages = uploadResults.map((result, index) => ({
          url: result.url,
          publicId: result.publicId,
          isMain: artwork.images.length === 0 && index === 0 // First image is main if no existing images
        }));

        updates.images = [...(artwork.images || []), ...newImages];

        // Clean up temporary files
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({ message: 'Failed to upload new images' });
      }
    }

    const updatedArtwork = await Artwork.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('artist', 'artistProfile.name profile.firstName profile.lastName');

    res.json({
      message: 'Artwork updated successfully',
      artwork: updatedArtwork
    });
  } catch (error) {
    console.error('Update artwork error:', error);
    res.status(500).json({ message: 'Server error while updating artwork' });
  }
};

// Delete artwork
const deleteArtwork = async (req, res) => {
  try {
    const { id } = req.params;

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check ownership
    if (artwork.artist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this artwork' });
    }

    // Delete images from Cloudinary
    if (artwork.images && artwork.images.length > 0) {
      const publicIds = artwork.images
        .filter(img => img.publicId)
        .map(img => img.publicId);
      
      if (publicIds.length > 0) {
        try {
          await deleteMultipleImages(publicIds);
        } catch (deleteError) {
          console.error('Image deletion error:', deleteError);
          // Continue with artwork deletion even if image deletion fails
        }
      }
    }

    await Artwork.findByIdAndDelete(id);

    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('Delete artwork error:', error);
    res.status(500).json({ message: 'Server error while deleting artwork' });
  }
};

// Like/unlike artwork
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    const existingLike = artwork.likes.find(like => like.user.toString() === userId.toString());

    if (existingLike) {
      // Remove like
      artwork.likes = artwork.likes.filter(like => like.user.toString() !== userId.toString());
    } else {
      // Add like
      artwork.likes.push({ user: userId });
    }

    await artwork.save();

    res.json({
      message: existingLike ? 'Artwork unliked' : 'Artwork liked',
      liked: !existingLike,
      likeCount: artwork.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error while updating like' });
  }
};

// Remove image from artwork
const removeImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check ownership
    if (artwork.artist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this artwork' });
    }

    // Find and remove the image
    const imageToRemove = artwork.images.id(imageId);
    if (!imageToRemove) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary if it has a publicId
    if (imageToRemove.publicId) {
      try {
        await deleteMultipleImages([imageToRemove.publicId]);
      } catch (deleteError) {
        console.error('Cloudinary deletion error:', deleteError);
        // Continue with database removal even if Cloudinary deletion fails
      }
    }

    // Remove from artwork
    artwork.images.pull(imageId);
    
    // If this was the main image and there are other images, set the first one as main
    if (imageToRemove.isMain && artwork.images.length > 0) {
      artwork.images[0].isMain = true;
    }

    await artwork.save();

    res.json({ message: 'Image removed successfully' });
  } catch (error) {
    console.error('Remove image error:', error);
    res.status(500).json({ message: 'Server error while removing image' });
  }
};

// Set main image
const setMainImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Check ownership
    if (artwork.artist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this artwork' });
    }

    // Update main image
    artwork.images.forEach(image => {
      image.isMain = image._id.toString() === imageId;
    });

    await artwork.save();

    res.json({ message: 'Main image updated successfully' });
  } catch (error) {
    console.error('Set main image error:', error);
    res.status(500).json({ message: 'Server error while setting main image' });
  }
};

// Get related artworks
const getRelatedArtworks = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Find related artworks based on category, style, or artist
    const relatedArtworks = await Artwork.find({
      _id: { $ne: id },
      status: 'published',
      isPublic: true,
      $or: [
        { category: artwork.category },
        { style: artwork.style },
        { artist: artwork.artist },
        { tags: { $in: artwork.tags } }
      ]
    })
    .populate('artist', 'artistProfile.name profile.firstName profile.lastName')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    res.json({ relatedArtworks });
  } catch (error) {
    console.error('Get related artworks error:', error);
    res.status(500).json({ message: 'Server error while fetching related artworks' });
  }
};

module.exports = {
  getArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  toggleLike,
  removeImage,
  setMainImage,
  getRelatedArtworks
};
