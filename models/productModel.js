const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
        required: false
    },
    name: {
        type: String,
        required: [true, 'Product name zaroori hai!'],
        trim: true,
        maxlength: [100, 'Product name maximum 100 characters ka ho sakta hai']
    },
    price: {
        type: Number,
        required: [true, 'Price daaliye!'],
        min: [0, 'Price zero se zyada hona chahiye']
    },
    description: {
        type: String,
        required: [true, 'Description likhiye!'],
        maxlength: [500, 'Description maximum 500 characters ki ho sakti hai']
    },
    category: {
        type: String,
        required: [true, 'Category select kariye!'],
        enum: {
            values: ['men', 'women', 'accessories', 'electronics', 'footwear'],
            message: 'Valid category chunein!'
        }
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity daaliye!'],
        min: [0, 'Stock zero ya zyada ho sakta hai']
    },

    colors: [
  {
    type: String,
    enum: [
      "black",
      "white",
      "red",
      "blue",
      "green",
      "yellow",
      "purple",
      "gray",
    ],
    default: []
  }
],


    sizes: [{
        type: String,
        enum: ['s', 'm', 'l', 'xl', 'xxl'],
        default: []
    }],

    // ✅ Primary thumbnail image (first image shown in listings)
    imageUrl: {
        type: String,
        default: null
    },
    imagePublicId: {
        type: String,
        default: null
    },

    // ✅ Multiple gallery images (Cloudinary)
    images: [
        {
            url: { type: String, required: true },       // Cloudinary image URL
            public_id: { type: String, required: true }  // For deletion
        }
    ],

    // Featured product flag
    isFeatured: {
        type: Boolean,
        default: false
    },

    tags: [{
        type: String,
        default: []
    }],

    averageRating: {
        type: Number,
        min: [0, 'Rating 0 se shuru hoti hai'],
        max: [5, 'Rating maximum 5 ho sakti hai'],
        default: 0
    },

    numReviews: {
        type: Number,
        default: 0,
        min: [0, 'Reviews zero se kam nahi ho sakte']
    }
}, {
    timestamps: true
});

// Indexes for optimization
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ averageRating: -1 });

// ✅ Virtual for full Cloudinary image URL (only used if needed for local fallback)
productSchema.virtual('imageFullUrl').get(function() {
    if (this.imageUrl) {
        return this.imageUrl.startsWith('http')
            ? this.imageUrl
            : `${process.env.BASE_URL || 'http://localhost:5000'}${this.imageUrl}`;
    }
    return null;
});

// ✅ Always ensure arrays are initialized
productSchema.pre('save', function(next) {
    if (!Array.isArray(this.images)) this.images = [];
    if (!Array.isArray(this.sizes)) this.sizes = [];
    next();
});

module.exports = mongoose.model('Product', productSchema);
