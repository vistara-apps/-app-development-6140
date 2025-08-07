import express from 'express';
import { Location } from '../models/Location.js';
import { validateLocation, validateLocationUpdate } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all locations with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      location_type: req.query.location_type,
      pricing_zone: req.query.pricing_zone,
      city: req.query.city,
      state: req.query.state,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
      search: req.query.search
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    const locations = await Location.findAll(page, limit, filters);
    
    res.json({
      success: true,
      data: locations,
      pagination: {
        page,
        limit,
        total: locations.length
      }
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations'
    });
  }
});

// Get active locations only (public endpoint)
router.get('/active', async (req, res) => {
  try {
    const locations = await Location.findActive();
    
    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching active locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active locations'
    });
  }
});

// Get location by ID
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location'
    });
  }
});

// Create new location
router.post('/', authenticateToken, validateLocation, async (req, res) => {
  try {
    const location = await Location.create(req.body);
    
    res.status(201).json({
      success: true,
      data: location,
      message: 'Location created successfully'
    });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create location'
    });
  }
});

// Update location
router.put('/:id', authenticateToken, validateLocationUpdate, async (req, res) => {
  try {
    const location = await Location.update(req.params.id, req.body);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: location,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
});

// Delete location (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const success = await Location.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete location'
    });
  }
});

// Get locations by city
router.get('/city/:city', async (req, res) => {
  try {
    const locations = await Location.findByCity(req.params.city);
    
    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching locations by city:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations by city'
    });
  }
});

// Get locations by pricing zone
router.get('/zone/:zone', async (req, res) => {
  try {
    const locations = await Location.findByPricingZone(req.params.zone);
    
    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching locations by zone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations by zone'
    });
  }
});

// Search locations within radius
router.post('/search/radius', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const radiusKm = radius || 50; // Default 50km radius
    const locations = await Location.findWithinRadius(latitude, longitude, radiusKm);
    
    res.json({
      success: true,
      data: locations,
      message: `Found ${locations.length} locations within ${radiusKm}km`
    });
  } catch (error) {
    console.error('Error searching locations by radius:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search locations by radius'
    });
  }
});

// Get location statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await Location.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching location stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location statistics'
    });
  }
});

// Toggle location active status
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    const updatedLocation = await Location.update(req.params.id, {
      is_active: !location.is_active
    });

    res.json({
      success: true,
      data: updatedLocation,
      message: `Location ${updatedLocation.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling location status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle location status'
    });
  }
});

export default router;

