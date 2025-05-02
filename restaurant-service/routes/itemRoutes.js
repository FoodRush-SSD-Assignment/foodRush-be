console.log("✅ itemRoutes loaded");

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); 
const storage = new CloudinaryStorage({ 
    cloudinary, 
    params: { folder: 'foodrush-Menu-items', allowed_formats: ['jpg','png','jpeg'] }
});
const upload = multer({ storage });

// Add item 
router.post('/', authenticate, authorizeRoles('restaurantOwner'), upload.single('image'), itemController.addItem);

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

// Get items by itemCategory under a restaurant
router.get('/restaurant/:restaurantId/category/:itemCategory', authenticate, itemController.getItemsByCategoryAndRestaurant);


module.exports = router;
