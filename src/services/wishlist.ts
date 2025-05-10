import WishListModel from '../models/wishlist';

export async function addProductToWishList(userId: string, product: any) {
    const user = await WishListModel.findOne({ userId });

    if (user) {
        user.products.push({ ...product, lastChecked: new Date() });
        return await user.save();
    }

    return await WishListModel.create({
        userId,
        products: [{ ...product, lastChecked: new Date() }]
    });
}
