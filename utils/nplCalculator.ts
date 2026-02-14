
import { NPLInputs, SimulationOutput, TimelinePoint } from '../types';

export const calculateNPL = (inputs: NPLInputs): SimulationOutput => {
  const {
    appraisal_price,
    urgent_sale_price,
    expected_bid_rate,
    claim_amount,
    max_mortgage_amount,
    bond_purchase_price,
    interest_rate,
    overdue_interest_rate,
    senior_takeover,
    pledge_interest_cost,
    target_roi,
    pledge_loan_rate,
    commencement_date,
    auction_date,
    distribution_date
  } = inputs;

  // Percentage conversion
  const bidRateDec = expected_bid_rate / 100;
  const interestRateDec = interest_rate / 100;
  const overdueRateDec = overdue_interest_rate / 100;
  const targetRoiDec = target_roi / 100;
  const pledgeLoanRateDec = pledge_loan_rate / 100;

  // 1. Core Derived Values
  const estimated_principal = max_mortgage_amount / 1.2;
  const expected_bid_price = appraisal_price * bidRateDec;
  
  const future_distribution_gain = max_mortgage_amount - estimated_principal;
  const overdue_interest = estimated_principal * overdueRateDec;
  const incidental_cost_sum = (max_mortgage_amount * 0.03) + senior_takeover + pledge_interest_cost;
  const pledge_loan_amount = bond_purchase_price * pledgeLoanRateDec;
  const min_investment_amount = bond_purchase_price - pledge_loan_amount;

  const min_margin = incidental_cost_sum;
  const target_margin = estimated_principal * targetRoiDec;

  // 2. Timeline Data Calculation
  const getDaysBetween = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const calculateRightsAtDate = (days: number) => {
    const dailyInterest = (estimated_principal * overdueRateDec) / 365;
    const totalInterest = dailyInterest * days;
    return Math.min(max_mortgage_amount, claim_amount + totalInterest);
  };

  const timeline_data: TimelinePoint[] = [
    { 
      date: commencement_date, 
      label: '경매개시결정일', 
      amount: claim_amount 
    },
    { 
      date: auction_date, 
      label: '경매기일', 
      amount: calculateRightsAtDate(getDaysBetween(commencement_date, auction_date)) 
    },
    { 
      date: distribution_date, 
      label: '배당기일', 
      amount: calculateRightsAtDate(getDaysBetween(commencement_date, distribution_date)) 
    }
  ];

  // 3. Distribution Strategy
  const expected_distribution = Math.min(claim_amount, expected_bid_price);
  const distribution_profit = expected_distribution - (bond_purchase_price + incidental_cost_sum);
  const distribution_roi = (bond_purchase_price + incidental_cost_sum) > 0 
    ? distribution_profit / (bond_purchase_price + incidental_cost_sum) 
    : 0;
  const is_profitable = distribution_profit >= 0;

  // 4. Inflow Strategy
  const profit_case_claim = claim_amount - bond_purchase_price;
  const profit_case_max_mortgage = max_mortgage_amount - bond_purchase_price;
  const profit_case_urgent_sale = urgent_sale_price - bond_purchase_price;

  const roi_case_claim = bond_purchase_price > 0 ? profit_case_claim / bond_purchase_price : 0;
  const roi_case_max_mortgage = bond_purchase_price > 0 ? profit_case_max_mortgage / bond_purchase_price : 0;
  const roi_case_urgent_sale = bond_purchase_price > 0 ? profit_case_urgent_sale / bond_purchase_price : 0;
  
  const annualInterest = estimated_principal * interestRateDec;
  const expected_period = annualInterest > 0 ? future_distribution_gain / annualInterest : 0;

  // 5. Negotiation & Scenarios
  const max_price_min_margin = expected_bid_price - min_margin;
  const max_price_target_margin = expected_bid_price - target_margin;

  const scenarios = [0.6, 0.7, 0.8, 0.9, 1.0].map(rate => {
    const s_bid_price = appraisal_price * rate;
    const s_dist = Math.min(claim_amount, s_bid_price);
    const s_dist_profit = s_dist - (bond_purchase_price + incidental_cost_sum);
    const s_inflow_profit = s_bid_price - (bond_purchase_price + incidental_cost_sum);
    
    return {
      bid_rate: rate,
      distribution_roi: (bond_purchase_price + incidental_cost_sum) > 0 ? s_dist_profit / (bond_purchase_price + incidental_cost_sum) : 0,
      inflow_roi: (bond_purchase_price + incidental_cost_sum) > 0 ? s_inflow_profit / (bond_purchase_price + incidental_cost_sum) : 0,
      profit_gap: s_inflow_profit - s_dist_profit
    };
  });

  const risk_flags: string[] = [];
  if (expected_distribution < bond_purchase_price) risk_flags.push("PRINCIPAL_LOSS");
  if (distribution_profit < 0) risk_flags.push("NEGATIVE_RETURN");
  if (max_price_target_margin < 0) risk_flags.push("OVERPRICED_BOND");

  return {
    expected_bid_price,
    estimated_principal,
    future_distribution_gain,
    overdue_interest,
    incidental_cost_sum,
    pledge_loan_amount,
    min_investment_amount,
    min_margin,
    target_margin,
    distribution_strategy: {
      expected_distribution,
      profit: distribution_profit,
      roi: distribution_roi,
      is_profitable
    },
    inflow_strategy: {
      profit_case_claim,
      profit_case_max_mortgage,
      profit_case_urgent_sale,
      roi_case_claim,
      roi_case_max_mortgage,
      roi_case_urgent_sale,
      expected_period
    },
    negotiation: {
      max_price_min_margin,
      max_price_target_margin
    },
    scenarios,
    timeline_data,
    risk_flags
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ko-KR', { 
    style: 'decimal', 
    maximumFractionDigits: 0 
  }).format(value) + '원';
};

export const formatPercent = (value: number) => {
  return (value * 100).toFixed(2) + '%';
};
