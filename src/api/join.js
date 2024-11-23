function loadUsers() {
    try {
      const usersData = localStorage.getItem('Users');
      return usersData ? JSON.parse(usersData) : {};
    } catch (error) {
      console.error('Error loading users:', error);
      return {};
    }
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function validate_signup(email, password, confirmPassword, agreeTerms, users) {
    if (!agreeTerms) {
      return "서비스 이용약관에 동의하셔야 가입이 가능합니다.";
    }
    if (!isValidEmail(email)) {
      return "유효한 이메일 주소를 입력해주세요.";
    }
    if (password !== confirmPassword) {
      return "비밀번호가 일치하지 않습니다.";
    }
    if (password.length < 8) {
      return "비밀번호는 8자리 이상만 사용 가능합니다.";
    }
    if (email in users) {
      return "이미 가입된 회원입니다.";
    }
    return null;
  }
  
  export function handleSignup(email, password, confirmPassword, agreeTerms) {
    const users = loadUsers();
    const error_msg = validate_signup(email, password, confirmPassword, agreeTerms, users);
    if (error_msg) {
      return { success: false, message: error_msg };
    }
    users[email] = password;
    localStorage.setItem('Users', JSON.stringify(users));
    return { success: true, message: "회원가입이 완료되었습니다." };
  }