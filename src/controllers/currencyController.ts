import { Request, Response } from 'express';
import axios from 'axios';

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/USD`;

export const getExchangeRate = async (req: Request, res: Response): Promise<void> => {
  const targetCurrency = req.query.currency as string;

  if (!targetCurrency) {
    res.status(400).json({ message: 'Missing currency query param' });
    return;
  }

  try {
    const response = await axios.get(EXCHANGE_API_URL);
    const rates = response.data?.conversion_rates;

    if (!rates || !rates[targetCurrency]) {
      res.status(404).json({ message: 'Currency not found in rates' });
      return;
    }

    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      RON: 'RON',
    };

    res.status(200).json({
      currency: targetCurrency,
      rate: rates[targetCurrency],
      symbol: symbols[targetCurrency] || '$',
    });
  } catch (error: any) {
  console.error('Exchange rate fetch error:', {
    message: error.message,
    responseData: error.response?.data,
    responseStatus: error.response?.status,
  });
  res.status(500).json({ message: 'Failed to fetch exchange rates' });
}

};
