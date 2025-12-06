import api from './auth';

export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents
  crisis_id: number;
  charity_id?: number;
  donor_email?: string;
  donor_name?: string;
}

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
}

export const paymentsAPI = {
  /**
   * Create a payment intent for donation
   */
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> => {
    const response = await api.post('/api/payments/create-intent', data);
    return response.data;
  },

  /**
   * Get payment status
   */
  getPaymentStatus: async (paymentIntentId: string) => {
    const response = await api.get(`/api/payments/status/${paymentIntentId}`);
    return response.data;
  },
};

export default paymentsAPI;
