const Item = require('../models/Item');

// Create Item
exports.addItem = async (req, res) => {
    try {
      const {
        itemName,
        itemDescription,
        itemPrice,
        itemCategory,
        restaurantId,
        restaurantName,
      } = req.body;
  
      if (!restaurantId || !restaurantName) {
        return res.status(400).json({ error: "Restaurant ID and name are required" });
      }

      const imageUrl = req.file?.path;
  
      const newItem = new Item({
        itemName,
        itemDescription,
        itemPrice,
        itemCategory,
        restaurantId,
        restaurantName,
        imageUrl
      });
  
      await newItem.save();
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

// Get All Items
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Item
exports.updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Item
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all items or items by restaurant = get Menu
exports.getItemsByRestaurant = async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const items = await Item.find({ restaurantId });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

// Get items by itemCategory for a specific restaurant
exports.getItemsByCategoryAndRestaurant = async (req, res) => {
  try {
    const { restaurantId, itemCategory } = req.params;

    const validCategories = ['mains', 'sides', 'desserts', 'beverages'];
    if (!validCategories.includes(itemCategory)) {
      return res.status(400).json({ error: "Invalid item category" });
    }

    const items = await Item.find({ restaurantId, itemCategory });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

  
