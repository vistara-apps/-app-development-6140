import express from 'express';
import { Quote } from '../models/Quote.js';
import { validateQuote, validateQuoteUpdate } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all quotes with pagination and filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      status: req.query.status,
      service_type: req.query.service_type,
      customer_email: req.query.customer_email
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    const quotes = await Quote.findAll(page, limit, filters);
    
    res.json({
      success: true,
      data: quotes,
      pagination: {
        page,
        limit,
        total: quotes.length
      }
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quotes'
    });
  }
});

// Get quote by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote'
    });
  }
});

// Create new quote
router.post('/', validateQuote, async (req, res) => {
  try {
    const quote = await Quote.create(req.body);
    
    res.status(201).json({
      success: true,
      data: quote,
      message: 'Quote created successfully'
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create quote'
    });
  }
});

// Update quote
router.put('/:id', authenticateToken, validateQuoteUpdate, async (req, res) => {
  try {
    const quote = await Quote.update(req.params.id, req.body);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    res.json({
      success: true,
      data: quote,
      message: 'Quote updated successfully'
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update quote'
    });
  }
});

// Update quote status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: pending, approved, rejected, cancelled'
      });
    }

    const quote = await Quote.update(req.params.id, { status });
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    res.json({
      success: true,
      data: quote,
      message: 'Quote status updated successfully'
    });
  } catch (error) {
    console.error('Error updating quote status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update quote status'
    });
  }
});

// Delete quote
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const success = await Quote.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    res.json({
      success: true,
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete quote'
    });
  }
});

// Get quote statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await Quote.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching quote stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote statistics'
    });
  }
});

// Duplicate quote
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const originalQuote = await Quote.findById(req.params.id);
    
    if (!originalQuote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    // Create new quote with same data but reset status
    const duplicateData = {
      customer_name: originalQuote.customer_name,
      customer_email: originalQuote.customer_email,
      customer_phone: originalQuote.customer_phone,
      location: originalQuote.location,
      service_type: originalQuote.service_type,
      vehicle_make: originalQuote.vehicle_make,
      vehicle_model: originalQuote.vehicle_model,
      vehicle_type: originalQuote.vehicle_type,
      duration: originalQuote.duration,
      event_date: originalQuote.event_date,
      base_price: originalQuote.base_price,
      additional_fees: originalQuote.additional_fees,
      total_price: originalQuote.total_price,
      pricing_factors: originalQuote.pricing_factors,
      status: 'pending',
      notes: originalQuote.notes ? `Duplicated from quote #${originalQuote.id}. ${originalQuote.notes}` : `Duplicated from quote #${originalQuote.id}`
    };

    const newQuote = await Quote.create(duplicateData);
    
    res.status(201).json({
      success: true,
      data: newQuote,
      message: 'Quote duplicated successfully'
    });
  } catch (error) {
    console.error('Error duplicating quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to duplicate quote'
    });
  }
});

export default router;

