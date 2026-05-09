export const stages = [
  {
    id: 1,
    title: "안녕, 컴퓨터!",
    subtitle: "Hello, World",
    emoji: "👋",
    color: "#6C63FF",
    colorLight: "#EEF0FF",
    cards: [
      {
        type: "concept",
        title: "코드는 컴퓨터에게 보내는 편지야",
        content:
          "우리가 친구에게 문자를 보내듯, 프로그래머는 컴퓨터에게 '코드'로 말을 걸어.\n문장 끝에 마침표(.)를 붙이듯, C언어에선 세미콜론(;)을 꼭 붙여야 해!",
        metaphor: "📬 편지 → 코드 / 마침표 → 세미콜론(;)",
        tip: "세미콜론은 '이 문장 끝!'을 컴퓨터에게 알려주는 신호야.",
      },
      {
        type: "code",
        title: "첫 번째 코드를 완성해봐!",
        description: "화면에 'Hello, World!'를 출력하는 코드야. 빈칸을 채워봐.",
        slots: [
          {
            id: 0,
            options: ["printf", "print", "scanf", "write"],
            correct: 0,
            fixed: false,
          },
          { id: 1, options: ['("Hello, World!")'], correct: 0, fixed: true },
          { id: 2, options: [";", ",", ".", "!"], correct: 0, fixed: false },
        ],
        fullCode: '#include <stdio.h>\nint main() {\n  printf("Hello, World!");\n  return 0;\n}',
        expectedOutput: "Hello, World!",
        hint: "화면에 출력할 때 쓰는 함수는 'printf'야!",
      },
      {
        type: "code",
        title: "여러 번 출력해보기!",
        description: "printf와 줄바꿈(\\n)을 사용해 세 줄을 출력해봐.",
        slots: [
          { id: 0, options: ['"Line 1\\n"', '"Line 1"', '"Line 1;\\n"'], correct: 0, fixed: false },
          { id: 1, options: [";", "."], correct: 0, fixed: false },
        ],
        fullCode: '#include <stdio.h>\nint main() {\n  printf("Line 1\\n");\n  printf("Line 2\\n");\n  printf("Line 3\\n");\n  return 0;\n}',
        expectedOutput: "Line 1\nLine 2\nLine 3",
        hint: "줄을 바꿀 때는 \\n을 사용해!",
      },
      {
        type: "project",
        title: "미니 프로젝트: 나만의 명함 만들기",
        description:
          "printf를 여러 번 써서 나만의 명함을 출력해봐!\n이름, 학교, 좋아하는 것을 출력해봐.",
        example:
          '#include <stdio.h>\nint main() {\n  printf("=== 나의 명함 ===\\n");\n  printf("이름: 홍길동\\n");\n  printf("학교: 서울중학교\\n");\n  printf("취미: 게임\\n");\n  return 0;\n}',
        badge: "🏆 Hello 마스터",
      },
    ],
  },
  {
    id: 2,
    title: "기억하는 컴퓨터",
    subtitle: "변수와 자료형",
    emoji: "📦",
    color: "#FF6B6B",
    colorLight: "#FFF0F0",
    cards: [
      {
        type: "concept",
        title: "변수는 이름표 붙은 택배 상자야",
        content:
          "컴퓨터는 값을 기억하기 위해 '변수'라는 상자를 써.\n상자마다 크기(자료형)가 다르고, 맞는 물건(값)만 넣을 수 있어!",
        metaphor: "📦 상자 크기 = 자료형(int, float, char)\n📬 상자 이름 = 변수명",
        tip: "int는 정수(1,2,3...), float는 소수(3.14), char는 글자('A')를 담아.",
        visualization: "memory",
      },
      {
        type: "code",
        title: "변수를 만들고 출력해봐!",
        description: "나이를 저장하는 변수를 만들어봐.",
        slots: [
          {
            id: 0,
            options: ["int", "float", "char", "string"],
            correct: 0,
            fixed: false,
          },
          { id: 1, options: ["age"], correct: 0, fixed: true },
          { id: 2, options: ["=", "+", "-", "*"], correct: 0, fixed: false },
          { id: 3, options: ["15", "15.5", "'A'", "hello"], correct: 0, fixed: false },
          { id: 4, options: [";"], correct: 0, fixed: true },
        ],
        fullCode: '#include <stdio.h>\nint main() {\n  int age = 15;\n  printf("내 나이: %d\\n", age);\n  return 0;\n}',
        expectedOutput: "내 나이: 15",
        hint: "나이는 정수니까 'int'를 써야 해!",
      },
      {
        type: "project",
        title: "미니 프로젝트: BMI 계산기",
        description: "키와 몸무게를 입력받아 BMI를 계산해봐!\nBMI = 몸무게 / (키 * 키)",
        example:
          '#include <stdio.h>\nint main() {\n  float height, weight, bmi;\n  printf("키(m)를 입력하세요: ");\n  scanf("%f", &height);\n  printf("몸무게(kg)를 입력하세요: ");\n  scanf("%f", &weight);\n  bmi = weight / (height * height);\n  printf("BMI: %.1f\\n", bmi);\n  return 0;\n}',
        badge: "🏆 변수 마스터",
      },
    ],
  },
  {
    id: 3,
    title: "반복하는 컴퓨터",
    subtitle: "조건문과 반복문",
    emoji: "🔄",
    color: "#FFA726",
    colorLight: "#FFF8F0",
    cards: [
      {
        type: "concept",
        title: "if는 갈림길, for는 에스컬레이터",
        content:
          "if는 조건에 따라 다른 길로 가는 갈림길이야.\nfor는 정해진 횟수만큼 반복하는 에스컬레이터고,\nwhile은 '조건이 맞을 때까지 계속 문 두드리기'야!",
        metaphor: "🚦 if/else = 신호등 갈림길\n🔃 for = 에스컬레이터\n🚪 while = 문 두드리기",
        tip: "for(시작; 조건; 증가) 형태로 써. 에스컬레이터처럼 단계가 있어!",
      },
      {
        type: "code",
        title: "별 피라미드 만들기!",
        description: "for문으로 별(*) 5개를 출력해봐.",
        slots: [
          { id: 0, options: ["for"], correct: 0, fixed: true },
          { id: 1, options: ["("], correct: 0, fixed: true },
          {
            id: 2,
            options: ["int i=0", "int i=1", "i=0", "int i=-1"],
            correct: 0,
            fixed: false,
          },
          { id: 3, options: [";"], correct: 0, fixed: true },
          {
            id: 4,
            options: ["i<5", "i<=5", "i>5", "i!=5"],
            correct: 0,
            fixed: false,
          },
          { id: 5, options: [";"], correct: 0, fixed: true },
          {
            id: 6,
            options: ["i++", "i--", "i+1", "i*2"],
            correct: 0,
            fixed: false,
          },
          { id: 7, options: [")"], correct: 0, fixed: true },
        ],
        fullCode:
          '#include <stdio.h>\nint main() {\n  for(int i=0; i<5; i++) {\n    printf("*");\n  }\n  return 0;\n}',
        expectedOutput: "*****",
        hint: "i가 0부터 시작해서 5보다 작을 때까지 반복해야 해!",
      },
      {
        type: "project",
        title: "미니 프로젝트: 숫자 야구 게임",
        description: "1~100 사이의 숫자를 맞추는 게임!\n힌트: Up/Down을 알려줘.",
        example:
          '#include <stdio.h>\nint main() {\n  int secret = 42, guess, tries = 0;\n  printf("1~100 숫자를 맞춰봐!\\n");\n  while(guess != secret) {\n    printf("입력: ");\n    scanf("%d", &guess);\n    tries++;\n    if(guess < secret) printf("Up!\\n");\n    else if(guess > secret) printf("Down!\\n");\n    else printf("정답! %d번 만에 맞췄어!\\n", tries);\n  }\n  return 0;\n}',
        badge: "🏆 반복문 마스터",
      },
    ],
  },
  {
    id: 4,
    title: "정리하는 컴퓨터",
    subtitle: "배열과 함수",
    emoji: "🏢",
    color: "#26C6DA",
    colorLight: "#F0FDFF",
    cards: [
      {
        type: "concept",
        title: "배열은 아파트, 함수는 레시피야",
        content:
          "배열은 같은 종류의 값을 순서대로 저장하는 아파트야.\n동(배열명)과 호수(인덱스[0,1,2...])로 각 방을 찾아가!\n함수는 자주 쓰는 코드를 묶어놓은 레시피야. 한번 만들면 계속 쓸 수 있어.",
        metaphor: "🏢 배열 = 아파트 (인덱스 = 호수)\n📖 함수 = 레시피 (재사용 가능)",
        tip: "배열 인덱스는 항상 0부터 시작해! arr[0]이 첫 번째 방이야.",
        visualization: "array",
      },
      {
        type: "code",
        title: "배열로 성적 저장하기!",
        description: "5명의 점수를 배열에 저장하고 평균을 구해봐.",
        slots: [
          {
            id: 0,
            options: ["int", "float", "char", "double"],
            correct: 0,
            fixed: false,
          },
          {
            id: 1,
            options: ["scores[5]", "scores(5)", "scores{5}", "[5]scores"],
            correct: 0,
            fixed: false,
          },
          { id: 2, options: ["="], correct: 0, fixed: true },
          {
            id: 3,
            options: ["{90,85,92,78,88}", "(90,85,92)", "[90,85,92]", "90,85,92"],
            correct: 0,
            fixed: false,
          },
        ],
        fullCode:
          '#include <stdio.h>\nint main() {\n  int scores[5] = {90,85,92,78,88};\n  int sum = 0;\n  for(int i=0; i<5; i++) sum += scores[i];\n  printf("평균: %d\\n", sum/5);\n  return 0;\n}',
        expectedOutput: "평균: 86",
        hint: "배열은 int 이름[크기] = {값들} 형태야!",
      },
      {
        type: "project",
        title: "미니 프로젝트: 반 성적 통계",
        description: "최고점, 최저점, 평균을 함수로 만들어봐!",
        example:
          '#include <stdio.h>\nint getMax(int arr[], int n) {\n  int max = arr[0];\n  for(int i=1; i<n; i++)\n    if(arr[i] > max) max = arr[i];\n  return max;\n}\nint main() {\n  int scores[] = {90,85,92,78,88};\n  printf("최고점: %d\\n", getMax(scores, 5));\n  return 0;\n}',
        badge: "🏆 배열/함수 마스터",
      },
    ],
  },
  {
    id: 5,
    title: "주소를 아는 컴퓨터",
    subtitle: "포인터와 동적 할당",
    emoji: "🗺️",
    color: "#AB47BC",
    colorLight: "#FDF4FF",
    cards: [
      {
        type: "concept",
        title: "포인터는 GPS 주소야",
        content:
          "포인터는 '값' 대신 '메모리 주소'를 저장하는 특별한 변수야.\n집(값)을 직접 옮기는 대신, 집 주소(포인터)만 알려주는 것처럼!\n&는 '이 변수의 주소를 알려줘', *는 '이 주소로 가줘'라는 뜻이야.",
        metaphor:
          "🗺️ 포인터 = GPS 주소\n📍 & (앰퍼샌드) = '주소 알려줘'\n🚗 * (별표) = '그 주소로 가줘'",
        tip: "int *ptr = &a; → ptr에 a의 주소를 저장. *ptr로 a의 값을 읽거나 바꿀 수 있어!",
        visualization: "pointer",
      },
      {
        type: "code",
        title: "포인터로 변수 값 바꾸기!",
        description: "포인터를 이용해 변수 a의 값을 100으로 바꿔봐.",
        slots: [
          {
            id: 0,
            options: ["int *ptr", "int ptr", "*int ptr", "ptr int"],
            correct: 0,
            fixed: false,
          },
          { id: 1, options: ["="], correct: 0, fixed: true },
          {
            id: 2,
            options: ["&a", "a", "*a", "&ptr"],
            correct: 0,
            fixed: false,
          },
          { id: 3, options: [";"], correct: 0, fixed: true },
        ],
        fullCode:
          '#include <stdio.h>\nint main() {\n  int a = 5;\n  int *ptr = &a;\n  *ptr = 100;\n  printf("a = %d\\n", a);\n  return 0;\n}',
        expectedOutput: "a = 100",
        hint: "포인터 변수는 int *ptr 처럼 선언하고, &a로 주소를 저장해!",
      },
      {
        type: "project",
        title: "미니 프로젝트: 동적 연락처",
        description: "malloc으로 필요한 만큼만 메모리를 만들어봐!\nfree로 꼭 정리하는 것도 잊지 마.",
        example:
          '#include <stdio.h>\n#include <stdlib.h>\nint main() {\n  int n;\n  printf("연락처 수: ");\n  scanf("%d", &n);\n  int *contacts = (int*)malloc(n * sizeof(int));\n  for(int i=0; i<n; i++) {\n    printf("번호 %d: ", i+1);\n    scanf("%d", &contacts[i]);\n  }\n  for(int i=0; i<n; i++)\n    printf("연락처 %d: %d\\n", i+1, contacts[i]);\n  free(contacts);\n  return 0;\n}',
        badge: "🏆 포인터 마스터",
      },
    ],
  },
  {
    id: 6,
    title: "묶음으로 관리하기",
    subtitle: "구조체와 공용체",
    emoji: "📂",
    color: "#4CAF50",
    colorLight: "#E8F5E9",
    cards: [
      {
        type: "concept",
        title: "구조체는 나만의 데이터 세트야",
        content:
          "서로 다른 종류의 정보(이름, 나이, 점수)를 하나로 묶고 싶을 때 '구조체'를 써.\n학생 한 명의 정보를 하나의 변수로 관리할 수 있어 편리해!",
        metaphor: "📂 구조체 = 개인 프로필 폴더\n📑 공용체 = 한 칸을 돌려쓰는 사물함",
        tip: "struct Student { char name[20]; int age; }; 처럼 정의해.",
      },
      {
        type: "code",
        title: "학생 정보 출력하기",
        description: "구조체 변수를 만들고 값을 넣어봐.",
        slots: [
          { id: 0, options: ["struct Student", "Student", "struct", "class"], correct: 0, fixed: false },
          { id: 1, options: ["s1"], correct: 0, fixed: true },
          { id: 2, options: ["."], correct: 0, fixed: true },
          { id: 3, options: ["age", "name", "id"], correct: 0, fixed: false },
        ],
        fullCode:
          '#include <stdio.h>\nstruct Student { int age; };\nint main() {\n  struct Student s1;\n  s1.age = 20;\n  printf("나이: %d\\n", s1.age);\n  return 0;\n}',
        expectedOutput: "나이: 20",
        hint: "구조체 멤버에 접근할 때는 점(.)을 사용해!",
      },
      {
        type: "project",
        title: "미니 프로젝트: 학생 관리 시스템",
        description: "구조체 배열을 사용해 여러 명의 학생 정보를 저장하고 출력해봐.",
        example:
          '#include <stdio.h>\nstruct Student { char name[20]; int score; };\nint main() {\n  struct Student list[3] = {{"Kim", 90}, {"Lee", 85}, {"Park", 95}};\n  for(int i=0; i<3; i++) printf("%s: %d\\n", list[i].name, list[i].score);\n  return 0;\n}',
        badge: "🏆 구조체 마스터",
      },
    ],
  },
  {
    id: 7,
    title: "영원히 저장하기",
    subtitle: "파일 입출력",
    emoji: "💾",
    color: "#607D8B",
    colorLight: "#ECEFF1",
    cards: [
      {
        type: "concept",
        title: "파일은 컴퓨터의 장기 기억장치야",
        content:
          "프로그램이 꺼져도 데이터를 남기고 싶다면 파일에 저장해야 해.\nFILE 포인터를 사용해 파일을 열고(fopen), 쓰고(fprintf), 닫아(fclose)!",
        metaphor: "📖 fopen = 책 펴기\n✍️ fprintf = 글 쓰기\n📕 fclose = 책 덮기",
        tip: "파일을 다 썼다면 반드시 fclose로 닫아줘야 메모리가 안전해.",
      },
      {
        type: "code",
        title: "파일에 인사말 쓰기",
        description: "파일을 쓰기 모드('w')로 열어봐.",
        slots: [
          { id: 0, options: ["FILE *fp", "FILE fp", "File *fp"], correct: 0, fixed: false },
          { id: 1, options: ['"w"', '"r"', '"a"'], correct: 0, fixed: false },
        ],
        fullCode:
          '#include <stdio.h>\nint main() {\n  FILE *fp = fopen("hello.txt", "w");\n  fprintf(fp, "Hello File!");\n  fclose(fp);\n  return 0;\n}',
        expectedOutput: "",
        hint: "파일 쓰기 모드는 'write'의 약자인 'w'야!",
      },
      {
        type: "project",
        title: "미니 프로젝트: 나만의 일기장",
        description: "사용자로부터 문자열을 입력받아 diary.txt 파일에 저장하는 프로그램을 만들어봐.",
        example:
          '#include <stdio.h>\nint main() {\n  char diary[100];\n  printf("오늘의 할 일: ");\n  gets(diary);\n  FILE *fp = fopen("diary.txt", "a");\n  fprintf(fp, "%s\\n", diary);\n  fclose(fp);\n  return 0;\n}',
        badge: "🏆 파일 마스터",
      },
    ],
  },
  {
    id: 8,
    title: "유연한 메모리",
    subtitle: "연결 리스트",
    emoji: "🔗",
    color: "#E91E63",
    colorLight: "#FCE4EC",
    cards: [
      {
        type: "concept",
        title: "연결 리스트는 기차야",
        content:
          "배열은 칸이 붙어있는 기차라면, 연결 리스트는 고리로 연결된 기차 칸들이야.\n중간에 칸을 넣거나 빼기가 훨씬 쉬워!",
        metaphor: "🔗 노드 = 기차 한 칸\n👉 next = 다음 칸으로 연결하는 고리",
        tip: "자기 자신과 같은 구조체를 가리키는 포인터가 핵심이야!",
      },
      {
        type: "code",
        title: "첫 번째 노드 만들기",
        description: "노드 두 개를 연결해봐.",
        slots: [
          { id: 0, options: ["struct Node *next", "int next", "struct Node next"], correct: 0, fixed: false },
          { id: 1, options: ["&n2", "n2", "*n2"], correct: 0, fixed: false },
        ],
        fullCode:
          '#include <stdio.h>\nstruct Node { int data; struct Node *next; };\nint main() {\n  struct Node n1 = {10, NULL}, n2 = {20, NULL};\n  n1.next = &n2;\n  printf("n1 -> n2: %d", n1.next->data);\n  return 0;\n}',
        expectedOutput: "n1 -> n2: 20",
        hint: "포인터를 통해 멤버에 접근할 때는 -> 기호를 써!",
      },
      {
        type: "project",
        title: "미니 프로젝트: 동적 To-Do 리스트",
        description: "연결 리스트를 사용해 할 일을 추가하고 관리해봐.",
        example:
          '#include <stdio.h>\n#include <stdlib.h>\nstruct Todo { char task[30]; struct Todo *next; };\nint main() {\n  struct Todo *head = (struct Todo*)malloc(sizeof(struct Todo));\n  // ... 할 일 추가 로직 ...\n  return 0;\n}',
        badge: "🏆 연결 리스트 마스터",
      },
    ],
  },
];
