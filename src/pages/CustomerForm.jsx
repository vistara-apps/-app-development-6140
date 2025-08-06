import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Car, Clock, DollarSign } from 'lucide-react';
import { generateQuote } from '../services/aiService';
import PaymentForm from '../components/PaymentForm';

const CustomerForm = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const generatedQuote = await generateQuote(data);
      setQuote(generatedQuote);
    } catch (error) {
      console.error('Error generating quote:', error);
      // Fallback quote for demo
      setQuote({
        basePrice: 45,
        additionalFees: 15,
        total: 60,
        estimatedTime: '2-3 hours',
        factors: ['Prime location', 'Luxury vehicle', 'Peak hours']
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = () => {
    setShowPayment(true);
  };

  if (showPayment) {
    return <PaymentForm quote={quote} onBack={() => setShowPayment(false)} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Your Valet Service Quote
          </h1>
          <p className="text-gray-600">
            Fill out the form below to receive an instant, AI-powered quote
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Location */}
              <div>
                <label className="form-label">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Service Location
                </label>
                <input
                  {...register('location', { required: 'Location is required' })}
                  type="text"
                  placeholder="Enter address or venue name"
                  className="form-input"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>

              {/* Service Type */}
              <div>
                <label className="form-label">
                  <Car className="inline h-4 w-4 mr-1" />
                  Service Type
                </label>
                <select
                  {...register('serviceType', { required: 'Service type is required' })}
                  className="form-input"
                >
                  <option value="">Select service type</option>
                  <option value="event">Event Valet</option>
                  <option value="restaurant">Restaurant Valet</option>
                  <option value="hotel">Hotel Valet</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="private">Private Party</option>
                </select>
                {errors.serviceType && (
                  <p className="text-red-500 text-sm mt-1">{errors.serviceType.message}</p>
                )}
              </div>

              {/* Vehicle Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Vehicle Make</label>
                  <input
                    {...register('vehicleMake', { required: 'Vehicle make is required' })}
                    type="text"
                    placeholder="e.g., BMW"
                    className="form-input"
                  />
                  {errors.vehicleMake && (
                    <p className="text-red-500 text-sm mt-1">{errors.vehicleMake.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Vehicle Model</label>
                  <input
                    {...register('vehicleModel', { required: 'Vehicle model is required' })}
                    type="text"
                    placeholder="e.g., X5"
                    className="form-input"
                  />
                  {errors.vehicleModel && (
                    <p className="text-red-500 text-sm mt-1">{errors.vehicleModel.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Vehicle Type</label>
                <select
                  {...register('vehicleType', { required: 'Vehicle type is required' })}
                  className="form-input"
                >
                  <option value="">Select vehicle type</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="coupe">Coupe</option>
                  <option value="convertible">Convertible</option>
                  <option value="luxury">Luxury</option>
                  <option value="exotic">Exotic</option>
                </select>
                {errors.vehicleType && (
                  <p className="text-red-500 text-sm mt-1">{errors.vehicleType.message}</p>
                )}
              </div>

              {/* Service Duration */}
              <div>
                <label className="form-label">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Expected Duration
                </label>
                <select
                  {...register('duration', { required: 'Duration is required' })}
                  className="form-input"
                >
                  <option value="">Select duration</option>
                  <option value="1-2">1-2 hours</option>
                  <option value="2-4">2-4 hours</option>
                  <option value="4-6">4-6 hours</option>
                  <option value="6-8">6-8 hours</option>
                  <option value="8+">8+ hours</option>
                </select>
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    placeholder="Your full name"
                    className="form-input"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    {...register('phone', { required: 'Phone is required' })}
                    type="tel"
                    placeholder="Your phone number"
                    className="form-input"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  placeholder="your.email@example.com"
                  className="form-input"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Quote...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Get Instant Quote
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quote Display */}
          <div>
            {quote && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Quote</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Service Fee:</span>
                    <span className="font-semibold">${quote.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Additional Fees:</span>
                    <span className="font-semibold">${quote.additionalFees}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-primary-600">${quote.total}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Estimated Duration: {quote.estimatedTime}
                  </p>
                  
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">Pricing factors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {quote.factors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={handleBookService}
                  className="w-full btn-primary"
                >
                  Book This Service
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;