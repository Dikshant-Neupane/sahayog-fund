"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });
import toast from "react-hot-toast";

interface FundraiserFormProps {
    onCancel: () => void;
}

interface FormErrors {
    organizationName?: string;
    representativeName?: string;
    representativeEmail?: string;
    representativePhone?: string;
    representativeRole?: string;
    description?: string;
    walletAddress?: string;
    verificationDetails?: string;
    eventDate?: string;
    locationAddress?: string;
    locationCoords?: string;
    category?: string;
    goalAmount?: string;
    province?: string;
}

const CATEGORIES = [
    'Humanitarian', 'Healthcare', 'Health', 'Education', 'Technology',
    'Infrastructure', 'Environment', 'Agriculture', 'Women Empowerment',
    'Culture', 'Energy', 'Livelihood', 'Business', 'Animal Welfare',
    'Housing', 'Accessibility',
];

const PROVINCES = [
    'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim',
];

const FundraiserForm = ({ onCancel }: FundraiserFormProps) => {
    const [formData, setFormData] = useState({
        organizationName: "",
        representativeName: "",
        representativeEmail: "",
        representativePhone: "",
        representativeRole: "",
        description: "",
        walletAddress: "",
        officialLinks: ["", ""],
        verificationDetails: "",
        eventDate: "",
        category: "Humanitarian",
        goalAmount: "",
        province: "",
        district: "",
        municipality: "",
        location: {
            address: "",
            coords: ""
        }
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [step, setStep] = useState(1); // Multi-step form: 1=details, 2=documents, 3=review
    const [campaignId, setCampaignId] = useState<string | null>(null);
    const [documents, setDocuments] = useState<{
        ngoRegistration: File | null;
        taxExemption: File | null;
        representativeId: File | null;
        representativePhoto: File | null;
    }>({
        ngoRegistration: null,
        taxExemption: null,
        representativeId: null,
        representativePhoto: null,
    });
    const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({});

    const fileInputRefs = {
        ngoRegistration: useRef<HTMLInputElement>(null),
        taxExemption: useRef<HTMLInputElement>(null),
        representativeId: useRef<HTMLInputElement>(null),
        representativePhoto: useRef<HTMLInputElement>(null),
    };

    const toErrorKey = (fieldName: string): keyof FormErrors => {
        if (fieldName === 'location.address') return 'locationAddress';
        if (fieldName === 'location.coords') return 'locationCoords';
        return fieldName as keyof FormErrors;
    };

    const isValidSolanaAddress = (address: string): boolean => {
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    };

    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
            case 'representativeEmail':
                if (value && !isValidEmail(value)) return 'Invalid email address';
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
            case 'goalAmount':
                if (value && (isNaN(Number(value)) || Number(value) <= 0)) return 'Goal amount must be greater than 0';
                break;
            case 'category':
                if (!value.trim()) return 'Category is required';
                break;
            case 'province':
                if (!value.trim()) return 'Province is required';
                break;
        }
        return undefined;
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [toErrorKey(name)]: error }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const handleFileChange = (type: keyof typeof documents) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large. Max 5MB.');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Use JPEG, PNG, WebP, or PDF.');
            return;
        }

        setDocuments(prev => ({ ...prev, [type]: file }));
    };

    const uploadDocument = async (file: File, type: string, cId: string) => {
        const formDataObj = new FormData();
        formDataObj.append('file', file);
        formDataObj.append('campaignId', cId);
        formDataObj.append('documentType', type);

        const res = await fetch('/api/upload-documents', {
            method: 'POST',
            body: formDataObj,
        });

        if (!res.ok) {
            throw new Error(`Failed to upload ${type}`);
        }

        return res.json();
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
            { name: 'category', value: formData.category },
            { name: 'province', value: formData.province },
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
            // Step 1: Submit campaign data to database
            const res = await fetch('/api/submit-campaign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationName: formData.organizationName,
                    representativeName: formData.representativeName,
                    representativeEmail: formData.representativeEmail,
                    representativePhone: formData.representativePhone,
                    representativeRole: formData.representativeRole,
                    description: formData.description,
                    walletAddress: formData.walletAddress,
                    officialLinks: formData.officialLinks.filter(l => l.trim()),
                    verificationDetails: formData.verificationDetails,
                    eventDate: formData.eventDate,
                    locationAddress: formData.location.address,
                    locationCoords: formData.location.coords,
                    province: formData.province,
                    district: formData.district,
                    municipality: formData.municipality,
                    category: formData.category,
                    goalAmount: parseFloat(formData.goalAmount) || 0,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit campaign');
            }

            setCampaignId(data.campaignId);
            setStep(2); // Move to document upload step
            toast.success("Campaign submitted! Now upload your documents.");
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'Failed to submit. Please try again.';
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentUpload = async () => {
        if (!campaignId) return;
        setLoading(true);

        const uploads = [
            { file: documents.ngoRegistration, type: 'ngo_registration', label: 'NGO Registration' },
            { file: documents.taxExemption, type: 'tax_exemption', label: 'Tax Exemption' },
            { file: documents.representativeId, type: 'representative_id', label: 'Representative ID' },
            { file: documents.representativePhoto, type: 'representative_photo', label: 'Representative Photo' },
        ];

        let successCount = 0;

        for (const upload of uploads) {
            if (upload.file) {
                try {
                    setUploadProgress(prev => ({ ...prev, [upload.type]: true }));
                    await uploadDocument(upload.file, upload.type, campaignId);
                    successCount++;
                    setUploadProgress(prev => ({ ...prev, [upload.type]: false }));
                } catch {
                    toast.error(`Failed to upload ${upload.label}`);
                    setUploadProgress(prev => ({ ...prev, [upload.type]: false }));
                }
            }
        }

        setLoading(false);

        if (successCount > 0) {
            toast.success(`${successCount} document(s) uploaded successfully!`);
        }

        setStep(3); // Move to confirmation step
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
                    {/* Step Indicator */}
                    <div className="step-indicator">
                        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                        <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
                        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                        <div className={`step-line ${step >= 3 ? 'active' : ''}`} />
                        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                    </div>
                    <div className="step-labels">
                        <span className={step === 1 ? 'active' : ''}>Details</span>
                        <span className={step === 2 ? 'active' : ''}>Documents</span>
                        <span className={step === 3 ? 'active' : ''}>Confirm</span>
                    </div>
                </div>

                {/* Step 1: Campaign Details Form */}
                {step === 1 && (
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
                            required
                        />
                        {touched.organizationName && errors.organizationName && (
                            <span className="error-message" role="alert">{errors.organizationName}</span>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="representativeName">Representative Name *</label>
                            <input
                                type="text"
                                id="representativeName"
                                name="representativeName"
                                value={formData.representativeName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Full name"
                                className={getInputClassName('representativeName')}
                                required
                            />
                            {touched.representativeName && errors.representativeName && (
                                <span className="error-message" role="alert">{errors.representativeName}</span>
                            )}
                        </div>
                        <div className="form-group half">
                            <label htmlFor="representativeRole">Role / Title</label>
                            <input
                                type="text"
                                id="representativeRole"
                                name="representativeRole"
                                value={formData.representativeRole}
                                onChange={handleChange}
                                placeholder="e.g. President, Director"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="representativeEmail">Email Address</label>
                            <input
                                type="email"
                                id="representativeEmail"
                                name="representativeEmail"
                                value={formData.representativeEmail}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="email@example.com"
                                className={getInputClassName('representativeEmail')}
                            />
                            {touched.representativeEmail && errors.representativeEmail && (
                                <span className="error-message" role="alert">{errors.representativeEmail}</span>
                            )}
                        </div>
                        <div className="form-group half">
                            <label htmlFor="representativePhone">Phone Number</label>
                            <input
                                type="tel"
                                id="representativePhone"
                                name="representativePhone"
                                value={formData.representativePhone}
                                onChange={handleChange}
                                placeholder="+977-XXXXXXXXXX"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group half">
                            <label htmlFor="goalAmount">Fundraise Goal (SOL)</label>
                            <input
                                type="number"
                                id="goalAmount"
                                name="goalAmount"
                                value={formData.goalAmount}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="e.g. 100"
                                min="0"
                                step="0.01"
                                className={getInputClassName('goalAmount')}
                            />
                        </div>
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
                            required
                        />
                        <span className="hint-text">{formData.description.length}/50 characters minimum</span>
                        {touched.description && errors.description && (
                            <span className="error-message" role="alert">{errors.description}</span>
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
                            <span className="error-message" role="alert">{errors.walletAddress}</span>
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
                            required
                        />
                        {touched.verificationDetails && errors.verificationDetails && (
                            <span className="error-message" role="alert">{errors.verificationDetails}</span>
                        )}
                    </div>

                    {/* Province/Location */}
                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="province">Province</label>
                            <select id="province" name="province" value={formData.province} onChange={handleChange} className="form-select">
                                <option value="">Select Province</option>
                                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="form-group half">
                            <label htmlFor="district">District</label>
                            <input type="text" id="district" name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Kathmandu" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="municipality">Municipality</label>
                            <input type="text" id="municipality" name="municipality" value={formData.municipality} onChange={handleChange} placeholder="e.g. Kathmandu Metropolitan" />
                        </div>
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
                                required
                            />
                            {touched.eventDate && errors.eventDate && (
                                <span className="error-message" role="alert">{errors.eventDate}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
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
                            required
                        />
                        {touched['location.address'] && errors.locationAddress && (
                            <span className="error-message" role="alert">{errors.locationAddress}</span>
                        )}
                    </div>

                    {/* Map Picker */}
                    <div className="form-group">
                        <label htmlFor="map-picker">Map Location Verification *</label>
                        <MapPicker value={formData.location.coords} onChange={handleMapSelect} />
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
                                readOnly
                            />
                            <span className="hint-text">Kathmandu default — click map to set exact point</span>
                        </div>
                        {touched['location.coords'] && errors.locationCoords && (
                            <span className="error-message" role="alert">{errors.locationCoords}</span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
                            {loading ? (<><span className="spinner" aria-hidden="true" />Submitting...</>) : "Submit & Continue to Documents"}
                        </button>
                    </div>
                </form>
                )}

                {/* Step 2: Document Upload */}
                {step === 2 && (
                <div className="fundraiser-form">
                    <div className="doc-upload-section">
                        <h3>Upload Verification Documents</h3>
                        <p className="hint-text">Upload supporting documents to speed up verification. All files max 5MB.</p>

                        <div className="doc-upload-grid">
                            <div className="doc-upload-card">
                                <div className="doc-icon">📄</div>
                                <h4>NGO Registration Certificate</h4>
                                <p>Government registration document</p>
                                <input type="file" ref={fileInputRefs.ngoRegistration} onChange={handleFileChange('ngoRegistration')} accept=".jpg,.jpeg,.png,.webp,.pdf" hidden />
                                <button type="button" className="doc-upload-btn" onClick={() => fileInputRefs.ngoRegistration.current?.click()} disabled={!!uploadProgress.ngo_registration}>
                                    {documents.ngoRegistration ? `✓ ${documents.ngoRegistration.name}` : 'Choose File'}
                                </button>
                            </div>

                            <div className="doc-upload-card">
                                <div className="doc-icon">📋</div>
                                <h4>Tax Exemption Document</h4>
                                <p>Tax exemption certificate if applicable</p>
                                <input type="file" ref={fileInputRefs.taxExemption} onChange={handleFileChange('taxExemption')} accept=".jpg,.jpeg,.png,.webp,.pdf" hidden />
                                <button type="button" className="doc-upload-btn" onClick={() => fileInputRefs.taxExemption.current?.click()} disabled={!!uploadProgress.tax_exemption}>
                                    {documents.taxExemption ? `✓ ${documents.taxExemption.name}` : 'Choose File'}
                                </button>
                            </div>

                            <div className="doc-upload-card">
                                <div className="doc-icon">🪪</div>
                                <h4>Representative ID Card</h4>
                                <p>Citizenship, passport, or national ID</p>
                                <input type="file" ref={fileInputRefs.representativeId} onChange={handleFileChange('representativeId')} accept=".jpg,.jpeg,.png,.webp,.pdf" hidden />
                                <button type="button" className="doc-upload-btn" onClick={() => fileInputRefs.representativeId.current?.click()} disabled={!!uploadProgress.representative_id}>
                                    {documents.representativeId ? `✓ ${documents.representativeId.name}` : 'Choose File'}
                                </button>
                            </div>

                            <div className="doc-upload-card">
                                <div className="doc-icon">📸</div>
                                <h4>Representative Photo</h4>
                                <p>Clear headshot photo for display</p>
                                <input type="file" ref={fileInputRefs.representativePhoto} onChange={handleFileChange('representativePhoto')} accept=".jpg,.jpeg,.png,.webp" hidden />
                                <button type="button" className="doc-upload-btn" onClick={() => fileInputRefs.representativePhoto.current?.click()} disabled={!!uploadProgress.representative_photo}>
                                    {documents.representativePhoto ? `✓ ${documents.representativePhoto.name}` : 'Choose File'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => { setStep(3); }} className="btn-secondary">Skip for Now</button>
                        <button type="button" onClick={handleDocumentUpload} className="btn-primary" disabled={loading}>
                            {loading ? (<><span className="spinner" aria-hidden="true" />Uploading...</>) : "Upload Documents"}
                        </button>
                    </div>
                </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                <div className="fundraiser-form confirmation-step">
                    <div className="confirmation-card">
                        <div className="confirmation-icon">✅</div>
                        <h3>Campaign Submitted Successfully!</h3>
                        <p>Thank you for submitting your campaign for verification.</p>

                        {campaignId && (
                            <div className="campaign-id-display">
                                <span className="label">Campaign ID:</span>
                                <code>{campaignId}</code>
                            </div>
                        )}

                        <div className="verification-timeline">
                            <div className="timeline-item active">
                                <div className="timeline-dot" />
                                <div>
                                    <strong>Submitted</strong>
                                    <p>Your campaign has been received</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-dot" />
                                <div>
                                    <strong>Under Review</strong>
                                    <p>Our team will review your documents (1-3 days)</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-dot" />
                                <div>
                                    <strong>Verification Meeting</strong>
                                    <p>We&apos;ll schedule a call or site visit</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-dot" />
                                <div>
                                    <strong>Campaign Live!</strong>
                                    <p>Your verified campaign goes live for donations</p>
                                </div>
                            </div>
                        </div>

                        {formData.representativeEmail && (
                            <p className="hint-text">A confirmation email has been sent to {formData.representativeEmail}</p>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="btn-primary">Back to Home</button>
                    </div>
                </div>
                )}
            </div>
        </section>
    );
};

export default FundraiserForm;
