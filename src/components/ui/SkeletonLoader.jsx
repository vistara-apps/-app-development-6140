import React from 'react';
import { clsx } from 'clsx';

const SkeletonLoader = ({ className, ...props }) => {
  return <div className={clsx('skeleton', className)} {...props} />;
};

const SkeletonText = ({ lines = 1, className, ...props }) => {
  return (
    <div className={clsx('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="skeleton-text" />
      ))}
    </div>
  );
};

const SkeletonAvatar = ({ className, ...props }) => {
  return <div className={clsx('skeleton-avatar', className)} {...props} />;
};

const SkeletonCard = ({ className, ...props }) => {
  return (
    <div className={clsx('card animate-pulse', className)} {...props}>
      <div className="card-body">
        <div className="flex items-center space-x-4 mb-4">
          <SkeletonAvatar />
          <div className="flex-1">
            <SkeletonText lines={2} />
          </div>
        </div>
        <SkeletonText lines={3} />
        <div className="mt-4 flex space-x-2">
          <div className="skeleton h-10 w-24 rounded-lg" />
          <div className="skeleton h-10 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

SkeletonLoader.Text = SkeletonText;
SkeletonLoader.Avatar = SkeletonAvatar;
SkeletonLoader.Card = SkeletonCard;

export default SkeletonLoader;

