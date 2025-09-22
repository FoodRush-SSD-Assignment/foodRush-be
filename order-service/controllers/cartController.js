const Cart = require("../models/cartModel");
const axios = require("axios");

// Add or update cart
exports.addToCart = async (req, res) => {
  const customerId = req.user.userId;
  const customerName = `${req.user.firstname} ${req.user.lastname || ""}`.trim();
  const { itemIds } = req.body;

  try {
    // Fetch all item details from the restaurant service
    const itemFetchPromises = itemIds.map(async (id) => {
      try {
        const response = await axios.get(`http://localhost:5001/api/items/${id}`, {
          headers: { Authorization: req.headers.authorization } 
        });
        return response.data;
      } catch (err) {
        console.error(`Failed to fetch item with ID: ${id}`, err.response?.data || err.message);
        throw err;
      }
    });

    // Await all and get an array of item objects
    const itemsFromDB = await Promise.all(itemFetchPromises);

    if (itemsFromDB.length === 0) {
      return res.status(400).json({ message: "No items found for provided IDs" });
    }

    // Validate they’re all from the same restaurant
    const uniqueRestaurantIds = new Set(itemsFromDB.map(i => i.restaurantId));
    if (uniqueRestaurantIds.size > 1) {
      return res.status(400).json({ message: "Items must be from the same restaurant" });
    }

    const restaurantId = itemsFromDB[0].restaurantId;
    const restaurantName = itemsFromDB[0].restaurantName;

    // Load or create cart
    let cart = await Cart.findOne({ customerId });

    // Prevent mixing restaurants
    if (cart && cart.restaurantId !== restaurantId) {
      return res.status(400).json({ message: "You can only order from one restaurant at a time." });
    }

    if (!cart) {
      cart = new Cart({ customerId, customerName, restaurantId, restaurantName, items: [] });
    }

    // update items
    itemsFromDB.forEach(itemToAdd => {
      const idx = cart.items.findIndex(i => i.name === itemToAdd.itemName);
      if (idx > -1) {
        //If the item already exists in the cart, increase its quantity
        cart.items[idx].quantity += 1;
      } else {
        cart.items.push({
          name: itemToAdd.itemName,
          quantity: 1,
          description: itemToAdd.itemDescription,
          price: itemToAdd.itemPrice
        });
      }
    });

    await cart.save();
    return res.status(200).json(cart);

  } catch (err) {
    console.error("Error adding to cart:", err.message);
    return res.status(500).json({ error: "Failed to fetch items or add to cart" });
  }
};


// Update item quantity in cart
exports.updateItemQuantity = async (req, res) => {
  const customerId = req.user.userId;
  const { itemName, quantity } = req.body;

  if (!itemName || typeof quantity !== "number" || quantity < 0) {
    return res.status(400).json({ message: "Invalid item name or quantity" });
  }

  try {
    const cart = await Cart.findOne({ customerId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const index = cart.items.findIndex(i => i.name === itemName);
    if (index === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(index, 1);
    } else {
      // Update quantity
      cart.items[index].quantity = quantity;
    }

    await cart.save();
    res.status(200).json({ message: "Quantity updated", cart });
  } catch (err) {
    console.error("Error updating item quantity:", err.message);
    res.status(500).json({ error: "Failed to update quantity" });
  }
};


// Get all items in the user's cart
exports.getCartItems = async (req, res) => {
  const customerId = req.user.userId;

  try {
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (err) {
    console.error("Error fetching cart items:", err.message);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
};



// Delete item from cart
exports.deleteItemFromCart = async (req, res) => {
  const customerId = req.user.userId;
  const { itemName } = req.body;

  if (!itemName) {
    return res.status(400).json({ message: "Invalid item name" });
  }

  try {
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const index = cart.items.findIndex(i => i.name === itemName);
    if (index === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove item from cart
    cart.items.splice(index, 1);

    if (cart.items.length === 0) {
      // If no items left, delete the cart
      await Cart.deleteOne({ customerId });
      return res.status(200).json({ message: "Item deleted and cart removed" });
    } else {
      // Otherwise, save the updated cart
      await cart.save();
      return res.status(200).json({ message: "Item deleted from cart", cart });
    }
  } catch (err) {
    console.error("Error deleting item from cart:", err.message);
    res.status(500).json({ error: "Failed to delete item" });
  }
};