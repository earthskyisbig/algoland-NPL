
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { NPLInputs } from "../types";

const simulateNPLFunction: FunctionDeclaration = {
  name: "simulate_npl_investment",
  description: "NPL 투자 시나리오를 시뮬레이션하고 엑셀 통합 로직 기반의 결과를 분석합니다.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      appraisal_price: { type: Type.NUMBER, description: "감정가" },
      urgent_sale_price: { type: Type.NUMBER, description: "급매가 (시세)" },
      expected_bid_rate: { type: Type.NUMBER, description: "예상 낙찰가율 (0~100)" },
      claim_amount: { type: Type.NUMBER, description: "법원 신고 채권액" },
      max_mortgage_amount: { type: Type.NUMBER, description: "채권최고액" },
      bond_purchase_price: { type: Type.NUMBER, description: "협의 채권매입가" },
      interest_rate: { type: Type.NUMBER, description: "연 이자율 (0~100)" },
      overdue_interest_rate: { type: Type.NUMBER, description: "연체 이자율 (0~100)" },
      senior_takeover: { type: Type.NUMBER, description: "선순위 인수금" },
      pledge_interest_cost: { type: Type.NUMBER, description: "질권 이자 비용" },
      target_roi: { type: Type.NUMBER, description: "목표 수익률 (0~100)" },
      pledge_loan_rate: { type: Type.NUMBER, description: "질권대출 비율 (0~100)" }
    },
    required: ["appraisal_price", "urgent_sale_price", "expected_bid_rate", "claim_amount", "max_mortgage_amount", "bond_purchase_price", "interest_rate", "target_roi", "pledge_loan_rate"]
  }
};

export const getGeminiConsultant = async (
  currentInputs: NPLInputs,
  currentResults: any,
  userMessage: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const systemInstruction = `
    당신은 NPL(부실채권) 투자 전문가입니다. 
    현재 사용자가 입력한 시뮬레이션 데이터를 바탕으로 투자 조언을 제공하십시오.
    
    데이터:
    ${JSON.stringify(currentInputs)}
    
    결과:
    ${JSON.stringify(currentResults)}
    
    규칙 및 분석 가이드:
    1. 유입 전략 Case 1(청구액 기준)과 Case 2(최고액 기준)의 수익 차이를 설명하세요.
    2. 급매가(시세)와 낙찰가, 매입가의 관계를 분석하여 안전 마진이 충분한지 평가하세요.
    3. 협상 기준가(Min Margin vs Target Margin)를 근거로 현재 채권매입가가 적절한지 평가하세요.
    4. 리스크(PRINCIPAL_LOSS, NEGATIVE_RETURN) 발생 시 즉시 경고하세요.
    5. 질권대출 및 최소투자금을 활용한 자본수익률(ROE) 관점에서의 조언을 추가하세요.
    6. 답변은 한국어로 구성하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [simulateNPLFunction] }]
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 상담 중 오류가 발생했습니다.";
  }
};
