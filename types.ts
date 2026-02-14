
export interface NPLInputs {
  appraisal_price: number;
  prev_min_bid_price: number;
  curr_min_bid_price: number;
  urgent_sale_price: number; 
  expected_bid_rate: number; 
  claim_amount: number;
  max_mortgage_amount: number;
  bond_purchase_price: number;
  interest_rate: number; 
  overdue_interest_rate: number; 
  senior_takeover: number;
  pledge_interest_cost: number;
  target_roi: number; 
  pledge_loan_rate: number; 
  
  auction_date: string;
  commencement_date: string;
  distribution_date: string;
}

export interface TimelinePoint {
  date: string;
  label: string;
  amount: number;
}

export interface SimulationOutput {
  expected_bid_price: number;
  estimated_principal: number;
  future_distribution_gain: number;
  overdue_interest: number;
  incidental_cost_sum: number;
  pledge_loan_amount: number;
  min_investment_amount: number;
  
  min_margin: number;
  target_margin: number;
  
  distribution_strategy: {
    expected_distribution: number;
    profit: number;
    roi: number;
    is_profitable: boolean;
  };
  
  inflow_strategy: {
    profit_case_claim: number;
    profit_case_max_mortgage: number;
    profit_case_urgent_sale: number;
    roi_case_claim: number;
    roi_case_max_mortgage: number;
    roi_case_urgent_sale: number;
    expected_period: number;
  };
  
  negotiation: {
    max_price_min_margin: number;
    max_price_target_margin: number;
  };
  
  scenarios: Array<{
    bid_rate: number;
    distribution_roi: number;
    inflow_roi: number;
    profit_gap: number;
  }>;
  
  timeline_data: TimelinePoint[];
  risk_flags: string[];
}
