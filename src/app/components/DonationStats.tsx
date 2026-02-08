import { useDonationStats } from '@/hooks/useDonationStats';
import { useEffect, useState } from 'react';

export function DonationStats() {
    const { totalDonations, totalDonors, isActive, loading, error } = useDonationStats();
    const [displayDonations, setDisplayDonations] = useState(0);
    const [displayDonors, setDisplayDonors] = useState(0);

    // Animated counter effect
    useEffect(() => {
        if (loading) return;

        // Animate donations
        const donationInterval = setInterval(() => {
            setDisplayDonations(prev => {
                const diff = totalDonations - prev;
                if (Math.abs(diff) < 0.001) {
                    clearInterval(donationInterval);
                    return totalDonations;
                }
                return prev + diff / 20;
            });
        }, 20);

        // Animate donors
        const donorInterval = setInterval(() => {
            setDisplayDonors(prev => {
                const diff = totalDonors - prev;
                if (Math.abs(diff) < 1) {
                    clearInterval(donorInterval);
                    return totalDonors;
                }
                return prev + Math.ceil(diff / 20);
            });
        }, 50);

        return () => {
            clearInterval(donationInterval);
            clearInterval(donorInterval);
        };
    }, [totalDonations, totalDonors, loading]);

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600">⚠️ {error}</p>
            </div>
        );
    }

    return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Total Donations */}
      <div className="bg-gradient-to-br from-[#003893] to-[#002766] rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Total Donations</p>
            <h3 className="text-4xl font-bold">
              {loading ? (
                <span className="animate-pulse">--</span>
              ) : (
                `${displayDonations.toFixed(4)} ◎`
              )}
            </h3>
            <p className="text-blue-100 text-xs mt-1">
              ≈ ${(displayDonations * 145).toFixed(2)} USD
            </p>
          </div>
          <div className="text-6xl opacity-20">💰</div>
        </div>
      </div>

      {/* Total Donors */}
      <div className="bg-gradient-to-br from-[#22A35D] to-[#1A8349] rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium mb-1">Total Donors</p>
            <h3 className="text-4xl font-bold">
              {loading ? (
                <span className="animate-pulse">--</span>
              ) : (
                Math.floor(displayDonors)
              )}
            </h3>
            <p className="text-emerald-100 text-xs mt-1">Community supporters</p>
          </div>
          <div className="text-6xl opacity-20">❤️</div>
        </div>
      </div>

        {/* Status */}
        <div className="bg-gradient-to-br from-[#DC143C] to-[#B91035] rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-red-100 text-sm font-medium mb-1">Campaign Status</p>
                    <h3 className="text-2xl font-bold">
                        {loading ? (
                            <span className="animate-pulse">Loading...</span>
                        ) : isActive ? (
                            <span className="flex items-center">
                                <span className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                Active
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
                                Paused
                            </span>
                        )}
                    </h3>
                    <p className="text-red-100 text-xs mt-1">
                        {isActive ? 'Accepting donations' : 'Temporarily paused'}
                    </p>
                </div>
                <div className="text-6xl opacity-20">📊</div>
            </div>
      </div >
    </div >
  );
}
