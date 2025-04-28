// controllers/deliveryDriverController.js
let db1;

function setDriverDb(connection) {
  const createModel = require("../models/Drivers");
  db1 = createModel(connection);
}

const getDeliveryDriverByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const driver = await db1.findOne({ userId });

    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json(driver);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error retrieving driver", details: error.message });
  }
};

const updateDeliveryDriverByUserId = async (req, res) => {
  const { userId } = req.params;
  const updatedData = req.body;

  try {
    const updatedDriver = await db1.findOneAndUpdate(
      { userId },
      { $set: updatedData },
      { new: true } // return the updated document
    );

    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json({
      message: "Driver details updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update driver", details: error.message });
  }
};

const updateApprovalStatus = async (req, res) => {
  const { userId } = req.params;
  const { approvalStatus } = req.body;

  if (!approvalStatus) {
    return res.status(400).json({ error: "approvalStatus is required" });
  }

  try {
    const updateFields = { approvalStatus };

    // If rejected, also set isActive to false
    if (approvalStatus === "rejected") {
      updateFields.isActive = false;
    }

    const updatedDriver = await db1.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json({
      message: "Approval status updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update approval status",
      details: error.message,
    });
  }
};

const updateIsActiveStatus = async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ error: "isActive must be a boolean value" });
  }

  try {
    const updatedDriver = await db1.findOneAndUpdate(
      { userId },
      { $set: { isActive } },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json({
      message: "isActive status updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update isActive status",
      details: error.message,
    });
  }
};

const deleteDeliveryDriver = async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedDriver = await db1.findOneAndDelete({ userId });

    if (!deletedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json({
      message: "Driver deleted successfully",
      driver: deletedDriver,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete driver",
      details: error.message,
    });
  }
};

const updateVehicleDetails = async (req, res) => {
  const { userId } = req.params;
  const { vehicle, vehicleNumber, approvalStatus } = req.body;

  if (!vehicle || !vehicleNumber || !approvalStatus) {
    return res
      .status(400)
      .json({
        error: "vehicle, vehicleNumber, and approvalStatus are required",
      });
  }

  try {
    const updatedDriver = await db1.findOneAndUpdate(
      { userId },
      { $set: { vehicle, vehicleNumber, approvalStatus } },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json({
      message: "Vehicle details updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update vehicle details",
      details: error.message,
    });
  }
};

const updateCurrentLocation = async (req, res) => {
  const { userId } = req.params;
  const { lat, lng } = req.body;

  if (lat === undefined || lng === undefined) {
    return res
      .status(400)
      .json({ error: "latitude and longitude are required" });
  }

  try {
    const updatedDriver = await db1.findOneAndUpdate(
      { userId },
      { $set: { currentLocation: { lat, lng } } },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json({
      message: "Current location updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update current location",
      details: error.message,
    });
  }
};

const updateVehicleDetails = async (req, res) => {
  const { userId } = req.params;
  const { vehicle, vehicleNumber, approvalStatus } = req.body;

  if (!vehicle || !vehicleNumber || !approvalStatus) {
    return res
      .status(400)
      .json({
        error: "vehicle, vehicleNumber, and approvalStatus are required",
      });
  }

  try {
    const updatedDriver = await db1.findOneAndUpdate(
      { userId },
      { $set: { vehicle, vehicleNumber, approvalStatus } },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json({
      message: "Vehicle details updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update vehicle details",
      details: error.message,
    });
  }
};

const updateCurrentLocation = async (req, res) => {
  const { userId } = req.params;
  const { lat, lng } = req.body;

  if (lat === undefined || lng === undefined) {
    return res
      .status(400)
      .json({ error: "latitude and longitude are required" });
  }

  try {
    const updatedDriver = await db1.findOneAndUpdate(
      { userId },
      { $set: { currentLocation: { lat, lng } } },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.json({
      message: "Current location updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update current location",
      details: error.message,
    });
  }
};

const getAllDeliveryDrivers = async (req, res) => {
  try {
    const drivers = await db1.find(); // Fetch all drivers from the database

    if (!drivers || drivers.length === 0) {
      return res.status(404).json({ error: "No drivers found" });
    }

    res.json(drivers); // Return all drivers as a JSON response
  } catch (error) {
    res.status(500).json({
      error: "Error retrieving drivers",
      details: error.message,
    });
  }
};
const getAllDeliveryDrivers = async (req, res) => {
  try {
    const drivers = await db1.find(); // Fetch all drivers from the database

    if (!drivers || drivers.length === 0) {
      return res.status(404).json({ error: "No drivers found" });
    }

    res.json(drivers); // Return all drivers as a JSON response
  } catch (error) {
    res.status(500).json({
      error: "Error retrieving drivers",
      details: error.message,
    });
  }
};

module.exports = {
  setDriverDb,
  getDeliveryDriverByUserId,
  updateDeliveryDriverByUserId,
  updateApprovalStatus,
  updateIsActiveStatus,
  deleteDeliveryDriver,
  updateVehicleDetails,
  updateCurrentLocation,
  getAllDeliveryDrivers,
};
