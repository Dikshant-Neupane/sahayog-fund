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
            <div className="text-center p-8 rounded-xl" style={{background: 'rgba(26,32,44,0.85)', border: '1px solid rgba(255,255,255,0.08)'}}>
                <h3 className="text-2xl font-bold mb-4 text-white">Support This Cause</h3>
                <p className="mb-6" style={{color: 'rgba(180,198,231,0.7)'}}>
                    Connect your wallet to make a secure donation on Solana.
                </p>
                <div className="flex justify-center">
                    <WalletMultiButton className="!bg-[#DC143C] hover:!bg-[#B91030] !h-12 !px-6 !text-lg !font-semibold transition-all hover:scale-105 active:scale-95 shadow-md" />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl p-8 max-w-md mx-auto relative overflow-hidden" style={{background: 'rgba(26,32,44,0.85)', border: '1px solid rgba(255,255,255,0.08)'}}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-10 -mt-10 opacity-20 pointer-events-none" style={{background: 'rgba(220,20,60,0.3)'}}></div>

            <h2 className="text-3xl font-bold mb-6 text-center text-white relative z-10">Make a Donation</h2>

            {/* Preset Amounts */}
            <div className="mb-6 relative z-10">
                <label className="block text-sm font-medium mb-3" style={{color: 'rgba(180,198,231,0.8)'}}>
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
                                    ? 'border-[#DC143C] text-[#E8365A] shadow-sm transform scale-105'
                                    : 'border-[rgba(255,255,255,0.12)] hover:border-[rgba(220,20,60,0.4)] text-[#B4C6E7] hover:text-white'
                                }`}
                            style={!useCustom && amount === preset ? {background: 'rgba(220,20,60,0.15)'} : {background: 'transparent'}}
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
                        className="mr-2 w-4 h-4 rounded transition-colors accent-[#DC143C]"
                    />
                    <span className="text-sm font-medium group-hover:text-[#E8365A] transition-colors" style={{color: 'rgba(180,198,231,0.8)'}}>Enter Custom Amount</span>
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
                            className="w-full pl-4 pr-12 py-3 border-2 rounded-lg focus:outline-none text-white transition-all font-mono"
                            style={{background: 'rgba(21,25,33,0.9)', borderColor: 'rgba(255,255,255,0.12)'}}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold" style={{color: 'rgba(180,198,231,0.5)'}}>SOL</span>
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
                        className="mr-2 w-4 h-4 rounded transition-colors accent-[#DC143C]"
                    />
                    <span className="text-sm font-medium group-hover:text-[#E8365A] transition-colors" style={{color: 'rgba(180,198,231,0.8)'}}>Add your name (appears publicly)</span>
                </label>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showNameField ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value.slice(0, 50))}
                        placeholder="Your name or nickname"
                        maxLength={50}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-white transition-all"
                        style={{background: 'rgba(21,25,33,0.9)', borderColor: 'rgba(255,255,255,0.12)'}}
                    />
                </div>
            </div>

            {/* Message */}
            <div className="mb-8 relative z-10">
                <label className="block text-sm font-medium mb-2" style={{color: 'rgba(180,198,231,0.8)'}}>
                    Message to Fund (Optional)
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 280))}
                    placeholder="Share your support... / आफ्नो सहयोग साझा गर्नुहोस्..."
                    maxLength={280}
                    rows={3}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none resize-none text-white transition-all"
                    style={{background: 'rgba(21,25,33,0.9)', borderColor: 'rgba(255,255,255,0.12)'}}
                />
                <div className="flex justify-end mt-1">
                    <span className={`text-xs ${message.length > 250 ? 'text-amber-500 font-bold' : ''}`} style={{color: message.length > 250 ? undefined : 'rgba(180,198,231,0.4)'}}>
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

            <p className="text-xs mt-6 text-center flex items-center justify-center gap-1 group cursor-help" style={{color: 'rgba(180,198,231,0.4)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secured by Solana Blockchain
            </p>
        </div>
    );
}
