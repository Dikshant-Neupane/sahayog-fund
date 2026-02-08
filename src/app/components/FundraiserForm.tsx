"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });
import toast from "react-hot-toast";

interface FundraiserFormProps {
    onCancel: () => void;
}

interface FormErrors {
    organizationName?: string;
    representativeName?: string;
    description?: string;
    walletAddress?: string;
    verificationDetails?: string;
    eventDate?: string;
    locationAddress?: string;
    locationCoords?: string;
}

const FundraiserForm = ({ onCancel }: FundraiserFormProps) => {
    const [formData, setFormData] = useState({
        organizationName: "",
        representativeName: "",
        description: "",
        walletAddress: "",
        officialLinks: ["", ""],
        verificationDetails: "",
        eventDate: "",
        location: {
            address: "",
            coords: ""
        }
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const toErrorKey = (fieldName: string): keyof FormErrors => {
        if (fieldName === 'location.address') return 'locationAddress';
        if (fieldName === 'location.coords') return 'locationCoords';
        return fieldName as keyof FormErrors;
    };

    // Validate Solana wallet address format
    const isValidSolanaAddress = (address: string): boolean => {
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    };

    const validateField = useCallback((name: string, value: string): string | undefined => {
        switch (name) {
            case 'organizationName':
                if (!value.trim()) return 'Organization name is required';
                if (value.length < 3) return 'Name must be at least 3 characters';
                break;
            case 'representativeName':
                if (!value.trim()) return 'Representative name is required';
                break;
            case 'description':
                if (!value.trim()) return 'Description is required';
                if (value.length < 50) return 'Description must be at least 50 characters';
                break;
            case 'walletAddress':
                if (!value.trim()) return 'Wallet address is required';
                if (!isValidSolanaAddress(value)) return 'Invalid Solana wallet address format';
                break;
            case 'verificationDetails':
                if (!value.trim()) return 'Verification details are required';
                break;
            case 'eventDate':
                if (!value) return 'Event date is required';
                if (new Date(value) < new Date()) return 'Event date must be in the future';
                break;
            case 'location.address':
                if (!value.trim()) return 'Location address is required';
                break;
            case 'location.coords':
                if (!value.trim()) return 'Please pin the location on the map';
                break;
        }
        return undefined;
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name.includes("location.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Validate on change if field has been touched
        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [toErrorKey(name)]: error }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [toErrorKey(name)]: error }));
    };

    const handleMapSelect = (coords: string) => {
        setFormData(prev => ({ ...prev, location: { ...prev.location, coords } }));
        setTouched(prev => ({ ...prev, ['location.coords']: true }));
        const error = validateField('location.coords', coords) || undefined;
        setErrors(prev => ({ ...prev, [toErrorKey('location.coords')]: error }));
    };

    const handleLinkChange = (index: number, value: string) => {
        const newLinks = [...formData.officialLinks];
        newLinks[index] = value;
        setFormData(prev => ({ ...prev, officialLinks: newLinks }));
    };

    const addLinkField = () => {
        if (formData.officialLinks.length < 5) {
            setFormData(prev => ({ ...prev, officialLinks: [...prev.officialLinks, ""] }));
        } else {
            toast.error("Maximum 5 links allowed");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all fields
        const newErrors: FormErrors = {};
        const fieldsToValidate = [
            { name: 'organizationName', value: formData.organizationName },
            { name: 'representativeName', value: formData.representativeName },
            { name: 'description', value: formData.description },
            { name: 'walletAddress', value: formData.walletAddress },
            { name: 'verificationDetails', value: formData.verificationDetails },
            { name: 'eventDate', value: formData.eventDate },
            { name: 'location.address', value: formData.location.address },
            { name: 'location.coords', value: formData.location.coords },
        ];

        fieldsToValidate.forEach(({ name, value }) => {
            const error = validateField(name, value);
            if (error) {
                const errorKey = toErrorKey(name);
                newErrors[errorKey] = error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched(Object.fromEntries(fieldsToValidate.map(f => [f.name, true])));
            toast.error("Please fix the errors in the form");
            return;
        }

        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Fundraiser verification request submitted!");
            onCancel();
        } catch {
            toast.error("Failed to submit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getInputClassName = (fieldName: string) => {
        const errorKey = toErrorKey(fieldName);
        const hasError = touched[fieldName] && errors[errorKey];
        return hasError ? 'input-error' : '';
    };

    return (
        <section className="form-section" role="region" aria-labelledby="fundraiser-form-title">
            <div className="form-container">
                <div className="form-header">
                    <h2 id="fundraiser-form-title">Start a Fundraiser</h2>
                    <p>Submit your details for verification to start raising funds.</p>
                </div>

                <form onSubmit={handleSubmit} className="fundraiser-form" noValidate>
                    {/* Organization Details */}
                    <div className="form-group">
                        <label htmlFor="organizationName">Organization Name *</label>
                        <input
                            type="text"
                            id="organizationName"
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Registered organization name"
                            className={getInputClassName('organizationName')}
                            aria-invalid={!!errors.organizationName}
                            aria-describedby={errors.organizationName ? 'orgName-error' : undefined}
                            required
                        />
                        {touched.organizationName && errors.organizationName && (
                            <span id="orgName-error" className="error-message" role="alert">{errors.organizationName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="representativeName">Representative Name *</label>
                        <input
                            type="text"
                            id="representativeName"
                            name="representativeName"
                            value={formData.representativeName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Full name of authorized representative"
                            className={getInputClassName('representativeName')}
                            aria-invalid={!!errors.representativeName}
                            aria-describedby={errors.representativeName ? 'repName-error' : undefined}
                            required
                        />
                        {touched.representativeName && errors.representativeName && (
                            <span id="repName-error" className="error-message" role="alert">{errors.representativeName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Fundraiser Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Describe your cause, goals, and impact..."
                            rows={4}
                            className={getInputClassName('description')}
                            aria-invalid={!!errors.description}
                            aria-describedby={errors.description ? 'desc-error' : 'desc-hint'}
                            required
                        />
                        <span id="desc-hint" className="hint-text">{formData.description.length}/50 characters minimum</span>
                        {touched.description && errors.description && (
                            <span id="desc-error" className="error-message" role="alert">{errors.description}</span>
                        )}
                    </div>

                    {/* Wallet Info */}
                    <div className="form-group">
                        <label htmlFor="walletAddress">Solana Wallet Address *</label>
                        <div className="wallet-input-container">
                            <input
                                type="text"
                                id="walletAddress"
                                name="walletAddress"
                                value={formData.walletAddress}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Public key for receiving funds"
                                className={`font-mono ${getInputClassName('walletAddress')}`}
                                aria-invalid={!!errors.walletAddress}
                                aria-describedby={errors.walletAddress ? 'wallet-error' : undefined}
                                required
                            />
                            <div className="input-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="M12 12h.01" />
                                </svg>
                            </div>
                        </div>
                        {touched.walletAddress && errors.walletAddress && (
                            <span id="wallet-error" className="error-message" role="alert">{errors.walletAddress}</span>
                        )}
                    </div>

                    {/* Official Links */}
                    <div className="form-group">
                        <label>Official Links (Social, Website) *</label>
                        {formData.officialLinks.map((link, index) => (
                            <input
                                key={index}
                                type="url"
                                value={link}
                                onChange={(e) => handleLinkChange(index, e.target.value)}
                                placeholder={`Link ${index + 1} (e.g. Website, Instagram)`}
                                className="mb-2"
                                aria-label={`Official link ${index + 1}`}
                                required={index === 0}
                            />
                        ))}
                        <button 
                            type="button" 
                            onClick={addLinkField} 
                            className="add-link-btn"
                            disabled={formData.officialLinks.length >= 5}
                        >
                            + Add another link {formData.officialLinks.length >= 5 && '(max 5)'}
                        </button>
                    </div>

                    {/* Verification */}
                    <div className="form-group">
                        <label htmlFor="verificationDetails">Verification Details *</label>
                        <textarea
                            id="verificationDetails"
                            name="verificationDetails"
                            value={formData.verificationDetails}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Provide details to help us verify your request (Registration numbers, references, etc.)"
                            rows={3}
                            className={getInputClassName('verificationDetails')}
                            aria-invalid={!!errors.verificationDetails}
                            aria-describedby={errors.verificationDetails ? 'verify-error' : undefined}
                            required
                        />
                        {touched.verificationDetails && errors.verificationDetails && (
                            <span id="verify-error" className="error-message" role="alert">{errors.verificationDetails}</span>
                        )}
                    </div>

                    {/* Event Info */}
                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="eventDate">Event Date/Time *</label>
                            <input
                                type="datetime-local"
                                id="eventDate"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClassName('eventDate')}
                                aria-invalid={!!errors.eventDate}
                                aria-describedby={errors.eventDate ? 'date-error' : undefined}
                                required
                            />
                            {touched.eventDate && errors.eventDate && (
                                <span id="date-error" className="error-message" role="alert">{errors.eventDate}</span>
                            )}
                        </div>
                        <div className="form-group half">
                            <label htmlFor="locationAddress">Location Address *</label>
                            <input
                                type="text"
                                id="locationAddress"
                                name="location.address"
                                value={formData.location.address}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Physical address"
                                className={getInputClassName('location.address')}
                                aria-invalid={!!errors.locationAddress}
                                aria-describedby={errors.locationAddress ? 'location-error' : undefined}
                                required
                            />
                            {touched['location.address'] && errors.locationAddress && (
                                <span id="location-error" className="error-message" role="alert">{errors.locationAddress}</span>
                            )}
                        </div>
                    </div>

                    {/* Map Picker */}
                    <div className="form-group">
                        <label htmlFor="map-picker">Map Location Verification *</label>
                        <MapPicker
                            value={formData.location.coords}
                            onChange={handleMapSelect}
                        />
                        <div className="map-coords-row">
                            <input
                                id="map-picker"
                                type="text"
                                name="location.coords"
                                value={formData.location.coords}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClassName('location.coords')}
                                placeholder="Latitude,Longitude"
                                aria-invalid={!!errors.locationCoords}
                                aria-describedby={errors.locationCoords ? 'map-error' : undefined}
                                readOnly
                            />
                            <span className="hint-text">Kathmandu default — click map to set exact point</span>
                        </div>
                        {touched['location.coords'] && errors.locationCoords && (
                            <span id="map-error" className="error-message" role="alert">{errors.locationCoords}</span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            className="btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" aria-hidden="true" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit for Verification"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default FundraiserForm;
