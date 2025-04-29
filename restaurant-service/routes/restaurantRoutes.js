console.log("✅ restaurantRoutes loaded");

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); 
const storage = new CloudinaryStorage({ 
    cloudinary, 
    params: { folder: 'foodrush-Menu-items', allowed_formats: ['jpg','png','jpeg'] }
});
const upload = multer({ storage });

// Protect all routes
router.post('/', authenticate, authorizeRoles('admin', 'restaurantOwner'), upload.single('image'), restaurantController.createRestaurant);
router.get('/', authenticate, restaurantController.getRestaurants);
router.get('/:id', authenticate, restaurantController.getRestaurantById);
router.put('/:id', authenticate, authorizeRoles('admin','restaurantOwner'), restaurantController.updateRestaurant);
router.delete('/:id', authenticate, authorizeRoles('admin'), restaurantController.deleteRestaurant);
router.get('/category/:type', authenticate, restaurantController.getRestaurantsByCategory);

// Update restaurant status - Admin only
router.patch('/status/:id', authenticate, authorizeRoles('admin'), restaurantController.updateRestaurantStatus);

//route to fetch all restaurants by the logged-in user
router.get('/owned/:id', authenticate, restaurantController.getRestaurantsByOwnerId);

//order cancel email 
router.post("/send-order-cancellation-email", restaurantController.sendOrderCancellationEmail);

module.exports = router;
