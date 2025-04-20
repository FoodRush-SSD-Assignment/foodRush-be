console.log("✅ restaurantRoutes loaded");

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all routes
router.post('/', authenticate, authorizeRoles('admin','restaurantOwner'), restaurantController.createRestaurant);
router.get('/', authenticate, restaurantController.getRestaurants);
router.get('/:id', authenticate, restaurantController.getRestaurantById);
router.put('/:id', authenticate, authorizeRoles('admin','restaurantOwner'), restaurantController.updateRestaurant);
router.delete('/:id', authenticate, authorizeRoles('admin'), restaurantController.deleteRestaurant);

module.exports = router;
