# Utterances 댓글 설정

## 1. Public 댓글 전용 레포

`alstjd0051/apt-chart-comments` (이미 생성됨)

## 2. Utterances 앱 설치/재설치

### 새로 설치

1. https://github.com/apps/utterances 접속
2. **Install** 클릭
3. **Only select repositories** → `apt-chart-comments` 선택
4. **Install** 확인

### 재설치 (기존 설치 제거 후)

1. https://github.com/settings/installations 접속
2. **Utterances** 찾기 → **Configure**
3. **Uninstall** 클릭
4. 위 "새로 설치" 절차 반복

### 스크립트로 설치 페이지 열기

```bash
./scripts/install-utterances.sh
```

## 3. 완료

댓글은 `apt-chart-comments` 레포의 GitHub Issues에 저장됩니다.
