import { Groq } from "groq-sdk";

// 메모리에 파티 데이터 저장 (서버 재시작 시 초기화됨)
let parties = {};

export default async function handler(req, res) {
  // POST 요청만 처리
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { nickname, message } = req.body;

    // 입력 유효성 검사
    if (!nickname || !message) {
      return res.status(400).json({ error: "닉네임과 메시지가 필요합니다." });
    }

    // Groq API 초기화
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // AI에게 사용자 메시지 분석 요청
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `당신은 파티 관리를 돕는 AI 어시스턴트입니다. 
          사용자 메시지를 분석하여 다음 중 하나의 의도를 JSON 형식으로 반환하세요:
          1. 파티 참가 요청 - {"intent": "join", "partyName": "파티이름"}
          2. 파티 탈퇴 요청 - {"intent": "leave", "partyName": "파티이름"}
          3. 파티 생성 요청 - {"intent": "create", "partyName": "파티이름"}
          4. 기타 메시지 - {"intent": "other"}`,
        },
        {
          role: "user",
          content: `닉네임: ${nickname}\n메시지: ${message}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // AI 응답 파싱
    const aiResponse = JSON.parse(response.choices[0].message.content);
    const { intent, partyName } = aiResponse;

    let result = {};

    // 의도에 따른 처리
    switch (intent) {
      case "join":
        result = joinParty(nickname, partyName);
        break;
      case "leave":
        result = leaveParty(nickname, partyName);
        break;
      case "create":
        result = createParty(nickname, partyName);
        break;
      default:
        result = {
          success: false,
          message: "파티 관련 요청을 인식하지 못했습니다.",
        };
    }

    // 현재 파티 상태와 함께 응답
    return res.status(200).json({
      ...result,
      intent,
      partyName,
      currentParties: parties,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return res
      .status(500)
      .json({ error: "서버 오류가 발생했습니다.", details: error.message });
  }
}

// 파티 참가 함수
function joinParty(nickname, partyName) {
  // 파티가 존재하는지 확인
  if (!parties[partyName]) {
    return {
      success: false,
      message: `"${partyName}" 파티가 존재하지 않습니다. 먼저 파티를 생성해주세요.`,
    };
  }

  // 이미 참가 중인지 확인
  if (parties[partyName].includes(nickname)) {
    return {
      success: false,
      message: `"${nickname}"님은 이미 "${partyName}" 파티에 참가 중입니다.`,
    };
  }

  // 파티에 참가
  parties[partyName].push(nickname);
  return {
    success: true,
    message: `"${nickname}"님이 "${partyName}" 파티에 참가했습니다!`,
  };
}

// 파티 탈퇴 함수
function leaveParty(nickname, partyName) {
  // 파티가 존재하는지 확인
  if (!parties[partyName]) {
    return {
      success: false,
      message: `"${partyName}" 파티가 존재하지 않습니다.`,
    };
  }

  // 참가 중인지 확인
  if (!parties[partyName].includes(nickname)) {
    return {
      success: false,
      message: `"${nickname}"님은 "${partyName}" 파티에 참가하고 있지 않습니다.`,
    };
  }

  // 파티에서 탈퇴
  parties[partyName] = parties[partyName].filter(
    (member) => member !== nickname
  );
  return {
    success: true,
    message: `"${nickname}"님이 "${partyName}" 파티에서 탈퇴했습니다.`,
  };
}

// 파티 생성 함수
function createParty(nickname, partyName) {
  // 이미 존재하는 파티인지 확인
  if (parties[partyName]) {
    return {
      success: false,
      message: `"${partyName}" 파티는 이미 존재합니다.`,
    };
  }

  // 새 파티 생성 및 생성자 자동 참가
  parties[partyName] = [nickname];
  return {
    success: true,
    message: `"${nickname}"님이 "${partyName}" 파티를 생성하고 참가했습니다!`,
  };
}
