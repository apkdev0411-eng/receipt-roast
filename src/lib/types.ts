export type RoastMode = "duro" | "coach";

export interface ExpenseItem {
  name: string;
  amount: number;
  category: string;
}

export interface ReceiptExtraction {
  isReceipt: boolean;
  rejectionReason?: string;
  merchant?: string;
  currency: string;
  date?: string;
  expenses: ExpenseItem[];
  total: number;
}

export interface RoastResult {
  mode: RoastMode;
  roast: string;
  insight: string;
  meme?: string;
  merchant?: string;
  currency: string;
  date?: string;
  expenses: ExpenseItem[];
  total: number;
  demo: boolean;
}

export type RoastApiResponse =
  | { ok: true; result: RoastResult }
  | {
      ok: false;
      error: string;
      code?: "NOT_A_RECEIPT" | "BAD_IMAGE" | "API_ERROR" | "MISSING_IMAGE";
    };