import React, { useState } from 'react';
import { CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';

const PaymentForm = ({ quote, onBack }) => {
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setPaymentComplete(true);
    }, 2000);
  };

  if (paymentComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your valet service has been booked. You'll receive a confirmation email shortly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Booking Details</h3>
            <p className="text-sm text-gray-600">Total Paid: ${quote.total}</p>
            <p className="text-sm text-gray-600">Confirmation: #VQ{Date.now().toString().slice(-6)}</p>
          </div>
          <button onClick={() => window.location.href = '/'} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Payment</h2>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="flex justify-between text-sm mb-1">
            <span>Base Service Fee:</span>
            <span>${quote.basePrice}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Additional Fees:</span>
            <span>${quote.additionalFees}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>${quote.total}</span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePayment}>
          <div className="mb-6">
            <label className="form-label">
              <CreditCard className="inline h-4 w-4 mr-1" />
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardInfo.number}
              onChange={(e) => setCardInfo({...cardInfo, number: e.target.value})}
              className="form-input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="form-label">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={cardInfo.expiry}
                onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">CVV</label>
              <input
                type="text"
                placeholder="123"
                value={cardInfo.cvv}
                onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="form-label">Cardholder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardInfo.name}
              onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full btn-primary flex items-center justify-center"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              `Pay $${quote.total}`
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your payment is secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;