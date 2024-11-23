function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function loadUsers() {
    try {
      const usersData = localStorage.getItem('Users');
      return usersData ? JSON.parse(usersData) : {};
    } catch (error) {
      console.error('Error loading users:', error);
      return {};
    }
  }
  
  export async function handleLogin(email, password) {
    if (!isValidEmail(email)) {
      return { success: false, message: "이메일 형식이 올바르지 않습니다." };
    }
  
    const users = loadUsers();
    
    if (!(email in users)) {
      return { success: false, message: "가입되지 않은 이메일입니다. 먼저 회원가입을 진행해주세요." };
    }
  
    if (users[email] !== password) {
      return { success: false, message: "비밀번호가 일치하지 않습니다." };
    }
  
    // 로그인 성공
    return { success: true, message: "로그인에 성공했습니다." };
  }