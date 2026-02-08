"use client";

const CampaignSkeleton = () => {
    return (
        <div className="campaign-skeleton" aria-hidden="true">
            {/* Image Skeleton */}
            <div className="skeleton-image shimmer" />
            
            {/* Content Skeleton */}
            <div className="skeleton-content">
                {/* Title */}
                <div className="skeleton-title shimmer" />
                
                {/* Organizer */}
                <div className="skeleton-text skeleton-short shimmer" />
                
                {/* Description */}
                <div className="skeleton-text shimmer" />
                <div className="skeleton-text skeleton-medium shimmer" />
                
                {/* Progress */}
                <div className="skeleton-progress">
                    <div className="skeleton-progress-bar shimmer" />
                    <div className="skeleton-progress-stats">
                        <div className="skeleton-stat shimmer" />
                        <div className="skeleton-stat shimmer" />
                    </div>
                </div>
                
                {/* Footer */}
                <div className="skeleton-footer">
                    <div className="skeleton-text skeleton-short shimmer" />
                </div>
                
                {/* Button */}
                <div className="skeleton-button shimmer" />
            </div>
        </div>
    );
};

export const CampaignGridSkeleton = ({ count = 6 }: { count?: number }) => {
    return (
        <div className="campaign-grid" aria-busy="true" aria-label="Loading campaigns">
            {Array.from({ length: count }).map((_, index) => (
                <CampaignSkeleton key={index} />
            ))}
        </div>
    );
};

export default CampaignSkeleton;
