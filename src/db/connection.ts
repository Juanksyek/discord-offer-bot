import mongoose from 'mongoose';

export async function connectToMongo() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('❌ URI de MongoDB no definida en .env');

        await mongoose.connect(uri);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
}
