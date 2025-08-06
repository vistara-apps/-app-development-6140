import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const userRole = watch('role', 'customer');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signUp(data.email, data.password, {
        name: data.name,
        phone: data.phone,
        role: data.role,
        businessName: data.businessName
      });
      
      if (result.user) {
        navigate(result.user.role === 'operator' ? '/portal' : '/');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Account Type</label>
              <select
                {...register('role', { required: 'Account type is required' })}
                className="form-input"
              >
                <option value="customer">Customer</option>
                <option value="operator">Valet Service Operator</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Full Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                className="form-input"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {userRole === 'operator' && (
              <div>
                <label className="form-label">Business Name</label>
                <input
                  {...register('businessName', { 
                    required: userRole === 'operator' ? 'Business name is required' : false 
                  })}
                  type="text"
                  className="form-input"
                  placeholder="Enter your business name"
                />
                {errors.businessName && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>
                )}
              </div>
            )}
            
            <div>
              <label className="form-label">Email address</label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                autoComplete="email"
                className="form-input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <input
                {...register('phone', { required: 'Phone number is required' })}
                type="tel"
                className="form-input"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
            
            <div>
              <label className="form-label">Password</label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type="password"
                autoComplete="new-password"
                className="form-input"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <input
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: (value) => {
                    const password = watch('password');
                    return value === password || 'Passwords do not match';
                  }
                })}
                type="password"
                autoComplete="new-password"
                className="form-input"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;