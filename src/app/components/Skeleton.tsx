"use client";

export default function CampaignCardSkeleton() {
    return (
        <div className="skeleton-card animate-pulse">
            <div className="skeleton-image bg-gray-700 h-48 w-full rounded-t-xl" />
            <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
                <div className="space-y-2 pt-4">
                    <div className="h-2 bg-gray-700 rounded-full" />
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-700 rounded w-1/4" />
                        <div className="h-4 bg-gray-700 rounded w-1/4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
