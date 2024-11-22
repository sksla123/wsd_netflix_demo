import { ref } from 'vue';

// 회원가입 유효성 검사 함수
function validateSignup(email, password, confirmPassword, agreeTerms) {
  const messages = ref([]);

  if (!agreeTerms) {
    messages.value.push("서비스 이용약관에 동의하셔야 가입이 가능합니다.");
  }
  if (password !== confirmPassword) {
    messages.value.push("비밀번호가 일치하지 않습니다.");
  }
  if (password.length < 8) {
    messages.value.push("비밀번호는 8자리 이상만 사용 가능합니다.");
  }

  return messages;
}

// Users.json 파일 로드 함수
function loadUsers() {
  try {
    const usersData = localStorage.getItem('Users');
    return usersData ? JSON.parse(usersData) : { users: {} };
  } catch (error) {
    console.error('Error loading users:', error);
    return { users: {} };
  }
}

// 회원 추가 함수
function addUser(email, password) {
  const data = loadUsers();
  const users = data.users;

  if (email in users) {
    return "이미 가입된 회원입니다.";
  } else {
    users[email] = password;
    localStorage.setItem('Users', JSON.stringify(data));
    return "회원가입이 완료되었습니다.";
  }
}

// 회원가입 처리 함수
export function handleSignup(email, password, confirmPassword, agreeTerms) {
  const validationMessages = validateSignup(email, password, confirmPassword, agreeTerms);
  
  if (validationMessages.value.length > 0) {
    return { success: false, messages: validationMessages.value };
  }

  const result = addUser(email, password);
  if (result === "회원가입이 완료되었습니다.") {
    return { success: true, message: result };
  } else {
    return { success: false, messages: [result] };
  }
}