import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Clock, DollarSign, Shield, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Effortless valet service quoting,{' '}
              <span className="text-primary-600">powered by AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get instant, accurate quotes for valet services with our AI-powered platform. 
              Perfect for customers seeking convenience and operators managing their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/quote" className="btn-primary px-8 py-3 text-lg">
                Get Your Quote
              </Link>
              <Link to="/register" className="btn-secondary px-8 py-3 text-lg">
                Join as Operator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ValetQuotes?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the future of valet service management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Quotes</h3>
              <p className="text-gray-600">
                Get accurate pricing in seconds with our AI-powered algorithm
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dynamic Pricing</h3>
              <p className="text-gray-600">
                Fair and competitive pricing based on location and service type
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Safe and secure transactions with Stripe integration
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Operator Portal</h3>
              <p className="text-gray-600">
                Comprehensive dashboard for managing your valet business
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Submit Request</h3>
              <p className="text-gray-600">
                Fill out our simple form with your location, service type, and vehicle details
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Get AI Quote</h3>
              <p className="text-gray-600">
                Our AI analyzes your requirements and provides an instant, accurate quote
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Book & Pay</h3>
              <p className="text-gray-600">
                Confirm your booking and pay securely through our platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied customers and operators using ValetQuotes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/quote" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200">
              Get Your Quote Now
            </Link>
            <Link to="/register" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200">
              Become an Operator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;