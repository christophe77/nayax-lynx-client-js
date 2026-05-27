export interface Transaction {
  id: string;
  machineId: number;
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Decimal amount as a string for accuracy ("3.50"), or number — accept both. */
  amount: number | string;
  currency: string;
  paymentMethod?:
    | "cash"
    | "card"
    | "mobile"
    | "voucher"
    | "loyalty"
    | "free"
    | "other";
  status?: "settled" | "pending" | "refunded" | "failed";
  items?: TransactionItem[];
  authCode?: string;
  externalId?: string;
}

export interface TransactionItem {
  productId?: string;
  selection?: string;
  name?: string;
  quantity: number;
  unitPrice?: number | string;
  totalPrice?: number | string;
}

export interface TransactionQuery {
  from: string;
  to: string;
  machineId?: number;
  status?: Transaction["status"];
  pageSize?: number;
  cursor?: string;
}
