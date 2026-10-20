# functionKeyCompat

솔루션 버전마다 다른 펑션키(F8·F9 등) 배치를 고객사 기준으로 맞추는 unidocu 플러그인.

| 솔루션 | F8 | F9 |
|---|---|---|
| A | 디버그 | 테스트 |
| B | 조회 | 디버그 |

기존 고객사와 신규 고객사에서 같은 키가 다르게 동작해 헷갈리는 걸 막기 위해, config의 매핑대로 키를 바꿔 코어 단축키 로직에 넘긴다.

## 설정

```js
{ name: 'functionKeyCompat', options: { map: { F8: 'F9', F9: 'F8' } } }
```

- `map`: `{원래 키: 바꿀 키}`. `F1`~`F12` 이름이나 키 코드 숫자로 적는다.
- 매핑이 없으면 아무 동작도 하지 않는다.
- 매핑에 없는 키, Ctrl/Alt/Shift/Meta 조합은 그대로 통과한다.

## 동작

1. 코어 단축키는 `$(document).keydown`(document 버블 단계)에서 처리된다.
2. 플러그인은 `window` 캡처 단계(이벤트 경로의 맨 처음)에서 키를 먼저 받는다.
3. 매핑된 키면 원래 이벤트의 전파를 막고, 바꾼 키 코드로 `$(document).trigger('keydown')`을 발생시켜 코어 로직(권한 체크 포함)을 그대로 실행한다.
4. jQuery `trigger`는 실제 키 이벤트를 만들지 않아 다시 가로채지지 않는다.

별도 팝업 창(디버그 화면 등)에서도 적용하려면 그 창에도 플러그인이 로드돼야 한다.

## 빌드 / 배포

```bash
npm ci
npm run build   # webpack → dist/plugin.js (UMD)
```

Jenkins(`Jenkinsfile`): 자동 빌드 없음. 태그 `v<버전>` push 후 Build with Parameters `GIT_REF=v<버전>` → NAS `<plugins>/functionKeyCompat/<version>/plugin.js`.
