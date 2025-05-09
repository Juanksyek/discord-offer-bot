import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  asin: String,
  name: String,
  price: Number,
  image: String,
  url: String,
  lastChecked: Date
});

const wishlistSchema = new mongoose.Schema({
  userId: String,
  products: [productSchema]
});

export default mongoose.model('WishList', wishlistSchema);
