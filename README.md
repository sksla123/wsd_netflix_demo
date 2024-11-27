# 넷플릭스 데모 사이트

이 프로젝트는 넷플릭스에서 영감을 받은 데모 웹사이트를 제작하기입니다.
반응형 웹사이트를 제작해보면서 관련된 능력을 습득하기 위해 시작하였습니다.

## 프로젝트 설치 및 실행 가이드

이 가이드는 Vite와 Vue를 사용한 영화 웹사이트 프로젝트의 설치 및 실행 과정을 설명합니다.

### 사전 요구 사항

- Node.js (버전 23.2 이상)
- npm (Node.js와 함께 설치됨)

### 설치 과정

1. 레포지토리 클론
   ```
   bash
   git clone [your-repository-url]
   cd [your-project-name]
   ```

2. 의존성 설치
   ```
   bash
   npm ci
   ```

### 개발 서버 실행
로컬 개발 서버를 시작하려면 다음 명령어를 실행하세요:

```
bash
npm run dev
```

이 명령어는 개발 서버를 시작하며, `http://localhost:4200`에서 프로젝트에 접근할 수 있습니다.
localhost가 아닌 외부에서 접근하기 위해서는 포트포워딩 관련 설정이 필요할 수 있습니다.

### 빌드

빌드를 생성하려면 다음 명령어를 사용하세요:

```
bash
npm run build
```

이 명령어는 `dist` 디렉토리에 최적화된 프로덕션 빌드 파일을 생성합니다.

### 배포

이 프로젝트는 GitHub Actions를 사용하여 자동으로 GitHub Pages에 배포됩니다. `main` 브랜치에 푸시하면 다음 과정이 자동으로 실행됩니다:

1. 프로젝트 빌드
2. 버전 계산 및 업데이트
3. GitHub Release 생성
4. 빌드된 파일을 GitHub Pages에 배포

### 추가 정보

- 이 웹사이트는 TMDB API를 사용하여 영화 정보를 가져옵니다.

**(반드시 먼저 TMDB API를 발급받은 후 사용해주세요.)**

TMDB API Key를 발급받았다면 실행된 웹사이트에 접속 후 회원가입 시 비밀번호로 발급받은 API Key를 입력하세요. 입력된 Key는 보안화되어 저장되지 않으니, 본인의 각별한 주의가 필요합니다. (본인의 부주의로 인한 API 유출은 책임지지 않습니다.)

## 웹사이트 설명
### 이 웹사이트는 반응형을 지원합니다.

<img width="253" alt="image" src="https://github.com/user-attachments/assets/49a67201-8c79-4353-9132-f839af53c109">


<img width="453" alt="image" src="https://github.com/user-attachments/assets/d9716302-f0ea-48f4-a615-43a5eb44797d">


<img width="656" alt="image" src="https://github.com/user-attachments/assets/23aa163c-1800-40a5-a369-be20854776ec">

### 애니매이션

헤더 각 navigation button(모바일 제외)에 마우스를 올려두면 아이콘에 색상이 차오르는 것을 확인하실 수 있습니다.

<img width="263" alt="image" src="https://github.com/user-attachments/assets/9190798d-817d-44f0-bb93-6d1938ab4bcb">

![image](https://github.com/user-attachments/assets/da3f1356-891c-4af2-874b-6ca33df8b0ee)

로그인 배경화면에서 선들을 활용한 BackgroundAnimation을 생성하여 사용자에게 다가오는 것처럼 느끼게 했습니다.

<img width="608" alt="image" src="https://github.com/user-attachments/assets/b40ff205-4d03-48f4-93ca-1addef4515de">

화면 절반 기준으로 선들은 생성된 위치에서 생성된 위치를 향하는 방향으로 밖으로 나가게 합니다.
이동하면서 동시에 선이 굵어지도록 설정해 사용자에게 다가오는 것처럼 느끼게 합니다.
일정 크기 이상 커지거나, 선들이 화면 바깥으로 나가면 해제해, 컴퓨터 자원을 아낄 수 있도록했습니다.


### 회원 가입, 로그인 구현

이메일 형식 여부를 검사합니다.(회원가입/로그인)
![image](https://github.com/user-attachments/assets/3caf44c7-1498-467a-9385-4a7a27d0b681)

로그인 정보를 저장하고 추후 로그인 시도 시 저장된 정보를 자동으로 구성합니다.
<img width="236" alt="image" src="https://github.com/user-attachments/assets/7e636c09-fa2f-41cf-8c32-03d0ea77b671">

### 페이지 테이블 뷰/ 무한 스크롤 뷰

페이지 테이블은 화면을 넘지 않도록 구성하며(스크롤이 생기지 않도록 합니다.), 페이지네이션을 구현합니다.

<img width="568" alt="image" src="https://github.com/user-attachments/assets/5008e0c4-2f4d-4e99-8548-bfebdc85d6ef">


무한 스크롤 뷰는 자동으로 하단 스크롤에 닿을 시 다음 영화 데이터를 불러옵니다.
<img width="605" alt="image" src="https://github.com/user-attachments/assets/1a5a2ea0-d702-4f56-8b23-9685f8d19cdf">


### 찾아보기

평점, 장르, 언어를 필터링할 수 있는 필터 드롭다운을 만들었습니다. 장르는 전체를 제외하면 전체선택이 가능하며, 멀티 선택시 장르는 모두 AND로 연결됩니다.

<img width="289" alt="image" src="https://github.com/user-attachments/assets/be5082bf-df8e-49fc-a3ac-9b09aec5eb49">

검색 기록이 저장되도록했습니다. 검색기록은 5개 이상 저장되지 않습니다.

<img width="242" alt="image" src="https://github.com/user-attachments/assets/11e79558-8b8d-4c66-94c4-502db33af4d1">


### 내가 찜한 리스트

어떤 곳에서든 포스터를 클릭하면 내가 찜한 리스트에 담기게 됩니다. 이미 담겨진 포스터를 다시 누르는 경우, 내가 찜한 리스트에서 제거됩니다.

<img width="593" alt="image" src="https://github.com/user-attachments/assets/588a8d08-6170-483d-8968-9aa314a9c566">

### 그 외
- 폰트를 적용했습니다.
- 사용자의 장르 선호도를 저장하여, 사용자가 좋아하는 장르에서 추천하는 오늘의 추천영화 가로 슬라이드를 구현하였습니다.
<img width="545" alt="image" src="https://github.com/user-attachments/assets/27d7d7ae-d68e-46ed-a184-a9ab63e0fc5a">
