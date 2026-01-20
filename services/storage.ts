
import { AppState, TransactionType, PaymentStatus, UserRole } from '../types';

// Storage key updated for local mobile vault
const STORAGE_KEY = 'orina_local_mobile_vault_v1';

// Generate some dates for reports
const today = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();

const DEFAULT_USER = {
  id: 'admin-1',
  name: 'Administrator',
  role: UserRole.ADMIN,
  username: 'admin'
};

const DEFAULT_STATE: AppState = {
  currentUser: DEFAULT_USER,
  products: [
    // --- Existing Raw Materials ---
    {
      id: 'rm-1',
      name: 'Refined Sugar (Cheeni)',
      sku: 'RM-1001',
      stock: 500,
      minStockAlert: 50,
      costPrice: 140,
      retailPrice: 0,
      wholesalePrice: 0,
      category: 'Raw Material',
      lastUpdated: today
    },
    {
      id: 'rm-2',
      name: 'Mango Pulp (Aam Gudda)',
      sku: 'RM-1002',
      stock: 200,
      minStockAlert: 20,
      costPrice: 450,
      retailPrice: 0,
      wholesalePrice: 0,
      category: 'Raw Material',
      lastUpdated: today
    },
    {
      id: 'rm-3',
      name: 'PET Bottle 1L (Empty)',
      sku: 'RM-1003',
      stock: 1000,
      minStockAlert: 100,
      costPrice: 35,
      retailPrice: 0,
      wholesalePrice: 0,
      category: 'Raw Material',
      lastUpdated: today
    },
    {
      id: 'rm-4',
      name: 'Premium Label Sticker',
      sku: 'RM-1004',
      stock: 2000,
      minStockAlert: 200,
      costPrice: 8,
      retailPrice: 0,
      wholesalePrice: 0,
      category: 'Raw Material',
      lastUpdated: today
    },
    {
      id: 'rm-5',
      name: 'Preservative Chemical',
      sku: 'RM-1005',
      stock: 50,
      minStockAlert: 5,
      costPrice: 1200,
      retailPrice: 0,
      wholesalePrice: 0,
      category: 'Raw Material',
      lastUpdated: today
    },
    
    // --- NEW CHEMICAL RAW MATERIALS ---
    { id: 'rm-6', name: 'Water (RO / Deionized)', sku: 'RM-1006', stock: 1000, minStockAlert: 100, costPrice: 5, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-7', name: 'Sodium Laureth Sulfate (SLES)', sku: 'RM-1007', stock: 200, minStockAlert: 20, costPrice: 650, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-8', name: 'Linear Alkyl Benzene Sulphonic Acid (LABSA)', sku: 'RM-1008', stock: 150, minStockAlert: 15, costPrice: 580, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-9', name: 'Cocamidopropyl Betaine (CAPB)', sku: 'RM-1009', stock: 100, minStockAlert: 10, costPrice: 450, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-10', name: 'Cocamide DEA / MEA', sku: 'RM-1010', stock: 50, minStockAlert: 5, costPrice: 900, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-11', name: 'Sodium Hydroxide (Caustic Soda)', sku: 'RM-1011', stock: 500, minStockAlert: 50, costPrice: 300, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-12', name: 'Citric Acid', sku: 'RM-1012', stock: 100, minStockAlert: 10, costPrice: 400, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-13', name: 'Sodium Chloride (Common Salt)', sku: 'RM-1013', stock: 1000, minStockAlert: 100, costPrice: 30, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-14', name: 'Soda Ash (Sodium Carbonate)', sku: 'RM-1014', stock: 500, minStockAlert: 50, costPrice: 120, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-15', name: 'Sodium Silicate', sku: 'RM-1015', stock: 200, minStockAlert: 20, costPrice: 80, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-16', name: 'Stearic Acid', sku: 'RM-1016', stock: 50, minStockAlert: 5, costPrice: 700, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-17', name: 'Coconut Oil', sku: 'RM-1017', stock: 100, minStockAlert: 10, costPrice: 1200, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-18', name: 'Palm Oil / Palm Kernel Oil', sku: 'RM-1018', stock: 100, minStockAlert: 10, costPrice: 900, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-19', name: 'Glycerin', sku: 'RM-1019', stock: 50, minStockAlert: 5, costPrice: 600, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-20', name: 'Propylene Glycol', sku: 'RM-1020', stock: 50, minStockAlert: 5, costPrice: 850, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-21', name: 'Sorbitol / Sugar', sku: 'RM-1021', stock: 200, minStockAlert: 20, costPrice: 150, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-22', name: 'Ethanol (Alcohol)', sku: 'RM-1022', stock: 100, minStockAlert: 10, costPrice: 1500, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-23', name: 'Pearlizing Agent', sku: 'RM-1023', stock: 20, minStockAlert: 2, costPrice: 1100, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-24', name: 'Conditioning Polymer (Polyquaternium-7/10)', sku: 'RM-1024', stock: 10, minStockAlert: 1, costPrice: 1800, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-25', name: 'Thickener (Carbomer / HEC)', sku: 'RM-1025', stock: 10, minStockAlert: 1, costPrice: 3000, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-26', name: 'Aloe Vera Extract / Gel', sku: 'RM-1026', stock: 20, minStockAlert: 2, costPrice: 2000, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-27', name: 'Herbal Extracts (Amla, Reetha, etc)', sku: 'RM-1027', stock: 50, minStockAlert: 5, costPrice: 1500, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-28', name: 'Essential Oils', sku: 'RM-1028', stock: 10, minStockAlert: 1, costPrice: 5000, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-29', name: 'Vitamin E', sku: 'RM-1029', stock: 5, minStockAlert: 1, costPrice: 6000, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-30', name: 'Titanium Dioxide', sku: 'RM-1030', stock: 20, minStockAlert: 2, costPrice: 2500, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-31', name: 'Optical Brightener', sku: 'RM-1031', stock: 10, minStockAlert: 1, costPrice: 4000, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-32', name: 'Preservative (Formalin/Other)', sku: 'RM-1032', stock: 20, minStockAlert: 2, costPrice: 1200, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-33', name: 'Fragrance / Perfume', sku: 'RM-1033', stock: 30, minStockAlert: 5, costPrice: 4500, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },
    { id: 'rm-34', name: 'Color (Dye)', sku: 'RM-1034', stock: 20, minStockAlert: 2, costPrice: 3500, retailPrice: 0, wholesalePrice: 0, category: 'Raw Material', lastUpdated: today },

    // --- Finished Goods ---
    {
      id: 'fg-1',
      name: 'Premium Mango Juice 1L',
      sku: 'FG-2001',
      stock: 45,
      minStockAlert: 10,
      costPrice: 0, // Calculated dynamically via formulation
      retailPrice: 350,
      wholesalePrice: 280,
      category: 'Finished Good',
      lastUpdated: today
    },
    {
      id: 'fg-2',
      name: 'Mango Nectar 500ml',
      sku: 'FG-2002',
      stock: 100,
      minStockAlert: 20,
      costPrice: 0,
      retailPrice: 180,
      wholesalePrice: 140,
      category: 'Finished Good',
      lastUpdated: today
    }
  ],
  transactions: [
    {
      id: 'INV-1001',
      date: yesterday,
      type: TransactionType.SALE,
      partyName: 'Super Mart Lahore',
      saleType: 'WHOLESALE',
      items: [
        { productId: 'fg-1', name: 'Premium Mango Juice 1L', quantity: 10, price: 280 },
        { productId: 'fg-2', name: 'Mango Nectar 500ml', quantity: 24, price: 140 }
      ],
      totalAmount: 6160,
      paidAmount: 6160,
      status: PaymentStatus.PAID,
      recordedBy: 'ADMIN'
    },
    {
      id: 'INV-1002',
      date: today,
      type: TransactionType.SALE,
      partyName: 'Walk-in Customer',
      saleType: 'RETAIL',
      items: [
        { productId: 'fg-1', name: 'Premium Mango Juice 1L', quantity: 2, price: 350 }
      ],
      totalAmount: 700,
      paidAmount: 700,
      status: PaymentStatus.PAID,
      recordedBy: 'ADMIN'
    }
  ],
  expenses: [
    {
        id: 'exp-1',
        date: yesterday,
        category: 'Utilities',
        amount: 5000,
        description: 'Electricity Bill'
    }
  ],
  formulations: [
    {
      id: 'form-1',
      productId: 'fg-1', // Link to Mango Juice 1L
      ingredients: [
        { itemId: 'rm-1', quantity: 0.15 }, // 150g Sugar
        { itemId: 'rm-2', quantity: 0.2 },  // 200g Pulp
        { itemId: 'rm-3', quantity: 1 },    // 1 Bottle
        { itemId: 'rm-4', quantity: 1 },    // 1 Label
        { itemId: 'rm-5', quantity: 0.005 } // 5g Preservative
      ],
      instructions: [
        "سب سے پہلے 500 ملی لیٹر پانی کو 80 ڈگری تک گرم کریں۔",
        "چینی اور پریزرویٹو کیمیکل شامل کریں اور اچھی طرح مکس کریں۔",
        "آم کا پلپ (Gudda) شامل کریں اور مکسچر کو 5 منٹ پکائیں۔",
        "مکسچر کو فلٹر کریں تاکہ گٹھلیاں الگ ہو جائیں۔",
        "جوس کو کمرے کے درجہ حرارت پر ٹھنڈا ہونے دیں۔",
        "بوتلوں میں بھر کر لیبل لگائیں اور کارٹن میں بند کریں۔"
      ]
    }
  ],
  settings: {
    currency: 'PKR',
    brandName: 'Orina Foods',
    brandAddress: 'Plot 45, Industrial Estate, Faisalabad',
    brandPhone: '0300-1234567',
    brandLogo: '',
    language: 'URDU'
  }
};

export const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Data Sanitization & Migration Logic
      const sanitizedState: AppState = {
        ...DEFAULT_STATE,
        ...parsed,
        // FORCE LOGIN: Always override currentUser to ensure offline access without login screen
        currentUser: DEFAULT_USER,
        
        products: Array.isArray(parsed.products) ? parsed.products.map((p: any) => ({
          ...p,
          stock: Number(p.stock) || 0,
          minStockAlert: Number(p.minStockAlert) || 5,
          costPrice: Number(p.costPrice) || 0,
          retailPrice: p.retailPrice !== undefined ? Number(p.retailPrice) : (Number(p.sellingPrice) || 0),
          wholesalePrice: p.wholesalePrice !== undefined ? Number(p.wholesalePrice) : (Number(p.sellingPrice) || 0),
        })) : [],
        
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions.map((t: any) => ({
          ...t,
          totalAmount: Number(t.totalAmount) || 0,
          paidAmount: Number(t.paidAmount) || 0,
          saleType: t.saleType === 'WHOLESALE' ? 'WHOLESALE' : 'RETAIL'
        })) : [],

        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        formulations: Array.isArray(parsed.formulations) ? parsed.formulations : [],
        settings: { 
            ...DEFAULT_STATE.settings, 
            ...parsed.settings,
            // Ensure new fields exist if loading old data
            brandAddress: parsed.settings?.brandAddress || DEFAULT_STATE.settings.brandAddress,
            brandPhone: parsed.settings?.brandPhone || DEFAULT_STATE.settings.brandPhone,
            brandLogo: parsed.settings?.brandLogo || '',
            language: parsed.settings?.language || 'URDU'
        }
      };

      return sanitizedState;
    }
  } catch (e) {
    console.error("Critical: Failed to load or sanitize local data:", e);
  }
  return DEFAULT_STATE;
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state:", e);
  }
};

export const exportToJSON = (state: AppState) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `orina_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
