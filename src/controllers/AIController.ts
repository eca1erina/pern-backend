import { Request, Response } from 'express';
import dataSource from '@config/database';
import { Transaction } from '../entities/transactionSchema';
import axios from 'axios';
import { AxiosError } from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyCvRhR6DhdO_LMt6j722KbpfG36qPuxN18';

export const analyzeUserTransactions = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.query.user_id);

  if (!userId) {
    res.status(400).json({ message: 'Missing or invalid user_id parameter' });
    return;
  }

  try {
    const transactions = await dataSource.getRepository(Transaction).find({
      where: { user_id: userId },
      order: { date: 'DESC' },
    });

    if (transactions.length === 0) {
      res.status(200).json({ message: 'No transactions found', tips: [] });
      return;
    }

    const prompt = `Based on the following user financial transactions, provide 4 helpful financial tips. Make them short and funny, even ridiculous. Remove any unnecessary symbols, such as *#@#. The response should be in the format: Here are 4 tips for you: 1... 2...:\n\n${JSON.stringify(transactions, null, 2)}`;
    
    const aiResponse = await axios.post(GEMINI_API_URL, {
  contents: [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 256,
  },
});

    const textResponse = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const tips = textResponse
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    res.status(200).json({
      source: 'gemini-api',
      tips,
    });
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error analyzing transactions:', err.response?.data || err.message || err);
    res.status(500).json({ message: 'Failed to analyze transactions' });
  }
};

