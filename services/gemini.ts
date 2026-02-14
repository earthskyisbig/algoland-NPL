
import { NPLInputs } from "../types";

export const getGeminiConsultant = async (
  currentInputs: NPLInputs,
  currentResults: any,
  userMessage: string
) => {
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
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemInstruction, userMessage }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 상담 중 오류가 발생했습니다.";
  }
};
