
export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  EXPENSE = 'EXPENSE'
}

export enum PaymentStatus {
  PAID = 'PAID',
  CREDIT = 'CREDIT',
  PARTIAL = 'PARTIAL'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStockAlert: number;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  category: string;
  lastUpdated: string;
}

export interface Formulation {
  id: string;
  productId: string;
  ingredients: { itemId: string; quantity: number }[];
  instructions?: string[]; // Added for Step-by-Step preparation
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  partyName: string;
  items: { productId: string; quantity: number; price: number; name: string }[];
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  recordedBy: string;
  saleType: 'RETAIL' | 'WHOLESALE';
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

export interface AppSettings {
  currency: string;
  brandName: string;
  brandAddress?: string; // New
  brandPhone?: string;   // New
  brandLogo?: string;    // New (Base64 string)
  language: 'URDU' | 'ENGLISH'; // Added Language Selection
}

export interface AppState {
  currentUser: User | null;
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  formulations: Formulation[];
  settings: AppSettings;
}
