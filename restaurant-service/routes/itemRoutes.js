console.log("✅ itemRoutes loaded");

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Add item 
router.post('/', authenticate, authorizeRoles('restaurantOwner'), itemController.addItem);

// Get all items
router.get('/', authenticate, itemController.getItems);

// Get item by ID
router.get('/:id', authenticate, itemController.getItemById);

// Update item
router.put('/:id', authenticate, authorizeRoles('restaurantOwner'), itemController.updateItem);

// Delete item
router.delete('/:id', authenticate, authorizeRoles('restaurantOwner'), itemController.deleteItem);

// Get menu
router.get('/restaurant/:restaurantId', authenticate, itemController.getItemsByRestaurant);

module.exports = router;
