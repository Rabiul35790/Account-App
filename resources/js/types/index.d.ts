export interface User {
    id: number;
    name: string;
    email: string;
    company_name: string | null;
    phone: string | null;
    email_verified_at: string | null;
    logo_url: string | null;
    primary_color: string | null;
}

export interface GlobalSettings {
    company_name: string | null;
    phone: string | null;
    primary_color: string;
    logo_url: string | null;
}

export interface Category {
    id: number;
    user_id: number;
    name: string;
    type: 'income' | 'expense';
    description: string | null;
    color: string;
    icon: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: number;
    user_id: number;
    category_id: number | null;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    date: string;
    is_recurring: boolean;
    receipt_path: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    category?: Category | null;
}

export interface Budget {
    id: number;
    user_id: number;
    category_id: number;
    amount: number;
    period: 'monthly' | 'quarterly' | 'yearly';
    start_date: string;
    end_date: string | null;
    created_at: string;
    updated_at: string;
    category?: Category | null;
    spent?: number;
    remaining?: number;
    percentage?: number;
}

export interface DashboardStats {
    monthly_income: number;
    monthly_expense: number;
    balance: number;
    recent_transactions: Transaction[];
    expense_by_category: { category_id: number; total: number; category?: Category }[];
    monthly_trend: { month: string; income: number; expense: number }[];
}

export interface ReportSummary {
    year: number;
    total_income: number;
    total_expense: number;
    net: number;
    monthly: { month: string; income: number; expense: number }[];
    category_breakdown: { category_id: number; total: number; category?: Category }[];
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
