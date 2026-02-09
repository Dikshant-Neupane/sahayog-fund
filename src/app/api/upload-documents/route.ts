import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const campaignId = formData.get('campaignId') as string;
        const documentType = formData.get('documentType') as string; // 'ngo_registration' | 'tax_exemption' | 'representative_id' | 'representative_photo'

        if (!file || !campaignId || !documentType) {
            return NextResponse.json({ error: 'Missing file, campaignId, or documentType' }, { status: 400 });
        }

        // Validate documentType against allowed values
        const validDocumentTypes = ['ngo_registration', 'tax_exemption', 'representative_id', 'representative_photo'];
        if (!validDocumentTypes.includes(documentType)) {
            return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF' }, { status: 400 });
        }

        const supabase = createServerSupabase();

        // Determine bucket and path based on document type
        const bucket = documentType === 'representative_photo' ? 'photos' : 'documents';
        const ext = file.name.split('.').pop() || 'bin';
        const filePath = `${campaignId}/${documentType}_${Date.now()}.${ext}`;

        // Upload to Supabase Storage
        const bytes = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, Buffer.from(bytes), {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;

        // Update campaign record with document URL
        const updateField = {
            ngo_registration: 'ngo_registration_url',
            tax_exemption: 'tax_exemption_url',
            representative_id: 'representative_id_url',
            representative_photo: 'representative_photo_url',
        }[documentType];

        if (updateField) {
            const { error: updateError } = await supabase
                .from('campaigns_pending')
                .update({ [updateField]: publicUrl })
                .eq('id', campaignId);

            if (updateError) {
                console.error('Update error:', updateError);
            }
        }

        return NextResponse.json({
            success: true,
            url: publicUrl,
            documentType,
        });
    } catch (error) {
        console.error('Upload documents error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
