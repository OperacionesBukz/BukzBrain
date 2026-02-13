import { supabase } from '@/lib/supabaseClient';

interface SendEmailParams {
    to: string | string[];
    subject: string;
    htmlContent: string;
    sender?: {
        name: string;
        email: string;
    };
}

interface SendEmailResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResponse> {
    const { data, error } = await supabase.functions.invoke('send-email', {
        body: params,
    });

    if (error) {
        console.error('Error invocando Edge Function:', error);
        throw new Error(error.message || 'Error al enviar el correo');
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    return data as SendEmailResponse;
}
