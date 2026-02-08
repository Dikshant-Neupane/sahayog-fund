import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useDonate } from '@/hooks/useDonate';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const PRESET_AMOUNTS = [0.1, 0.5, 1, 5];

export function DonationForm() {
    const { connected } = useWallet();
    const { donate, loading } = useDonate();
    const [amount, setAmount] = useState<number>(0.5);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [donorName, setDonorName] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [useCustom, setUseCustom] = useState(false);
    const [showNameField, setShowNameField] = useState(false);

    const handleConfetti = () => {
        // Fire confetti from the center
        const duration = 2000;
        const animationEnd = Date.now() + duration;

        // Create confetti burst function
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 9999, // Ensure it's on top of modals/toasts
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#DC143C', '#003893', '#FFFFFF', '#CB4154', '#22A35D'] // Nepal theme colors
            });
            confetti({
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 9999,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#DC143C', '#003893', '#FFFFFF', '#CB4154', '#22A35D']
            });
        }, 250);
    };

    const handleDonate = async () => {
        const donationAmount = useCustom ? parseFloat(customAmount) : amount;

        if (isNaN(donationAmount) || donationAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        const tx = await donate(donationAmount, message);

        if (tx) {
            // Fire confetti on success!
            handleConfetti();

            // Reset form
            setMessage('');
            setDonorName('');
            setShowNameField(false);
            setCustomAmount('');
            setUseCustom(false);
            setAmount(0.5);
        }
    };

    if (!connected) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Support This Cause</h3>
                <p className="text-gray-600 mb-6">
                    Connect your wallet to make a secure donation on Solana.
                </p>
                <div className="flex justify-center">
                    <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !h-12 !px-6 !text-lg !font-semibold transition-all hover:scale-105 active:scale-95 shadow-md" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto border border-gray-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>

            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 relative z-10">Make a Donation</h2>

            {/* Preset Amounts */}
            <div className="mb-6 relative z-10">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Amount (SOL)
                </label>
                <div className="grid grid-cols-4 gap-3">
                    {PRESET_AMOUNTS.map((preset) => (
                        <button
                            key={preset}
                            onClick={() => {
                                setAmount(preset);
                                setUseCustom(false);
                            }}
                            className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all active:scale-95 duration-200 ${!useCustom && amount === preset
                                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm transform scale-105'
                                    : 'border-gray-200 hover:border-blue-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            {preset} ◎
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6 relative z-10">
                <label className="flex items-center mb-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={useCustom}
                        onChange={(e) => setUseCustom(e.target.checked)}
                        className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 transition-colors"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Enter Custom Amount</span>
                </label>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${useCustom ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="relative">
                        <input
                            type="number"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0.0001"
                            className="w-full pl-4 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-800 transition-all font-mono"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">SOL</span>
                    </div>
                </div>
            </div>

            {/* Donor Name (Optional) */}
            <div className="mb-4 relative z-10">
                <label className="flex items-center mb-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={showNameField}
                        onChange={(e) => setShowNameField(e.target.checked)}
                        className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 transition-colors"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Add your name (appears publicly)</span>
                </label>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showNameField ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value.slice(0, 50))}
                        placeholder="Your name or nickname"
                        maxLength={50}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-800 transition-all"
                    />
                </div>
            </div>

            {/* Message */}
            <div className="mb-8 relative z-10">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to Fund (Optional)
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 280))}
                    placeholder="Share your support... / आफ्नो सहयोग साझा गर्नुहोस्..."
                    maxLength={280}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none text-gray-800 transition-all bg-gray-50 focus:bg-white"
                />
                <div className="flex justify-end mt-1">
                    <span className={`text-xs ${message.length > 250 ? 'text-amber-500 font-bold' : 'text-gray-400'}`}>
                        {message.length}/280
                    </span>
                </div>
            </div>

            {/* Donate Button */}
            <button
                onClick={handleDonate}
                disabled={loading}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-[#DC143C] to-[#003893] hover:from-[#B91035] hover:to-[#002766] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 text-lg"
                aria-busy={loading}
            >
                <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                {loading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Transaction...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <span>✨ Donate {useCustom ? customAmount || '0' : amount} SOL</span>
                    </span>
                )}
            </button>

            <p className="text-xs text-gray-400 mt-6 text-center flex items-center justify-center gap-1 group cursor-help">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secured by Solana Blockchain
            </p>
        </div>
    );
}
