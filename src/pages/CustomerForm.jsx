import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Car, Clock, DollarSign, CheckCircle, ArrowRight, User, Mail, Phone } from 'lucide-react';
import { generateQuote } from '../services/aiService';
import PaymentForm from '../components/PaymentForm';
import { Button, Input, Card, LoadingSpinner, Alert } from '../components/ui';

const CustomerForm = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm();
  
  const steps = [
    { id: 1, name: 'Service Details', icon: MapPin },
    { id: 2, name: 'Vehicle Info', icon: Car },
    { id: 3, name: 'Contact Info', icon: User },
    { id: 4, name: 'Get Quote', icon: DollarSign },
  ];

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const getFieldsForStep = (step) => {
    switch (step) {
      case 1:
        return ['location', 'serviceType', 'duration'];
      case 2:
        return ['vehicleMake', 'vehicleModel', 'vehicleType'];
      case 3:
        return ['name', 'phone', 'email'];
      default:
        return [];
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const generatedQuote = await generateQuote(data);
      setQuote(generatedQuote);
    } catch (error) {
      console.error('Error generating quote:', error);
      setError('Unable to generate quote. Please try again.');
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Details</h2>
              <p className="text-gray-600">Tell us about your valet service needs</p>
            </div>
            
            <Input
              label="Service Location"
              placeholder="Enter address or venue name"
              {...register('location', { required: 'Location is required' })}
              error={errors.location?.message}
              help="We'll use this to calculate accurate pricing"
            />

            <div>
              <label className="form-label">Service Type</label>
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
                <p className="form-error">{errors.serviceType.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Expected Duration</label>
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
                <p className="form-error">{errors.duration.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <Car className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Information</h2>
              <p className="text-gray-600">Help us provide accurate handling for your vehicle</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Vehicle Make"
                placeholder="e.g., BMW"
                {...register('vehicleMake', { required: 'Vehicle make is required' })}
                error={errors.vehicleMake?.message}
              />
              <Input
                label="Vehicle Model"
                placeholder="e.g., X5"
                {...register('vehicleModel', { required: 'Vehicle model is required' })}
                error={errors.vehicleModel?.message}
              />
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
                <p className="form-error">{errors.vehicleType.message}</p>
              )}
              <p className="form-help">Vehicle type affects pricing and handling requirements</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <User className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-gray-600">We'll use this to send you the quote and updates</p>
            </div>
            
            <Input
              label="Full Name"
              placeholder="Your full name"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="Your phone number"
                {...register('phone', { required: 'Phone is required' })}
                error={errors.phone?.message}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                error={errors.email?.message}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <DollarSign className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Quote</h2>
              <p className="text-gray-600">Review your information and get an instant quote</p>
            </div>
            
            {/* Summary */}
            <Card className="mb-6">
              <Card.Header>
                <h3 className="text-lg font-semibold">Service Summary</h3>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Location:</p>
                    <p className="font-medium">{watch('location')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Service Type:</p>
                    <p className="font-medium">{watch('serviceType')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Vehicle:</p>
                    <p className="font-medium">{watch('vehicleMake')} {watch('vehicleModel')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration:</p>
                    <p className="font-medium">{watch('duration')} hours</p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            {loading && (
              <Card className="text-center py-8">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600">Generating your personalized quote...</p>
              </Card>
            )}

            {quote && (
              <Card className="animate-slide-up">
                <Card.Header className="bg-gradient-primary text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Your Quote</h3>
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Service Fee:</span>
                      <span className="font-semibold text-lg">${quote.basePrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Additional Fees:</span>
                      <span className="font-semibold text-lg">${quote.additionalFees}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-primary-600">${quote.total}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Estimated Duration: {quote.estimatedTime}
                    </p>
                    
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">Pricing factors:</p>
                      <ul className="space-y-1">
                        {quote.factors.map((factor, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-success-600 mr-2 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button
                    onClick={handleBookService}
                    className="w-full"
                    size="lg"
                  >
                    Book This Service
                  </Button>
                </Card.Body>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Get Your Valet Service Quote
          </h1>
          <p className="text-xl text-gray-600">
            Get an instant, AI-powered quote in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200
                    ${isActive ? 'border-primary-600 bg-primary-600 text-white' : 
                      isCompleted ? 'border-success-600 bg-success-600 text-white' : 
                      'border-gray-300 bg-white text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${isActive ? 'text-primary-600' : isCompleted ? 'text-success-600' : 'text-gray-500'}`}>
                      Step {step.id}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-primary-600' : isCompleted ? 'text-success-600' : 'text-gray-500'}`}>
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4 transition-all duration-200
                      ${isCompleted ? 'bg-success-600' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="mb-8">
          <Card.Body className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={currentStep === 1 ? 'invisible' : ''}
                >
                  Previous
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading || quote}
                    loading={loading}
                    className="flex items-center"
                  >
                    {quote ? 'Quote Generated' : 'Generate Quote'}
                    {!quote && <DollarSign className="h-4 w-4 ml-2" />}
                  </Button>
                )}
              </div>
            </form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default CustomerForm;
