export const mockDashboardData = {
    total_exposure: 25000000,
    avg_risk_score: 58,
    overdue_count: 17,
    high_risk_distributors: [
        { id: "D-101", name: "Alpha Tech Supplies", risk_score: 82 },
        { id: "D-105", name: "Global Logistics Ltd", risk_score: 75 },
        { id: "D-203", name: "Zenith Retail", risk_score: 72 }
    ]
};

export const mockDistributors = [
    { id: "1", name: "Alpha Tech Supplies", industry: "Electronics", city: "Mumbai", credit_limit: 500000, utilization: 85, risk_score: 82, badge: "Red" },
    { id: "2", name: "Beta Pharmaceuticals", industry: "Healthcare", city: "Delhi", credit_limit: 2000000, utilization: 40, risk_score: 35, badge: "Green" },
    { id: "3", name: "Gamma Industries", industry: "Manufacturing", city: "Pune", credit_limit: 1500000, utilization: 65, risk_score: 60, badge: "Yellow" },
    { id: "4", name: "Delta Traders", industry: "Retail", city: "Bangalore", credit_limit: 300000, utilization: 92, risk_score: 78, badge: "Red" },
];

export const mockProfileData = {
    id: "1",
    name: "Alpha Tech Supplies",
    industry: "Electronics",
    city: "Mumbai",
    credit_limit: 500000,
    current_utilization: 425000,
    structured_risk: 65,
    semantic_risk: 85,
    final_risk: 72,
    breakdown: {
        delay_score: 70,
        utilization_score: 85,
        dispute_score: 40,
        sales_trend_score: 65
    },
    similar_cases: [
        { id: "C1", event: "Defaulted after rapid credit expansion. Market shift observed.", severity: 90, similarity: 0.87, date: "2023-10-15" },
        { id: "C2", event: "Delayed payments for 90 days following management change.", severity: 75, similarity: 0.81, date: "2024-01-20" },
        { id: "C3", event: "Dispute over deliveries led to hold on payments.", severity: 60, similarity: 0.76, date: "2024-05-10" }
    ]
};

export const mockAlerts = [
    { id: "A1", type: "Semantic", message: "High semantic risk detected for Alpha Tech Supplies.", date: "2 Hours Ago", severity: "High" },
    { id: "A2", type: "Structured", message: "Gamma Industries approaching 70% credit utilization.", date: "5 Hours Ago", severity: "Medium" },
    { id: "A3", type: "System", message: "Credit model recalibrated with new memory factors.", date: "1 Day Ago", severity: "Low" }
];
