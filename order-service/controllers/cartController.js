const Cart = require("../models/cartModel");

// Add or update cart
exports.addToCart = async (req, res) => {
  const customerId = req.user.userId;
  const customerName = req.user.username;
  const { restaurantId, restaurantName, items } = req.body;

  try {
    let cart = await Cart.findOne({ customerId });

    // Prevent mixing restaurants
    if (cart && cart.restaurantId !== restaurantId) {
      return res.status(400).json({ message: "You can only order from one restaurant at a time." });
    }

    if (!cart) {
      // Create a new cart
      cart = new Cart({
        customerId,
        customerName,
        restaurantId,
        restaurantName,
        items: []
      });
    }

    // Add or update each item
    items.forEach((itemToAdd) => {
      const existingIndex = cart.items.findIndex(i => i.name === itemToAdd.name);

      if (existingIndex > -1) {
        // If item already exists, update quantity
        cart.items[existingIndex].quantity += itemToAdd.quantity;
      } else {
        // Add new item to cart
        cart.items.push(itemToAdd);
      }
    });

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};