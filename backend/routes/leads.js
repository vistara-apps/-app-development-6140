import express from 'express';
import { Lead } from '../models/Lead.js';
import { validateLead, validateLeadUpdate } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all leads with pagination and filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      status: req.query.status,
      source: req.query.source,
      assigned_to: req.query.assigned_to,
      search: req.query.search
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    const leads = await Lead.findAll(page, limit, filters);
    
    res.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total: leads.length
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leads'
    });
  }
});

// Get lead by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lead'
    });
  }
});

// Create new lead
router.post('/', authenticateToken, validateLead, async (req, res) => {
  try {
    // Check if lead with email already exists
    const existingLead = await Lead.findByEmail(req.body.email);
    if (existingLead) {
      return res.status(409).json({
        success: false,
        error: 'Lead with this email already exists'
      });
    }

    const lead = await Lead.create(req.body);
    
    res.status(201).json({
      success: true,
      data: lead,
      message: 'Lead created successfully'
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create lead'
    });
  }
});

// Update lead
router.put('/:id', authenticateToken, validateLeadUpdate, async (req, res) => {
  try {
    const lead = await Lead.update(req.params.id, req.body);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead,
      message: 'Lead updated successfully'
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update lead'
    });
  }
});

// Update lead status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const lead = await Lead.updateStatus(req.params.id, status);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead,
      message: 'Lead status updated successfully'
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update lead status'
    });
  }
});

// Delete lead
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const success = await Lead.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete lead'
    });
  }
});

// Get leads due for follow-up
router.get('/followup/due', authenticateToken, async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const leads = await Lead.getFollowUpDue(date);
    
    res.json({
      success: true,
      data: leads,
      message: `Found ${leads.length} leads due for follow-up`
    });
  } catch (error) {
    console.error('Error fetching follow-up leads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch follow-up leads'
    });
  }
});

// Get lead statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await Lead.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lead statistics'
    });
  }
});

// Get leads by source
router.get('/stats/by-source', authenticateToken, async (req, res) => {
  try {
    const sourceStats = await Lead.getBySource();
    
    res.json({
      success: true,
      data: sourceStats
    });
  } catch (error) {
    console.error('Error fetching lead source stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lead source statistics'
    });
  }
});

// Assign lead to user
router.patch('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { assigned_to } = req.body;
    
    if (!assigned_to) {
      return res.status(400).json({
        success: false,
        error: 'assigned_to is required'
      });
    }

    const lead = await Lead.update(req.params.id, { assigned_to });
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead,
      message: 'Lead assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign lead'
    });
  }
});

export default router;

