import Joi from 'joi';

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errorMessage
      });
    }
    
    next();
  };
};

// User validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  first_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  }),
  last_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  company_name: Joi.string().max(100).optional().messages({
    'string.max': 'Company name cannot exceed 100 characters'
  }),
  role: Joi.string().valid('admin', 'operator', 'manager').optional().messages({
    'any.only': 'Role must be one of: admin, operator, manager'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Quote validation schemas
const quoteSchema = Joi.object({
  customer_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Customer name must be at least 2 characters long',
    'string.max': 'Customer name cannot exceed 100 characters',
    'any.required': 'Customer name is required'
  }),
  customer_email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid customer email address',
    'any.required': 'Customer email is required'
  }),
  customer_phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  location: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Location must be at least 5 characters long',
    'string.max': 'Location cannot exceed 200 characters',
    'any.required': 'Location is required'
  }),
  service_type: Joi.string().valid('event', 'restaurant', 'hotel', 'corporate', 'private').required().messages({
    'any.only': 'Service type must be one of: event, restaurant, hotel, corporate, private',
    'any.required': 'Service type is required'
  }),
  vehicle_make: Joi.string().max(50).optional().messages({
    'string.max': 'Vehicle make cannot exceed 50 characters'
  }),
  vehicle_model: Joi.string().max(50).optional().messages({
    'string.max': 'Vehicle model cannot exceed 50 characters'
  }),
  vehicle_type: Joi.string().valid('standard', 'luxury', 'exotic', 'suv', 'truck').optional().messages({
    'any.only': 'Vehicle type must be one of: standard, luxury, exotic, suv, truck'
  }),
  duration: Joi.string().valid('1-2', '2-4', '4-6', '6-8', '8+').required().messages({
    'any.only': 'Duration must be one of: 1-2, 2-4, 4-6, 6-8, 8+',
    'any.required': 'Duration is required'
  }),
  event_date: Joi.date().iso().min('now').optional().messages({
    'date.min': 'Event date cannot be in the past'
  }),
  base_price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Base price must be a positive number',
    'any.required': 'Base price is required'
  }),
  additional_fees: Joi.number().min(0).precision(2).optional().messages({
    'number.min': 'Additional fees cannot be negative'
  }),
  total_price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Total price must be a positive number',
    'any.required': 'Total price is required'
  }),
  pricing_factors: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'cancelled').optional().messages({
    'any.only': 'Status must be one of: pending, approved, rejected, cancelled'
  }),
  notes: Joi.string().max(1000).optional().messages({
    'string.max': 'Notes cannot exceed 1000 characters'
  })
});

const quoteUpdateSchema = Joi.object({
  customer_name: Joi.string().min(2).max(100).optional(),
  customer_email: Joi.string().email().optional(),
  customer_phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  location: Joi.string().min(5).max(200).optional(),
  service_type: Joi.string().valid('event', 'restaurant', 'hotel', 'corporate', 'private').optional(),
  vehicle_make: Joi.string().max(50).optional(),
  vehicle_model: Joi.string().max(50).optional(),
  vehicle_type: Joi.string().valid('standard', 'luxury', 'exotic', 'suv', 'truck').optional(),
  duration: Joi.string().valid('1-2', '2-4', '4-6', '6-8', '8+').optional(),
  event_date: Joi.date().iso().min('now').optional(),
  base_price: Joi.number().positive().precision(2).optional(),
  additional_fees: Joi.number().min(0).precision(2).optional(),
  total_price: Joi.number().positive().precision(2).optional(),
  pricing_factors: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'cancelled').optional(),
  notes: Joi.string().max(1000).optional()
});

// Lead validation schemas
const leadSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  company: Joi.string().max(100).optional().messages({
    'string.max': 'Company name cannot exceed 100 characters'
  }),
  source: Joi.string().valid('website', 'referral', 'social_media', 'email_campaign', 'phone_call', 'other').optional().messages({
    'any.only': 'Source must be one of: website, referral, social_media, email_campaign, phone_call, other'
  }),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'closed').optional().messages({
    'any.only': 'Status must be one of: new, contacted, qualified, proposal_sent, converted, closed'
  }),
  notes: Joi.string().max(1000).optional().messages({
    'string.max': 'Notes cannot exceed 1000 characters'
  }),
  assigned_to: Joi.number().integer().positive().optional().messages({
    'number.integer': 'Assigned to must be a valid user ID'
  }),
  follow_up_date: Joi.date().iso().optional()
});

const leadUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  company: Joi.string().max(100).optional(),
  source: Joi.string().valid('website', 'referral', 'social_media', 'email_campaign', 'phone_call', 'other').optional(),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'closed').optional(),
  notes: Joi.string().max(1000).optional(),
  assigned_to: Joi.number().integer().positive().optional(),
  follow_up_date: Joi.date().iso().optional()
});

// Location validation schemas
const locationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Location name must be at least 2 characters long',
    'string.max': 'Location name cannot exceed 100 characters',
    'any.required': 'Location name is required'
  }),
  address: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Address must be at least 5 characters long',
    'string.max': 'Address cannot exceed 200 characters',
    'any.required': 'Address is required'
  }),
  city: Joi.string().min(2).max(50).required().messages({
    'string.min': 'City must be at least 2 characters long',
    'string.max': 'City cannot exceed 50 characters',
    'any.required': 'City is required'
  }),
  state: Joi.string().length(2).required().messages({
    'string.length': 'State must be a 2-character code',
    'any.required': 'State is required'
  }),
  zip_code: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required().messages({
    'string.pattern.base': 'Please provide a valid ZIP code',
    'any.required': 'ZIP code is required'
  }),
  country: Joi.string().length(2).optional().messages({
    'string.length': 'Country must be a 2-character code'
  }),
  latitude: Joi.number().min(-90).max(90).optional().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90'
  }),
  longitude: Joi.number().min(-180).max(180).optional().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180'
  }),
  location_type: Joi.string().valid('hotel', 'restaurant', 'event_venue', 'corporate', 'residential', 'other').required().messages({
    'any.only': 'Location type must be one of: hotel, restaurant, event_venue, corporate, residential, other',
    'any.required': 'Location type is required'
  }),
  contact_name: Joi.string().max(100).optional().messages({
    'string.max': 'Contact name cannot exceed 100 characters'
  }),
  contact_email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid contact email address'
  }),
  contact_phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid contact phone number'
  }),
  pricing_zone: Joi.string().valid('downtown', 'suburban', 'remote').required().messages({
    'any.only': 'Pricing zone must be one of: downtown, suburban, remote',
    'any.required': 'Pricing zone is required'
  }),
  base_rate: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Base rate must be a positive number'
  }),
  premium_rate: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Premium rate must be a positive number'
  }),
  notes: Joi.string().max(1000).optional().messages({
    'string.max': 'Notes cannot exceed 1000 characters'
  }),
  is_active: Joi.boolean().optional()
});

const locationUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  address: Joi.string().min(5).max(200).optional(),
  city: Joi.string().min(2).max(50).optional(),
  state: Joi.string().length(2).optional(),
  zip_code: Joi.string().pattern(/^\d{5}(-\d{4})?$/).optional(),
  country: Joi.string().length(2).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  location_type: Joi.string().valid('hotel', 'restaurant', 'event_venue', 'corporate', 'residential', 'other').optional(),
  contact_name: Joi.string().max(100).optional(),
  contact_email: Joi.string().email().optional(),
  contact_phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  pricing_zone: Joi.string().valid('downtown', 'suburban', 'remote').optional(),
  base_rate: Joi.number().positive().precision(2).optional(),
  premium_rate: Joi.number().positive().precision(2).optional(),
  notes: Joi.string().max(1000).optional(),
  is_active: Joi.boolean().optional()
});

// Export validation middleware
export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateQuote = validate(quoteSchema);
export const validateQuoteUpdate = validate(quoteUpdateSchema);
export const validateLead = validate(leadSchema);
export const validateLeadUpdate = validate(leadUpdateSchema);
export const validateLocation = validate(locationSchema);
export const validateLocationUpdate = validate(locationUpdateSchema);

